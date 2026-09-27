import { writeFile, unlink, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import crypto from 'crypto';

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export class UploadValidationError extends Error {}

export function detectImageExtension(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(pngSignature)) {
    return 'png';
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

export async function saveUploadedImage(file: File, subdir: string, prefix: string): Promise<string> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError('Ukuran file maksimal 2 MB');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = detectImageExtension(buffer);
  if (!ext) {
    throw new UploadValidationError('Format file harus JPG, PNG, atau WEBP');
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', subdir);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${prefix}_${crypto.randomUUID()}.${ext}`;
  await writeFile(join(uploadDir, filename), buffer);
  return filename;
}

export async function deleteUploadedFile(subdir: string, filename: string | null | undefined): Promise<void> {
  if (!filename) return;
  try {
    await unlink(join(process.cwd(), 'public', 'uploads', subdir, basename(filename)));
  } catch {}
}
