import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './tailwind.config.ts';
import { QueryProvider } from '@/providers/query-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  applicationName: 'DIVA',
  title: 'Diva the brand: Luxury & confidence for everyday life.',

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`min-h-dvh flex flex-col`} suppressHydrationWarning={true}>
        <QueryProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster richColors position="top-right" />
          <div id="VG_OVERLAY_CONTAINER" style={{ width: 0, height: 0 }} />
          <Script id="vg-config" strategy="afterInteractive">
            {`window.VG_CONFIG = {
  ID: "0s5LyqAvEq5i6vMfsz5n",
  region: "eu",
  appOrigin: "https://convocore.ai",
  render: "bottom-right",
  stylesheets: ["https://vg-bunny-cdn.b-cdn.net/vg_live_build/styles.css"]
};`}
          </Script>
          <Script
            id="vg-bundle"
            src="https://vg-bunny-cdn.b-cdn.net/vg_live_build/vg_bundle.js"
            strategy="afterInteractive"
          />
        </QueryProvider>
      </body>
    </html>
  );
}