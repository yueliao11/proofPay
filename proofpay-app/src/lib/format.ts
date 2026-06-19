export function truncateAddress(addr: string, start = 6, end = 4): string {
  if (!addr || addr.length <= start + end + 2) return addr;
  return `${addr.slice(0, start + 2)}...${addr.slice(-end)}`;
}

export function formatAmount(amount: number, asset = "SUI"): string {
  return `${amount} ${asset}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    funded: "Funded",
    submitted: "Submitted",
    needs_revision: "Needs Revision",
    reviewed: "Reviewed",
    released: "Released",
    locked: "Locked",
    ready: "Ready to Release",
  };
  return map[status] || status.replace(/_/g, " ");
}

export function statusColor(
  status: string
): { bg: string; text: string; border: string } {
  switch (status) {
    case "released":
    case "ready":
    case "pass":
      return { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]", border: "border-[#22C55E]/30" };
    case "reviewed":
      return { bg: "bg-[#4DA3FF]/10", text: "text-[#4DA3FF]", border: "border-[#4DA3FF]/30" };
    case "needs_revision":
    case "locked":
    case "fail":
      return { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", border: "border-[#EF4444]/30" };
    case "submitted":
      return { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" };
    default:
      return { bg: "bg-[#172033]", text: "text-[#94A3B8]", border: "border-[#263244]" };
  }
}
