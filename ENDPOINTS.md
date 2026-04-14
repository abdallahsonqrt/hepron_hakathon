# Service Endpoints

## Identity Service

### Auth — `/v1/auth`
| Method | Path |
|--------|------|
| POST | `/v1/auth/login` |
| POST | `/v1/auth/refresh` |
| POST | `/v1/auth/logout` |
| POST | `/v1/auth/verify` |
| GET | `/v1/auth/context` |

### Users — `/v1/users`
| Method | Path |
|--------|------|
| GET | `/v1/users` |
| POST | `/v1/users` |
| GET | `/v1/users/{user_id}` |
| PUT | `/v1/users/{user_id}` |
| DELETE | `/v1/users/{user_id}` |
| POST | `/v1/users/{user_id}/reset-password` |

### RBAC — `/v1/rbac`
| Method | Path |
|--------|------|
| GET | `/v1/rbac/roles` |
| POST | `/v1/rbac/roles/assign` |
| POST | `/v1/rbac/roles/revoke` |
| GET | `/v1/rbac/users/{user_id}/permissions` |
| POST | `/v1/rbac/check-permission` |
| GET | `/v1/rbac/policies` |
| POST | `/v1/rbac/policies` |

### Audit — `/v1/audit`
| Method | Path |
|--------|------|
| GET | `/v1/audit/events` |
| GET | `/v1/audit/events/{event_id}` |

### Health
| Method | Path |
|--------|------|
| GET | `/health/live` |
| GET | `/health/ready` |

---

## Ingestion Service

### Events — `/v1/ingest`
| Method | Path |
|--------|------|
| POST | `/v1/ingest/{dept_id}/events` |

### Health
| Method | Path |
|--------|------|
| GET | `/health/live` |
| GET | `/health/ready` |

---

## KPI Service

### Registry — `/v1/kpis`
| Method | Path |
|--------|------|
| POST | `/v1/kpis` |
| GET | `/v1/kpis` |
| GET | `/v1/kpis/{kpi_id}` |

### Health
| Method | Path |
|--------|------|
| GET | `/health/live` |
| GET | `/health/ready` |

---

## Monitoring Service

### Rules — `/v1/rules`
| Method | Path |
|--------|------|
| POST | `/v1/rules` |
| GET | `/v1/rules` |
| GET | `/v1/rules/{rule_id}` |

### Health
| Method | Path |
|--------|------|
| GET | `/health/live` |
| GET | `/health/ready` |

---

## Notification Service

### Health
| Method | Path |
|--------|------|
| GET | `/health/live` |
| GET | `/health/ready` |

---

## Processing Service

### Health
| Method | Path |
|--------|------|
| GET | `/health/live` |
| GET | `/health/ready` |

---

## Governance Service

### Health
| Method | Path |
|--------|------|
| GET | `/health/live` |
| GET | `/health/ready` |
