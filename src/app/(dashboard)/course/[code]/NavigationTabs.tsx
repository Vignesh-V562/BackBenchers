"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, 
  HelpCircle, 
  Flame, 
  BookOpen 
} from "lucide-react";


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
    <div className="flex glass-toolbar p-1.5 overflow-x-auto scrollbar-none gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={classNames(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap",
              isActive
                ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/20 shadow-[0_0_12px_rgba(180,168,255,0.1)]"
                : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
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
