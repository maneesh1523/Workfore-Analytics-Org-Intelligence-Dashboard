export const cognitoConfig = {
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  domain: import.meta.env.VITE_COGNITO_DOMAIN,
  redirectUri: window.location.origin,

  scopes: ["email", "openid"],
  responseType: "token", // implicit flow
};