import { type Configuration, LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID ?? "YOUR_SPA_CLIENT_ID",
    authority: import.meta.env.VITE_ENTRA_AUTHORITY ??
      "https://YOUR_TENANT_NAME.ciamlogin.com/YOUR_TENANT_ID",
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) console.error(message);
      },
    },
  },
};

export const loginRequest = {
  scopes: [
    import.meta.env.VITE_ENTRA_API_SCOPE ??
      "api://YOUR_API_CLIENT_ID/todos.read",
  ],
};

export const tokenRequest = {
  scopes: [
    import.meta.env.VITE_ENTRA_API_SCOPE ??
      "api://YOUR_API_CLIENT_ID/todos.read",
  ],
};
