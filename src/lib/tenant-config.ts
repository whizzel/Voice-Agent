export type TenantConfig = {
  indexName: string
}

const TENANTS: Record<string, TenantConfig> = {
  dispatch: { indexName: process.env.MOSS_INDEX_NAME || "dispatch-kb" },
}

export const DEFAULT_TENANT_ID = "dispatch"

export function getTenantConfig(tenantId?: string): TenantConfig {
  return TENANTS[tenantId ?? DEFAULT_TENANT_ID] ?? TENANTS[DEFAULT_TENANT_ID]
}
