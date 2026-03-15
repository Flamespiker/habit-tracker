// TODO: Stage 3 — wire Save Profile to PATCH /api/settings (Supabase).
// TODO: Stage 4 — wire Coaching Style and Notification Time to PATCH /api/settings (MongoDB).

// 'use client' required: manages coaching style selection, notification time, and display name state.
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type CoachingStyle = "motivational" | "analytical" | "gentle"

const coachingOptions: { value: CoachingStyle; label: string; description: string }[] = [
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
]

/**
 * Settings page. Displays Profile, Coaching Style, and Notification Time sections.
 * Client Component — form state is local until API routes are wired up in Stage 3/4.
 */
export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("")
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>("motivational")
  const [notificationTime, setNotificationTime] = useState("08:00")

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* Profile */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Your display name shown across the app.</CardDescription>
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

        {/* Coaching Style */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Coaching Style</CardTitle>
            <CardDescription>How you want your AI coach to communicate with you.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {coachingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCoachingStyle(option.value)}
                className={cn(
                  "flex flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors",
                  coachingStyle === option.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:bg-accent/50"
                )}
              >
                <span className="text-sm font-medium leading-none">{option.label}</span>
                <span className="mt-1 text-xs">{option.description}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>When to receive your daily coaching nudge.</CardDescription>
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
              />
            </div>
            <Button variant="outline" size="sm" className="self-start" disabled>
              Save Notifications
            </Button>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
