"use client";

import { DemoRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Briefcase, Bot, ScanEye, Gavel } from "lucide-react";

const roles: { id: DemoRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "client", label: "Client", icon: Briefcase },
  { id: "agent", label: "ResearchBot-01", icon: Bot },
  { id: "reviewer", label: "AI Reviewer", icon: ScanEye },
  { id: "judge", label: "Judge", icon: Gavel },
];

export function RoleSwitcher({
  active,
  onChange,
}: {
  active: DemoRole;
  onChange: (role: DemoRole) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-xl border border-[#263244] bg-[#172033] p-1.5">
      {roles.map((role) => {
        const Icon = role.icon;
        const isActive = active === role.id;
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-[#4DA3FF] text-[#0B1020]"
                : "text-[#94A3B8] hover:bg-[#111827] hover:text-[#F8FAFC]"
            )}
          >
            <Icon className="size-4" />
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
