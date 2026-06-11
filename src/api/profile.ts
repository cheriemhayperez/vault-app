import { formatSupabaseError } from "@/lib/supabaseErrors";
import { supabase } from "@/lib/supabaseClient";

const AVATAR_BUCKET = "avatars";
const AVATAR_BUCKET_SETUP_MESSAGE =
  'The "avatars" storage bucket is missing. In Supabase → SQL Editor, run `supabase/avatars.sql` (or section 6 of `supabase/setup.sql`), then try again.';
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
]);

const getAvatarExtension = (file: File): string => {
  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ALLOWED_AVATAR_EXTENSIONS.has(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  const fromType = file.type.split("/").pop()?.toLowerCase() ?? "";
  if (fromType === "jpeg") {
    return "jpg";
  }
  if (ALLOWED_AVATAR_EXTENSIONS.has(fromType)) {
    return fromType;
  }

  return "jpg";
};

const formatAvatarUploadError = (error: unknown): string => {
  const message = formatSupabaseError(error).toLowerCase();
  if (
    message.includes("bucket not found") ||
    message.includes("does not exist") ||
    message.includes("invalid bucket")
  ) {
    return AVATAR_BUCKET_SETUP_MESSAGE;
  }
  return formatSupabaseError(error);
};

export const getVaultAvatarUrl = (user: {
  user_metadata?: Record<string, unknown>;
} | null): string | null => {
  const value = user?.user_metadata?.avatar_url;
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

export const uploadVaultAvatar = async (
  userId: string,
  file: File,
): Promise<string> => {
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Profile photo must be 2MB or smaller.");
  }

  const extension = getAvatarExtension(file);
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type || `image/${extension}`,
    });

  if (uploadError) {
    throw new Error(formatAvatarUploadError(uploadError));
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const publicUrl = data.publicUrl.trim();
  if (!publicUrl) {
    throw new Error("Could not resolve avatar URL after upload.");
  }

  return `${publicUrl}?t=${Date.now()}`;
};

export const updateVaultProfile = async (input: {
  fullName: string;
  avatarUrl?: string | null;
}) => {
  const trimmedName = input.fullName.trim();
  if (!trimmedName) {
    throw new Error("Full name is required.");
  }

  const metadata: Record<string, string> = {
    full_name: trimmedName,
    name: trimmedName,
  };

  if (input.avatarUrl) {
    metadata.avatar_url = input.avatarUrl;
  }

  const { data, error } = await supabase.auth.updateUser({
    data: metadata,
  });

  if (error) {
    throw new Error(formatSupabaseError(error));
  }

  return data.user;
};

export const saveVaultProfile = async (input: {
  userId: string;
  fullName: string;
  avatarFile?: File | null;
  existingAvatarUrl?: string | null;
}) => {
  const trimmedName = input.fullName.trim();
  if (!trimmedName) {
    throw new Error("Full name is required.");
  }

  let avatarUrl = input.existingAvatarUrl?.trim() || null;

  if (input.avatarFile) {
    avatarUrl = await uploadVaultAvatar(input.userId, input.avatarFile);
  }

  const user = await updateVaultProfile({
    fullName: trimmedName,
    avatarUrl: avatarUrl ?? undefined,
  });

  return {
    user,
    avatarUrl,
  };
};
