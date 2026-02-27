import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <section className="h-screen w-full shrink-0 bg-[#f5e6dc]" />
    </main>
  );
}
