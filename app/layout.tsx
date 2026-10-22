import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Surat Digital KUA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
