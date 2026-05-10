import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เรื่องราวของเรา - ครัวบ้านเจ็ม (Krua Baan Gem) | จุดเริ่มต้นและความใส่ใจ",
  description: "ทำความรู้จักครัวบ้านเจ็ม (Gem's Kitchen) จุดเริ่มต้นจากความหลงใหลในรสชาติหม่าล่า และปรัชญาการทำอาหารที่ใส่ใจเสมือนทำให้คนในครอบครัวทาน",
  openGraph: {
    title: "เรื่องราวของเรา - ครัวบ้านเจ็ม (Krua Baan Gem)",
    description: "จุดเริ่มต้นและความใส่ใจในทุกจานอาหารของครัวบ้านเจ็ม อ่านเรื่องราวของเราได้ที่นี่",
  },
};

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
