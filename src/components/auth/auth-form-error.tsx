interface AuthFormErrorProps {
  message: string | null;
  variant?: "error" | "success";
  tone?: "light" | "glass";
}

export const AuthFormError = ({
  message,
  variant = "error",
  tone = "light",
}: AuthFormErrorProps) => {
  if (!message) {
    return null;
  }

  const styles =
    tone === "glass"
      ? variant === "success"
        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
        : "border-rose-400/30 bg-rose-500/10 text-rose-300"
      : variant === "success"
        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
        : "border-rose-100 bg-rose-50 text-rose-600";

  return (
    <p role="alert" className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {message}
    </p>
  );
};
