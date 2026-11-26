export function SearchPage({ query }: { query: string }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-foreground">Search</h1>
      <p className="text-muted-foreground">{query}</p>
    </main>
  );
}
