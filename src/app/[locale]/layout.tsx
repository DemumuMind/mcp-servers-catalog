import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { A2HSBanner } from "@/components/a2hs-banner";
import { HelpModal } from "@/components/help-modal";
import { WebVitals } from "@/components/web-vitals";
import { auth } from "@/lib/auth";
import { getUserNotifications, getUnreadNotificationsCount } from "@/app/actions/notifications";

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
  const session = await auth().catch(() => null);
  const notifications = session?.user?.id ? await getUserNotifications(session.user.id).catch(() => []) : [];
  const unreadCount = session?.user?.id ? await getUnreadNotificationsCount(session.user.id).catch(() => 0) : 0;

  return (
    <NextIntlClientProvider messages={messages} locale={resolvedLocale}>
      <ServiceWorkerRegister />
      <KeyboardShortcuts locale={resolvedLocale} />
      <PullToRefresh />
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
