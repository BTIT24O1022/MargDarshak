import request from "./api";

// ─── VEHICLES ───────────────────────────────

export async function getAllVehicles() {
  return request("GET", "/vehicles");
}

export async function getVehicleById(id) {
  return request("GET", `/vehicles/${id}`);
}

export async function updateVehicleStatus(id, status) {
  return request("PATCH", `/vehicles/${id}/status`, { status });
}

// ─── DELIVERIES ─────────────────────────────

export async function getAllDeliveries() {
  return request("GET", "/deliveries");
}

export async function getDeliveryById(id) {
  return request("GET", `/deliveries/${id}`);
}

export async function confirmDelivery(id) {
  return request("PATCH", `/deliveries/${id}/confirm`);
}

export async function dispatchDelivery(deliveryId, vehicleId) {
  return request("POST", `/deliveries/${deliveryId}/dispatch`, { vehicleId });
}