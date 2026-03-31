import { z } from 'zod'

export const createSpiritSchema = z.object({
  name: z.string().min(1).max(50),
  spiritType: z.enum(['pet_cat', 'pet_dog', 'pet_other', 'human']),
  personality: z.object({
    tags: z.array(z.string()).min(1).max(6),
    habits: z.string().max(500).optional(),
    funnyStory: z.string().max(500).optional(),
  }),
  homeStyle: z.enum(['cozy_room', 'garden', 'cloud_loft', 'mountain_cabin']).default('cozy_room'),
  photoUrls: z.array(z.string()).default([]),
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
