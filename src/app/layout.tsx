import type { Metadata } from "next";

import "./globals.css";

import Script from "next/script";

import { MainLayout } from "@/components/layout/main-layout";
import { Providers } from "@/providers/providers-index";

export const metadata: Metadata = {
  title: {
    default: "Yaad",
    template: "%s | Yaad",
  },
  description: "Your modern note-taking application",
  applicationName: "Yaad",
  keywords: ["notes", "note-taking", "productivity", "yaad", "organization"],
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "Yaad",
    description: "Your modern note-taking application",
    siteName: "Yaad",
    images: [
      {
        url: "/favicon/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Yaad Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Yaad",
    description: "Your modern note-taking application",
    images: ["/favicon/android-chrome-512x512.png"],
  },
};

const themeScript = `
  (function() {
    try {
      var theme = JSON.parse(localStorage.getItem('theme'));
      if (theme === 'dark') document.documentElement.classList.add('dark');
    } catch (e) {}
  })()
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: React will try to remove 'dark' during hydration
    // because the server rendered without it. This tells React to ignore class
    // mismatches on <html> so the inline script's class survives hydration.
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script id="theme" dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* <Script
          src="//unpkg.com/react-scan/dist/auto.global.js"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        /> */}
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
