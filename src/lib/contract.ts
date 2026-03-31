import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

const SPIRIT_NFT_ABI = [{
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'name', type: 'string' },
    { name: 'spiritType', type: 'string' },
    { name: 'metadataURI', type: 'string' },
  ],
  name: 'mintSpirit',
  outputs: [{ name: 'tokenId', type: 'uint256' }],
  stateMutability: 'nonpayable',
  type: 'function',
}] as const

export async function mintSpiritNFT(
  to: string,
  name: string,
  spiritType: string,
  metadataURI: string
): Promise<number | null> {
  try {
    const privateKey = process.env.BASE_SEPOLIA_PRIVATE_KEY
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL
    const contractAddress = process.env.NEXT_PUBLIC_SPIRIT_NFT_ADDRESS

    if (!privateKey || !contractAddress) {
      console.warn('Missing contract config, skipping NFT mint')
      return null
    }

    const account = privateKeyToAccount(`0x${privateKey}`)
    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(rpcUrl),
    }).extend(publicActions)

    const hash = await client.writeContract({
      address: contractAddress as `0x${string}`,
      abi: SPIRIT_NFT_ABI,
      functionName: 'mintSpirit',
      args: [to as `0x${string}`, name, spiritType, metadataURI],
    })

    const receipt = await client.waitForTransactionReceipt({ hash })

    // 从logs中解析tokenId（SpiritMinted event的第一个indexed参数）
    const mintLog = receipt.logs[0]
    if (mintLog?.topics[1]) {
      const tokenId = Number(BigInt(mintLog.topics[1]))
      return tokenId
    }

    return null
  } catch (error) {
    console.error('NFT mint error:', error)
    return null
  }
}
