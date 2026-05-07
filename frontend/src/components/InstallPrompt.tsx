import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("localkart-install-dismissed") === "true");

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!installEvent || dismissed) return null;

  const install = async () => {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem("localkart-install-dismissed", "true");
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-[70] mx-auto max-w-md rounded-3xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-slate-900/15 lg:bottom-6">
      <div className="flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Download className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-black text-slate-950">Install LocalKart</h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Add LocalKart to your phone for quick salon booking and kirana ordering on WhatsApp.
          </p>
          <div className="mt-3 flex gap-2">
            <Button type="button" className="h-10 rounded-xl bg-emerald-700 font-black" onClick={() => void install()}>
              Install
            </Button>
            <Button type="button" variant="outline" className="h-10 rounded-xl font-black" onClick={dismiss}>
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
