import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const files = formData.getAll('photos') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const paths: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const buffer = Buffer.from(await file.arrayBuffer())
      const { error } = await supabase.storage
        .from('spirit-photos')
        .upload(path, buffer, { contentType: file.type })

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      paths.push(path)
    }

    return NextResponse.json({ paths })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
