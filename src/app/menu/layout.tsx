import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เมนูอาหาร - ครัวบ้านเจ็ม (Krua Baan Gem) | หม่าล่าทั่ง & อาหารตามสั่ง",
  description: "เลือกชมเมนูอาหารที่หลากหลายจากครัวบ้านเจ็ม ทั้งหม่าล่าทั่งรสเด็ด อาหารตามสั่ง และเมนูสุขภาพ ปรุงสดใหม่ทุกวัน ย่านหนองแขม ซอยขนมหวาน",
  openGraph: {
    title: "เมนูอาหาร - ครัวบ้านเจ็ม (Krua Baan Gem)",
    description: "หม่าล่าทั่งรสเด็ดและอาหารตามสั่งที่ปรุงด้วยใจ ดูเมนูของเราได้ที่นี่",
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
