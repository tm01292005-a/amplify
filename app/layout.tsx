"use client";

import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

// Amplifyの設定
Amplify.configure(outputs);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
