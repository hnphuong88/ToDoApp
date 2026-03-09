import {
  type AccountInfo,
  type IPublicClientApplication,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import { tokenRequest } from "./msalConfig";

let msalInstance: IPublicClientApplication | null = null;

export function setMsalInstance(instance: IPublicClientApplication) {
  msalInstance = instance;
}

export function getMsalAccount(): AccountInfo | null {
  if (!msalInstance) return null;
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

export async function getAccessToken(): Promise<string> {
  if (!msalInstance) throw new Error("MSAL instance not initialized");

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) throw new Error("No accounts found – please sign in");

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...tokenRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const response = await msalInstance.acquireTokenPopup(tokenRequest);
      return response.accessToken;
    }
    throw error;
  }
}
