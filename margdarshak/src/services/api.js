const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const token = localStorage.getItem("token");

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;

  } catch (error) {
    console.error("API ERROR:", error);
    throw error;
  }
}

export default request;