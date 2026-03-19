import { User } from "@supabase/supabase-js";

export function makeUser(overrides: RecursivePartial<User>): User {
  return {
    id: "test-user-id",
    aud: "authenticated",
    created_at: new Date(0).toISOString(),
    app_metadata: {},
    user_metadata: {},
    ...overrides,
  } as User;
}

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
