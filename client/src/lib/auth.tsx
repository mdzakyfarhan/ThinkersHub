export const loginUser = async (username: string, password: string) => {
  try {
    console.log("Attempting login with:", username);
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: {
        username,
        password,
      },
    });

    if (response._statusCode !== 200) {
      throw new Error("Login failed");
    }

    // Store the user data in session storage
    sessionStorage.setItem("user", JSON.stringify(response));
    return { success: true, user: response };
  } catch (error) {
    console.error("Login error details:", error);
    return { success: false, error };
  }
};