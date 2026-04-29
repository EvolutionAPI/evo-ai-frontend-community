import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { convertToOggOpus } from './audioConversionUtils';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockFfmpegInstance = {
  setProgress: vi.fn(),
  FS: vi.fn(),
  run: vi.fn().mockResolvedValue(undefined),
};

vi.mock('./ffmpegLoader', () => ({
  preloadFfmpeg: vi.fn().mockResolvedValue(undefined),
  getFfmpegInstance: vi.fn(() => mockFfmpegInstance),
}));

vi.mock('@ffmpeg/ffmpeg', () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeBlob = (type: string) => new Blob(['audio-data'], { type });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('convertToOggOpus', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: FS('readFile') returns mock OGG data
    mockFfmpegInstance.FS.mockImplementation((op: string) => {
      if (op === 'readFile') return new Uint8Array([0x4f, 0x67, 0x67, 0x53]); // OGG magic bytes
      return undefined;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('converts webm blob to ogg/opus', async () => {
    const input = makeBlob('audio/webm;codecs=opus');
    const result = await convertToOggOpus(input);

    expect(result.type).toBe('audio/ogg; codecs=opus');
    expect(mockFfmpegInstance.run).toHaveBeenCalledWith(
      expect.stringMatching(/-i/),
      expect.stringMatching(/input\.(webm|ogg|mp4)/),
      '-c:a', 'libopus',
      '-b:a', '48k',
      '-ar', '48000',
      '-ac', '1',
      '-application', 'voip',
      '-flags', '+bitexact',
      '-map_metadata', '-1',
      'output.ogg',
    );
  });

  it('re-encodes ogg/opus (Firefox) through FFmpeg to normalise bitrate (H5)', async () => {
    const input = makeBlob('audio/ogg;codecs=opus');
    const result = await convertToOggOpus(input);

    // Must go through FFmpeg even though it's already OGG — bitrate normalisation
    expect(mockFfmpegInstance.run).toHaveBeenCalled();
    expect(result.type).toBe('audio/ogg; codecs=opus');
  });

  it('converts mp4/m4a blob to ogg/opus', async () => {
    const input = makeBlob('audio/mp4');
    await convertToOggOpus(input);

    // Verify the correct input extension is used (third arg is fetchFile output, may vary by mock)
    const writeCalls = mockFfmpegInstance.FS.mock.calls.filter(([op]: [string]) => op === 'writeFile');
    expect(writeCalls[0][1]).toBe('input.mp4');
  });

  it('calls onProgress callback during conversion', async () => {
    const onProgress = vi.fn();
    const input = makeBlob('audio/webm');

    // Simulate FFmpeg calling setProgress
    mockFfmpegInstance.setProgress.mockImplementation((cb: (arg: { ratio: number }) => void) => {
      cb({ ratio: 0.5 });
    });

    await convertToOggOpus(input, onProgress);

    expect(onProgress).toHaveBeenCalledWith(50);
    expect(onProgress).toHaveBeenCalledWith(100); // final call
  });

  it('cleans up FS files after conversion', async () => {
    const input = makeBlob('audio/webm');
    await convertToOggOpus(input);

    const unlinkCalls = mockFfmpegInstance.FS.mock.calls
      .filter(([op]: [string]) => op === 'unlink')
      .map(([, file]: [string, string]) => file);

    expect(unlinkCalls).toContain('input.webm');
    expect(unlinkCalls).toContain('output.ogg');
  });

  it('resets setProgress handler after conversion', async () => {
    const input = makeBlob('audio/webm');
    await convertToOggOpus(input);

    // Last setProgress call should be a no-op reset
    const lastCall = mockFfmpegInstance.setProgress.mock.calls.at(-1)?.[0];
    expect(lastCall).toBeTypeOf('function');
    expect(lastCall?.({ ratio: 1 })).toBeUndefined();
  });

  it('throws when FFmpeg instance is unavailable', async () => {
    const { getFfmpegInstance } = await import('./ffmpegLoader');
    vi.mocked(getFfmpegInstance).mockReturnValueOnce(null);

    await expect(convertToOggOpus(makeBlob('audio/webm'))).rejects.toThrow(
      'FFmpeg not available',
    );
  });
});
