import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Awesome MCP Servers",
    template: "%s | Awesome MCP Servers",
  },
  description: "Коллекция серверов для Model Context Protocol. Найдите, сравните и используйте MCP серверы для вашего AI.",
  keywords: ["MCP", "Model Context Protocol", "AI серверы", "MCP servers", "AI tools"],
  authors: [{ name: "Awesome MCP" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Awesome MCP Servers",
    title: "Awesome MCP Servers",
    description: "Коллекция серверов для Model Context Protocol",
  },
  twitter: {
    card: "summary_large_image",
    title: "Awesome MCP Servers",
    description: "Коллекция серверов для Model Context Protocol",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/ru",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (theme === 'system' && systemDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        <Script
          defer
          data-domain="mcpservers.org"
          src="https://plausible.io/js/script.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
