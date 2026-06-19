"use client";

import Link from "next/link";

const footerLinks = [
  { href: "/create", label: "Create Settlement" },
  { href: "/demo", label: "Demo Console" },
  { href: "/verify", label: "Verify Passport" },
];

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-[#263244] bg-[#111827]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-[#94A3B8]">
          © {new Date().getFullYear()} ProofPay. Settlement layer for AI agent work.
        </p>
        <nav className="flex items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#94A3B8] transition-colors hover:text-[#4DA3FF]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
