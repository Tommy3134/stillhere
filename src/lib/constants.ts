export const SPIRIT_TYPES = {
  pet_cat: '猫咪',
  pet_dog: '狗狗',
  pet_other: '其他宠物',
  human: '家人/朋友',
} as const

export type SpiritType = keyof typeof SPIRIT_TYPES

export const PERSONALITY_TAGS = [
  '粘人', '独立', '好奇', '胆小',
  '贪吃', '活泼', '安静', '调皮',
  '温柔', '霸道', '聪明', '傻乎乎',
] as const

export const HOME_STYLES = {
  cozy_room: '温馨小屋',
  garden: '花园小院',
  cloud_loft: '云端阁楼',
  mountain_cabin: '山间木屋',
} as const

export const BLESSING_ITEMS = {
  candle: { name: '点灯', icon: '🕯️', priceCny: 1 },
  flower: { name: '献花', icon: '🌸', priceCny: 2 },
  prayer: { name: '祈福', icon: '📿', priceCny: 5 },
  charm: { name: '护身符', icon: '✨', priceCny: 10 },
} as const

export const MOODS = {
  content: '满足',
  playful: '玩耍',
  sleepy: '犯困',
  curious: '好奇',
  happy: '开心',
} as const
