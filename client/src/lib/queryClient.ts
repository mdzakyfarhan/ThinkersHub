import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  apiPath: string,
  data?: unknown | undefined,
): Promise<any> {
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

    // Always ensure path starts with / for consistency
    const normalizedPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;

    console.log(`[${requestId}] API request: ${method} ${normalizedPath}`,
      requestBody ? { body: JSON.parse(requestBody) } : '(no body)');

    const res = await fetch(normalizedPath, options);
    
    await throwIfResNotOk(res);
    
    // Parse the JSON response
    const jsonData = await res.json();
    console.log(`[${requestId}] API response data:`, jsonData);
    
    return jsonData;
  } catch (error) {
    const requestId = Math.random().toString(36).substring(2, 8);
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