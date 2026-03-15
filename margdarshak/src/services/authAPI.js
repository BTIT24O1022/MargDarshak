import request from "./api";

export async function loginUser(email, password) {
  const result = await request("POST", "/auth/login", { email, password });

  if (result.token) {
    localStorage.setItem("token", result.token);
  }

  if (result.user) {
    localStorage.setItem("user", JSON.stringify(result.user));
  }

  return result;
}

export async function logoutUser() {
  try {
    await request("POST", "/auth/logout");
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export async function getMe() {
  return request("GET", "/auth/me");
}