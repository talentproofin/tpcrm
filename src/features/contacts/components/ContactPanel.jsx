"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CardListSkeleton } from "@/components/feedback/PageSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getAuthBrowserClient } from "@/features/auth/services/authClient";
import { useCurrentProfile } from "@/features/leads/hooks/useCurrentProfile";
import {
  createDialogOpenChangeHandler,
  preventDialogDismissWhenBusy,
} from "@/utils/dialogGuards";
import {
  archiveContact,
  filterContacts,
  getContactsByLead,
} from "../services/contactService";
import { ContactCard } from "./ContactCard";
import { ContactFormDialog } from "./ContactFormDialog";

/**
 * @param {{
 *   leadId: string,
 *   disabled?: boolean,
 *   onContactsChanged?: () => void,
 * }} props
 */
export function ContactPanel({
  leadId,
  disabled = false,
  onContactsChanged,
}) {
  const { profile } = useCurrentProfile();
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getAuthBrowserClient();
    const { data, error: loadError } = await getContactsByLead(supabase, leadId);

    if (loadError) {
      setError(loadError.message);
      setContacts([]);
    } else {
      setContacts(data ?? []);
    }

    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const filteredContacts = useMemo(
    () => filterContacts(contacts, search),
    [contacts, search]
  );

  function handleAdd() {
    setSelectedContact(null);
    setFormOpen(true);
  }

  function handleEdit(contact) {
    setSelectedContact(contact);
    setFormOpen(true);
  }

  function handleArchive(contact) {
    setSelectedContact(contact);
    setArchiveOpen(true);
  }

  async function confirmArchive() {
    if (!profile || !selectedContact) {
      return;
    }

    setArchiving(true);

    const supabase = getAuthBrowserClient();
    const { error: archiveError } = await archiveContact(
      supabase,
      profile.profileId,
      selectedContact.id
    );

    setArchiving(false);

    if (archiveError) {
      toast.error(archiveError.message);
      return;
    }

    setArchiveOpen(false);
    setSelectedContact(null);
    toast.success("Contact archived.");
    await loadContacts();
    onContactsChanged?.();
  }

  function handleSaved() {
    toast.success(selectedContact ? "Contact updated." : "Contact added.");
    loadContacts();
    onContactsChanged?.();
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="text-base">Contacts</CardTitle>
          <CardDescription>
            Manage people associated with this lead. One contact can be marked
            primary.
          </CardDescription>
        </div>
        <Button size="sm" disabled={disabled} onClick={handleAdd}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add contact
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone, email, or designation"
          disabled={loading || disabled}
          aria-label="Search contacts"
        />

        {loading ? (
          <CardListSkeleton count={2} />
        ) : error ? (
          <ErrorState
            title="Unable to load contacts"
            message={error}
            onRetry={loadContacts}
          />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Add contacts for this lead. Mark one as primary to sync with the lead record."
            action={
              <Button type="button" size="sm" disabled={disabled} onClick={handleAdd}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add contact
              </Button>
            }
          />
        ) : filteredContacts.length === 0 ? (
          <EmptyState
            title="No matching contacts"
            description="Try a different search term."
          />
        ) : (
          <div className="grid gap-4">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                disabled={disabled}
                onEdit={handleEdit}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </CardContent>

      <ContactFormDialog
        leadId={leadId}
        contact={selectedContact}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={handleSaved}
        disabled={disabled}
      />

      <Dialog
        open={archiveOpen}
        onOpenChange={createDialogOpenChangeHandler(archiving, setArchiveOpen)}
      >
        <DialogContent
          onEscapeKeyDown={preventDialogDismissWhenBusy(archiving)}
          onInteractOutside={preventDialogDismissWhenBusy(archiving)}
        >
          <DialogHeader>
            <DialogTitle>Archive contact?</DialogTitle>
            <DialogDescription>
              {selectedContact?.isPrimary
                ? "Assign another primary contact before archiving this one."
                : `Archive ${selectedContact?.fullName ?? "this contact"}? They will be hidden from the active contact list.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setArchiveOpen(false)}
              disabled={archiving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmArchive}
              disabled={archiving || selectedContact?.isPrimary}
            >
              {archiving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Archiving...
                </>
              ) : (
                "Archive contact"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
