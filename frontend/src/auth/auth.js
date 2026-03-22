import { cognitoConfig } from "../config/cognito";

export const login = () => {
  const { domain, clientId, redirectUri, scopes, responseType } = cognitoConfig;

  const url = `https://${domain}/login?client_id=${clientId}&response_type=${responseType}&scope=${scopes.join(
    "+"
  )}&redirect_uri=${redirectUri}`;

  window.location.href = url;
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};

export const handleAuth = () => {
  const hash = window.location.hash;

  if (hash.includes("id_token")) {
    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("id_token");

    if (token) {
      localStorage.setItem("token", token);

      // 🔥 CLEAN URL + REDIRECT
      window.location.href = "/dashboard";
    }
  }
};