import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Unlock } from "lucide-react";

interface PrivacyToggleProps {
  isPrivate: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

export const PrivacyToggle = ({ isPrivate, onToggle, disabled }: PrivacyToggleProps) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-background/50 backdrop-blur-sm">
      {isPrivate ? (
        <Lock className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Unlock className="h-4 w-4 text-muted-foreground" />
      )}
      <Label htmlFor="privacy-toggle" className="cursor-pointer text-sm font-medium">
        {isPrivate ? "Riêng tư" : "Công khai"}
      </Label>
      <Switch
        id="privacy-toggle"
        checked={isPrivate}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-label="Toggle profile privacy"
      />
    </div>
  );
};
