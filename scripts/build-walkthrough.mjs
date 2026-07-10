import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { loadAndValidateWalkthrough } from './validate-walkthrough-manifest.mjs';

const root = process.cwd();
const artifactId = 'UABC-WT-ENV-001';
const sourcePath = 'artifacts/walkthrough/instances/UABC-WT-ENV-001.yaml';
const schemaPath = 'artifacts/walkthrough/schema/walkthrough-package.schema.json';
const outputRelative = `artifacts/walkthrough/generated/${artifactId}`;
const outputDir = path.join(root, outputRelative);
const exportRelative = 'exports/project-artifacts/v0.1/index.yaml';
const absolute = (relative) => path.join(root, relative);
const readText = (relative) => fs.readFileSync(absolute(relative), 'utf8');
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(absolute(relative))).digest('hex');
const fail = (message) => { throw new Error(message); };

function validateBaselinePilot(source) {
  if (source.artifactId !== artifactId || source.artifactTypeId !== 'UABC-ARTTYPE-WALKTHROUGH-001' || source.templateVersion !== '0.1.0') fail('Walkthrough identity or template version is invalid.');
  if (!['in-review', 'approved'].includes(source.status) || source.simulationOnly !== true) fail('Pilot must be in-review or approved and simulationOnly.');
  if (source.evidenceSemantics?.artifactProvidesBusinessEvidence !== false || source.evidenceSemantics?.sourceEvidenceRetainedAsProvenance !== true) fail('Pilot evidence semantics are invalid.');
  if (JSON.stringify(source.sourceRunRefs) !== JSON.stringify(['run-1', 'run-2'])) fail('Baseline pilot source runs must be run-1 and run-2.');
  for (const field of ['sourceScenarioRefs', 'requirementRefs', 'jiraRefs', 'evidenceRefs', 'sourceRunRefs', 'reviewers', 'audiences']) {
    if (!Array.isArray(source[field]) || source[field].length === 0 || new Set(source[field]).size !== source[field].length) fail(`${field} must be a non-empty unique array.`);
  }
  for (const mode of ['beginner', 'consultant', 'evidence-review']) if (!source.playbackModes?.[mode]) fail(`Playback mode ${mode} missing.`);
  if (!Array.isArray(source.steps) || source.steps.length !== 7) fail('Baseline pilot must contain exactly seven evidenced steps.');
  source.steps.forEach((step, index) => {
    if (step.sequence !== index + 1 || step.stepId !== `ENV-${String(index).padStart(2, '0')}`) fail(`Invalid step sequence at index ${index}.`);
    for (const field of ['title', 'bcSurface', 'userAction', 'expectedResult', 'businessRationale', 'caption']) if (!String(step[field] ?? '').trim()) fail(`${step.stepId}: ${field} is required.`);
    if (!Array.isArray(step.screenshotRefs) || step.screenshotRefs.length !== 2) fail(`${step.stepId}: both source runs must be referenced.`);
    for (const screenshot of step.screenshotRefs) {
      if (!source.sourceRunRefs.includes(screenshot.runRef)) fail(`${step.stepId}: unknown run ${screenshot.runRef}.`);
      if (!fs.existsSync(absolute(screenshot.path))) fail(`${step.stepId}: missing screenshot ${screenshot.path}.`);
    }
  });
  if (!source.securityAndRedaction?.noSecrets || !source.securityAndRedaction?.noFullBcUrl || source.securityAndRedaction?.rawArtifactsTracked !== false) fail('Security and redaction policy is incomplete.');
}

