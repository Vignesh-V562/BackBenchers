"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, 
  HelpCircle, 
  Flame, 
  BookOpen 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Simple utility function in case tailwind-merge / clsx is missing, or import directly
function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function NavigationTabs({ code }: { code: string }) {
  const pathname = usePathname();
  const cleanCode = code.toUpperCase();

  const tabs = [
    {
      name: "Notes Marketplace",
      href: `/course/${cleanCode}/notes`,
      icon: FileText,
    },
    {
      name: "Question Papers",
      href: `/course/${cleanCode}/pyq`,
      icon: BookOpen,
    },
    {
      name: "Curated Kits",
      href: `/course/${cleanCode}/kit`,
      icon: HelpCircle,
    },
    {
      name: "Panic Mode",
      href: `/course/${cleanCode}/panic`,
      icon: Flame,
    },
  ];

  return (
    <div className="flex border-b border-brand-border overflow-x-auto scrollbar-none gap-2 pb-0.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={classNames(
              "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
              isActive
                ? "border-accent-primary text-accent-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-brand-border-strong"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
