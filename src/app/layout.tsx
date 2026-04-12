import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#d97706",
};

export const metadata: Metadata = {
  title: "仍在 / Stillhere",
  description: "一个给离开的宠物留纪念空间的小网站，默认私密，你可以放照片、名字、习惯和故事，以后想它的时候还能回来看看。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "仍在",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} min-h-screen bg-amber-50 font-sans text-stone-800 antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <footer className="border-t border-stone-200 bg-white/80 px-6 py-8 backdrop-blur">
              <div className="mx-auto grid max-w-5xl gap-4 text-sm leading-7 text-stone-500 md:grid-cols-4">
                <p>
                  <span className="font-medium text-stone-700">你的内容</span> · 你拥有 · 你可以删 · 你可以导出
                </p>
                <p>
                  <span className="font-medium text-stone-700">默认私密</span> · 除非你主动分享,没人能进来
                </p>
                <p>
                  <span className="font-medium text-stone-700">不训练</span> · 我们不用你的内容训练任何 AI 模型
                </p>
                <p>
                  <span className="font-medium text-stone-700">不上链</span> · 敏感原始内容不会写到任何区块链上
                </p>
              </div>
              <div className="mx-auto mt-4 max-w-5xl text-xs leading-6 text-stone-400">
                <p>StillHere 是纪念空间,不是心理咨询服务。如果你需要专业帮助,请联系专业机构。</p>
                <p className="mt-1"><a href="/privacy" className="underline underline-offset-2 hover:text-stone-500">隐私政策</a></p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
