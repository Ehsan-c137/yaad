import { fetchGoogleUserProfile } from "./google-api-client";

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              expires_in?: number | string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (err: { message?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export interface GoogleOAuthTokenResult {
  accessToken: string;
  expiresIn?: number;
  email?: string;
  name?: string;
}

/**
 * Dynamically loads the official Google Identity Services client script
 */
export async function loadGoogleGsiScript(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.google?.accounts?.oauth2) return;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services script."));
    document.head.appendChild(script);
  });
}

/**
 * Requests a Google OAuth access token with calendar read scopes via standard GIS popup
 */
export async function requestGoogleOAuthToken(
  clientId: string,
): Promise<GoogleOAuthTokenResult> {
  await loadGoogleGsiScript();

  return new Promise((resolve, reject) => {
    try {
      if (!window.google?.accounts?.oauth2) {
        throw new Error(
          "Google Identity Services is not available in this environment.",
        );
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope:
          "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        callback: (response) => {
          if (response.error) {
            reject(
              new Error(
                response.error_description ??
                  `Google OAuth error: ${response.error}`,
              ),
            );
            return;
          }

          if (!response.access_token) {
            reject(new Error("No access token returned by Google."));
            return;
          }

          const accessToken = response.access_token;
          const expiresIn = response.expires_in
            ? Number(response.expires_in)
            : undefined;

          void (async () => {
            try {
              // Fetch account profile for email/name
              const profile = await fetchGoogleUserProfile(accessToken);

              resolve({
                accessToken,
                expiresIn,
                email: profile.email,
                name: profile.name,
              });
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              reject(new Error(msg));
            }
          })();
        },
        error_callback: (err) => {
          reject(
            new Error(
              err.message ?? "Google OAuth consent closed or cancelled.",
            ),
          );
        },
      });

      client.requestAccessToken({ prompt: "consent" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      reject(new Error(msg));
    }
  });
}
