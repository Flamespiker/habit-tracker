import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Custom 404 page.
 * force-dynamic prevents Next.js from prerendering this route at build time,
 * which would trigger cookies() outside a request scope via the root layout.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">404 — Page not found</h1>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="text-primary underline underline-offset-4">
        Go home
      </Link>
    </div>
  );
}
