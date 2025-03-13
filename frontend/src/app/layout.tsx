import Container from "@/components/container";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { AuthProvider } from "@/context/auth-context";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "svjaime - spinanda test",
  description: "A backoffice management app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Container className="flex min-h-svh flex-col py-4 sm:py-8">
              <Header />
              <main className="flex grow py-10">{children}</main>
              <Footer />
            </Container>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
