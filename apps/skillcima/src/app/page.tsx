import { Button, Card } from "@repo/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <Card className="w-full max-w-2xl">
        <div className="mb-6 inline-flex rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-foreground">
          Free five-day foundations course
        </div>

        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Understand Forex before you risk real money.
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          Skillcima helps complete beginners understand the foundations of
          Forex through clear, structured and risk-conscious education.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="large">Start learning free</Button>

          <Button variant="secondary" size="large">
            See the course
          </Button>
        </div>
      </Card>
    </main>
  );
}