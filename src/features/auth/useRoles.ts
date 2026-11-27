import { useAuthStore } from '@/stores/authStore';

/** Returns a predicate for checking whether the current user has any of the given roles. */
export function useHasAnyRole() {
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  return (...required: string[]) => required.some((r) => roles.includes(r));
}
