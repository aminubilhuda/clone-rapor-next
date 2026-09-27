import { describe, it, expect } from 'vitest';
import { detectImageExtension, UploadValidationError } from '../upload';

const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const webp = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0, 0, 0, 0]),
  Buffer.from('WEBP'),
  Buffer.from([0, 0, 0, 0]),
]);
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
const php = Buffer.from('<?php echo "x"; ?>');

describe('detectImageExtension', () => {
  it('detects jpg, png, webp', () => {
    expect(detectImageExtension(jpg)).toBe('jpg');
    expect(detectImageExtension(png)).toBe('png');
    expect(detectImageExtension(webp)).toBe('webp');
  });

  it('rejects svg and php payloads', () => {
    expect(detectImageExtension(svg)).toBeNull();
    expect(detectImageExtension(php)).toBeNull();
  });
});

describe('UploadValidationError', () => {
  it('is an Error subclass', () => {
    const err = new UploadValidationError('Format file harus JPG, PNG, atau WEBP');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain('JPG');
  });
});
