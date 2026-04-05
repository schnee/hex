/**
 * @deprecated Single-screen workspace no longer depends on route splits.
 * Retained temporarily for legacy integration tests during migration.
 */
export const WORKSPACE_ROUTES = {
  base: '/',
  generator: '/generator',
  overlay: '/overlay',
} as const;
