import { createClient } from '@supabase/supabase-js'

const bucket = 'spirit-photos'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export function isStoragePath(value: string) {
  return value.length > 0 && !value.startsWith('http://') && !value.startsWith('https://')
}

export async function createSignedPhotoUrls(photoRefs: string[], expiresIn = 60 * 60) {
  if (photoRefs.length === 0) return []

  const signedRefs = photoRefs.filter(isStoragePath)
  const signedMap = new Map<string, string>()

  if (signedRefs.length > 0) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrls(signedRefs, expiresIn)

    if (error) {
      console.error('Create signed urls error:', error)
    } else {
      data.forEach((item, index) => {
        if (item.signedUrl) {
          signedMap.set(signedRefs[index], item.signedUrl)
        }
      })
    }
  }

  return photoRefs.map((ref) => {
    if (!isStoragePath(ref)) return ref
    return signedMap.get(ref) || ''
  }).filter(Boolean)
}

export async function createShareablePhotoUrl(photoRef?: string | null, expiresIn = 60 * 30) {
  if (!photoRef) return null
  const [url] = await createSignedPhotoUrls([photoRef], expiresIn)
  return url || null
}

export async function deleteStorageFiles(photoRefs: string[]) {
  const storagePaths = photoRefs.filter(isStoragePath)
  if (storagePaths.length === 0) return

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove(storagePaths)

  if (error) {
    console.error('Delete storage files error:', error)
  }
}
