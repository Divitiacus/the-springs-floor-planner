"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MonitorUp } from "lucide-react";

const PHONE_SIZED_VIEWPORT = "(max-width: 900px)";

export function MobileDeviceNotice() {
  const [isOpen, setIsOpen] = useState(false);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const dismissedForPageLoadRef = useRef(false);

  const dismiss = useCallback(() => {
    dismissedForPageLoadRef.current = true;
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const viewport = window.matchMedia(PHONE_SIZED_VIEWPORT);
    const syncVisibility = () => setIsOpen(viewport.matches && !dismissedForPageLoadRef.current);
    syncVisibility();
    viewport.addEventListener("change", syncVisibility);
    return () => viewport.removeEventListener("change", syncVisibility);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    continueButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
      if (event.key === "Tab") {
        event.preventDefault();
        continueButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismiss, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#1d2923]/55 p-5 backdrop-blur-[3px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-device-notice-title"
        aria-describedby="mobile-device-notice-description"
        className="w-full max-w-sm rounded-[24px] border border-white/80 bg-[#fffefa] p-7 text-center shadow-[0_30px_90px_rgba(20,35,27,0.38)]"
      >
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e8f0eb] text-[#294f3d]">
          <MonitorUp aria-hidden="true" size={26} strokeWidth={1.8} />
        </div>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.17em] text-[#87938c]">Larger screen recommended</p>
        <h1 id="mobile-device-notice-title" className="mt-2 font-serif text-2xl font-semibold text-[#24372d]">
          This planner works best on a desktop or laptop
        </h1>
        <p id="mobile-device-notice-description" className="mt-3 text-sm leading-6 text-[#6f7d75]">
          For easier placement, resizing, and editing, please reopen it on a larger screen.
        </p>
        <button
          ref={continueButtonRef}
          type="button"
          className="mt-6 h-11 w-full rounded-xl bg-[#294f3d] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f4031] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294f3d] focus-visible:ring-offset-2"
          onClick={dismiss}
        >
          Continue anyway
        </button>
      </section>
    </div>
  );
}
