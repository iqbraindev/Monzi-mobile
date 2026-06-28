import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

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
    process.cwd(),
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
    process.cwd(),
    "node_modules",
    "@livekit",
    "react-native",
    "android",
    "build.gradle"
  ),
  (source) => source.replace(/\n\s*jcenter\(\)/g, "")
);
