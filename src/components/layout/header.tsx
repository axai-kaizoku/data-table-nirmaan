import { BookHeadphones } from "lucide-react";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { ModeToggle } from "./mode-toggle";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 px-4 container mx-auto">
      <div className="container flex h-14 items-center">
        <a href="/" className="mr-2 flex items-center md:mr-6 md:space-x-2">
          <BookHeadphones className="size-5" aria-hidden="true" />
          <span className="hidden font-bold md:inline-block">Spotify Songs</span>
        </a>
        <nav className="flex flex-1 items-center md:justify-end">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <a
              aria-label="GitHub repo"
              href={"https://github.com/axai-kaizoku/data-table-nirmaan"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icons.gitHub className="size-4" aria-hidden="true" />
            </a>
          </Button>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
};
