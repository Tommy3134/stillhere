import { z } from 'zod'

const optionalDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
const spiritPersonalitySchema = z.object({
  nickname: z.string().trim().max(50).optional(),
  tags: z.array(z.string()).min(1).max(6),
  habits: z.string().trim().max(500).optional(),
  funnyStory: z.string().trim().max(500).optional(),
  birthday: optionalDateString,
  passedDate: optionalDateString,
})

export const createSpiritSchema = z.object({
  name: z.string().trim().min(1).max(50),
  spiritType: z.enum(['pet_cat', 'pet_dog', 'pet_other', 'human']),
  personality: spiritPersonalitySchema,
  homeStyle: z.enum(['cozy_room', 'garden', 'cloud_loft', 'mountain_cabin']).default('cozy_room'),
  photoUrls: z.array(z.string()).default([]),
})

export const updateSpiritSharingSchema = z.object({
  id: z.string(),
  shareEnabled: z.boolean(),
})

export const sendMessageSchema = z.object({
  spiritId: z.string(),
  content: z.string().min(1).max(1000),
})

export const blessSchema = z.object({
  spiritId: z.string(),
  blessingType: z.enum(['candle', 'flower', 'prayer', 'charm']),
})

export type CreateSpiritInput = z.infer<typeof createSpiritSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type BlessInput = z.infer<typeof blessSchema>
