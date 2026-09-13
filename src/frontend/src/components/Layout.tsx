import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Plus, Swords } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            data-ocid="nav_home"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Swords className="h-5 w-5" />
            </span>
            <span>
              SR <span className="text-primary">Battle</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" data-ocid="nav_home_button">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild data-ocid="nav_create_button">
              <Link to="/create">
                <Plus className="mr-1.5 h-4 w-4" />
                Create Tournament
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p className="font-display font-semibold text-foreground">
            SR <span className="text-primary">Battle</span>
          </p>
          <p>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
