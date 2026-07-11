import test from 'node:test';
import assert from 'node:assert/strict';
import { mediaToolchainContract, resolveMediaToolchain } from '../../scripts/media-toolchain.mjs';

const version = (program, build = mediaToolchainContract.buildIdentifier) => `${program} version ${build} Copyright`;
const validSpawn = (command, args) => ({ status: 0, stdout: args.includes('-version') ? version(command) : ' V..... libvpx-vp9\n V..... libwebp_anim\n', stderr: '' });

test('Medienwerkzeuge akzeptieren den gepinnten passenden Build mit erforderlichen Encodern', () => {
  const resolved = resolveMediaToolchain({ spawn: validSpawn });
  assert.deepEqual(resolved.manifest, mediaToolchainContract);
});

test('Medienwerkzeuge lehnen fehlende Programme und unpassende Builds ab', () => {
  assert.throws(() => resolveMediaToolchain({ spawn: () => ({ status: null, error: new Error('ENOENT') }) }), /wurde nicht ausgefuehrt/);
  assert.throws(() => resolveMediaToolchain({ spawn: (command, args) => ({ status: 0, stdout: args.includes('-version') ? version(command, command === 'ffprobe' ? 'different-build' : mediaToolchainContract.buildIdentifier) : 'libvpx-vp9 libwebp_anim', stderr: '' }) }), /erwartet/);
});

test('Medienwerkzeuge lehnen fehlende erforderliche Encoder ab', () => {
  assert.throws(() => resolveMediaToolchain({ spawn: (command, args) => ({ status: 0, stdout: args.includes('-version') ? version(command) : ' V..... libvpx-vp9\n', stderr: '' }) }), /libwebp_anim/);
});
