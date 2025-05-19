
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">Settings</h1>
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Manage your application preferences here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="Your username" defaultValue="DevUser" />
          </div>
          
          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates for important events.
                </p>
              </div>
              <Switch
                id="email-notifications"
                aria-label="Toggle email notifications"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-base">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get push notifications on your devices. (Coming soon!)
                </p>
              </div>
              <Switch
                id="push-notifications"
                disabled
                aria-label="Toggle push notifications"
              />
            </div>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Theme</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
               <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable dark mode for the application.
                </p>
              </div>
              <Switch
                id="dark-mode"
                aria-label="Toggle dark mode"
              />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
