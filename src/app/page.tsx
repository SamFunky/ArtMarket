import HeroSection from "@/components/HeroSection";
import ModelViewer from "@/components/ModelViewer";
import Image from "next/image";
import Link from "next/link";

const hotAuctions = [
  {
    id: "1",
    title: "The Apparition",
    image: "/artwork/TheApparition.jpg",
    currentBid: "$12,400",
    timeLeft: "2h 34m",
    imageFit: "contain" as const,
  },
  {
    id: "2",
    title: "Old Roman Coin",
    currentBid: "$24,100",
    timeLeft: "1h 08m",
    model: true,
    modelSrc: "/models/old_roman_coin_ueinbaiva_mid.glb",
    modelScale: 80,
    modelRotation: [Math.PI / 2, 0, 0] as [number, number, number],
  },
  {
    id: "3",
    title: "Oriental Vase",
    currentBid: "$8,750",
    timeLeft: "5h 12m",
    model: true,
    modelSrc: "/models/oriental_vase.glb",
    modelScale: 3,
    modelPosition: [0, -1.3, 0] as [number, number, number],
  },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <section
        className="relative flex min-h-[60vh] w-full shrink-0 flex-col items-center justify-center border-y border-black/50 px-6 py-16"
        style={{
          background:
            "radial-gradient(circle at center, transparent 40%, black 150%), #2F3E4F",
        }}
      >
        <h2 className="mb-20 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Hot Right Now
        </h2>
        <div className="mx-auto flex w-full max-w-[120rem] flex-wrap justify-between gap-x-[22rem] gap-y-20 px-4 lg:flex-nowrap">
          {hotAuctions.map((auction) => (
            <div key={auction.id} className="flex w-full min-w-[20rem] flex-1 flex-col items-center gap-10 sm:min-w-[24rem]">
              <div className="relative w-full">
                {auction.model ? (
                  <ModelViewer
                    src={auction.modelSrc!}
                    scale={auction.modelScale ?? 1}
                    baseRotation={auction.modelRotation}
                    modelPosition={auction.modelPosition}
                  />
                ) : (
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={auction.image!}
                      alt={auction.title}
                      fill
                      className={
                        auction.imageFit === "contain"
                          ? "object-contain"
                          : "object-cover"
                      }
                      style={
                        "imagePosition" in auction &&
                        typeof auction.imagePosition === "string"
                          ? { objectPosition: auction.imagePosition }
                          : undefined
                      }
                    />
                  </div>
                )}
              </div>
              <div className="flex w-full flex-col gap-6">
                <h3 className="font-display text-lg font-semibold text-white line-clamp-2">
                  {auction.title}
                </h3>
                <div className="flex items-baseline justify-between gap-4 border-t border-white/20 pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/60">
                      Current bid
                    </p>
                    <p className="text-2xl font-bold text-[#f5e6dc]">
                      {auction.currentBid}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-white/60">
                      Time left
                    </p>
                    <p className="text-lg font-medium text-white">
                      {auction.timeLeft}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/item/${auction.id}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#f5e6dc] px-6 py-3 font-medium text-zinc-900 transition-colors hover:bg-[#ecd5cc]"
                >
                  Place Bid
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="h-screen w-full shrink-0 bg-[#f5e6dc]" />
    </main>
  );
}
