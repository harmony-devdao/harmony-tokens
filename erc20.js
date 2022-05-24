const { JsonRpcProvider } = require("@ethersproject/providers");
const { Contract } = require("ethers");
const path = require("path");
const ercJsonAbi = require("./abi/erc20.json")
const tokens = require("./tokens.json")
const fs = require("fs").promises

async function main() {

    const address = process.argv[2]
    let network = process.argv[3] || "mainnet"
    console.log(address)
    if (!address) {
        throw new Error(`Address is required as a parameters!`)
    }

    const supportedNetworks = {
        mainnet: {
            url: "https://api.s0.t.hmny.io",
            chainId: 1666600000,
            name: "Harmony Mainnet"
        }, testnet: {
            url: "https://api.s0.b.hmny.io",
            chainId: 1666700000,
            name: "Harmony Testnet"
        }, devnet: {
            url: "https://api.s0.ps.hmny.io",
            chainId: 1666900000,
            name: "Harmony Devnet"
        }
    }
    if (supportedNetworks[network] == null) {
        throw new Error(`Invalid network! Supported networks are: ${Object.keys(supportedNetworks).join(", ")}`)
    }

    if (!(address.length && address.length === 42 && address.startsWith("0x"))) {
        throw new Error("Invalid 0x... address!")
    }

    const provider = new JsonRpcProvider(supportedNetworks[network].url, supportedNetworks[network])
    const contract = new Contract(address, ercJsonAbi, provider)


    const token = {
        address,
        name: await contract.name(),
        symbol: await contract.symbol(),
        decimals: await contract.decimals()
    }

    if (tokens[network][token.symbol])
        console.warn("Token is already in configuration and will be overwritten!")

    tokens[network][token.symbol] = token
    await fs.writeFile(path.join(__dirname, "tokens.json"), JSON.stringify(tokens, null, 4), { encoding: "utf-8", flag: "w" })

}

main().catch(console.error)