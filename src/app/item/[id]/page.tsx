type Props = {
  params: Promise<{ id: string }>;
};

export default async function ItemPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <h1 className="font-display text-2xl font-bold">Item {id}</h1>
    </main>
  );
}
