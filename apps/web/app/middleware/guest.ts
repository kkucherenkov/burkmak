export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth();
  const session = await auth.getSession();
  const authed = Boolean((session as { data?: { user?: unknown } } | null)?.data?.user);
  if (authed) return navigateTo('/library');
});
