/**
 * 画像入力の正規化
 *
 * LLMに渡す前に画像サイズを最適化する。
 */
import sharp from 'sharp';
import { MAX_IMAGE_WIDTH } from '../types.js';

/** 正規化結果 */
export interface NormalizedImage {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
}

/**
 * Base64画像をリサイズ・正規化する
 *
 * - 最大幅を超える場合はリサイズ
 * - PNG形式に統一
 */
export async function normalizeImage(
  imageBase64: string,
  mimeType?: string,
): Promise<NormalizedImage> {
  const buffer = Buffer.from(imageBase64, 'base64');
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const currentWidth = metadata.width ?? 0;
  const currentHeight = metadata.height ?? 0;

  // 最大幅を超える場合のみリサイズ
  const needsResize = currentWidth > MAX_IMAGE_WIDTH;
  const processed = needsResize
    ? image.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    : image;

  const outputBuffer = await processed.png().toBuffer();
  const outputMetadata = await sharp(outputBuffer).metadata();

  return {
    base64: outputBuffer.toString('base64'),
    mimeType: 'image/png',
    width: outputMetadata.width ?? currentWidth,
    height: outputMetadata.height ?? currentHeight,
  };
}
