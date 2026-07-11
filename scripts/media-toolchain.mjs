import { spawnSync } from 'node:child_process';

export const mediaToolchainContract = Object.freeze({
  kind: 'system-toolchain',
  buildIdentifier: '2025-07-23-git-829680f96a-full_build-www.gyan.dev',
  requiredEncoders: ['libvpx-vp9', 'libwebp_anim']
});

const installHint = 'Installiere exakt den FFmpeg/FFprobe-Full-Build 2025-07-23-git-829680f96a-full_build-www.gyan.dev, stelle beide Programme ueber PATH bereit und fuehre danach npm run check:media-toolchain aus.';

function preflightError(detail) {
  return new Error(`Medienwerkzeug-Preflight fehlgeschlagen: ${detail}. ${installHint}`);
}

function invoke(spawn, command, args, cwd) {
  let result;
  try { result = spawn(command, args, { cwd, encoding: 'utf8' }); }
  catch (error) { throw preflightError(`${command} ist nicht ausfuehrbar (${error.message})`); }
  if (result.error || result.status !== 0) throw preflightError(`${command} ${args.join(' ')} wurde nicht ausgefuehrt (${result.error?.message ?? result.stderr ?? result.stdout ?? `exit ${result.status}`})`);
  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function requireBuild(command, output) {
  const match = output.match(/ff(?:mpeg|probe) version ([^\s]+)/i);
  if (!match) throw preflightError(`${command} meldet keinen FFmpeg-Build-Identifier`);
  if (match[1] !== mediaToolchainContract.buildIdentifier) throw preflightError(`${command} meldet ${match[1]}, erwartet ${mediaToolchainContract.buildIdentifier}`);
  return match[1];
}

export function resolveMediaToolchain({ spawn = spawnSync, cwd = process.cwd(), commands = {} } = {}) {
  const ffmpeg = commands.ffmpeg ?? process.env.UABC_FFMPEG_COMMAND ?? 'ffmpeg';
  const ffprobe = commands.ffprobe ?? process.env.UABC_FFPROBE_COMMAND ?? 'ffprobe';
  const ffmpegVersion = invoke(spawn, ffmpeg, ['-version'], cwd);
  const ffprobeVersion = invoke(spawn, ffprobe, ['-version'], cwd);
  const ffmpegBuild = requireBuild(ffmpeg, ffmpegVersion);
  const ffprobeBuild = requireBuild(ffprobe, ffprobeVersion);
  if (ffmpegBuild !== ffprobeBuild) throw preflightError(`ffmpeg (${ffmpegBuild}) und ffprobe (${ffprobeBuild}) stammen nicht aus demselben Build`);
  const encoders = invoke(spawn, ffmpeg, ['-hide_banner', '-encoders'], cwd);
  for (const encoder of mediaToolchainContract.requiredEncoders) {
    if (!new RegExp(`\\b${encoder}\\b`).test(encoders)) throw preflightError(`ffmpeg-Build enthaelt den erforderlichen Encoder ${encoder} nicht`);
  }
  return Object.freeze({
    ffmpeg,
    ffprobe,
    manifest: { ...mediaToolchainContract },
    run(command, args) { return invoke(spawn, command, args, cwd); }
  });
}
