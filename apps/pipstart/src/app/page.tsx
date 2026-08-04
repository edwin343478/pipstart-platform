import { Button, Card } from "@repo/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <Card className="w-full max-w-2xl">
        <div className="mb-6 inline-flex rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
          PipStart foundation preview
        </div>

        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Learn markets with structure, not shortcuts.
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          PipStart provides structured and risk-conscious Forex and
          cryptocurrency education for beginners and developing learners.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="large">Explore learning</Button>

          <Button variant="secondary" size="large">
            View curriculum
          </Button>
        </div>
      </Card>
    </main>
  );
}