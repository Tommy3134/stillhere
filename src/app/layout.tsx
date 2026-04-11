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
      <body className={`${geistSans.variable} font-sans antialiased bg-amber-50 text-stone-800`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
