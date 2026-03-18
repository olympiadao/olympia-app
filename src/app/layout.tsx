import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
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
  metadataBase: new URL("https://core.olympiadao.org"),
  title: {
    default: "Olympia Governance — CoreDAO for Ethereum Classic",
    template: "%s | Olympia Governance",
  },
  description:
    "CoreDAO governance application for Ethereum Classic. Browse proposals, vote, manage treasury, and participate in on-chain governance.",
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
  ],
  authors: [
    { name: "Cody Burns", url: "https://github.com/realcodywburns" },
    { name: "Chris Mercer", url: "https://github.com/chris-mercer" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://core.olympiadao.org",
    siteName: "Olympia Governance",
    title: "Olympia Governance — CoreDAO for Ethereum Classic",
    description:
      "Browse proposals, vote, and manage the treasury. On-chain governance for ETC.",
    images: [
      {
        url: "https://core.olympiadao.org/og-image.png",
        width: 1200,
        height: 630,
        alt: "Olympia CoreDAO Governance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olympia Governance — CoreDAO for Ethereum Classic",
    description: "On-chain governance for Ethereum Classic",
    images: ["https://core.olympiadao.org/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        <ThemeProvider>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:pl-64">
              <Header />
              <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </div>
          <MobileNav />
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