function validateEvidence(source) {
  const eventStepsByRun = new Map();
  for (const runRef of source.sourceRunRefs) {
    const manifestPath = `evidence/playthru-environment-baseline/${runRef}/manifest.json`;
    const eventPath = `evidence/playthru-environment-baseline/${runRef}/events.jsonl`;
    const manifest = JSON.parse(readText(manifestPath));
    if (manifest.runId !== runRef || manifest.companySwitchPerformed !== false || manifest.writesPerformed !== false) fail(`${runRef}: manifest violates read-only provenance.`);
    const events = readText(eventPath).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
    eventStepsByRun.set(runRef, new Set(events.map((event) => event.stepId)));
  }
  for (const step of source.steps) for (const runRef of source.sourceRunRefs) {
    if (!eventStepsByRun.get(runRef)?.has(step.stepId)) fail(`${step.stepId}: missing event in ${runRef}.`);
    const screenshot = step.screenshotRefs.find((item) => item.runRef === runRef);
    if (!screenshot || path.basename(screenshot.path).toLowerCase() !== `${step.stepId.toLowerCase()}.png`) fail(`${step.stepId}: screenshot/event mapping invalid for ${runRef}.`);
  }
}

function forbiddenContent(text, label) {
  const patterns = [
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    /https:\/\/businesscentral\.dynamics\.com\/(?!\[tenant\])[^/\s]+\/playthru/i,
    /(?:access_token|refresh_token|id_token|client_secret)\s*[:=]/i
  ];
  if (patterns.some((pattern) => pattern.test(text))) fail(`${label}: forbidden tenant, URL or secret material detected.`);
}

function timestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const whole = Math.floor(seconds % 60);
  const milliseconds = Math.round((seconds - Math.floor(seconds)) * 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(whole).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

function run(command, args, label) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) fail(`${label} failed (${result.status}): ${result.stderr || result.stdout}`);
  return result.stdout;
}

function mediaArgs(screenshots, secondsPerStep, width, height) {
  const args = ['-hide_banner', '-loglevel', 'error'];
  for (const screenshot of screenshots) args.push('-loop', '1', '-t', String(secondsPerStep), '-i', absolute(screenshot));
  const filters = screenshots.map((_, index) => `[${index}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,fps=10,format=yuv420p[v${index}]`);
  filters.push(`${screenshots.map((_, index) => `[v${index}]`).join('')}concat=n=${screenshots.length}:v=1:a=0[outv]`);
  args.push('-filter_complex', filters.join(';'), '-map', '[outv]');
  return args;
}

function relativeFromOutput(repoRelative) {
  return path.relative(outputDir, absolute(repoRelative)).replaceAll('\\', '/');
}

const source = loadAndValidateWalkthrough(sourcePath);
validateBaselinePilot(source);
validateEvidence(source);
forbiddenContent(JSON.stringify(source), sourcePath);

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.dirname(absolute(exportRelative)), { recursive: true });

const secondsPerStep = source.playbackModes.beginner.secondsPerStep;
const vtt = ['WEBVTT', ''];
source.steps.forEach((step, index) => {
  vtt.push(String(index + 1), `${timestamp(index * secondsPerStep)} --> ${timestamp((index + 1) * secondsPerStep)}`, step.caption, '');
});
fs.writeFileSync(path.join(outputDir, 'captions.vtt'), vtt.join('\n'), 'utf8');

