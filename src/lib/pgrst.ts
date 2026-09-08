/**
 * PostgREST reads commas, parentheses and wildcards as filter syntax inside `.or(...)`,
 * so free text has to be stripped of them before it is spliced into a filter string.
 */
export function safeFilterValue(value: string) {
  return value.replace(/[(),*%.]/g, " ").replace(/\s+/g, " ").trim();
}
