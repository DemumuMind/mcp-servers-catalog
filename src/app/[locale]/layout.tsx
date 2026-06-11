import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NextIntlClientProvider } from "next-intl";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { A2HSBanner } from "@/components/a2hs-banner";
import { HelpModal } from "@/components/help-modal";
import { WebVitals } from "@/components/web-vitals";
import { auth } from "@/lib/auth";
import { getUserNotifications, getUnreadNotificationsCount } from "@/app/actions/notifications";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { generateWebsiteJsonLd, generateOrganizationJsonLd } from "@/lib/json-ld";

const SITE_URL = process.env.SITE_URL || "https://mcpservers.org";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    description:
      "Collection of servers for Model Context Protocol. Find, compare and use MCP servers for your AI.",
    openGraph: {
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locale === "ru" ? "en_US" : "ru_RU",
      url: `${SITE_URL}/${locale}`,
      siteName: "Awesome MCP Servers",
      title: "Awesome MCP Servers",
      description:
        "Collection of servers for Model Context Protocol. Find, compare and use MCP servers for your AI.",
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
      description:
        "Collection of servers for Model Context Protocol. Find, compare and use MCP servers for your AI.",
      images: ["/og-brand.png"],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        ru: `${SITE_URL}/ru`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const resolvedLocale = locale || 'ru';
  
  // Direct import to avoid next-intl context issues
  const messages = (await import(`../../../messages/${resolvedLocale}.json`)).default;

  // Fetch auth and notifications in layout to avoid nested async components
  const session = await auth().catch(async (e) => {
    if (e?.message?.includes('no matching decryption secret') || e?.code === 'JWTSessionError') {
      const cookieStore = await cookies()
      cookieStore.delete('authjs.session-token')
      cookieStore.delete('__Secure-authjs.session-token')
    }
    return null
  })
  const notifications = session?.user?.id ? await getUserNotifications(session.user.id).catch(() => []) : [];
  const unreadCount = session?.user?.id ? await getUnreadNotificationsCount(session.user.id).catch(() => 0) : 0;

  // JSON-LD structured data for the site
  const websiteJsonLd = generateWebsiteJsonLd()
  const orgJsonLd = generateOrganizationJsonLd()

  return (
    <NextIntlClientProvider messages={messages} locale={resolvedLocale}>
      <ServiceWorkerRegister />
      <KeyboardShortcuts locale={resolvedLocale} />
      <PullToRefresh />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <div className="flex flex-col min-h-screen">
        <Header 
          locale={resolvedLocale} 
          session={session}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1">{children}</main>
        <Footer locale={resolvedLocale} />
        <A2HSBanner />
        <HelpModal />
        <WebVitals />
      </div>
    </NextIntlClientProvider>
  );
}
