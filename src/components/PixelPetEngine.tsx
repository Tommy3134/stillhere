'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type PetAction = 'idle' | 'walk' | 'sleep' | 'play' | 'sit' | 'eat'
type Mood = 'sleepy' | 'playful' | 'content' | 'curious' | 'happy'
type HomeStyle = 'cozy_room' | 'garden' | 'cloud_loft' | 'mountain_cabin'

interface PixelPetEngineProps {
  spiritType: string
  mood: Mood
  homeStyle: HomeStyle
  name: string
  statusText: string
  decor?: string[]
  onInteract?: (type: 'pet' | 'feed') => void
}

// 粒子
interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; type: 'heart' | 'star' | 'food'
}

// 宠物状态
interface PetState {
  x: number
  y: number
  action: PetAction
  frame: number
  direction: 1 | -1
  actionTimer: number
  zzz: number
  particles: Particle[]
  foodBowl: number // 食碗显示倒计时
}

// 昼夜
function getDayPhase(): 'dawn' | 'day' | 'dusk' | 'night' {
  const h = new Date().getHours()
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 17) return 'day'
  if (h >= 17 && h < 20) return 'dusk'
  return 'night'
}

const SKY_COLORS = {
  dawn: ['#FDE68A', '#FBBF24', '#F59E0B'],
  day: ['#BFDBFE', '#93C5FD', '#60A5FA'],
  dusk: ['#FCA5A5', '#F87171', '#DC2626'],
  night: ['#1E3A5F', '#1E293B', '#0F172A'],
}

// Mood决定动作概率
const MOOD_WEIGHTS: Record<Mood, Record<PetAction, number>> = {
  sleepy:  { idle: 10, walk: 5,  sleep: 60, play: 0,  sit: 20, eat: 5 },
  playful: { idle: 10, walk: 20, sleep: 0,  play: 50, sit: 5,  eat: 15 },
  content: { idle: 30, walk: 15, sleep: 10, play: 10, sit: 25, eat: 10 },
  curious: { idle: 10, walk: 40, sleep: 0,  play: 20, sit: 10, eat: 20 },
  happy:   { idle: 15, walk: 20, sleep: 5,  play: 35, sit: 10, eat: 15 },
}

function pickAction(mood: Mood): PetAction {
  const weights = MOOD_WEIGHTS[mood]
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (const [action, w] of Object.entries(weights)) {
    r -= w
    if (r <= 0) return action as PetAction
  }
  return 'idle'
}

// ===== 绘制函数 =====

