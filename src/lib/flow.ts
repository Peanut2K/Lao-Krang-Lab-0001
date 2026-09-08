export const FLOW = [
  "verify",
  "source-type",
  "place",
  "object",
  "pattern",
  "informant",
  "similar",
  "compare",
  "ai",
  "ai-result",
  "edit-line",
  "save-file",
  "license",
  "confirm",
] as const;

export type Step = (typeof FLOW)[number];

export function stepFromPathname(pathname: string): Step | null {
  const match = /^\/record\/([^/?]+)/.exec(pathname);
  const candidate = match?.[1] as Step | undefined;
  return candidate && FLOW.includes(candidate) ? candidate : null;
}
