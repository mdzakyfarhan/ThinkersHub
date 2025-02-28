import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  apiPath: string, // Added apiPath parameter
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const requestId = Math.random().toString(36).substring(2, 8); // For tracking in logs

    // Combine body and data into a single payload
    const payload = data;
    const requestBody = payload && method !== "GET" && method !== "HEAD"
      ? JSON.stringify(payload)
      : undefined;

    const options: RequestInit = {
      method,
      headers: payload && method !== "GET" && method !== "HEAD"
        ? { "Content-Type": "application/json" }
        : {},
      credentials: "include",
    };

    // Only add body for non-GET/HEAD requests
    if (requestBody) {
      options.body = requestBody;
    }

    // Normalize the path to ensure it's correctly formatted
    let normalizedPath = apiPath;
    if (!normalizedPath.startsWith("/")) {
      normalizedPath = `/${normalizedPath}`;
    }
    console.log(`[REQUEST] Using normalized path: ${normalizedPath}`);

    console.log(`[${requestId}] API request: ${method} ${normalizedPath}`,
      requestBody ? { body: JSON.parse(requestBody) } : '(no body)');

    const res = await fetch(normalizedPath, options);

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`[${requestId}] API request failed:`, error);
    throw error; // Re-throw the error to be handled higher up
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