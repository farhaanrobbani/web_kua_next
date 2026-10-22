"use client";

import Link from "next/link";
import { useState } from "react";

import type { NavItem } from "@/lib/kua";

type HeaderProps = {
  items: NavItem[];
  instansi: string;
  logoUrl: string | null;
};

function MenuLink({
  item,
  className,
  onNavigate,
}: {
  item: NavItem;
  className: string;
  onNavigate?: () => void;
}) {
  const href = item.url ?? "#";
  const external = /^https?:\/\//.test(href);

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

function Chevron() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function PublicHeader({ items, instansi, logoUrl }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-10 border-b border-[#19140012] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`Logo ${instansi}`}
              className="h-9 w-9 rounded-md object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-700 text-sm font-bold text-white">
              K
            </div>
          )}
          <span className="text-sm font-semibold tracking-wide">{instansi}</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Menu"
          className="rounded-md p-2 text-teal-800 transition-colors duration-150 hover:bg-teal-50 sm:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <nav className="hidden items-center gap-2 text-sm font-medium sm:flex">
          {items.map((item) => {
            const key = item.key ?? item.label;
            const children = item.children.filter((child) => child.label);
            const isDropdown = item.hasSubmenu && children.length > 0;

            if (isDropdown) {
              const open = openKey === key;
              return (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => setOpenKey(key)}
                  onMouseLeave={() => setOpenKey(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : key)}
                    aria-expanded={open}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-teal-800 transition-colors duration-150 hover:bg-teal-50 hover:text-teal-700"
                  >
                    {item.label}
                    <Chevron />
                  </button>
                  {open ? (
                    <div className="absolute start-1/2 mt-2 w-56 -translate-x-1/2 rounded-lg border border-teal-100 bg-white p-2 shadow-lg">
                      {children.map((child) => (
                        <MenuLink
                          key={child.key ?? child.label}
                          item={child}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#1b1b18] hover:bg-teal-50"
                          onNavigate={() => setOpenKey(null)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            if (item.hasSubmenu) return null;

            return (
              <MenuLink
                key={key}
                item={item}
                className="rounded-md px-3 py-1.5 text-teal-800 transition-colors duration-150 hover:bg-teal-50 hover:text-teal-700"
              />
            );
          })}
        </nav>
      </div>

      {mobileOpen ? (
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#19140012] px-6 py-2 text-sm font-medium sm:hidden">
          {items.map((item) => {
            const key = item.key ?? item.label;
            const children = item.children.filter((child) => child.label);
            const isDropdown = item.hasSubmenu && children.length > 0;

            if (isDropdown) {
              const open = mobileSubmenu === key;
              return (
                <div key={key} className="w-full">
                  <button
                    type="button"
                    onClick={() => setMobileSubmenu(open ? null : key)}
                    aria-expanded={open}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-teal-800 transition-colors duration-150 hover:bg-teal-50 hover:text-teal-700"
                  >
                    {item.label}
                    <Chevron />
                  </button>
                  {open ? (
                    <div className="w-full border-t border-teal-100 pt-1">
                      {children.map((child) => (
                        <MenuLink
                          key={child.key ?? child.label}
                          item={child}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#1b1b18] hover:bg-teal-50"
                          onNavigate={() => setMobileOpen(false)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            if (item.hasSubmenu) return null;

            return (
              <MenuLink
                key={key}
                item={item}
                className="rounded-md px-3 py-1.5 text-teal-800 transition-colors duration-150 hover:bg-teal-50 hover:text-teal-700"
                onNavigate={() => setMobileOpen(false)}
              />
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