function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, homeStyle: HomeStyle, phase: string) {
  const sky = SKY_COLORS[phase as keyof typeof SKY_COLORS] || SKY_COLORS.day
  // 天空渐变
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.6)
  grad.addColorStop(0, sky[0])
  grad.addColorStop(0.5, sky[1])
  grad.addColorStop(1, sky[2])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 地面
  const groundY = h * 0.65
  const groundColors: Record<string, string> = {
    cozy_room: '#D4A574',
    garden: '#86EFAC',
    cloud_loft: '#E0E7FF',
    mountain_cabin: '#A8A29E',
  }
  ctx.fillStyle = groundColors[homeStyle] || '#D4A574'
  ctx.fillRect(0, groundY, w, h - groundY)

  // 场景装饰
  if (homeStyle === 'cozy_room') {
    // 墙壁
    ctx.fillStyle = '#FEF3C7'
    ctx.fillRect(0, h * 0.2, w, groundY - h * 0.2)
    // 窗户
    ctx.fillStyle = sky[0]
    ctx.fillRect(w * 0.65, h * 0.25, w * 0.2, h * 0.25)
    ctx.strokeStyle = '#92400E'
    ctx.lineWidth = 2
    ctx.strokeRect(w * 0.65, h * 0.25, w * 0.2, h * 0.25)
    ctx.beginPath()
    ctx.moveTo(w * 0.75, h * 0.25)
    ctx.lineTo(w * 0.75, h * 0.5)
    ctx.stroke()
    // 猫爬架
    ctx.fillStyle = '#D97706'
    ctx.fillRect(w * 0.1, groundY - h * 0.25, w * 0.04, h * 0.25)
    ctx.fillStyle = '#B45309'
    ctx.fillRect(w * 0.05, groundY - h * 0.25, w * 0.14, h * 0.03)
    ctx.fillRect(w * 0.07, groundY - h * 0.15, w * 0.1, h * 0.03)
  } else if (homeStyle === 'garden') {
    // 花
    drawFlower(ctx, w * 0.15, groundY - 5, '#F472B6')
    drawFlower(ctx, w * 0.8, groundY - 8, '#FBBF24')
    drawFlower(ctx, w * 0.5, groundY - 3, '#A78BFA')
    // 树
    ctx.fillStyle = '#92400E'
    ctx.fillRect(w * 0.85, groundY - h * 0.35, w * 0.03, h * 0.35)
    ctx.fillStyle = '#22C55E'
    ctx.beginPath()
    ctx.arc(w * 0.865, groundY - h * 0.35, w * 0.08, 0, Math.PI * 2)
    ctx.fill()
    // 蝴蝶
    const bx = w * 0.3 + Math.sin(Date.now() / 500) * 20
    const by = h * 0.35 + Math.cos(Date.now() / 700) * 10
    ctx.fillStyle = '#F472B6'
    ctx.beginPath()
    ctx.ellipse(bx - 4, by, 4, 6, -0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(bx + 4, by, 4, 6, 0.3, 0, Math.PI * 2)
    ctx.fill()
  } else if (homeStyle === 'cloud_loft') {
    // 云
    drawCloud(ctx, w * 0.2, h * 0.15, 30)
    drawCloud(ctx, w * 0.7, h * 0.25, 20)
    drawCloud(ctx, w * 0.45, h * 0.1, 25)
    // 平台
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    roundRect(ctx, w * 0.2, groundY - 5, w * 0.6, 15, 8)
    // 星星（夜晚）
    if (phase === 'night' || phase === 'dusk') {
      for (let i = 0; i < 8; i++) {
        const sx = w * (0.1 + Math.random() * 0.8)
        const sy = h * (0.05 + Math.random() * 0.3)
        ctx.fillStyle = `rgba(255,255,200,${0.3 + Math.random() * 0.5})`
        ctx.beginPath()
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else {
    // mountain_cabin
    // 山
    ctx.fillStyle = '#78716C'
    ctx.beginPath()
    ctx.moveTo(0, groundY)
    ctx.lineTo(w * 0.25, h * 0.15)
    ctx.lineTo(w * 0.5, groundY)
    ctx.fill()
    ctx.fillStyle = '#A8A29E'
    ctx.beginPath()
    ctx.moveTo(w * 0.4, groundY)
    ctx.lineTo(w * 0.7, h * 0.1)
    ctx.lineTo(w * 1, groundY)
    ctx.fill()
    // 雪顶
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.moveTo(w * 0.2, h * 0.2)
    ctx.lineTo(w * 0.25, h * 0.15)
    ctx.lineTo(w * 0.3, h * 0.2)
    ctx.fill()
    // 小木屋
    ctx.fillStyle = '#92400E'
    ctx.fillRect(w * 0.1, groundY - h * 0.12, w * 0.15, h * 0.12)
    ctx.fillStyle = '#DC2626'
    ctx.beginPath()
    ctx.moveTo(w * 0.08, groundY - h * 0.12)
    ctx.lineTo(w * 0.175, groundY - h * 0.2)
    ctx.lineTo(w * 0.27, groundY - h * 0.12)
    ctx.fill()
  }
}

/* PLACEHOLDER_PET_DRAW */

function drawCat(ctx: CanvasRenderingContext2D, x: number, y: number, state: PetState, scale: number, color: string) {
  const s = scale
  const dir = state.direction
  const frame = state.frame

  ctx.save()
  ctx.translate(x, y)
  if (dir === -1) {
    ctx.scale(-1, 1)
  }

  if (state.action === 'sleep') {
    // 蜷缩的猫
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(0, 0, s * 20, s * 12, 0, 0, Math.PI * 2)
    ctx.fill()
    // 头
    ctx.beginPath()
    ctx.arc(-s * 14, -s * 6, s * 10, 0, Math.PI * 2)
    ctx.fill()
    // 耳朵
    ctx.beginPath()
    ctx.moveTo(-s * 20, -s * 12)
    ctx.lineTo(-s * 24, -s * 22)
    ctx.lineTo(-s * 16, -s * 14)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(-s * 8, -s * 14)
    ctx.lineTo(-s * 10, -s * 22)
    ctx.lineTo(-s * 4, -s * 12)
    ctx.fill()
    // 闭眼
    ctx.strokeStyle = '#333'
    ctx.lineWidth = s * 1.5
    ctx.beginPath()
    ctx.arc(-s * 17, -s * 6, s * 3, 0.2, Math.PI - 0.2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(-s * 10, -s * 6, s * 3, 0.2, Math.PI - 0.2)
    ctx.stroke()
    // 尾巴
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(s * 16, -s * 4, s * 8, s * 4, 0.3, 0, Math.PI * 2)
    ctx.fill()
    // ZZZ
    if (state.zzz > 0) {
      ctx.fillStyle = 'rgba(100,100,255,0.6)'
      ctx.font = `${s * 8}px sans-serif`
      const zy = -s * 20 - Math.sin(Date.now() / 500) * s * 5
      ctx.fillText('z', -s * 5, zy)
      ctx.font = `${s * 6}px sans-serif`
      ctx.fillText('z', 0, zy - s * 8)
    }
  } else {
    // 站立/走路/玩耍的猫
    const bounce = state.action === 'walk' ? Math.sin(frame * 0.3) * s * 2 : 0
    const playBounce = state.action === 'play' ? Math.abs(Math.sin(frame * 0.4)) * s * 6 : 0

    // 身体
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(0, -bounce - playBounce, s * 14, s * 10, 0, 0, Math.PI * 2)
    ctx.fill()

    // 腿
    const legAnim = state.action === 'walk' ? Math.sin(frame * 0.3) * s * 3 : 0
    ctx.fillStyle = color
    ctx.fillRect(-s * 8 + legAnim, s * 6 - bounce - playBounce, s * 4, s * 8)
    ctx.fillRect(s * 4 - legAnim, s * 6 - bounce - playBounce, s * 4, s * 8)
    // 脚
    ctx.fillStyle = '#333'
    ctx.fillRect(-s * 8 + legAnim, s * 12 - bounce - playBounce, s * 5, s * 2)
    ctx.fillRect(s * 4 - legAnim, s * 12 - bounce - playBounce, s * 5, s * 2)

    // 头
    const headY = -s * 16 - bounce - playBounce
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(0, headY, s * 11, 0, Math.PI * 2)
    ctx.fill()

    // 耳朵
    ctx.beginPath()
    ctx.moveTo(-s * 7, headY - s * 8)
    ctx.lineTo(-s * 11, headY - s * 18)
    ctx.lineTo(-s * 2, headY - s * 10)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(s * 7, headY - s * 8)
    ctx.lineTo(s * 11, headY - s * 18)
    ctx.lineTo(s * 2, headY - s * 10)
    ctx.fill()
    // 耳朵内
    ctx.fillStyle = '#FDA4AF'
    ctx.beginPath()
    ctx.moveTo(-s * 6, headY - s * 9)
    ctx.lineTo(-s * 9, headY - s * 16)
    ctx.lineTo(-s * 3, headY - s * 10)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(s * 6, headY - s * 9)
    ctx.lineTo(s * 9, headY - s * 16)
    ctx.lineTo(s * 3, headY - s * 10)
    ctx.fill()

    // 眼睛
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.arc(-s * 4, headY - s * 1, s * 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s * 4, headY - s * 1, s * 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(-s * 3.5, headY - s * 0.5, s * 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s * 4.5, headY - s * 0.5, s * 2, 0, Math.PI * 2)
    ctx.fill()
    // 高光
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.arc(-s * 3, headY - s * 1.5, s * 0.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s * 5, headY - s * 1.5, s * 0.8, 0, Math.PI * 2)
    ctx.fill()

    // 鼻子
    ctx.fillStyle = '#FDA4AF'
    ctx.beginPath()
    ctx.moveTo(0, headY + s * 2)
    ctx.lineTo(-s * 1.5, headY + s * 4)
    ctx.lineTo(s * 1.5, headY + s * 4)
    ctx.fill()

    // 嘴
    ctx.strokeStyle = '#333'
    ctx.lineWidth = s * 0.8
    ctx.beginPath()
    ctx.moveTo(0, headY + s * 4)
    ctx.lineTo(-s * 2, headY + s * 6)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, headY + s * 4)
    ctx.lineTo(s * 2, headY + s * 6)
    ctx.stroke()

    // 胡须
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = s * 0.5
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(side * s * 5, headY + s * 3)
      ctx.lineTo(side * s * 14, headY + s * 1)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(side * s * 5, headY + s * 4)
      ctx.lineTo(side * s * 14, headY + s * 4)
      ctx.stroke()
    }

    // 尾巴
    ctx.strokeStyle = color
    ctx.lineWidth = s * 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(s * 12, -s * 4 - bounce)
    const tailWag = Math.sin(frame * 0.2) * s * 5
    ctx.quadraticCurveTo(s * 20, -s * 15 - bounce + tailWag, s * 16, -s * 22 - bounce)
    ctx.stroke()

    // 腮红
    ctx.fillStyle = 'rgba(253,164,175,0.4)'
    ctx.beginPath()
    ctx.arc(-s * 8, headY + s * 3, s * 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s * 8, headY + s * 3, s * 2.5, 0, Math.PI * 2)
    ctx.fill()

    // 玩耍时的爪子
    if (state.action === 'play' && frame % 20 < 10) {
      ctx.strokeStyle = color
      ctx.lineWidth = s * 2
      ctx.beginPath()
      ctx.moveTo(-s * 10, -s * 4)
      ctx.lineTo(-s * 16, -s * 12)
      ctx.stroke()
    }
  }

  ctx.restore()
}

/* Helper drawing functions */

function drawDog(ctx: CanvasRenderingContext2D, x: number, y: number, state: PetState, scale: number, color: string) {
  const s = scale
  const dir = state.direction
  const frame = state.frame

  ctx.save()
  ctx.translate(x, y)
  if (dir === -1) ctx.scale(-1, 1)

  if (state.action === 'sleep') {
    // 趴着的狗
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(0, 0, s * 22, s * 10, 0, 0, Math.PI * 2)
    ctx.fill()
    // 头
    ctx.beginPath()
    ctx.arc(-s * 16, -s * 4, s * 10, 0, Math.PI * 2)
    ctx.fill()
    // 垂耳
    ctx.fillStyle = darkenColor(color)
    ctx.beginPath()
    ctx.ellipse(-s * 24, -s * 2, s * 5, s * 10, -0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(-s * 8, -s * 2, s * 5, s * 10, 0.2, 0, Math.PI * 2)
    ctx.fill()
    // 闭眼
    ctx.strokeStyle = '#333'
    ctx.lineWidth = s * 1.5
    ctx.beginPath()
    ctx.arc(-s * 19, -s * 5, s * 3, 0.2, Math.PI - 0.2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(-s * 12, -s * 5, s * 3, 0.2, Math.PI - 0.2)
    ctx.stroke()
    // 鼻子
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.ellipse(-s * 15, -s * 1, s * 2.5, s * 2, 0, 0, Math.PI * 2)
    ctx.fill()
    // 尾巴
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(s * 20, -s * 4, s * 6, s * 3, 0, 0, Math.PI * 2)
    ctx.fill()
    // ZZZ
    if (state.zzz > 0) {
      ctx.fillStyle = 'rgba(100,100,255,0.6)'
      ctx.font = `${s * 8}px sans-serif`
      const zy = -s * 16 - Math.sin(Date.now() / 500) * s * 5
      ctx.fillText('z', -s * 5, zy)
    }
  } else {
    const bounce = state.action === 'walk' ? Math.sin(frame * 0.3) * s * 2 : 0
    const playBounce = state.action === 'play' ? Math.abs(Math.sin(frame * 0.4)) * s * 5 : 0

    // 身体
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(0, -bounce - playBounce, s * 16, s * 11, 0, 0, Math.PI * 2)
    ctx.fill()

    // 腿
    const legAnim = state.action === 'walk' ? Math.sin(frame * 0.3) * s * 3 : 0
    ctx.fillStyle = color
    ctx.fillRect(-s * 10 + legAnim, s * 6 - bounce - playBounce, s * 5, s * 9)
    ctx.fillRect(s * 5 - legAnim, s * 6 - bounce - playBounce, s * 5, s * 9)
    ctx.fillStyle = '#333'
    ctx.fillRect(-s * 10 + legAnim, s * 13 - bounce - playBounce, s * 6, s * 2)
    ctx.fillRect(s * 5 - legAnim, s * 13 - bounce - playBounce, s * 6, s * 2)

    // 头
    const headY = -s * 18 - bounce - playBounce
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(0, headY, s * 12, 0, Math.PI * 2)
    ctx.fill()
    // 嘴部突出
    ctx.beginPath()
    ctx.ellipse(0, headY + s * 6, s * 7, s * 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // 垂耳
    ctx.fillStyle = darkenColor(color)
    ctx.beginPath()
    ctx.ellipse(-s * 10, headY + s * 2, s * 5, s * 12, -0.15, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(s * 10, headY + s * 2, s * 5, s * 12, 0.15, 0, Math.PI * 2)
    ctx.fill()

    // 眼睛
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.arc(-s * 4, headY - s * 2, s * 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s * 4, headY - s * 2, s * 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(-s * 3.5, headY - s * 1.5, s * 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s * 4.5, headY - s * 1.5, s * 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.arc(-s * 3, headY - s * 2.5, s * 0.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s * 5, headY - s * 2.5, s * 0.8, 0, Math.PI * 2)
    ctx.fill()

    // 鼻子
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.ellipse(0, headY + s * 4, s * 3, s * 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // 嘴
    ctx.strokeStyle = '#333'
    ctx.lineWidth = s * 0.8
    ctx.beginPath()
    ctx.moveTo(0, headY + s * 6)
    ctx.lineTo(-s * 3, headY + s * 8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, headY + s * 6)
    ctx.lineTo(s * 3, headY + s * 8)
    ctx.stroke()

    // 舌头（playful/happy）
    if (state.action === 'play' || state.action === 'eat') {
      ctx.fillStyle = '#F87171'
      ctx.beginPath()
      ctx.ellipse(s * 2, headY + s * 9, s * 2.5, s * 4, 0.1, 0, Math.PI * 2)
      ctx.fill()
    }

    // 尾巴（摇）
    ctx.strokeStyle = color
    ctx.lineWidth = s * 3.5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(s * 14, -s * 6 - bounce)
    const tailWag = Math.sin(frame * 0.4) * s * 8
    ctx.quadraticCurveTo(s * 22, -s * 16 - bounce + tailWag, s * 18, -s * 24 - bounce)
    ctx.stroke()
  }

  ctx.restore()
}

function darkenColor(hex: string): string {
  // 简单变暗
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.max(0, r - 35)},${Math.max(0, g - 35)},${Math.max(0, b - 35)})`
}

/* Original helper drawing functions */

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = '#22C55E'
  ctx.fillRect(x - 1, y, 2, 12)
  ctx.fillStyle = color
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(x + Math.cos(a) * 4, y - 2 + Math.sin(a) * 4, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#FBBF24'
  ctx.beginPath()
  ctx.arc(x, y - 2, 2, 0, Math.PI * 2)
  ctx.fill()
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.beginPath()
  ctx.arc(x, y, size * 0.6, 0, Math.PI * 2)
  ctx.arc(x + size * 0.5, y - size * 0.2, size * 0.5, 0, Math.PI * 2)
  ctx.arc(x + size, y, size * 0.6, 0, Math.PI * 2)
  ctx.arc(x + size * 0.5, y + size * 0.1, size * 0.5, 0, Math.PI * 2)
  ctx.fill()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.fill()
}

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, maxW: number) {
  ctx.font = '12px sans-serif'
  const lines: string[] = []
  let line = ''
  for (const char of text) {
    if (ctx.measureText(line + char).width > maxW - 16) {
      lines.push(line)
      line = char
    } else {
      line += char
    }
  }
  if (line) lines.push(line)

  const lineH = 16
  const bw = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)) + 20)
  const bh = lines.length * lineH + 12

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath()
  const bx = x - bw / 2
  const by = y - bh
  roundRect(ctx, bx, by, bw, bh, 10)

  // 小三角
  ctx.beginPath()
  ctx.moveTo(x - 5, y)
  ctx.lineTo(x, y + 6)
  ctx.lineTo(x + 5, y)
  ctx.fill()

  ctx.fillStyle = '#57534E'
  ctx.textAlign = 'center'
  lines.forEach((l, i) => {
    ctx.fillText(l, x, by + 14 + i * lineH)
  })
  ctx.textAlign = 'start'
}

// ===== 装饰物渲染 =====

const DECOR_POSITIONS: Record<string, { x: number; y: number; size: number }> = {
  cat_bed: { x: 0.15, y: 0.58, size: 20 },
  food_bowl: { x: 0.82, y: 0.6, size: 16 },
  toy_ball: { x: 0.7, y: 0.6, size: 14 },
  cat_tree: { x: 0.9, y: 0.42, size: 24 },
  fish_tank: { x: 0.12, y: 0.35, size: 20 },
  cushion: { x: 0.35, y: 0.58, size: 18 },
  plant: { x: 0.08, y: 0.45, size: 18 },
  photo_frame: { x: 0.25, y: 0.2, size: 16 },
  wind_chime: { x: 0.75, y: 0.12, size: 16 },
  night_light: { x: 0.88, y: 0.5, size: 16 },
  music_box: { x: 0.6, y: 0.58, size: 14 },
  rainbow_bridge: { x: 0.5, y: 0.08, size: 28 },
}

const DECOR_ICONS: Record<string, string> = {
  cat_bed: '\u{1F6CF}\uFE0F', food_bowl: '\u{1F37D}\uFE0F', toy_ball: '\u{1F9F6}',
  cat_tree: '\u{1F3D7}\uFE0F', fish_tank: '\u{1F420}', cushion: '\u{1F6CB}\uFE0F',
  plant: '\u{1FAB4}', photo_frame: '\u{1F5BC}\uFE0F', wind_chime: '\u{1F390}',
  night_light: '\u{1F52E}', music_box: '\u{1F3B5}', rainbow_bridge: '\u{1F308}',
}

function drawDecorItems(ctx: CanvasRenderingContext2D, w: number, h: number, decor: string[]) {
  for (const key of decor) {
    const pos = DECOR_POSITIONS[key]
    const icon = DECOR_ICONS[key]
    if (!pos || !icon) continue
    ctx.font = `${pos.size}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(icon, pos.x * w, pos.y * h)
  }
  ctx.textAlign = 'start'
}

// ===== 主组件 =====

const PET_COLORS: Record<string, string> = {
  pet_cat: '#F59E0B',
  pet_dog: '#92400E',
  pet_other: '#A78BFA',
  human: '#FBBF24',
}

export default function PixelPetEngine({ spiritType, mood, homeStyle, name, statusText, decor, onInteract }: PixelPetEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<PetState>({
    x: 0.5, y: 0, action: 'idle', frame: 0, direction: 1, actionTimer: 0, zzz: 0, particles: [], foodBowl: 0,
  })
  const [showBubble, setShowBubble] = useState(true)
  const animRef = useRef<number>(0)

  // 状态气泡
  useEffect(() => {
    setShowBubble(true)
    const t = setTimeout(() => setShowBubble(false), 4000)
    return () => clearTimeout(t)
  }, [statusText])

  const update = useCallback(() => {
    const st = stateRef.current
    st.frame++
    st.actionTimer--

    // 切换动作
    if (st.actionTimer <= 0) {
      st.action = pickAction(mood)
      st.actionTimer = 60 + Math.random() * 180 // 1-4秒
      if (st.action === 'sleep') st.actionTimer = 300 + Math.random() * 300
      if (st.action === 'walk') st.direction = Math.random() > 0.5 ? 1 : -1
    }

    // 移动
    if (st.action === 'walk') {
      st.x += st.direction * 0.003
      if (st.x > 0.85) { st.direction = -1 }
      if (st.x < 0.15) { st.direction = 1 }
    }

    // 睡觉Z
    st.zzz = st.action === 'sleep' ? 1 : 0

    // 食碗
    if (st.foodBowl > 0) st.foodBowl--

    // 粒子更新
    st.particles = st.particles.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy -= 0.02 // 重力反向（上飘）
      p.life--
      return p.life > 0
    })
  }, [mood])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const st = stateRef.current
    const phase = getDayPhase()

    ctx.clearRect(0, 0, w, h)

    // 场景
    drawScene(ctx, w, h, homeStyle as HomeStyle, phase)

    // 装饰物
    if (decor && decor.length > 0) {
      drawDecorItems(ctx, w, h, decor)
    }

    // 宠物
    const petX = st.x * w
    const groundY = h * 0.65
    const petY = groundY - 5
    const color = PET_COLORS[spiritType] || '#F59E0B'
    if (spiritType === 'pet_dog') {
      drawDog(ctx, petX, petY, st, 1.8, color)
    } else {
      drawCat(ctx, petX, petY, st, 1.8, color)
    }

    // 名字
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(name, petX, groundY + 20)
    ctx.textAlign = 'start'

    // 食碗
    if (st.foodBowl > 0) {
      const bowlX = petX + 30 * st.direction
      ctx.fillStyle = '#DC2626'
      ctx.beginPath()
      ctx.ellipse(bowlX, groundY - 2, 12, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#7C2D12'
      ctx.beginPath()
      ctx.ellipse(bowlX, groundY - 4, 8, 4, 0, 0, Math.PI)
      ctx.fill()
    }

    // 粒子
    for (const p of st.particles) {
      const alpha = p.life / p.maxLife
      if (p.type === 'heart') {
        ctx.fillStyle = `rgba(239,68,68,${alpha})`
        ctx.font = `${10 + (1 - alpha) * 6}px sans-serif`
        ctx.fillText('❤', p.x * w, p.y * h)
      } else if (p.type === 'star') {
        ctx.fillStyle = `rgba(251,191,36,${alpha})`
        ctx.font = `${8 + (1 - alpha) * 4}px sans-serif`
        ctx.fillText('✨', p.x * w, p.y * h)
      }
    }

    // 状态气泡
    if (showBubble && statusText) {
      drawBubble(ctx, petX, petY - 45, statusText, w * 0.6)
    }
  }, [homeStyle, spiritType, name, statusText, showBubble])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.clientWidth * 2
      canvas.height = parent.clientWidth * 2 * 0.75
      canvas.style.width = '100%'
      canvas.style.height = 'auto'
    }

    const loop = () => {
      update()
      draw()
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [update, draw])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const st = stateRef.current

    if (Math.abs(x - st.x) < 0.2) {
      if (y > 0.6) {
        // 喂食
        st.action = 'eat'
        st.actionTimer = 90
        st.foodBowl = 120
        // 星星粒子
        for (let i = 0; i < 5; i++) {
          st.particles.push({
            x: st.x + (Math.random() - 0.5) * 0.1,
            y: 0.55,
            vx: (Math.random() - 0.5) * 0.003,
            vy: -0.003 - Math.random() * 0.003,
            life: 40 + Math.random() * 20,
            maxLife: 60,
            type: 'star',
          })
        }
        onInteract?.('feed')
      } else {
        // 抚摸
        st.action = 'play'
        st.actionTimer = 60
        // 爱心粒子
        for (let i = 0; i < 6; i++) {
          st.particles.push({
            x: st.x + (Math.random() - 0.5) * 0.08,
            y: 0.35 + Math.random() * 0.1,
            vx: (Math.random() - 0.5) * 0.002,
            vy: -0.004 - Math.random() * 0.003,
            life: 50 + Math.random() * 30,
            maxLife: 80,
            type: 'heart',
          })
        }
        onInteract?.('pet')
      }
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-lg">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="cursor-pointer"
      />
    </div>
  )
}
