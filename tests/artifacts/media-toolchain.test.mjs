import test from 'node:test';
import assert from 'node:assert/strict';
import { mediaToolchainContract, resolveMediaToolchain } from '../../scripts/media-toolchain.mjs';

const version = (program, build = mediaToolchainContract.buildIdentifier) => `${program} version ${build} Copyright`;
const validSpawn = (command, args) => ({ status: 0, stdout: args.includes('-version') ? version(command) : ' V..... libvpx-vp9\n V..... libwebp_anim\n', stderr: '' });

test('media toolchain accepts the pinned matching build with required encoders', () => {
  const resolved = resolveMediaToolchain({ spawn: validSpawn });
  assert.deepEqual(resolved.manifest, mediaToolchainContract);
});

test('media toolchain rejects missing executables and mismatched builds', () => {
  assert.throws(() => resolveMediaToolchain({ spawn: () => ({ status: null, error: new Error('ENOENT') }) }), /did not run/);
  assert.throws(() => resolveMediaToolchain({ spawn: (command, args) => ({ status: 0, stdout: args.includes('-version') ? version(command, command === 'ffprobe' ? 'different-build' : mediaToolchainContract.buildIdentifier) : 'libvpx-vp9 libwebp_anim', stderr: '' }) }), /expected/);
});

test('media toolchain rejects missing required encoders', () => {
  assert.throws(() => resolveMediaToolchain({ spawn: (command, args) => ({ status: 0, stdout: args.includes('-version') ? version(command) : ' V..... libvpx-vp9\n', stderr: '' }) }), /libwebp_anim/);
});
