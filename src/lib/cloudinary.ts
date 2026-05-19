/**
 * Cloudinary URL builder. Returns null if NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 * is not set, so callers can fall back to local images.
 */
export function cloudinaryUrl(
  publicId: string,
  transforms = "f_auto,q_auto,w_800",
): string | null {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return null;
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms}/${publicId}`;
}
