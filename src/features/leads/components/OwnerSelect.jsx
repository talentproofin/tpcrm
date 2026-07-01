import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/**
 * @param {{
 *   label: string,
 *   profiles: import('../types/lead').LeadProfileSummary[],
 *   value: string,
 *   onChange: (value: string) => void,
 *   disabled?: boolean,
 *   placeholder?: string,
 *   allowEmpty?: boolean,
 * }} props
 */
export function OwnerSelect({
  label,
  profiles,
  value,
  onChange,
  disabled = false,
  placeholder = "Select owner",
  allowEmpty = false,
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value || (allowEmpty ? "__none__" : undefined)}
        onValueChange={(next) => onChange(next === "__none__" ? "" : next)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? (
            <SelectItem value="__none__">Unassigned</SelectItem>
          ) : null}
          {profiles.map((profile) => (
            <SelectItem key={profile.profileId} value={profile.profileId}>
              {profile.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
