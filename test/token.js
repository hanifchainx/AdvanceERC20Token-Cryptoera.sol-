const { expect } = require("chai");
const { ethers, network } = require("hardhat");

// Hardcoded wallets from Cryptoera.sol
const LP_WALLET = "0x57Eec8876D36e00C0C0Df1A6946aE0c613cb8ed2";
const EXCHANGE_WALLET = "0x4A5592Dbd23e0D37E2BC52F073521d19dE07da7a";
const TREASURY_WALLET = "0xa0DC05431abfF5F247299fbEC776a09357f17C64";
const MARKETING_WALLET = "0xb88D740874ec5dA10DD8FaF64Dee77d90A8eE825";
const TEAM_WALLET = "0xfcEde60058c1c33EE068526F2FB9AEc2558C4D00";
const DEV_WALLET = "0x1DBa38FDd0EDF59AddcE92c799819638ADb43134";

const toUnits = (value) => ethers.parseUnits(value.toString(), 18);

async function impersonate(address) {
    await network.provider.send("hardhat_impersonateAccount", [address]);
    await network.provider.send("hardhat_setBalance", [
        address,
        "0x3635C9ADC5DEA00000", // 100 ETH
    ]);
    return ethers.getSigner(address);
}

describe("Cryptoera", function () {
    const INITIAL_SUPPLY = ethers.parseUnits("1000000000", 18);

    let owner;
    let addr1;
    let addr2;
    let token;
    let lpSigner;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const Cryptoera = await ethers.getContractFactory("Cryptoera");
        token = await Cryptoera.deploy();
        await token.waitForDeployment();

        lpSigner = await impersonate(LP_WALLET);
    });

    describe("Deployment, metadata & ownership", function () {
        it("initializes supply, allocations, metadata and owner", async function () {
            expect(await token.getAddress()).to.be.properAddress;
            expect(await token.owner()).to.equal(owner.address);

            expect(await token.name()).to.equal("Cryptoera");
            expect(await token.symbol()).to.equal("CRT");
            expect(await token.decimals()).to.equal(18);

            const totalSupply = await token.totalSupply();
            expect(totalSupply).to.equal(INITIAL_SUPPLY);

            const lp = await token.lpReserve();
            const exchange = await token.exchangeReserve();
            const treasury = await token.treasuryReserve();
            const marketing = await token.marketingReserve();
            const team = await token.teamReserve();
            const dev = await token.developmentReserve();

            const sum = lp + exchange + treasury + marketing + team + dev;
            expect(sum).to.equal(INITIAL_SUPPLY);

            expect(await token.balanceOf(LP_WALLET)).to.equal(lp);
            expect(await token.balanceOf(EXCHANGE_WALLET)).to.equal(exchange);
            expect(await token.balanceOf(TREASURY_WALLET)).to.equal(treasury);
            expect(await token.balanceOf(MARKETING_WALLET)).to.equal(marketing);
            expect(await token.balanceOf(TEAM_WALLET)).to.equal(team);
            expect(await token.balanceOf(DEV_WALLET)).to.equal(dev);
        });

        it("enforces owner-only admin and allows ownership transfer", async function () {
            await expect(
                token.connect(addr1).transferOwnership(addr1.address)
            ).to.be.reverted;

            await token.connect(owner).transferOwnership(addr1.address);
            expect(await token.owner()).to.equal(addr1.address);

            await expect(token.connect(owner).pause()).to.be.reverted;
            await token.connect(addr1).pause();
            await token.connect(addr1).unpause();
        });
    });

    describe("Transfers & allowances", function () {
        it("handles transfer, approve and transferFrom correctly", async function () {
            const amount = toUnits(1000);

            await expect(
                token.connect(lpSigner).transfer(addr1.address, amount)
            )
                .to.emit(token, "Transfer")
                .withArgs(LP_WALLET, addr1.address, amount);

            expect(await token.balanceOf(addr1.address)).to.equal(amount);

            await token.connect(lpSigner).approve(addr1.address, amount);
            await expect(
                token
                    .connect(addr1)
                    .transferFrom(LP_WALLET, addr2.address, amount)
            )
                .to.emit(token, "Transfer")
                .withArgs(LP_WALLET, addr2.address, amount);

            expect(
                await token.allowance(LP_WALLET, addr1.address)
            ).to.equal(0n);
        });

        it("reverts when spending without enough balance or approval", async function () {
            const balance = await token.balanceOf(LP_WALLET);
            const tooMuch = balance + 1n;

            await expect(
                token.connect(lpSigner).transfer(addr1.address, tooMuch)
            ).to.be.reverted;

            const amount = toUnits(100);
            await expect(
                token
                    .connect(addr1)
                    .transferFrom(LP_WALLET, addr2.address, amount)
            ).to.be.reverted;
        });

        it("increase/decrease allowance helpers work and enforce floor 0", async function () {
            await token.connect(lpSigner).increaseAllowance(addr1.address, toUnits(200));
            expect(
                await token.allowance(LP_WALLET, addr1.address)
            ).to.equal(toUnits(200));

            await token.connect(lpSigner).decreaseAllowance(addr1.address, toUnits(50));
            expect(
                await token.allowance(LP_WALLET, addr1.address)
            ).to.equal(toUnits(150));

            await expect(
                token
                    .connect(lpSigner)
                    .decreaseAllowance(addr1.address, toUnits(200))
            ).to.be.revertedWith("ERC20: decreased allowance below zero");
        });
    });

    describe("Pause / Unpause", function () {
        it("only owner can pause/unpause, and paused blocks transfers", async function () {
            const amount = toUnits(100);

            await expect(token.connect(addr1).pause()).to.be.reverted;

            await token.connect(owner).pause();
            await expect(
                token.connect(lpSigner).transfer(addr1.address, amount)
            ).to.be.reverted;

            await token.connect(owner).unpause();
            await expect(
                token.connect(lpSigner).transfer(addr1.address, amount)
            ).to.emit(token, "Transfer");
        });
    });

    describe("First-buy protection", function () {
        it("enforces pool setup and first-buy must go to owner", async function () {
            await expect(
                token.connect(addr1).setUniswapPool(LP_WALLET)
            ).to.be.reverted;

            await expect(
                token.connect(owner).setUniswapPool(ethers.ZeroAddress)
            ).to.be.revertedWith("Pool address cannot be zero");

            await token.connect(owner).setUniswapPool(LP_WALLET);
            expect(await token.uniswapPool()).to.equal(LP_WALLET);

            const amount = toUnits(100);
            await expect(
                token.connect(lpSigner).transfer(addr1.address, amount)
            ).to.be.revertedWith("First Buy Pending");

            expect(await token.firstBuyCompleted()).to.equal(false);
        });
    });

    describe("Tax configuration", function () {
        it("has correct tax rates and no tax on non-pool transfers", async function () {
            expect(await token.buyTax()).to.equal(3n);
            expect(await token.sellTax()).to.equal(5n);

            const amount = toUnits(1000);

            const lpStart = await token.balanceOf(LP_WALLET);
            const addr1Start = await token.balanceOf(addr1.address);

            await token.connect(lpSigner).transfer(addr1.address, amount);

            const lpEnd = await token.balanceOf(LP_WALLET);
            const addr1End = await token.balanceOf(addr1.address);

            expect(lpStart - lpEnd).to.equal(amount);
            expect(addr1End - addr1Start).to.equal(amount);
        });
    });
});