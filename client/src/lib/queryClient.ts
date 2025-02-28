import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  data?: unknown | undefined,
): Promise<{ _statusCode: number } & any> {
  try {
    const body = data ? JSON.stringify(data) : undefined;

    const options: RequestInit = {
      method,
      body,
      headers: data ? { "Content-Type": "application/json" } : {},
      credentials: "include",
    };

    // Always ensure path starts with / for consistency
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    // All API requests should go to /api/* endpoint
    const apiPath = normalizedPath.startsWith("/api") ? normalizedPath : `/api${normalizedPath}`;

    console.log(`API request: ${method} ${apiPath}`);

    const response = await fetch(apiPath, options);
    console.log(`API response status: ${response.status}`);

    const result = await response.json();
    console.log("API response body:", result);

    // Attach status code to the result to help with client-side handling
    result._statusCode = response.status;

    return result;
  } catch (error) {
    console.error(`API request error (${method} ${path}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      useErrorBoundary: false,
    },
    mutations: {
      retry: false,
      useErrorBoundary: false,
    },
  },
});