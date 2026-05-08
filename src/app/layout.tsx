import type { Metadata } from "next";
import { Prompt, Kanit } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
});

export const viewport = {
  themeColor: "#b91c1c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ครัวบ้านเจ็ม หม่าล่าทั่ง อาหารตามสั่ง - ซอยขนมหวาน (Gem's Kitchen Homemade)",
  description: "ครัวบ้านเจ็ม เสิร์ฟความสุขผ่านรสชาติหม่าล่าต้นตำรับและอาหารตามสั่ง คัดสรรวัตถุดิบอย่างพิถีพิถันเพื่อคุณโดยเฉพาะ ย่านหนองแขม ซอยขนมหวาน",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KBG Merchant",
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  verification: {
    google: "d9gdpBVUOlCJBXUPVAl-i3AOF7dFcNAFXnOb6mPWSQ4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${kanit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
