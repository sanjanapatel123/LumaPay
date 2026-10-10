
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest<T>(
  path: string,
  token?: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiRequestError(
      data?.message ?? `Request failed (${response.status})`,
      response.status,
    );
  }

  return data as T;
}

export function unwrapResponse<T>(response: any): T {
  return (response?.data ?? response) as T;
}
