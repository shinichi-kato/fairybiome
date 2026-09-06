export type StaticFilesManifest = {
  bots: Record<string, string[]>;
  wordTags: string[];
};

const EMPTY_MANIFEST: StaticFilesManifest = { bots: {}, wordTags: [] };
let manifestPromise: Promise<StaticFilesManifest> | null = null;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function parseManifest(value: unknown): StaticFilesManifest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return EMPTY_MANIFEST;
  }

  const { bots, wordTags } = value as { bots?: unknown; wordTags?: unknown };
  if (!bots || typeof bots !== 'object' || Array.isArray(bots) || !isStringArray(wordTags)) {
    return EMPTY_MANIFEST;
  }

  const normalizedBots: Record<string, string[]> = {};
  for (const [botName, paths] of Object.entries(bots)) {
    if (isStringArray(paths)) {
      normalizedBots[botName] = paths;
    }
  }

  return { bots: normalizedBots, wordTags };
}

export function loadStaticFiles(): Promise<StaticFilesManifest> {
  if (!manifestPromise) {
    manifestPromise = fetch('/static/files.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load static files manifest (${response.status})`);
        }
        return response.json();
      })
      .then(parseManifest)
      .catch(() => EMPTY_MANIFEST);
  }

  return manifestPromise;
}
