import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
        </QueryProvider>
      </body>
    </html>
  );
}