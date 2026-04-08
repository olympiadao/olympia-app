import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.olympiadao.org"),
  title: {
    default: "Olympia Governance — On-Chain Governance for Ethereum Classic",
    template: "%s | Olympia Governance",
  },
  description:
    "Olympia DAO governance application for Ethereum Classic. Browse proposals, vote, manage treasury, and participate in on-chain governance.",
  keywords: [
    "Ethereum Classic",
    "ETC",
    "Olympia",
    "DAO",
    "governance",
    "proposals",
    "voting",
    "treasury",
    "ECIP-1113",
    "ECIP-1114",
    "basefee",
    "miner rewards untouched",
    "block rewards",
    "EIP-1559",
    "ECIP-1112",
    "ECIP-1121",
    "Fusaka",
    "EVM upgrade",
    "EVM compatibility",
  ],
  authors: [
    { name: "Cody Burns", url: "https://github.com/realcodywburns" },
    { name: "Chris Mercer", url: "https://github.com/chris-mercer" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.olympiadao.org",
    siteName: "Olympia Governance",
    title: "Olympia Governance — On-Chain Governance for Ethereum Classic",
    description:
      "Browse proposals, vote, and manage the treasury. On-chain governance for ETC.",
    images: [
      {
        url: "https://app.olympiadao.org/og-image.png",
        width: 1200,
        height: 630,
        alt: "Olympia DAO Governance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olympia Governance — On-Chain Governance for Ethereum Classic",
    description: "On-chain governance for Ethereum Classic",
    images: ["https://app.olympiadao.org/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://app.olympiadao.org" },
  creator: "Ethereum Classic DAO",
  other: { "color-scheme": "dark" },
  formatDetection: { telephone: false, email: false },
  appleWebApp: {
    capable: true,
    title: "Olympia Governance",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <ThemeProvider>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:pl-64">
              <Header />
              <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          <MobileNav />
        </Providers>
        </ThemeProvider>
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "2725d4c6d2924e7e8b1ddfab7b4df968"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
