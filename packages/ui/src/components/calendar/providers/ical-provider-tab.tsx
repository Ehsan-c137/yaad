import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { useCalendarStore } from "@yaad/core/store/use-calendar-store";
import { AlertCircle, CheckCircle2, Globe } from "lucide-react";
import React, { useState } from "react";

import { CALENDAR_COLOR_OPTIONS } from "./color-options";
import { ColorPickerRow } from "./color-picker-row";

interface IcalProviderTabProps {
  onSuccess?: () => void;
}

export const IcalProviderTab: React.FC<IcalProviderTabProps> = ({
  onSuccess,
}) => {
  const addProvider = useCalendarStore((s) => s.addProvider);
  const syncProviderConnection = useCalendarStore(
    (s) => s.syncProviderConnection,
  );

  const [icalUrl, setIcalUrl] = useState("");
  const [icalName, setIcalName] = useState("External iCal Feed");
  const [icalColorIndex, setIcalColorIndex] = useState(1);
  const [isSubmittingIcal, setIsSubmittingIcal] = useState(false);
  const [icalStatusMsg, setIcalStatusMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleConnectIcal = async (e: React.ChangeEvent) => {
    e.preventDefault();

    if (!icalUrl.trim()) {
      setIcalStatusMsg({
        type: "error",
        text: "Please enter an iCal or Webcal URL.",
      });
      return;
    }

    setIsSubmittingIcal(true);
    setIcalStatusMsg(null);

    try {
      const selectedColor = CALENDAR_COLOR_OPTIONS[icalColorIndex];
      const providerId = `ical-${Date.now()}`;
      const calendarId = `cat-ical-${Date.now()}`;

      addProvider({
        id: providerId,
        provider: "ical_url",
        name: icalName || "iCal Feed",
        feedUrl: icalUrl.trim(),
        color: selectedColor.dot,
        calendarId,
        autoSync: true,
        syncIntervalMinutes: 30,
        syncStatus: "idle",
      });

      await syncProviderConnection(providerId);

      setIcalStatusMsg({
        type: "success",
        text: "iCal calendar feed added and synchronized successfully!",
      });

      setTimeout(() => {
        onSuccess?.();
      }, 900);
    } catch (err: unknown) {
      setIcalStatusMsg({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to load iCal feed. Check URL and CORS.",
      });
    } finally {
      setIsSubmittingIcal(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleConnectIcal(e);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5">
        <Globe className="size-6 shrink-0 text-purple-600 dark:text-purple-400" />
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-foreground">
            Subscribe to Calendar Feed
          </span>
          <span className="text-muted-foreground">
            Connect any public or secret Webcal / iCal link (Apple Calendar,
            Outlook, Fastmail, Notion).
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="ical-name"
          className="text-[12px] font-medium text-foreground flex flex-col gap-1.5"
        >
          Calendar Name
          <Input
            id="ical-name"
            type="text"
            required
            placeholder="e.g. Work Outlook, University, Sports Schedule"
            value={icalName}
            onChange={(e) => setIcalName(e.target.value)}
          />
        </label>
      </div>

      <label
        htmlFor="ical-url"
        className="text-[12px] font-medium text-foreground flex flex-col gap-1.5"
      >
        iCal / Webcal URL (.ics)
        <Input
          id="ical-url"
          type="url"
          required
          placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
          value={icalUrl}
          onChange={(e) => setIcalUrl(e.target.value)}
          className="font-mono text-xs"
        />
        <span className="text-[11px] text-muted-foreground">
          Supports <code>webcal://</code>, <code>http://</code>, and{" "}
          <code>https://</code> endpoints.
        </span>
      </label>

      {/* Color Selection */}
      <ColorPickerRow
        selectedIndex={icalColorIndex}
        onSelectIndex={setIcalColorIndex}
        label="Event Color"
      />

      {/* Status message */}
      {icalStatusMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
            icalStatusMsg.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
          }`}
        >
          {icalStatusMsg.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{icalStatusMsg.text}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        size="lg"
        loading={isSubmittingIcal}
        className="mt-2 w-full gap-2 rounded-xl"
      >
        <Globe className="size-4" />
        <span>
          {isSubmittingIcal ? "Connecting feed..." : "Subscribe to Calendar"}
        </span>
      </Button>
    </form>
  );
};
