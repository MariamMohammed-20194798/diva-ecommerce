import Link from 'next/link';
import { redirect } from 'next/navigation';

const LOCAL_DOCS_URL = 'http://localhost:3002/introduction';
const PRODUCTION_DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL;

export default function DocsPage() {
  if (process.env.NODE_ENV === 'development') {
    redirect(LOCAL_DOCS_URL);
  }

  if (PRODUCTION_DOCS_URL) {
    redirect(PRODUCTION_DOCS_URL);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-foreground">
      <div className="space-y-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            Documentation
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Project docs</h1>
          <p className="text-base leading-7 text-muted-foreground">
            In production, this route should open your deployed Mintlify docs site using
            the `NEXT_PUBLIC_DOCS_URL` environment variable.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border p-6 shadow-sm backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Run docs locally</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Start the Mintlify docs server from the repo root, then refresh this page.
            </p>
            <pre className="mt-4 rounded-2xl bg-slate-950/70 p-4 text-sm text-white">
              pnpm run docs:dev
            </pre>
            <a
              href={PRODUCTION_DOCS_URL ?? LOCAL_DOCS_URL}
              className="mt-4 inline-flex items-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-muted transition"
            >
              Open docs in new tab
            </a>
          </div>

          <div className="rounded-3xl border border-border p-6 shadow-sm backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Docs folder</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The documentation source lives in the `docs/` directory, including API
              reference pages and guides.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-muted transition"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
