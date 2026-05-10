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
  title: "ครัวบ้านเจ็ม (Krua Baan Gem) - หม่าล่าทั่ง & อาหารตามสั่ง ย่านหนองแขม ซอยขนมหวาน",
  description: "ครัวบ้านเจ็ม เสิร์ฟความสุขผ่านรสชาติหม่าล่าต้นตำรับและอาหารตามสั่ง คัดสรรวัตถุดิบอย่างพิถีพิถันเพื่อคุณโดยเฉพาะ ย่านหนองแขม ซอยขนมหวาน อาหารสะอาด อร่อย ราคาเป็นกันเอง",
  keywords: ["ครัวบ้านเจ็ม", "Krua Baan Gem", "หม่าล่าทั่ง", "หม่าล่าหนองแขม", "อาหารตามสั่ง", "ซอยขนมหวาน", "หนองแขม", "อร่อย", "อาหารเดลิเวอรี่"],
  authors: [{ name: "ครัวบ้านเจ็ม" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ครัวบ้านเจ็ม",
  },
  icons: {
    icon: [
      { url: "/logo.jpg" },
      { url: "/logo.jpg", sizes: "32x32", type: "image/jpeg" },
    ],
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "ครัวบ้านเจ็ม (Krua Baan Gem) - หม่าล่าทั่ง & อาหารตามสั่ง",
    description: "สัมผัสรสชาติหม่าล่าต้นตำรับและอาหารตามสั่งที่ปรุงด้วยใจ ย่านหนองแขม ซอยขนมหวาน",
    url: "https://krua-baan-gem.vercel.app",
    siteName: "ครัวบ้านเจ็ม (Krua Baan Gem)",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "ครัวบ้านเจ็ม Logo",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ครัวบ้านเจ็ม (Krua Baan Gem) - หม่าล่าทั่ง & อาหารตามสั่ง",
    description: "รสชาติหม่าล่าต้นตำรับและอาหารตามสั่งที่ปรุงด้วยใจ ย่านหนองแขม",
    images: ["/logo.jpg"],
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
