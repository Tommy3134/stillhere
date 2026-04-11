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

export const updateSpiritDetailsSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(50),
  personality: spiritPersonalitySchema,
  addPhotoUrls: z.array(z.string()).max(9).default([]),
  removePhotoRefs: z.array(z.string()).max(18).default([]),
})

export const sendMessageSchema = z.object({
  spiritId: z.string(),
  content: z.string().min(1).max(1000),
})

export const blessSchema = z.object({
  spiritId: z.string(),
  blessingType: z.enum(['candle', 'flower', 'prayer', 'charm']),
})

const optionalShortFeedback = z.string().trim().max(100).optional().default('')
const optionalLongFeedback = z.string().trim().max(2000).optional().default('')
const feedbackContextSnapshotSchema = z.object({
  progressLabel: z.string().trim().max(100).optional().default(''),
  nextStep: z.string().trim().max(200).optional().default(''),
  photoCount: z.number().int().min(0).nullable().optional().default(null),
  shareEnabled: z.boolean().nullable().optional().default(null),
  returnReason: z.string().trim().max(200).optional().default(''),
})

export const feedbackSubmissionSchema = z.object({
  who: optionalShortFeedback,
  feeling: optionalLongFeedback,
  comeback: optionalShortFeedback,
  feature: optionalShortFeedback,
  wanted: optionalShortFeedback,
  price: optionalShortFeedback,
  share: optionalShortFeedback,
  other: optionalLongFeedback,
  context: z.object({
    source: z.string().trim().max(50).optional().default('unknown'),
    sourceLabel: z.string().trim().max(100).optional().default('unknown'),
    spiritId: z.string().trim().max(100).nullable().optional().default(null),
    spiritName: z.string().trim().max(100).nullable().optional().default(null),
    snapshot: feedbackContextSnapshotSchema.optional().default({
      progressLabel: '',
      nextStep: '',
      photoCount: null,
      shareEnabled: null,
      returnReason: '',
    }),
  }).optional().default({
    source: 'unknown',
    sourceLabel: 'unknown',
    spiritId: null,
    spiritName: null,
    snapshot: {
      progressLabel: '',
      nextStep: '',
      photoCount: null,
      shareEnabled: null,
      returnReason: '',
    },
  }),
})

export type CreateSpiritInput = z.infer<typeof createSpiritSchema>
export type UpdateSpiritDetailsInput = z.infer<typeof updateSpiritDetailsSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type BlessInput = z.infer<typeof blessSchema>
export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>
