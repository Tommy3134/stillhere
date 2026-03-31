import { NextRequest, NextResponse } from 'next/server'
import { createSpiritSchema } from '@/lib/validations'
import { buildSpiritSystemPrompt } from '@/lib/ai-engine'
import { prisma } from '@/lib/prisma'
import { mintSpiritNFT } from '@/lib/contract'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const spirit = await prisma.spirit.findUnique({
        where: { id },
        include: {
          statuses: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      })
      if (!spirit) {
        return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
      }
      return NextResponse.json({ spirit })
    }

    // 列出所有分身
    const spirits = await prisma.spirit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        statuses: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
    return NextResponse.json({ spirits })
  } catch (error) {
    console.error('Get spirit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createSpiritSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, spiritType, personality, homeStyle, photoUrls } = parsed.data

    // 生成AI性格prompt
    const systemPrompt = buildSpiritSystemPrompt({ name, spiritType, personality })

    // 获取认证用户，fallback到临时用户
    const authUser = await getAuthUser(req.headers.get('authorization'))
    let user = authUser
    if (!user) {
      user = await prisma.user.findFirst()
      if (!user) {
        user = await prisma.user.create({
          data: { privyId: 'temp-user', displayName: '临时用户' },
        })
      }
    }

    const spirit = await prisma.spirit.create({
      data: {
        userId: user.id,
        name,
        spiritType,
        personality: JSON.parse(JSON.stringify(personality)),
        photoUrls: photoUrls || [],
        homeStyle,
      },
    })

    // 创建初始状态
    await prisma.spiritStatus.create({
      data: {
        spiritId: spirit.id,
        content: '刚到彼岸世界，正在熟悉新家',
        mood: 'curious',
      },
    })

    // 异步mint NFT（不阻塞响应）
    const ownerAddress = '0x' + (await import('viem/accounts')).privateKeyToAccount(
      `0x${process.env.BASE_SEPOLIA_PRIVATE_KEY}` as `0x${string}`
    ).address.slice(2)

    mintSpiritNFT(ownerAddress, name, spiritType, '').then(async (tokenId) => {
      if (tokenId) {
        await prisma.spirit.update({
          where: { id: spirit.id },
          data: { tokenId },
        })
        console.log(`NFT minted for spirit ${spirit.id}, tokenId: ${tokenId}`)
      }
    }).catch(err => console.error('NFT mint background error:', err))

    return NextResponse.json({ spirit: { ...spirit, systemPrompt } }, { status: 201 })
  } catch (error) {
    console.error('Create spirit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
