export const APP_NAME = "eBay Order Portal";
export const APP_DESCRIPTION = "Upload order sheets, let your team fill in prices, and download the result.";

/** Every page path in one place, so links never drift from the real routes. */
export const ROUTES = {
  home: "/",
  admin: "/admin",
  adminUpload: "/admin/upload",
  team: "/team",
} as const;

export function adminBatchRoute(batchId: string): string {
  return `${ROUTES.admin}/batches/${batchId}`;
}

export function teamBatchRoute(batchId: string): string {
  return `${ROUTES.team}/${batchId}`;
}

export const API_ROUTES = {
  access: "/api/access",
  batches: "/api/batches",
  batchPreview: "/api/batches/preview",
} as const;

export function batchApiRoute(batchId: string): string {
  return `/api/batches/${batchId}`;
}

export function batchColumnsApiRoute(batchId: string): string {
  return `/api/batches/${batchId}/columns`;
}

export function batchColumnApiRoute(batchId: string, columnKey: string): string {
  return `/api/batches/${batchId}/columns/${columnKey}`;
}

export function batchExportApiRoute(batchId: string): string {
  return `/api/batches/${batchId}/export`;
}

export function rowApiRoute(rowId: string): string {
  return `/api/team/rows/${rowId}`;
}