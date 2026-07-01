import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * @param {{
 *   contact: import('../types/contact').Contact,
 *   onEdit: (contact: import('../types/contact').Contact) => void,
 *   onArchive: (contact: import('../types/contact').Contact) => void,
 *   disabled?: boolean,
 * }} props
 */
export function ContactCard({ contact, onEdit, onArchive, disabled = false }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{contact.fullName}</CardTitle>
            {contact.isPrimary ? (
              <Badge>Primary</Badge>
            ) : null}
            {!contact.isActive ? (
              <Badge variant="outline">Inactive</Badge>
            ) : null}
          </div>
          {contact.designation ? (
            <CardDescription>{contact.designation}</CardDescription>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onEdit(contact)}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || contact.isPrimary}
            onClick={() => onArchive(contact)}
          >
            Archive
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
        <ContactField label="Department" value={contact.department} />
        <ContactField label="Mobile" value={contact.mobileNumber} />
        <ContactField label="Alternate" value={contact.alternateNumber} />
        <ContactField label="Email" value={contact.email} />
        <ContactField
          label="LinkedIn"
          value={contact.linkedinProfileUrl}
          className="sm:col-span-2 break-all"
        />
        {contact.notes ? (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap">{contact.notes}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * @param {{ label: string, value: string | null, className?: string }} props
 */
function ContactField({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1">{value?.trim() ? value : "—"}</p>
    </div>
  );
}
