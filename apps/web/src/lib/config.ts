export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("NEXT_PUBLIC_APP_URL must be set in production");
      })()
    : "http://localhost:3000");
