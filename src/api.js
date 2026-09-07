const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function submitTicket(ticket) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/v1/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket),
    });
  } catch {
    throw new ApiError(
      `No se pudo contactar al backend en ${API_BASE_URL}. ¿Está corriendo "python app.py"?`,
      0
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error || `Error HTTP ${res.status}`, res.status);
  }

  return data;
}

export { API_BASE_URL };
