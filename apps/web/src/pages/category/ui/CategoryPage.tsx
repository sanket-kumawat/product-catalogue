export function CategoryPage({ slug }: { slug: string }) {
  return (
    <main className='mx-auto max-w-5xl px-4 py-6'>
      <h1 className='text-2xl font-semibold text-foreground'>Category</h1>
      <p className='text-muted-foreground'>{slug}</p>
    </main>
  );
}
