async function login(username: string, password: string) {
    console.log("Auth context: login attempt for", username);

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: { username, password },
      });

      console.log("Auth context: login response", response);

      if (response.statusCode >= 400) {
        console.error("Auth context: login failed with status", response.statusCode);
        throw new Error(response.message || "Login failed");
      }

      console.log("Auth context: setting user", response);
      setUser(response);
      return response;
    } catch (error) {
      console.error("Auth context: login exception", error);
      throw error;
    }
  }