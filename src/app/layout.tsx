import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { VROEG_SCRIPT } from "@/lib/weergave";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Azulejo — een taal leren, tegel voor tegel",
  description:
    "Woordenschat, grammatica en echte gesprekken. Met herhaling die zich aanpast aan wat je nog niet kent.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1420" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: het script hieronder zet data-tekst nog vóórdat
    // React laadt, dus dit ene element wijkt bewust af van wat de server stuurde.
    <html
      lang="nl"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Zet de tekstgrootte vóór de eerste weergave. */}
        <script dangerouslySetInnerHTML={{ __html: VROEG_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ProgressProvider>
          <AppShell>{children}</AppShell>
        </ProgressProvider>
      </body>
    </html>
  );
}
