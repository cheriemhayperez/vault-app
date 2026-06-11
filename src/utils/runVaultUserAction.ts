import { getCurrentVaultUser } from "@/api/user";
import { formatSupabaseError } from "@/lib/supabaseErrors";

/** Runs an authenticated Supabase action; only calls onSuccess after the server action succeeds. */
export const runVaultUserAction = async (options: {
  run: (userId: string) => Promise<void>;
  onSuccess: () => void;
  onError?: (message: string) => void;
}): Promise<void> => {
  try {
    const user = await getCurrentVaultUser();
    if (!user) {
      options.onError?.("You must be signed in.");
      return;
    }

    await options.run(user.id);
    options.onSuccess();
  } catch (error) {
    console.error(error);
    options.onError?.(formatSupabaseError(error));
  }
};
