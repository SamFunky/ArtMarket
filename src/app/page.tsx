import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturedAuctions from "@/components/FeaturedAuctions";
import TrendingEndingSoon from "@/components/TrendingEndingSoon";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <FeaturedAuctions />
      <HowItWorks />
      <TrendingEndingSoon />
      <Newsletter />
    </main>
  );
}
