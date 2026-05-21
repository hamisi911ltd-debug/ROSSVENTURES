import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Access — Ross Ventures" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14">
      <div className="rounded-2xl border border-border/60 bg-card/60 p-8 shadow-card-soft">
        <h1 className="font-display text-3xl font-bold">Admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Click the button below to access the dashboard instantly.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin" })}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember"
        >
          Continue to admin
        </button>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to site</Link>
        </p>
      </div>
    </main>
  );
}
