import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shell/AppShell";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionHeader } from "@/components/shell/SectionHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/api/hooks";
import { userService } from "@/services/api";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TestWest" },
      { name: "description", content: "Manage your TestWest profile, personal details, and request a grade change." },
      { property: "og:title", content: "Settings — TestWest" },
      { property: "og:description", content: "Update personal details and request academic changes." },
    ],
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppShell
      title="Settings"
      subtitle="Manage your profile and preferences"
      role={user?.role || "STUDENT"}
      userName={user ? `${user.firstName} ${user.lastName}` : "User"}
    >
      <SettingsView user={user} />
    </AppShell>
  );
}

function SettingsView({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);
  const [requestedGrade, setRequestedGrade] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userService.updateMe({ firstName, lastName });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated", { description: "Your personal details have been saved." });
    } catch (err: any) {
      toast.error("Failed to update profile", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGradeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedGrade || !reason.trim()) {
      toast.error("Please select a grade and add a reason.");
      return;
    }
    toast.success("Request submitted", {
      description: `Your request to change to Grade ${requestedGrade} has been sent to the admin.`,
    });
    setRequestedGrade("");
    setReason("");
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Account settings"
        subtitle="Edit your personal information. Some academic fields are locked and require admin approval."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal details</CardTitle>
            <CardDescription>Update your name and contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Academic info</CardTitle>
            <CardDescription>Locked fields managed by your school admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LockedField label="Role" value={user?.role || "STUDENT"} />
            {user?.profile?.grade && <LockedField label="Grade" value={`Grade ${user.profile.grade}`} />}
            {user?.profile?.board && <LockedField label="Board" value={user.profile.board} />}
            <LockedField label="User ID" value={(user?._id || user?.id || "").slice(-8).toUpperCase()} />
          </CardContent>
        </Card>
      </div>

      {(user?.role === "STUDENT" || user?.role === "SOLO") && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Request grade change</CardTitle>
                <CardDescription>
                  Grade can only be updated by an admin. Submit a request with a reason and we'll forward it.
                </CardDescription>
              </div>
              <Badge variant="secondary">Admin approval</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGradeRequest} className="grid gap-4 md:grid-cols-[200px_1fr_auto] md:items-end">
              <div className="grid gap-2">
                <Label htmlFor="grade">Requested grade</Label>
                <Select value={requestedGrade} onValueChange={setRequestedGrade}>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <SelectItem key={g} value={String(g)} disabled={g === user?.profile?.grade}>
                        Grade {g}
                        {g === user?.profile?.grade ? " (current)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly explain why you're requesting this change…"
                  maxLength={500}
                  rows={3}
                />
              </div>
              <Button type="submit" className="md:mb-0">
                <Send className="mr-2 h-4 w-4" />
                Submit request
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
      <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </div>
  );
}
