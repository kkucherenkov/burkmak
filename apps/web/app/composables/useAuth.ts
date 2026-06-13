import type { Ref } from 'vue';
import { createAuthClient } from 'better-auth/vue';

interface SessionData {
  user?: { id: string; name?: string; email?: string; role?: string };
}

interface SessionState {
  data: SessionData | null;
  isPending: boolean;
  error: { message?: string } | null;
}

// Narrowed interface over the email+password surface we use from the base
// auth client. The full better-auth inferred type is not directly castable,
// so we cast through `unknown` — the cast is intentional and safe because
// these methods are part of the core API and are always present at runtime
// when emailAndPassword is enabled on the server.
interface AuthClientLike {
  signIn: {
    email(opts: {
      email: string;
      password: string;
    }): Promise<{ data: unknown; error: { message?: string } | null }>;
  };
  changePassword(opts: {
    newPassword: string;
    currentPassword?: string;
    revokeOtherSessions?: boolean;
  }): Promise<{ data: unknown; error: { message?: string } | null }>;
  getSession(): Promise<{ data: unknown; error: { message?: string } | null }>;
  signOut(): Promise<{ data: unknown; error: { message?: string } | null }>;
  useSession(): Ref<SessionState>;
}

let client: AuthClientLike | null = null;

export function useAuth(): AuthClientLike {
  if (!client) {
    const { public: pub } = useRuntimeConfig();
    // Cast through `unknown` — the base createAuthClient already exposes
    // signIn.email and changePassword at runtime; the cast is intentional.
    client = createAuthClient({
      baseURL: `${pub.authBaseUrl}/api/v1/auth`,
      fetchOptions: { credentials: 'include' },
    }) as unknown as AuthClientLike;
  }
  return client;
}
