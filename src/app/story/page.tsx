import Navbar from "@/components/layout/Navbar";

import StorySection from "@/components/home/StorySection";

export default function StoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-20">
        <StorySection />
      </main>
    </div>
  );
}
