import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  apiClient,
  downloadPattern,
  normalizeGeneratedPatternPngData,
} from '../../src/services/api';
import type { GenerateRequest } from '../../src/types/api';

const requestPayload: GenerateRequest = {
  aspect_w: 16,
  aspect_h: 9,
  total_tiles: 12,
  colors: ['#273c6b', '#92323d'],
  counts: [6, 6],
  color_mode: 'random',
  seed: 7,
  num_layouts: 1,
};

describe('apiClient generated image contract normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('converts raw base64 png_data into data URL on generatePatterns success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          patterns: [
            {
              id: 'pattern_1',
              seed: 7,
              width_inches: 10,
              height_inches: 5,
              aspect_ratio: 2,
              aspect_deviation: 0,
              png_data: 'abc123base64',
              hexes: [{ q: 0, r: 0 }],
              colors: ['#273c6b'],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await apiClient.generatePatterns(requestPayload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.patterns[0]?.png_data).toBe(
        'data:image/png;base64,abc123base64'
      );
    }
  });

  it('preserves existing data URL values idempotently', () => {
    const prefixed = 'data:image/png;base64,already-prefixed';
    expect(normalizeGeneratedPatternPngData(prefixed)).toBe(prefixed);
  });

  it('preserves wrapper error behavior for non-success responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'bad request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await apiClient.generatePatterns(requestPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.detail).toBe('bad request');
    }
  });

  it('keeps the named downloadPattern export bound to API client baseUrl', async () => {
    const blob = new Blob(['png-bytes'], { type: 'image/png' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(blob, {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      })
    );

    const result = await downloadPattern('pattern_7_0');

    expect(result).not.toBeNull();
    expect(Object.prototype.toString.call(result)).toBe('[object Blob]');
    expect(typeof result?.size).toBe('number');
    expect(result?.type).toBe('image/png');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/patterns/pattern_7_0/download'
    );
  });

  it('returns null when named downloadPattern receives non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('not found', { status: 404 })
    );

    const result = await downloadPattern('missing-pattern');

    expect(result).toBeNull();
  });
});
