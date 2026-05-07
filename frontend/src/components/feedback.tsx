import { AlertCircle, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm", className)}>
      <div className="h-44 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export function EmptyStateBlock({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
      <Search className="mx-auto h-10 w-10 text-slate-400" />
      <h3 className="mt-3 text-lg font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{text}</p>
      {action ? (
        <Button type="button" onClick={action.onClick} className="mt-5 rounded-2xl bg-emerald-700 font-black">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorStateBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-red-800">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-black">{title}</h3>
          <p className="mt-1 text-sm leading-6">{text}</p>
        </div>
      </div>
    </div>
  );
}
