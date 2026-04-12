import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RandomStatusCard } from './RandomStatusCard'
import { getAllSampleMemorialSlugs, getSampleMemorial } from '@/lib/sample-memorial'

const sampleMetadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

type Props = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return getAllSampleMemorialSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const memorial = getSampleMemorial(params.slug)

  if (!memorial) {
    return {}
  }

  return {
    metadataBase: sampleMetadataBase,
    title: '史小圆的纪念空间 · StillHere 示例',
    description: memorial.hero.declarationParagraphs[0],
    alternates: {
      canonical: `/sample/${memorial.slug}`,
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: '史小圆的纪念空间 · StillHere 示例',
      description: memorial.hero.declarationParagraphs[0],
      url: `/sample/${memorial.slug}`,
      images: [
        {
          url: memorial.heroImageUrl,
          alt: memorial.hero.title,
        },
      ],
    },
  }
}

export default function SampleMemorialPage({ params }: Props) {
  const memorial = getSampleMemorial(params.slug)

  if (!memorial) {
    notFound()
  }

  return (
    <main
      className="min-h-screen bg-[#f6f2ea] px-6 py-8 text-stone-800 md:px-8 md:py-10"
      style={{
        fontFamily:
          '"Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", ui-serif, Georgia, Cambria, "Times New Roman", serif',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <section className="flex min-h-[100svh] items-center py-6 md:py-10">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.9fr)] lg:items-end">
            <div className="order-2 max-w-3xl lg:order-1">
              <h1 className="whitespace-nowrap text-[clamp(1.65rem,6.2vw,5.2rem)] font-semibold leading-none tracking-[-0.04em] text-stone-800">
                {memorial.hero.title}
              </h1>

              <div className="mt-8 space-y-3 text-base leading-8 text-stone-600 md:text-xl md:leading-10">
                {memorial.hero.subtitleLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>

              <div className="mt-10 max-w-2xl space-y-5 text-sm leading-7 text-stone-500 md:text-base md:leading-8">
                <p>{memorial.hero.declarationParagraphs[0]}</p>
                <p>
                  做这个示例,是因为我们相信:
                  <strong className="font-semibold text-stone-700">
                    在你决定是否要为你的猫/狗留一个这样的空间之前,你应该先看到一个完成后的大概样子。
                  </strong>
                </p>
              </div>

              <p className="mt-14 text-sm tracking-[0.22em] text-stone-400">{memorial.hero.scrollLabel}</p>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-200/70 bg-white shadow-[0_28px_100px_rgba(89,69,41,0.12)]">
                <div className="relative aspect-[7/5]">
                  <Image
                    src={memorial.heroImageUrl}
                    alt="史小圆的示例纪念像"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[minmax(280px,0.62fr)_minmax(0,1fr)] lg:items-start">
            <div className="rounded-[2.25rem] border border-stone-200/70 bg-white px-6 py-7 shadow-[0_24px_80px_rgba(90,72,42,0.08)] md:px-8 md:py-8">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-stone-800 md:text-4xl">
                {memorial.about.title}
              </h2>

              <div className="mt-7 overflow-hidden rounded-[1.8rem] bg-[#f3ede2]">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={memorial.about.accentImageUrl}
                    alt="史小圆的生成纪念像"
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="mt-7 space-y-3 text-base leading-8 text-stone-600">
                {memorial.about.facts.map((fact) => (
                  <p key={fact} className="whitespace-pre-wrap">
                    {fact}
                  </p>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="flex min-w-max gap-4 md:gap-5">
                {memorial.galleryImageUrls.map((photoUrl, index) => (
                  <div
                    key={photoUrl}
                    className="relative h-[320px] w-[240px] shrink-0 overflow-hidden rounded-[1.9rem] border border-stone-200/70 bg-white shadow-[0_20px_60px_rgba(90,72,42,0.08)] md:h-[380px] md:w-[285px]"
                  >
                    <Image
                      src={photoUrl}
                      alt={`史小圆的照片 ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 70vw, 285px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-stone-800 md:text-4xl">
              {memorial.traits.title}
            </h2>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {memorial.traits.cards.map((card) => (
              <article
                key={card.title}
                className="overflow-hidden rounded-[2.25rem] border border-stone-200/70 bg-white shadow-[0_24px_80px_rgba(90,72,42,0.08)]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={card.imageUrl}
                    alt={card.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-6 py-7 md:px-7">
                  <h3 className="text-2xl font-semibold leading-tight tracking-[-0.03em] text-stone-800">
                    {card.title}
                  </h3>
                  <div className="mt-6 space-y-4 text-base leading-8 text-stone-600">
                    {card.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-stone-800 md:text-4xl">
              {memorial.currentMoment.title}
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <RandomStatusCard
              statuses={memorial.currentMoment.statuses}
              signature={memorial.currentMoment.signature}
            />
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(300px,0.82fr)] lg:items-start">
            <div className="rounded-[2.25rem] border border-stone-200/70 bg-white px-6 py-7 shadow-[0_24px_80px_rgba(90,72,42,0.08)] md:px-8 md:py-9">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-stone-800 md:text-4xl">
                {memorial.ownerLetter.title}
              </h2>

              <div className="mt-8 space-y-5 text-lg leading-9 text-stone-600 md:text-xl md:leading-10">
                {memorial.ownerLetter.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="overflow-hidden rounded-[2.25rem] border border-stone-200/70 bg-white shadow-[0_24px_80px_rgba(90,72,42,0.08)]">
                <video
                  className="aspect-video w-full bg-stone-200 object-cover"
                  controls
                  preload="none"
                  poster={memorial.ownerLetter.videoPosterUrl}
                >
                  <source src={memorial.ownerLetter.videoUrl} type="video/mp4" />
                </video>
              </div>
              <p className="text-sm leading-7 text-stone-500">{memorial.ownerLetter.videoCaption}</p>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="rounded-[2.4rem] border border-stone-200/70 bg-white px-6 py-8 shadow-[0_28px_90px_rgba(90,72,42,0.1)] md:px-10 md:py-10">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-stone-800 md:text-5xl">
                {memorial.cta.title}
              </h2>

              <div className="mt-8 space-y-4 text-lg leading-9 text-stone-600 md:text-xl md:leading-10">
                {memorial.cta.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center">
              <Link
                href={memorial.cta.primaryHref}
                className="inline-flex justify-center rounded-full bg-stone-900 px-8 py-3 text-base text-white transition-colors hover:bg-stone-700"
              >
                {memorial.cta.primaryLabel}
              </Link>
              <Link
                href={memorial.cta.secondaryHref}
                className="inline-flex justify-center rounded-full border border-stone-300 px-8 py-3 text-base text-stone-700 transition-colors hover:bg-stone-100"
              >
                {memorial.cta.secondaryLabel}
              </Link>
            </div>

            <p className="mt-5 text-sm leading-7 text-stone-500">{memorial.cta.primaryNote}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
