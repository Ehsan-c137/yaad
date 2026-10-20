import { Button } from "@ui/button";
import { Input } from "@ui/input";
import {
  extractGoogleEmailFromFeedUrl,
  requestGoogleOAuthToken,
  useCalendarStore,
} from "@yaad/core/store/use-calendar-store";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  KeyRound,
  Link2,
  ShieldCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { GoogleLogo } from "../calendar-google-logo";
import { CALENDAR_COLOR_OPTIONS } from "./color-options";
import { ColorPickerRow } from "./color-picker-row";

interface GoogleProviderTabProps {
  onSuccess?: () => void;
}

type GoogleConnectionMode = "oauth" | "secret";

const GOOGLE_CLIENT_ID_STORAGE_KEY = "yaad_google_client_id";

export const GoogleProviderTab: React.FC<GoogleProviderTabProps> = ({
  onSuccess,
}) => {
  const addProvider = useCalendarStore((s) => s.addProvider);
  const syncProviderConnection = useCalendarStore(
    (s) => s.syncProviderConnection,
  );

  const [authMode, setAuthMode] = useState<GoogleConnectionMode>("secret");
  const [feedUrl, setFeedUrl] = useState("");
  const [calendarName, setCalendarName] = useState("Google Calendar");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleColorIndex, setGoogleColorIndex] = useState(0);
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // OAuth states
  const [clientId, setClientId] = useState("");
  const [saveClientId, setSaveClientId] = useState(true);
  const [showOAuthConfig, setShowOAuthConfig] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [showManualToken, setShowManualToken] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // Initialize Client ID from env or local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GOOGLE_CLIENT_ID_STORAGE_KEY);
      const envClientId = (
        import.meta as unknown as { env?: { VITE_GOOGLE_CLIENT_ID?: string } }
      ).env?.VITE_GOOGLE_CLIENT_ID;

      const initialId = stored ?? envClientId ?? "";
      setClientId(initialId);

      if (!initialId) {
        setShowOAuthConfig(true);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // When user enters/pastes a Google Calendar feed URL, auto-extract email
  const handleFeedUrlChange = (value: string) => {
    setFeedUrl(value);
    const extracted = extractGoogleEmailFromFeedUrl(value);

    if (extracted) {
      setGoogleEmail(extracted);

      if (
        calendarName === "Google Calendar" ||
        calendarName.startsWith("Google Calendar (")
      ) {
        setCalendarName(`Google Calendar (${extracted.split("@")[0]})`);
      }
    }
  };

  // Connect via Secret Address / iCal feed
  const handleConnectSecretUrl = async (e: React.ChangeEvent) => {
    e.preventDefault();

    const trimmedUrl = feedUrl.trim();

    if (!trimmedUrl) {
      setStatusMsg({
        type: "error",
        text: "Please paste your Google Calendar Secret Address (URL).",
      });
      return;
    }

    if (!trimmedUrl.includes("basic.ics") && !trimmedUrl.includes("calendar")) {
      setStatusMsg({
        type: "error",
        text: "The URL does not look like a Google Calendar address. It usually ends with /basic.ics",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const selectedColor = CALENDAR_COLOR_OPTIONS[googleColorIndex];
      const providerId = `google-${Date.now()}`;
      const calendarId = `cat-google-${Date.now()}`;

      addProvider({
        id: providerId,
        provider: "google",
        name:
          calendarName.trim() ||
          (googleEmail
            ? `Google (${googleEmail.split("@")[0]})`
            : "Google Calendar"),
        accountEmail: googleEmail.trim() || undefined,
        feedUrl: trimmedUrl,
        color: selectedColor.dot,
        calendarId,
        autoSync: true,
        syncIntervalMinutes,
        syncStatus: "idle",
      });

      await syncProviderConnection(providerId);

      setStatusMsg({
        type: "success",
        text: "Google Calendar connected and synced successfully!",
      });

      setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to connect to Google Calendar.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Connect via Google OAuth 2.0 Sign-In
  const handleGoogleOAuthSignIn = async () => {
    // If manual token was provided
    if (showManualToken && manualToken.trim()) {
      setIsSubmitting(true);
      setStatusMsg(null);

      try {
        const selectedColor = CALENDAR_COLOR_OPTIONS[googleColorIndex];
        const providerId = `google-${Date.now()}`;
        const calendarId = `cat-google-${Date.now()}`;

        addProvider({
          id: providerId,
          provider: "google",
          name: calendarName.trim() || "Google Calendar",
          accountEmail: googleEmail.trim() || undefined,
          color: selectedColor.dot,
          calendarId,
          autoSync: true,
          syncIntervalMinutes,
          syncStatus: "idle",
          accessToken: manualToken.trim(),
        });

        await syncProviderConnection(providerId);

        setStatusMsg({
          type: "success",
          text: "Google Calendar connected and synced successfully via OAuth token!",
        });

        setTimeout(() => {
          onSuccess?.();
        }, 900);
      } catch (err: unknown) {
        setStatusMsg({
          type: "error",
          text:
            err instanceof Error
              ? err.message
              : "Failed to sync Google Calendar with access token.",
        });
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    const trimmedClientId = clientId.trim();

    if (!trimmedClientId) {
      setShowOAuthConfig(true);
      setStatusMsg({
        type: "error",
        text: "Please enter your Google OAuth Client ID first, or use the Secret Calendar Address option.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      if (saveClientId) {
        localStorage.setItem(GOOGLE_CLIENT_ID_STORAGE_KEY, trimmedClientId);
      }

      const oauthResult = await requestGoogleOAuthToken(trimmedClientId);

      const resolvedEmail = oauthResult.email ?? googleEmail.trim();
      const resolvedName =
        oauthResult.name ??
        (resolvedEmail ? `Google (${resolvedEmail.split("@")[0]})` : "");

      const selectedColor = CALENDAR_COLOR_OPTIONS[googleColorIndex];
      const providerId = `google-${Date.now()}`;
      const calendarId = `cat-google-${Date.now()}`;

      addProvider({
        id: providerId,
        provider: "google",
        name: calendarName.trim() || resolvedName || "Google Calendar",
        accountEmail: resolvedEmail || undefined,
        color: selectedColor.dot,
        calendarId,
        autoSync: true,
        syncIntervalMinutes,
        syncStatus: "idle",
        accessToken: oauthResult.accessToken,
        clientId: trimmedClientId,
      });

      await syncProviderConnection(providerId);

      setStatusMsg({
        type: "success",
        text: "Google Calendar connected and synced successfully!",
      });

      setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (err: unknown) {
      setStatusMsg({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Google OAuth sign-in was cancelled or failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-3.5 shadow-2xs dark:border-blue-500/20 dark:bg-blue-950/20">
        <GoogleLogo className="size-6 shrink-0" />
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-foreground">
            Connect Real Google Calendar
          </span>
          <span className="text-muted-foreground">
            Sync real-time Google events, recurring meetings, and Google Meet
            links directly into Yaad.
          </span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-foreground">
          Connection Method
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode("secret");
              setStatusMsg(null);
            }}
            className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all ${
              authMode === "secret"
                ? "border-primary bg-primary/10 text-foreground font-semibold shadow-2xs dark:bg-primary/15"
                : "border-border bg-card text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Link2 className="size-3.5 text-blue-500" />
              <span>Secret Address (Live)</span>
            </div>
            <span className="text-[11px] font-normal leading-relaxed opacity-85">
              Instant live sync via your private Google Calendar link. Zero
              cloud setup.
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode("oauth");
              setStatusMsg(null);
            }}
            className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all ${
              authMode === "oauth"
                ? "border-primary bg-primary/10 text-foreground font-semibold shadow-2xs dark:bg-primary/15"
                : "border-border bg-card text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <KeyRound className="size-3.5 text-amber-500" />
              <span>Google OAuth 2.0</span>
            </div>
            <span className="text-[11px] font-normal leading-relaxed opacity-85">
              Direct connection using official Google account authorization
              popup.
            </span>
          </button>
        </div>
      </div>

      {/* Secret Address Form */}
      {authMode === "secret" && (
        <form
          onSubmit={(e) => {
            void handleConnectSecretUrl(e);
          }}
          className="flex flex-col gap-3.5"
        >
          <label
            htmlFor="gcal-feed-url"
            className="flex flex-col gap-1.5 text-[12px] font-medium text-foreground"
          >
            <div className="flex items-center justify-between">
              <span>Google Calendar Secret Address (.ics)</span>
              <button
                type="button"
                onClick={() => setShowInstructions((prev) => !prev)}
                className="flex items-center gap-1 text-[11px] font-normal text-blue-600 hover:underline dark:text-blue-400"
              >
                <HelpCircle className="size-3" />
                <span>
                  {showInstructions
                    ? "Hide instructions"
                    : "Where do I find this?"}
                </span>
                {showInstructions ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>
            </div>
            <Input
              id="gcal-feed-url"
              type="url"
              required
              placeholder="https://calendar.google.com/calendar/ical/.../private-.../basic.ics"
              value={feedUrl}
              onChange={(e) => handleFeedUrlChange(e.target.value)}
              className="font-mono text-xs"
            />
          </label>

          {/* Expandable Step-by-Step Guide */}
          {showInstructions && (
            <div className="flex flex-col gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-muted-foreground animate-in fade-in duration-200">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-blue-500" />
                  How to get your private Google Calendar link (30 seconds):
                </span>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline dark:text-blue-400"
                >
                  <span>Open Google Calendar</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <ol className="flex flex-col gap-1.5 pl-4 list-decimal text-[11px] leading-relaxed">
                <li>
                  Open{" "}
                  <strong className="text-foreground">Google Calendar</strong>{" "}
                  in your web browser.
                </li>
                <li>
                  On the left sidebar, hover over the calendar you want to sync
                  under <em>My calendars</em>, and click the three dots{" "}
                  <strong className="text-foreground">⋮</strong> &gt;{" "}
                  <strong className="text-foreground">
                    Settings and sharing
                  </strong>
                  .
                </li>
                <li>
                  Scroll down to the{" "}
                  <strong className="text-foreground">
                    Integrate calendar
                  </strong>{" "}
                  section.
                </li>
                <li>
                  Copy the link labeled{" "}
                  <strong className="text-foreground">
                    Secret address in iCal format
                  </strong>{" "}
                  and paste it into the field above.
                </li>
              </ol>
              <span className="text-[10px] text-muted-foreground/80 italic">
                * The secret address is unique to your account and allows secure
                read-sync without needing a Google Cloud API developer key.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <label
              htmlFor="gcal-name"
              className="flex flex-col gap-1 text-[12px] font-medium text-foreground"
            >
              Calendar Name
              <Input
                id="gcal-name"
                type="text"
                placeholder="Google Calendar"
                value={calendarName}
                onChange={(e) => setCalendarName(e.target.value)}
              />
            </label>

            <label
              htmlFor="gcal-email"
              className="flex flex-col gap-1 text-[12px] font-medium text-foreground"
            >
              Account Email (Optional)
              <Input
                id="gcal-email"
                type="email"
                placeholder="your.email@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
              />
            </label>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-medium text-foreground">Sync Interval</span>
            <div className="flex items-center gap-1">
              {[15, 30, 60].map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setSyncIntervalMinutes(min)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    syncIntervalMinutes === min
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <ColorPickerRow
            selectedIndex={googleColorIndex}
            onSelectIndex={setGoogleColorIndex}
            label="Calendar Color"
          />

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs animate-in fade-in ${
                statusMsg.type === "success"
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            size="lg"
            loading={isSubmitting}
            className="mt-1 w-full gap-2 rounded-xl font-semibold"
          >
            <GoogleLogo className="size-4" />
            <span>
              {isSubmitting
                ? "Connecting & Syncing..."
                : "Connect Google Calendar"}
            </span>
          </Button>
        </form>
      )}

      {/* Google OAuth Form */}
      {authMode === "oauth" && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Google Cloud OAuth Credentials
              </span>
              <button
                type="button"
                onClick={() => setShowOAuthConfig((prev) => !prev)}
                className="text-[11px] text-blue-600 hover:underline dark:text-blue-400"
              >
                {showOAuthConfig ? "Hide setup" : "Edit Client ID"}
              </button>
            </div>

            {showOAuthConfig && (
              <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-150">
                <label
                  htmlFor="google-client-id"
                  className="flex flex-col gap-1 text-[11px] text-muted-foreground"
                >
                  OAuth 2.0 Web Client ID
                  <Input
                    id="google-client-id"
                    type="text"
                    placeholder="123456789-xxxxxxxx.apps.googleusercontent.com"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="font-mono text-xs"
                  />
                </label>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveClientId}
                      onChange={(e) => setSaveClientId(e.target.checked)}
                      className="rounded accent-primary"
                    />
                    <span>Remember Client ID in this browser</span>
                  </label>

                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <span>Get free Client ID</span>
                    <ExternalLink className="size-2.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Direct Bearer Token Accordion (For developers / self-hosting) */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setShowManualToken((prev) => !prev)}
              className="flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground"
            >
              <span>Developer: Connect with existing OAuth token</span>
              {showManualToken ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </button>

            {showManualToken && (
              <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/30 p-2.5 animate-in fade-in duration-150">
                <label
                  htmlFor="manual-token"
                  className="flex flex-col gap-1 text-[11px] text-muted-foreground"
                >
                  Google OAuth Bearer Token (ya29...)
                  <Input
                    id="manual-token"
                    type="password"
                    placeholder="ya29.a0AfH6SM..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="font-mono text-xs"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Color Selection */}
          <ColorPickerRow
            selectedIndex={googleColorIndex}
            onSelectIndex={setGoogleColorIndex}
            label="Calendar Color"
          />

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs animate-in fade-in ${
                statusMsg.type === "success"
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <Button
            type="button"
            variant="default"
            size="lg"
            loading={isSubmitting}
            onClick={() => {
              void handleGoogleOAuthSignIn();
            }}
            className="mt-1 w-full gap-2 rounded-xl font-semibold shadow-2xs"
          >
            <GoogleLogo className="size-4" />
            <span>
              {isSubmitting
                ? "Connecting with Google..."
                : showManualToken && manualToken
                  ? "Connect via Token"
                  : "Sign in with Google"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};
