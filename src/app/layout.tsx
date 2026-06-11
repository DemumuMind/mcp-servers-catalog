import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://mcpservers.org"),
  title: {
    default: "Awesome MCP Servers",
    template: "%s | Awesome MCP Servers",
  },
  description: "Collection of servers for Model Context Protocol. Find, compare and use MCP servers for your AI.",
  keywords: ["MCP", "Model Context Protocol", "AI servers", "MCP servers", "AI tools"],
  authors: [{ name: "Awesome MCP" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Awesome MCP Servers",
    title: "Awesome MCP Servers",
    description: "Collection of servers for Model Context Protocol",
    images: [
      {
        url: "/og-brand.png",
        width: 1200,
        height: 630,
        alt: "MCP Servers Protocol Catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Awesome MCP Servers",
    description: "Collection of servers for Model Context Protocol",
    images: ["/og-brand.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/en",
  },
};

const THEME_SCRIPT_SRC = `data:text/javascript,${encodeURIComponent(
  "(function(){try{var t=localStorage.getItem('theme')||'system';if(t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){console.warn('Theme detection failed:',e)}})();"
)}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <noscript>
          <style>{`html.dark{--tw-bg-opacity:1;background-color:rgb(10 10 10 / var(--tw-bg-opacity))}`}</style>
        </noscript>
      </head>
      <body
        className={`${manrope.variable} ${unbounded.variable} ${jetbrainsMono.variable} min-h-screen font-sans antialiased`}
        suppressHydrationWarning
      >
        <script async src={THEME_SCRIPT_SRC} />
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
