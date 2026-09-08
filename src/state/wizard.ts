"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { EMPTY_DRAFT, type PatternDraft } from "@/lib/pattern-draft";

type WizardActions = {
  /** True once a record has been filed, so the flow guard stops redirecting. */
  finished: boolean;
  patch: (values: Partial<PatternDraft>) => void;
  startCapture: (photo: { path: string; url: string }) => void;
  reset: () => void;
  /** Clear the filed record but leave the flow guard alone until we navigate away. */
  finish: () => void;
  toggleUpdateField: (label: string) => void;
};

export const useWizard = create<PatternDraft & WizardActions>()(
  persist(
    (set) => ({
      ...EMPTY_DRAFT,
      finished: false,
      patch: (values) => set(values),
      startCapture: (photo) =>
        set({ ...EMPTY_DRAFT, finished: false, photoPath: photo.path, photoUrl: photo.url }),
      reset: () => set({ ...EMPTY_DRAFT, finished: false }),
      finish: () => set({ ...EMPTY_DRAFT, finished: true }),
      toggleUpdateField: (label) =>
        set((state) => ({
          updateFields: state.updateFields.includes(label)
            ? state.updateFields.filter((field) => field !== label)
            : [...state.updateFields, label],
        })),
    }),
    {
      name: "lai-thai-wizard",
      storage: createJSONStorage(() => sessionStorage),
      // Rehydrated from a client effect so the server render and first client render match.
      skipHydration: true,
    },
  ),
);

/** True once the persisted wizard draft has been read back from sessionStorage. */
export function useWizardHydrated() {
  const hydrated = useSyncExternalStore(
    (onChange) => useWizard.persist.onFinishHydration(onChange),
    () => useWizard.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    if (!useWizard.persist.hasHydrated()) void useWizard.persist.rehydrate();
  }, []);

  return hydrated;
}

/** The plain draft, without the action methods, for sending to server actions. */
export function draftPayload(state: PatternDraft & WizardActions): PatternDraft {
  const keys = Object.keys(EMPTY_DRAFT) as (keyof PatternDraft)[];
  return Object.fromEntries(keys.map((key) => [key, state[key]])) as unknown as PatternDraft;
}
