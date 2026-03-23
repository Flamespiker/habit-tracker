// 'use client' required: manages form state and calls fetch on save.
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CoachingStyle = "motivational" | "analytical" | "gentle";

const coachingOptions: {
  value: CoachingStyle;
  label: string;
  description: string;
}[] = [
  {
    value: "motivational",
    label: "Motivational",
    description: "High-energy nudges that push you to do more",
  },
  {
    value: "analytical",
    label: "Analytical",
    description: "Data-focused insights and pattern recognition",
  },
  {
    value: "gentle",
    label: "Gentle",
    description: "Supportive and compassionate encouragement",
  },
];

/**
 * Settings page. Loads preferences from MongoDB on mount.
 * Coaching style auto-saves on selection; notifications save on button click.
 * Display name (Supabase profile) is not yet wired — save button remains disabled.
 */
export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [coachingStyle, setCoachingStyle] =
    useState<CoachingStyle>("motivational");
  const [notificationTime, setNotificationTime] = useState("08:00");
  const [loaded, setLoaded] = useState(false);
  const [savingCoaching, setSavingCoaching] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Load preferences from MongoDB on mount
  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then(
        (data: {
          coaching_style: CoachingStyle;
          notification_time: string;
        }) => {
          setCoachingStyle(data.coaching_style);
          setNotificationTime(data.notification_time);
          setLoaded(true);
        },
      )
      .catch(() => {
        toast.error("Failed to load preferences");
        setLoaded(true);
      });
  }, []);

  const patchPreferences = async (
    update: Partial<{
      coaching_style: CoachingStyle;
      notification_time: string;
    }>,
  ) => {
    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error("Failed to save preferences");
  };

  const handleCoachingStyleChange = async (style: CoachingStyle) => {
    setCoachingStyle(style);
    setSavingCoaching(true);
    try {
      await patchPreferences({ coaching_style: style });
      toast.success("Coaching style saved");
    } catch {
      toast.error("Failed to save coaching style");
    } finally {
      setSavingCoaching(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await patchPreferences({ notification_time: notificationTime });
      toast.success("Notification time saved");
    } catch {
      toast.error("Failed to save notification time");
    } finally {
      setSavingNotifications(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile — display name not yet wired (Supabase) */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>
              Your display name shown across the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="e.g. Mike"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="self-start" disabled>
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Coaching Style — auto-saves on selection */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Coaching Style</CardTitle>
            <CardDescription>
              How you want your AI coach to communicate with you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {coachingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={!loaded || savingCoaching}
                onClick={() => handleCoachingStyleChange(option.value)}
                className={cn(
                  "flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors",
                  coachingStyle === option.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:bg-accent/50",
                  (!loaded || savingCoaching) &&
                    "cursor-not-allowed opacity-60",
                )}
              >
                <span className="text-sm font-medium leading-none">
                  {option.label}
                </span>
                <span className="mt-1 text-xs">{option.description}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>
              When to receive your daily coaching nudge.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notification-time">Notification Time</Label>
              <Input
                id="notification-time"
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="w-32"
                disabled={!loaded}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              disabled={!loaded || savingNotifications}
              onClick={handleSaveNotifications}
            >
              {savingNotifications ? "Saving…" : "Save Notifications"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
