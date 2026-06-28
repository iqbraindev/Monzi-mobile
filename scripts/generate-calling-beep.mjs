import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "..", "assets", "sounds", "calling-beep.wav");

const sampleRate = 44100;
const toneSeconds = 1;
const pauseSeconds = 2;
const frequencies = [440, 480];
const toneSamples = Math.floor(toneSeconds * sampleRate);
const pauseSamples = Math.floor(pauseSeconds * sampleRate);
const numSamples = toneSamples + pauseSamples;
const dataSize = numSamples * 2;
const buffer = Buffer.alloc(44 + dataSize);

function writeString(offset, value) {
  buffer.write(value, offset, value.length, "ascii");
}

writeString(0, "RIFF");
buffer.writeUInt32LE(36 + dataSize, 4);
writeString(8, "WAVE");
writeString(12, "fmt ");
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
writeString(36, "data");
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < toneSamples; i += 1) {
  const t = i / sampleRate;
  let sample = 0;
  for (const frequency of frequencies) {
    sample += Math.sin(2 * Math.PI * frequency * t);
  }
  sample /= frequencies.length;

  const fadeSamples = Math.floor(sampleRate * 0.02);
  const fadeIn = Math.min(1, i / fadeSamples);
  const fadeOut = Math.min(1, (toneSamples - i) / fadeSamples);
  sample *= 0.55 * fadeIn * fadeOut;

  const int16 = Math.max(-32767, Math.min(32767, Math.round(sample * 32767)));
  buffer.writeInt16LE(int16, 44 + i * 2);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buffer);
console.log(`Wrote ${outputPath}`);
