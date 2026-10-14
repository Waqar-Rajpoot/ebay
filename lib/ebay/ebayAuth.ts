import "server-only";
import { getEbayConfig } from "./ebayConfig";
import {
  EBAY_FULFILLMENT_READONLY_SCOPE,
  ERROR_BODY_PREVIEW_LENGTH,
  TOKEN_EXPIRY_BUFFER_SECONDS,
} from "./ebayConstants";
import { EbayApiError } from "./ebayError";

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedToken: { value: string; expiresAtMilliseconds: number } | null = null;

/**
 * Returns a valid eBay access token, exchanging the long-lived refresh token
 * only when the cached token is missing or about to expire.
 *
 * @throws EbayApiError when eBay rejects the refresh token or credentials.
 */
export async function getEbayAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAtMilliseconds > Date.now()) {
    return cachedToken.value;
  }

  const { apiBaseUrl, clientId, clientSecret, refreshToken } = getEbayConfig();
  const basicCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${apiBaseUrl}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicCredentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: EBAY_FULFILLMENT_READONLY_SCOPE,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyPreview = (await response.text()).slice(0, ERROR_BODY_PREVIEW_LENGTH);
    throw new EbayApiError(`eBay token request failed: ${bodyPreview}`, response.status);
  }

  const token = (await response.json()) as TokenResponse;
  cachedToken = {
    value: token.access_token,
    expiresAtMilliseconds: Date.now() + (token.expires_in - TOKEN_EXPIRY_BUFFER_SECONDS) * 1000,
  };
  return cachedToken.value;
}