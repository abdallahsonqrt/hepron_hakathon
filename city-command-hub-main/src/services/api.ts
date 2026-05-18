// City Command Center — API Service Layer
// Configure BASE_URL to point to your backend

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `API error ${res.status}`);
  }
  return res.json();
}

// ─── Identity Service ───────────────────────────────────────

export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    request<{ token: string; refresh_token: string }>("POST", "/v1/auth/login", credentials),
  refresh: (refreshToken: string) =>
    request<{ token: string }>("POST", "/v1/auth/refresh", { refresh_token: refreshToken }),
  logout: () => request("POST", "/v1/auth/logout"),
  verify: (token: string) => request("POST", "/v1/auth/verify", { token }),
  getContext: () => request("GET", "/v1/auth/context"),
};

export const usersApi = {
  list: () => request("GET", "/v1/users"),
  create: (data: Record<string, unknown>) => request("POST", "/v1/users", data),
  get: (userId: string) => request("GET", `/v1/users/${userId}`),
  update: (userId: string, data: Record<string, unknown>) => request("PUT", `/v1/users/${userId}`, data),
  delete: (userId: string) => request("DELETE", `/v1/users/${userId}`),
  resetPassword: (userId: string) => request("POST", `/v1/users/${userId}/reset-password`),
};

export const rbacApi = {
  getRoles: () => request("GET", "/v1/rbac/roles"),
  assignRole: (data: { user_id: string; role: string }) => request("POST", "/v1/rbac/roles/assign", data),
  revokeRole: (data: { user_id: string; role: string }) => request("POST", "/v1/rbac/roles/revoke", data),
  getUserPermissions: (userId: string) => request("GET", `/v1/rbac/users/${userId}/permissions`),
  checkPermission: (data: { user_id: string; permission: string }) =>
    request("POST", "/v1/rbac/check-permission", data),
  getPolicies: () => request("GET", "/v1/rbac/policies"),
  createPolicy: (data: Record<string, unknown>) => request("POST", "/v1/rbac/policies", data),
};

export const auditApi = {
  getEvents: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request("GET", `/v1/audit/events${qs}`);
  },
  getEvent: (eventId: string) => request("GET", `/v1/audit/events/${eventId}`),
};

// ─── Ingestion Service ──────────────────────────────────────

export const ingestApi = {
  sendEvents: (deptId: string, events: unknown[]) =>
    request("POST", `/v1/ingest/${deptId}/events`, { events }),
};

// ─── KPI Service ────────────────────────────────────────────

export const kpiApi = {
  list: () => request("GET", "/v1/kpis"),
  create: (data: Record<string, unknown>) => request("POST", "/v1/kpis", data),
  get: (kpiId: string) => request("GET", `/v1/kpis/${kpiId}`),
};

// ─── Monitoring Service ─────────────────────────────────────

export const rulesApi = {
  list: () => request("GET", "/v1/rules"),
  create: (data: Record<string, unknown>) => request("POST", "/v1/rules", data),
  get: (ruleId: string) => request("GET", `/v1/rules/${ruleId}`),
};

// ─── Health Checks ──────────────────────────────────────────

export type ServiceName = "identity" | "ingestion" | "kpi" | "monitoring" | "notification" | "processing" | "governance";

const SERVICE_PORTS: Record<ServiceName, string> = {
  identity: BASE_URL,
  ingestion: BASE_URL,
  kpi: BASE_URL,
  monitoring: BASE_URL,
  notification: BASE_URL,
  processing: BASE_URL,
  governance: BASE_URL,
};

export const healthApi = {
  live: (service: ServiceName) =>
    request<{ status: string }>("GET", "/health/live").catch(() => ({ status: "down" })),
  ready: (service: ServiceName) =>
    request<{ status: string }>("GET", "/health/ready").catch(() => ({ status: "down" })),
  checkAll: async () => {
    const services: ServiceName[] = ["identity", "ingestion", "kpi", "monitoring", "notification", "processing", "governance"];
    const results = await Promise.all(
      services.map(async (s) => {
        try {
          const res = await healthApi.live(s);
          return { service: s, status: res.status === "ok" ? "online" : "degraded" } as const;
        } catch {
          return { service: s, status: "offline" as const };
        }
      })
    );
    return results;
  },
};