const primaryScreenshots = source.steps.map((step) => step.screenshotRefs.find((item) => item.runRef === 'run-2').path);
const webmPath = path.join(outputDir, 'walkthrough.webm');
run('ffmpeg', [...mediaArgs(primaryScreenshots, secondsPerStep, 1280, 720), '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-deadline', 'good', '-cpu-used', '2', '-row-mt', '0', '-threads', '1', '-an', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:v', '+bitexact', '-y', webmPath], 'WebM generation');

const webpPath = path.join(outputDir, 'preview.webp');
run('ffmpeg', [...mediaArgs(primaryScreenshots, 2, 960, 540), '-c:v', 'libwebp_anim', '-lossless', '0', '-quality', '60', '-loop', '0', '-an', '-map_metadata', '-1', '-fflags', '+bitexact', '-y', webpPath], 'WebP generation');

const sourceFiles = [...new Set([sourcePath, schemaPath, ...source.provenance.sourceManifests, ...source.provenance.sourceEventLogs, ...source.steps.flatMap((step) => step.screenshotRefs.map((item) => item.path))])].sort();
const sourceChecksums = Object.fromEntries(sourceFiles.map((file) => [file, sha256File(file)]));
const mediaChecksums = {
  'captions.vtt': sha256File(`${outputRelative}/captions.vtt`),
  'preview.webp': sha256File(`${outputRelative}/preview.webp`),
  'walkthrough.webm': sha256File(`${outputRelative}/walkthrough.webm`)
};
const ffmpegVersion = run('ffmpeg', ['-version'], 'FFmpeg version').split(/\r?\n/)[0];

const resolved = {
  ...source,
  generatedAt: source.createdAt,
  generation: { command: 'npm run build:walkthrough:baseline', ffmpegVersion, mediaNature: 'deterministic screenshot sequence; not a browser recording' },
  resolvedProvenance: { sourceChecksums, outputChecksums: mediaChecksums },
  steps: source.steps.map((step) => ({ ...step, displayScreenshot: relativeFromOutput(step.screenshotRefs.find((item) => item.runRef === 'run-2').path) })),
  outputs: {
    captions: 'captions.vtt',
    html: 'index.html',
    video: 'walkthrough.webm',
    animatedPreview: 'preview.webp'
  }
};
fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(resolved, null, 2)}\n`, 'utf8');

const embedded = JSON.stringify(resolved).replaceAll('</script', '<\\/script');
const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${artifactId} – playthru Baseline</title>
<style>
:root{font-family:system-ui,sans-serif;color:#17202a;background:#f5f7f8}body{max-width:1100px;margin:auto;padding:1rem}main{background:white;padding:1.25rem;border-radius:.6rem}img,video{width:100%;max-height:620px;object-fit:contain;background:#eef2f3}button,select{font:inherit;padding:.5rem .75rem;margin:.25rem}.controls{display:flex;gap:.5rem;flex-wrap:wrap}.meta{color:#46545c}.step-text{min-height:11rem}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important;transition:none!important}.animated-preview{display:none}}
</style></head><body><main>
<h1>Playthru-Umgebungsbaseline</h1><p class="meta" id="evidence-semantics">Artifact ${artifactId} · Status ${source.status} · Simulation · abgeleitetes Lern-/Darstellungsartefakt, keine fachliche Evidence · Source-Evidence bleibt Provenienz</p>
<label for="mode">Wiedergabemodus</label><select id="mode"><option value="beginner">Beginner</option><option value="consultant">Consultant</option><option value="evidence-review">Evidence Review</option></select>
<section aria-live="polite"><h2 id="title"></h2><img id="shot" alt=""><div class="step-text"><p id="action"></p><p id="result"></p><p id="why"></p><p id="caption"></p><p id="refs" class="meta"></p></div></section>
<div class="controls"><button id="previous" type="button">Zurueck</button><button id="play" type="button">Abspielen</button><button id="next" type="button">Weiter</button></div>
<h2>Steuerbares Video</h2><video controls preload="metadata"><source src="walkthrough.webm" type="video/webm"><track default kind="captions" srclang="de" label="Deutsch" src="captions.vtt">Textalternative steht in der Schrittansicht.</video>
<details><summary>Evidence und Provenienz</summary><pre id="provenance"></pre></details>
<p><a href="manifest.json">Aufgeloestes Manifest</a> · <a href="captions.vtt">WebVTT</a> · <a href="preview.webp">Animierte WebP-Vorschau</a></p>
<script id="walkthrough-data" type="application/json">${embedded}</script><script>
const data=JSON.parse(document.getElementById('walkthrough-data').textContent);let index=0,timer=null;const byId=id=>document.getElementById(id);
function render(){const s=data.steps[index],mode=byId('mode').value;byId('title').textContent=s.stepId+' – '+s.title;byId('shot').src=s.displayScreenshot;byId('shot').alt=s.expectedResult;byId('action').textContent='Aktion: '+s.userAction;byId('result').textContent='Erwartet: '+s.expectedResult;byId('why').textContent=mode==='beginner'?'Warum: '+s.businessRationale:mode==='consultant'?'Fachliche Wirkung: '+s.businessRationale:'Evidence: '+s.screenshotRefs.map(x=>x.runRef+' '+x.path).join(' | ');byId('caption').textContent=s.caption;byId('refs').textContent=data.sourceScenarioRefs.join(', ')+' · '+data.evidenceRefs.join(', ');byId('previous').disabled=index===0;byId('next').disabled=index===data.steps.length-1;}
function stop(){if(timer)clearInterval(timer);timer=null;byId('play').textContent='Abspielen'}byId('previous').onclick=()=>{stop();index=Math.max(0,index-1);render()};byId('next').onclick=()=>{stop();index=Math.min(data.steps.length-1,index+1);render()};byId('mode').onchange=()=>{stop();render()};byId('play').onclick=()=>{if(timer){stop();return}byId('play').textContent='Pause';timer=setInterval(()=>{if(index>=data.steps.length-1){stop();return}index++;render()},data.playbackModes[byId('mode').value].secondsPerStep*1000)};byId('provenance').textContent=JSON.stringify(data.resolvedProvenance,null,2);render();
</script></main></body></html>`;
forbiddenContent(html, 'generated HTML');
fs.writeFileSync(path.join(outputDir, 'index.html'), `${html}\n`, 'utf8');

const outputChecksums = {
  manifest: sha256File(`${outputRelative}/manifest.json`),
  html: sha256File(`${outputRelative}/index.html`),
  captions: mediaChecksums['captions.vtt'],
  video: mediaChecksums['walkthrough.webm'],
  animatedPreview: mediaChecksums['preview.webp']
};
const exportIndex = {
  schemaVersion: '0.1.0',
  contract: 'project-artifacts/v0.1',
  access: 'read-only',
  relativePathBase: 'repository-root',
  allowedPathBoundary: '.',
  producer: { projectId: 'UABC', repositoryRole: 'Blueprint source of truth' },
  consumer: { project: 'Universaarl Project Twin', repositoryMutationRequired: false },
  artifactTypes: [{ artifactTypeId: 'UABC-ARTTYPE-WALKTHROUGH-001', name: 'Walkthrough Package', schemaPath }],
  artifacts: [{
    artifactId,
    artifactTypeId: source.artifactTypeId,
    templateVersion: source.templateVersion,
    status: source.status,
    governingChange: 'establish-project-artifact-walkthrough-pilot',
    simulationOnly: source.simulationOnly,
    evidenceSemantics: source.evidenceSemantics,
    sourceManifestPath: sourcePath,
    resolvedManifestPath: `${outputRelative}/manifest.json`,
    outputs: { html: `${outputRelative}/index.html`, captions: `${outputRelative}/captions.vtt`, video: `${outputRelative}/walkthrough.webm`, animatedPreview: `${outputRelative}/preview.webp` },
    checksums: outputChecksums
  }],
  consumerRules: {
    pathResolution: 'Resolve every relative path from repository-root; reject absolute paths and paths outside allowedPathBoundary.',
    allowedPackageOutputs: ['manifest', 'html', 'captions', 'video', 'animatedPreview'],
    generatedVideoSemantics: 'The declared walkthrough.webm is a curated package output, not raw browser video.',
    forbiddenInputs: ['raw-browser-video', 'playwright-trace', 'auth-state', 'temporary-files'],
    evidenceSemantics: 'Template, example and generated package are not business evidence; referenced source evidence remains provenance.'
  }
};
fs.writeFileSync(absolute(exportRelative), YAML.stringify(exportIndex), 'utf8');
forbiddenContent(readText(exportRelative), exportRelative);

console.log(JSON.stringify({ artifactId, steps: source.steps.length, outputDirectory: outputRelative, outputs: outputChecksums }, null, 2));
