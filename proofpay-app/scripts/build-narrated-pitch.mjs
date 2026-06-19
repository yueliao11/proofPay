import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const pitchDir = "/Volumes/extdisk/project/sui/proofPay/pitch";
const framesDir = path.join(pitchDir, "frames");
const outDir = path.join(pitchDir, "segments");
fs.mkdirSync(outDir, { recursive: true });

const segments = [
  {
    text: "AI agents can do real work now. Research, code, reports, designs. But here's the problem: how do we verify the work and release payment safely?",
    frame: "01-landing",
  },
  {
    text: "ProofPay is the settlement layer for AI agent work. A client locks payment and acceptance criteria on Sui before the agent starts.",
    frame: "02-create",
  },
  {
    text: "Meet ResearchBot-01. Its job: produce a Sui Overflow competitor analysis, with a budget of two SUI.",
    frame: "03-demo-created",
  },
  {
    text: "ResearchBot submits its first delivery to Walrus. But the AI reviewer finds the comparison table missing. Score: sixty. Payment remains locked.",
    frame: "04-demo-failed-delivery",
  },
  {
    text: "The agent submits a corrected version with the comparison table. This time, the AI reviewer gives a score of ninety-two. Payment is ready to release.",
    frame: "06-demo-corrected-delivery",
  },
  {
    text: "The client approves. In one Sui PTB, escrow releases, the settlement updates, and the event is emitted.",
    frame: "08-demo-released",
  },
  {
    text: "The TraceBrief Passport is now verified. It records the settlement, the Walrus deliverable proof, the reviewer attestation, and the agent's latest work score. This becomes the agent's reputation.",
    frame: "09-demo-passport",
  },
  {
    text: "ProofPay is not a marketplace, not static storage, and not just escrow. It is proof-of-delivery settlement for AI agent work on Sui and Walrus.",
    frame: "10-verify-page",
  },
];

function getDuration(file) {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`,
    { encoding: "utf8" }
  );
  return parseFloat(out.trim());
}

function generateAudio(text, outFile) {
  const aiff = outFile.replace(".mp3", ".aiff");
  execSync(`say -v Samantha "${text.replace(/"/g, '\\"')}" -o "${aiff}"`);
  execSync(
    `ffmpeg -y -i "${aiff}" -ar 44100 -ac 2 -b:a 192k "${outFile}" >/dev/null 2>&1`
  );
  fs.unlinkSync(aiff);
}

const segFiles = [];
let totalAudioDur = 0;

for (let i = 0; i < segments.length; i++) {
  const s = segments[i];
  const audioFile = path.join(outDir, `seg${i}.mp3`);
  generateAudio(s.text, audioFile);
  const dur = getDuration(audioFile);
  totalAudioDur += dur;
  segFiles.push({ audio: audioFile, frame: s.frame, duration: dur });
  console.log(`Segment ${i}: ${s.frame}, duration ${dur.toFixed(2)}s`);
}

console.log(`Total audio duration: ${totalAudioDur.toFixed(2)}s`);

// Build per-segment video clips from frames
const clipList = [];
for (let i = 0; i < segFiles.length; i++) {
  const { frame, duration } = segFiles[i];
  const img = path.join(framesDir, `${frame}.png`);
  const clip = path.join(outDir, `clip${i}.mp4`);
  execSync(
    `ffmpeg -y -loop 1 -i "${img}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" "${clip}" >/dev/null 2>&1`
  );
  clipList.push(clip);
}

// Concatenate clips
const concatFile = path.join(outDir, "concat.txt");
fs.writeFileSync(
  concatFile,
  clipList.map((f) => `file '${f}'`).join("\n")
);
const videoOnly = path.join(pitchDir, "pitch-video-nosound.mp4");
execSync(
  `ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${videoOnly}" >/dev/null 2>&1`
);

// Concatenate audio
const audioConcatFile = path.join(outDir, "audio_concat.txt");
fs.writeFileSync(
  audioConcatFile,
  segFiles.map((s) => `file '${s.audio}'`).join("\n")
);
const fullAudio = path.join(pitchDir, "narration-full.mp3");
execSync(
  `ffmpeg -y -f concat -safe 0 -i "${audioConcatFile}" -c copy "${fullAudio}" >/dev/null 2>&1`
);

// Merge video and audio
const finalVideo = path.join(pitchDir, "proofpay-pitch-narrated.mp4");
execSync(
  `ffmpeg -y -i "${videoOnly}" -i "${fullAudio}" -c:v copy -c:a aac -b:a 192k -shortest "${finalVideo}" >/dev/null 2>&1`
);

console.log("Final narrated video:", finalVideo);

// Cleanup intermediate files
for (const f of [...clipList, concatFile, audioConcatFile, videoOnly]) {
  try { fs.unlinkSync(f); } catch {}
}
for (let i = 0; i < segFiles.length; i++) {
  try { fs.unlinkSync(segFiles[i].audio); } catch {}
}
