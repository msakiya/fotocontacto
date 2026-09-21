import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ScanApp } from "@/components/scan-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <>
      <ScanApp />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className:
            "!bg-bg-elevated !text-fg !border-0 !shadow-[var(--shadow-border)] !font-sans",
        }}
      />
    </>
  );
}
