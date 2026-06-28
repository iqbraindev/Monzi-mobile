const LOGO_SLUG_OVERRIDES: Record<string, string> = {
  googleanalytics: "google_analytics",
};

export function toolkitLogoUrl(toolkitSlug: string): string {
  const logoSlug = LOGO_SLUG_OVERRIDES[toolkitSlug] ?? toolkitSlug;
  return `https://logos.composio.dev/api/${logoSlug}`;
}
