import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * @param {{
 *   search: string,
 *   stageId: string,
 *   leadTypeId: string,
 *   ownerProfileId: string,
 *   includeTrashed: boolean,
 *   stages: import('@/types/lookups').LookupItem[],
 *   leadTypes: import('@/types/lookups').LookupItem[],
 *   profiles: import('../types/lead').LeadProfileSummary[],
 *   onSearchChange: (value: string) => void,
 *   onStageChange: (value: string) => void,
 *   onLeadTypeChange: (value: string) => void,
 *   onOwnerChange: (value: string) => void,
 *   onIncludeTrashedChange: (value: boolean) => void,
 *   disableFilters?: boolean,
 * }} props
 */
export function LeadFilters({
  search,
  stageId,
  leadTypeId,
  ownerProfileId,
  includeTrashed,
  stages,
  leadTypes,
  profiles,
  onSearchChange,
  onStageChange,
  onLeadTypeChange,
  onOwnerChange,
  onIncludeTrashedChange,
  disableFilters = false,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-2 xl:col-span-2">
        <Label htmlFor="lead-search">Search</Label>
        <Input
          id="lead-search"
          placeholder="Search by organization name..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Stage</Label>
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
        <Label>Type</Label>
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
        <Label>Owner</Label>
        <Select
          value={ownerProfileId || "__all__"}
          onValueChange={(value) =>
            onOwnerChange(value === "__all__" ? "" : value)
          }
          disabled={disableFilters}
        >
          <SelectTrigger>
            <SelectValue placeholder="All owners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All owners</SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={profile.profileId} value={profile.profileId}>
                {profile.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end md:col-span-2 xl:col-span-5">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-input"
            checked={includeTrashed}
            onChange={(event) => onIncludeTrashedChange(event.target.checked)}
            disabled={disableFilters}
          />
          Show trashed leads only
        </label>
      </div>
    </div>
  );
}
