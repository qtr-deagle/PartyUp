import { supabase } from '@/lib/supabase';

// Profile photos for the signed-in account. Mirrors lib/avatar.ts in
// partyup-mobile: the public `avatars` bucket only takes JPEG, files live
// under `<user id>/`, each upload gets a new name (so cached URLs don't go
// stale) and older files are cleaned up afterwards.

const MAX_SIZE = 512;

// Illustrated avatars (DiceBear "notionists", free, CC0-style license); the
// same style the demo accounts were given.
export function illustratedAvatarUrl(seed: string) {
  const params = new URLSearchParams({ seed, size: String(MAX_SIZE), backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' });
  return `https://api.dicebear.com/9.x/notionists/jpg?${params}`;
}

// Center-crops to a square, scales to 512px and re-encodes as JPEG.
async function toSquareJpeg(source: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(MAX_SIZE, side);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not process this image.');
  ctx.fillStyle = '#ffffff'; // transparent PNGs would otherwise turn black in JPEG
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image.'))), 'image/jpeg', 0.85)
  );
}

async function saveAvatar(jpeg: Blob) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('You are not signed in.');

  const path = `${userId}/${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, jpeg, { contentType: 'image/jpeg', upsert: false });
  if (uploadError) throw new Error(`Failed to upload photo: ${uploadError.message}`);

  const publicUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
  const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
  if (updateError) throw updateError;

  await removeOtherFiles(userId, path);
  return publicUrl;
}

// Best effort: a leftover old file is harmless.
async function removeOtherFiles(userId: string, keepPath: string | null) {
  const { data: existing } = await supabase.storage.from('avatars').list(userId);
  const stale = (existing ?? []).map((file) => `${userId}/${file.name}`).filter((name) => name !== keepPath);
  if (stale.length) await supabase.storage.from('avatars').remove(stale);
}

export async function uploadOwnAvatar(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Pick an image file (JPG, PNG or WebP).');
  if (file.size > 15 * 1024 * 1024) throw new Error('That image is over 15 MB. Pick a smaller one.');
  return saveAvatar(await toSquareJpeg(file));
}

export async function setIllustratedAvatar(seed: string) {
  const response = await fetch(illustratedAvatarUrl(seed));
  if (!response.ok) throw new Error('Could not generate an avatar right now. Try again.');
  return saveAvatar(await response.blob());
}

export async function removeOwnAvatar() {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('You are not signed in.');
  const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', userId);
  if (error) throw error;
  await removeOtherFiles(userId, null);
}
