import { Github } from "lucide-react";

const links = [
  { label: "Ethereum Classic DAO", href: "https://ethereumclassicdao.org" },
  { label: "Olympia Treasury", href: "https://olympiatreasury.org" },
  { label: "OlympiaDAO", href: "https://olympiadao.org" },
];

export function Footer() {
  return (
    <footer className="border-t border-border-default px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-text-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/olympia-wordmark.svg" alt="" className="h-4" />
          </span>

          <div className="flex items-center gap-5">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-muted transition-colors hover:text-text-primary"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/olympiadao"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted transition-colors hover:text-text-primary"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-text-subtle">
          On-chain governance and treasury infrastructure for Ethereum Classic.
        </p>
      </div>
    </footer>
  );
}
