# NFT自动Mint — Codex需求文档

## 目标

在用户创建数字分身时，后端自动调用已部署的SpiritNFT合约mint一个Soulbound NFT，将tokenId写回数据库。

## 已有条件

- 合约已部署到Base Sepolia测试网
- 合约地址：`0x409296A9cCf470B8d93e3fAe891709479FeBCeCc`
- 合约ABI见 `contracts/SpiritNFT.sol`，关键方法：`mintSpirit(address to, string name, string spiritType, string metadataURI) returns (uint256 tokenId)`
- 合约owner的私钥在 `.env` 的 `BASE_SEPOLIA_PRIVATE_KEY`
- RPC URL在 `.env` 的 `BASE_SEPOLIA_RPC_URL`（`https://sepolia.base.org`）
- 数据库Spirit表有 `tokenId` 字段（Int, nullable）

## 需要做的事

### 1. 创建 `src/lib/contract.ts`

- 用 `viem` 库（项目已安装）创建钱包客户端连接Base Sepolia
- 导出 `mintSpiritNFT(to: string, name: string, spiritType: string, metadataURI: string): Promise<number>` 函数
- 函数调用合约的 `mintSpirit` 方法，返回tokenId
- 从环境变量读取私钥和RPC URL

### 2. 修改 `src/app/api/spirit/route.ts` 的POST方法

在 `prisma.spirit.create` 之后，添加：
- 调用 `mintSpiritNFT`，to地址暂时用合约owner地址（后续替换为用户Privy钱包地址）
- metadataURI暂时传空字符串（后续接IPFS）
- mint成功后用 `prisma.spirit.update` 把tokenId写回数据库
- mint失败不阻塞创建流程（catch错误，log但不throw）

### 3. 合约ABI

只需要 `mintSpirit` 方法的ABI片段：
```json
[{
  "inputs": [
    {"name": "to", "type": "address"},
    {"name": "name", "type": "string"},
    {"name": "spiritType", "type": "string"},
    {"name": "metadataURI", "type": "string"}
  ],
  "name": "mintSpirit",
  "outputs": [{"name": "tokenId", "type": "uint256"}],
  "stateMutability": "nonpayable",
  "type": "function"
}]
```

## 约束

- 不要安装新依赖，用已有的 `viem`
- mint失败不能阻塞分身创建
- 不要改动合约代码
- 不要改动前端代码
- 只改 `src/lib/contract.ts`（新建）和 `src/app/api/spirit/route.ts`（修改）

## 验证方式

`npm run build` 通过即可。运行时验证需要启动dev server创建一个分身，检查数据库Spirit记录的tokenId是否有值。
