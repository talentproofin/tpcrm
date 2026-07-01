import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FOLLOWUP_VIEW_OPTIONS } from "../constants/routes";

/**
 * @param {{
 *   search: string,
 *   view: string,
 *   assignedToMe: boolean,
 *   assignedToProfileId: string,
 *   leadTypeId: string,
 *   stageId: string,
 *   leadTypes: import('@/types/lookups').LookupItem[],
 *   stages: import('@/types/lookups').LookupItem[],
 *   profiles: import('../types/followUp').FollowUpProfileSummary[],
 *   onSearchChange: (value: string) => void,
 *   onViewChange: (value: string) => void,
 *   onAssignedToMeChange: (value: boolean) => void,
 *   onAssignedToProfileIdChange: (value: string) => void,
 *   onLeadTypeChange: (value: string) => void,
 *   onStageChange: (value: string) => void,
 *   disableFilters?: boolean,
 * }} props
 */
export function FollowUpFilters({
  search,
  view,
  assignedToMe,
  assignedToProfileId,
  leadTypeId,
  stageId,
  leadTypes,
  stages,
  profiles,
  onSearchChange,
  onViewChange,
  onAssignedToMeChange,
  onAssignedToProfileIdChange,
  onLeadTypeChange,
  onStageChange,
  disableFilters = false,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2 xl:col-span-2">
        <Label htmlFor="followup-search">Search</Label>
        <Input
          id="followup-search"
          placeholder="Organization or primary contact..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>View</Label>
        <Select
          value={view}
          onValueChange={onViewChange}
          disabled={disableFilters}
        >
          <SelectTrigger>
            <SelectValue placeholder="All open" />
          </SelectTrigger>
          <SelectContent>
            {FOLLOWUP_VIEW_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Lead stage</Label>
        <Select
          value={stageId || "__all__"}
          onValueChange={(value) =>
            onStageChange(value === "__all__" ? "" : value)
          }
          disabled={disableFilters}
        >
          <SelectTrigger>
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All stages</SelectItem>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Lead type</Label>
        <Select
          value={leadTypeId || "__all__"}
          onValueChange={(value) =>
            onLeadTypeChange(value === "__all__" ? "" : value)
          }
          disabled={disableFilters}
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All types</SelectItem>
            {leadTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Assigned to</Label>
        <Select
          value={assignedToProfileId || "__all__"}
          onValueChange={(value) => {
            onAssignedToProfileIdChange(value === "__all__" ? "" : value);
            onAssignedToMeChange(false);
          }}
          disabled={disableFilters || assignedToMe}
        >
          <SelectTrigger>
            <SelectValue placeholder="All executives" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All executives</SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={profile.profileId} value={profile.profileId}>
                {profile.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end md:col-span-2 xl:col-span-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-input"
            checked={assignedToMe}
            onChange={(event) => onAssignedToMeChange(event.target.checked)}
            disabled={disableFilters}
          />
          Assigned to me
        </label>
      </div>
    </div>
  );
}
