"use client";

import { useSyncExternalStore } from "react";

import { OnboardingFlow } from "@/components/traveler/onboarding-flow";

const STORAGE_KEY = "atct-onboarding-completed";
const EVENT = "atct-onboarding-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

function getServerSnapshot() {
  return "";
}

export function OnboardingGate({ children }: { readonly children: React.ReactNode }) {
  const completed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  function handleComplete() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    window.dispatchEvent(new Event(EVENT));
  }

  if (!completed) {
    return <OnboardingFlow onComplete={handleComplete} />;
  }
  return <>{children}</>;
}
