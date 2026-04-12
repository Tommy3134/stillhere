import { redirect } from 'next/navigation'
import { defaultSampleMemorial } from '@/lib/sample-memorial'

export default function SampleEntryPage() {
  redirect(`/sample/${defaultSampleMemorial.slug}`)
}
