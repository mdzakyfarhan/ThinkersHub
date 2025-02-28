import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
};

export async function apiRequest(
  path: string,
  { method = "GET", body }: ApiRequestOptions = {},
  data?: unknown | undefined,
): Promise<{ _statusCode: number } & any> {
  try {
    const requestBody = data ? JSON.stringify(data) : body ? JSON.stringify(body) : undefined;
    const requestId = Math.random().toString(36).substring(2, 8); // For tracking in logs

    const options: RequestInit = {
      method,
      body: requestBody,
      headers: (data || body) ? { "Content-Type": "application/json" } : {},
      credentials: "include",
    };

    // Always ensure path starts with / for consistency
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    // All API requests should go to /api/* endpoint
    const apiPath = normalizedPath.startsWith("/api") ? normalizedPath : `/api${normalizedPath}`;

    console.log(`[${requestId}] API request: ${method} ${apiPath}`, requestBody ? { body: requestBody } : '');

    const response = await fetch(apiPath, options);
    console.log(`[${requestId}] API response status: ${response.status}`);

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    let result;

    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
      console.log(`[${requestId}] API response body:`, result);
    } else {
      const text = await response.text();
      console.log(`[${requestId}] API response text:`, text);
      // Create a placeholder result object
      result = { message: text, _isTextResponse: true };
    }

    // Attach status code to the result to help with client-side handling
    result._statusCode = response.status;
    return result;
  } catch (error) {
    console.error(`[${requestId}] API request error:`, error);
    throw error; // Re-throw the error to be handled by the caller
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