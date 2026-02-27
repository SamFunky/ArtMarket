import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-screen items-center overflow-hidden pl-8 sm:pl-12 lg:pl-16">
      <Image
        src="/artwork/Maecenas Presenting the Liberal Arts to the Emperor Augustus.jpg"
        alt=""
        fill
        className="-scale-x-100 object-cover object-center"
        priority
      />
      <div
        className="absolute inset-0 bg-black/20"
        aria-hidden
      />
      <div className="relative z-10 inline-flex w-fit flex-col -space-y-8">
        <div className="relative">
          <span className="absolute left-10 -top-5 font-display text-2xl text-[#f5e6dc] sm:text-4xl lg:text-5xl scale-y-65">
            THE
          </span>
          <h1 className="font-display text-8xl font-bold tracking-tight text-[#f5e6dc] sm:text-9xl lg:text-[12rem]">
            CURATOR
          </h1>
        </div>
        <p className="-translate-x-10 text-right text-3xl text-[#ecd5cc] sm:text-4xl lg:text-5xl scale-y-65">
          Fine Art Marketplace
        </p>
      </div>
    </main>
  );
}
