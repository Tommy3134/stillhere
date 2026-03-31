'use client'

type Mood = 'sleepy' | 'playful' | 'content' | 'curious' | 'happy'

interface SpiritAvatarSVGProps {
  spiritType: string
  mood: Mood
  size?: number
  color?: string
}

export default function SpiritAvatarSVG({ spiritType, mood, size = 120, color }: SpiritAvatarSVGProps) {
  if (spiritType === 'pet_cat') return <CatAvatar mood={mood} size={size} color={color || '#F59E0B'} />
  if (spiritType === 'pet_dog') return <DogAvatar mood={mood} size={size} color={color || '#92400E'} />
  if (spiritType === 'human') return <HumanAvatar mood={mood} size={size} />
  return <CatAvatar mood={mood} size={size} color={color || '#A78BFA'} />
}

function CatAvatar({ mood, size, color }: { mood: Mood; size: number; color: string }) {
  const eyeStyle = getEyeStyle(mood)
  const mouthStyle = getMouthStyle(mood)

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 身体 */}
      <ellipse cx="60" cy="75" rx="35" ry="30" fill={color} opacity="0.9" />
      {/* 头 */}
      <circle cx="60" cy="50" r="28" fill={color} />
      {/* 耳朵 */}
      <path d="M38 30 L30 10 L50 25 Z" fill={color} />
      <path d="M82 30 L90 10 L70 25 Z" fill={color} />
      <path d="M40 28 L34 14 L48 25 Z" fill={lighten(color)} />
      <path d="M80 28 L86 14 L72 25 Z" fill={lighten(color)} />
      {/* 眼睛 */}
      {eyeStyle}
      {/* 嘴巴 */}
      {mouthStyle}
      {/* 胡须 */}
      <line x1="30" y1="52" x2="45" y2="54" stroke="#666" strokeWidth="1" opacity="0.4" />
      <line x1="30" y1="56" x2="45" y2="56" stroke="#666" strokeWidth="1" opacity="0.4" />
      <line x1="75" y1="54" x2="90" y2="52" stroke="#666" strokeWidth="1" opacity="0.4" />
      <line x1="75" y1="56" x2="90" y2="56" stroke="#666" strokeWidth="1" opacity="0.4" />
      {/* 腮红 */}
      <circle cx="42" cy="58" r="5" fill="#FDA4AF" opacity="0.4" />
      <circle cx="78" cy="58" r="5" fill="#FDA4AF" opacity="0.4" />
    </svg>
  )
}

function DogAvatar({ mood, size, color }: { mood: Mood; size: number; color: string }) {
  const eyeStyle = getEyeStyle(mood)
  const mouthStyle = getMouthStyle(mood)

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 身体 */}
      <ellipse cx="60" cy="78" rx="32" ry="28" fill={color} opacity="0.9" />
      {/* 头 */}
      <circle cx="60" cy="50" r="28" fill={color} />
      {/* 耳朵（垂耳） */}
      <ellipse cx="35" cy="38" rx="12" ry="20" fill={darken(color)} transform="rotate(-15 35 38)" />
      <ellipse cx="85" cy="38" rx="12" ry="20" fill={darken(color)} transform="rotate(15 85 38)" />
      {/* 眼睛 */}
      {eyeStyle}
      {/* 鼻子 */}
      <ellipse cx="60" cy="55" rx="5" ry="4" fill="#333" />
      {/* 嘴巴 */}
      {mouthStyle}
      {/* 舌头（playful/happy时） */}
      {(mood === 'playful' || mood === 'happy') && (
        <ellipse cx="63" cy="65" rx="4" ry="6" fill="#F87171" />
      )}
      {/* 腮红 */}
      <circle cx="42" cy="58" r="5" fill="#FDA4AF" opacity="0.3" />
      <circle cx="78" cy="58" r="5" fill="#FDA4AF" opacity="0.3" />
    </svg>
  )
}

function HumanAvatar({ mood, size }: { mood: Mood; size: number }) {
  const eyeStyle = getEyeStyle(mood)
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="50" r="28" fill="#FBBF24" />
      <ellipse cx="60" cy="80" rx="30" ry="25" fill="#FBBF24" opacity="0.9" />
      {/* 头发 */}
      <path d="M32 45 Q35 20 60 18 Q85 20 88 45" fill="#333" />
      {eyeStyle}
      <path d="M55 60 Q60 65 65 60" stroke="#333" strokeWidth="1.5" fill="none" />
      <circle cx="42" cy="58" r="4" fill="#FDA4AF" opacity="0.4" />
      <circle cx="78" cy="58" r="4" fill="#FDA4AF" opacity="0.4" />
    </svg>
  )
}

/* Helper functions */

function getEyeStyle(mood: Mood) {
  switch (mood) {
    case 'sleepy':
      return (
        <>
          <path d="M45 48 Q50 46 55 48" stroke="#333" strokeWidth="2" fill="none" />
          <path d="M65 48 Q70 46 75 48" stroke="#333" strokeWidth="2" fill="none" />
        </>
      )
    case 'curious':
      return (
        <>
          <circle cx="48" cy="46" r="5" fill="white" />
          <circle cx="72" cy="46" r="5" fill="white" />
          <circle cx="49" cy="45" r="3" fill="#333" />
          <circle cx="73" cy="45" r="3" fill="#333" />
          <circle cx="50" cy="44" r="1" fill="white" />
          <circle cx="74" cy="44" r="1" fill="white" />
        </>
      )
    case 'happy':
    case 'playful':
      return (
        <>
          <path d="M43 47 Q48 43 53 47" stroke="#333" strokeWidth="2" fill="none" />
          <path d="M67 47 Q72 43 77 47" stroke="#333" strokeWidth="2" fill="none" />
        </>
      )
    default: // content
      return (
        <>
          <circle cx="48" cy="46" r="4" fill="white" />
          <circle cx="72" cy="46" r="4" fill="white" />
          <circle cx="49" cy="46" r="2.5" fill="#333" />
          <circle cx="73" cy="46" r="2.5" fill="#333" />
          <circle cx="50" cy="45" r="1" fill="white" />
          <circle cx="74" cy="45" r="1" fill="white" />
        </>
      )
  }
}

function getMouthStyle(mood: Mood) {
  switch (mood) {
    case 'happy':
    case 'playful':
      return <path d="M52 60 Q60 68 68 60" stroke="#333" strokeWidth="1.5" fill="none" />
    case 'sleepy':
      return <path d="M55 60 Q60 62 65 60" stroke="#333" strokeWidth="1.5" fill="none" />
    case 'curious':
      return <circle cx="60" cy="62" rx="3" ry="4" fill="#333" opacity="0.6" />
    default:
      return <path d="M54 60 Q60 64 66 60" stroke="#333" strokeWidth="1.5" fill="none" />
  }
}

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.min(255, r + 40)
  const lg = Math.min(255, g + 40)
  const lb = Math.min(255, b + 40)
  return `rgb(${lr},${lg},${lb})`
}

function darken(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const dr = Math.max(0, r - 30)
  const dg = Math.max(0, g - 30)
  const db = Math.max(0, b - 30)
  return `rgb(${dr},${dg},${db})`
}
