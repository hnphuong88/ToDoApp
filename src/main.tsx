import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/msalConfig";
import { setMsalInstance } from "./auth/getToken";
import { TodoProvider } from "./context/TodoContext";
import App from "./App";
import "./index.css";

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(() => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  msalInstance.addEventCallback((event) => {
    if (
      event.eventType === EventType.LOGIN_SUCCESS &&
      event.payload &&
      "account" in event.payload
    ) {
      msalInstance.setActiveAccount(
        (event.payload as { account: ReturnType<typeof msalInstance.getActiveAccount> }).account
      );
    }
  });

  setMsalInstance(msalInstance);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <TodoProvider>
            <App />
          </TodoProvider>
        </BrowserRouter>
      </MsalProvider>
    </StrictMode>
  );
});
