import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function patchFile(path, replacer) {
  if (!existsSync(path)) return;

  const source = readFileSync(path, "utf8");
  const patched = replacer(source);

  if (patched !== source) {
    writeFileSync(path, patched);
    console.log(`Patched ${path}`);
  }
}

patchFile(
  join(
    rootDir,
    "node_modules",
    "@react-native",
    "gradle-plugin",
    "settings.gradle.kts"
  ),
  (source) =>
    source.replace(
      'id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0")',
      'id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")'
    )
);

patchFile(
  join(
    rootDir,
    "node_modules",
    "@livekit",
    "react-native",
    "android",
    "build.gradle"
  ),
  (source) => source.replace(/\n\s*jcenter\(\)/g, "")
);

// Hermes rejects dynamic import() in release bundles. See vercel/ai#16191.
function patchAiDiagnosticsChannelImport(source) {
  const replacements = [
    [
      `  if (diagnosticsChannelPromise == null) {
    diagnosticsChannelPromise = (
      import(
        /* webpackIgnore: true */
        'node:diagnostics_channel'
      ) as Promise<DiagnosticsChannel>
    ).catch(() => undefined);
  }`,
      `  if (diagnosticsChannelPromise == null) {
    diagnosticsChannelPromise = Promise.resolve(
      loadBuiltinModule<DiagnosticsChannel>('node:diagnostics_channel'),
    );
  }`,
    ],
    [
      `  if (diagnosticsChannelPromise == null) {
    diagnosticsChannelPromise = import(
      /* webpackIgnore: true */
      "diagnostics_channel"
    ).catch(() => void 0);
  }`,
      `  if (diagnosticsChannelPromise == null) {
    diagnosticsChannelPromise = Promise.resolve(
      loadBuiltinModule("node:diagnostics_channel")
    );
  }`,
    ],
  ];

  for (const [from, to] of replacements) {
    if (source.includes(from)) {
      return source.replace(from, to);
    }
  }

  return source;
}

for (const relativePath of [
  ["ai", "src", "telemetry", "tracing-channel-publisher.ts"],
  ["ai", "dist", "index.js"],
  ["ai", "dist", "internal", "index.js"],
]) {
  patchFile(join(rootDir, "node_modules", ...relativePath), patchAiDiagnosticsChannelImport);
}
