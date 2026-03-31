import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('photos') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const buffer = Buffer.from(await file.arrayBuffer())
      const { error } = await supabase.storage
        .from('spirit-photos')
        .upload(path, buffer, { contentType: file.type })

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('spirit-photos')
        .getPublicUrl(path)

      urls.push(urlData.publicUrl)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
