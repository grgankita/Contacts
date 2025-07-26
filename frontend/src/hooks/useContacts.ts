import { useState, useEffect, useCallback } from "react";
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  addedDate?: string;
  nickname?: string;
  contactCount?: number;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
interface UseContactsResult {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  addContact: (
    newContact: Omit<Contact, "id" | "addedDate" | "nickname" | "contactCount">
  ) => Promise<boolean>;
  updateContact: (
    id: string,
    updatedFields: Partial<Omit<Contact, "id">>
  ) => Promise<boolean>;
  deleteContact: (id: string, name: string) => Promise<boolean>;
  setSortOrder: (sort: string) => void;
}

export const useContacts = (
  initialSortBy: string = "alphabetical"
): UseContactsResult => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSortBy, setCurrentSortBy] = useState<string>(initialSortBy);

  const fetchContacts = useCallback(
    async (sortByOption: string = currentSortBy) => {
      console.log("fetchContacts: Starting fetch with sort:", sortByOption); // DEBUG LOG
      try {
        setLoading(true);
        setError(null);

        if (!BACKEND_API_URL) {
          throw new Error(
            "Backend API URL is not defined. Check your .env.local file."
          );
        }
        let url = `${BACKEND_API_URL}/contacts`;
        if (sortByOption === "newlyAdded") {
          url = `${BACKEND_API_URL}/contacts/newly-added`;
        } else if (sortByOption === "mostRecent") {
          url = `${BACKEND_API_URL}/contacts/most-recent-activity`;
        } else if (sortByOption === "alphabetical") {
          url = `${BACKEND_API_URL}/contacts?sortBy=name_asc`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }
        const data: Contact[] = await response.json();
        console.log("fetchContacts: Data received from backend:", data);

        const enhancedData = data.map((contact) => {
          // const rawDate =
          //   (contact as any).dateAdded || (contact as any).addedDate;
          const rawDate = (contact as any).addedDate;

          const formattedDate = rawDate
            ? new Date(rawDate).toLocaleDateString() // Format for display (e.g., "M/D/YYYY")
            : "No date found"; // Default string if no date

          return {
            ...contact,
            nickname: contact.name ? contact.name.split(" ")[0] : "",
            addedDate: formattedDate,
            contactCount:
              contact.contactCount !== undefined
                ? contact.contactCount
                : Math.floor(Math.random() * 10) + 1,
            lastActivity: (contact as any).lastActivity
              ? new Date((contact as any).lastActivity).toISOString()
              : undefined,
          };
        });
        setContacts(enhancedData);
        console.log(
          "fetchContacts: Contacts state updated with:",
          enhancedData
        );
      } catch (err: any) {
        console.error("fetchContacts: Failed to fetch contacts:", err); // DEBUG LOG
        setError(err.message);
      } finally {
        setLoading(false);
        console.log("fetchContacts: Fetch operation finished."); // DEBUG LOG
      }
    },
    [currentSortBy]
  );

  const addContact = useCallback(
    async (
      newContact: Omit<
        Contact,
        "id" | "addedDate" | "nickname" | "contactCount"
      >
    ): Promise<boolean> => {
      console.log("addContact: Attempting to add new contact:", newContact); // DEBUG LOG
      try {
        setError(null);
        const response = await fetch(`${BACKEND_API_URL}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newContact),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        console.log("addContact: Successfully added contact, re-fetching..."); // DEBUG LOG
        await fetchContacts(currentSortBy);
        console.log("addContact: Re-fetch completed."); // DEBUG LOG
        return true;
      } catch (err: any) {
        console.error("addContact: Failed to add contact:", err); // DEBUG LOG
        setError(err.message);
        return false;
      }
    },
    [fetchContacts, currentSortBy]
  );

  const updateContact = useCallback(
    async (id: string, updatedFields: Partial<Omit<Contact, "id">>) => {
      console.log(
        "updateContact: Attempting to update contact ID:",
        id,
        "with fields:",
        updatedFields
      ); // DEBUG LOG
      try {
        setError(null);
        const response = await fetch(`${BACKEND_API_URL}/contacts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("updateContact: Backend response data:", data); // DEBUG LOG

        const updatedContact: Contact = {
          ...data,
          nickname: data.name ? data.name.split(" ")[0] : "",
          addedDate: data.addedDate
            ? new Date(data.addedDate).toISOString().split("T")[0]
            : undefined,
          contactCount: data.contactCount || Math.floor(Math.random() * 10) + 1,
        };
        console.log(
          "updateContact: Processed updated contact for state:",
          updatedContact
        ); // DEBUG LOG

        console.log(
          "updateContact: Successfully updated contact, re-fetching all contacts..."
        ); // DEBUG LOG
        await fetchContacts(currentSortBy);
        console.log("updateContact: Re-fetch completed."); // DEBUG LOG

        return true;
      } catch (err: any) {
        console.error("updateContact: Failed to update contact:", err); // DEBUG LOG
        setError(err.message);
        return false;
      }
    },
    [fetchContacts, currentSortBy]
  );

  const deleteContact = useCallback(
    async (id: string, name: string): Promise<boolean> => {
      console.log(
        "deleteContact: Attempting to delete contact ID:",
        id,
        "Name:",
        name
      ); // DEBUG LOG
      try {
        if (!confirm(`Are you sure you want to delete ${name}?`)) {
          return false;
        }
        setError(null);
        const response = await fetch(`${BACKEND_API_URL}/contacts/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }
        console.log(
          "deleteContact: Successfully deleted contact, re-fetching..."
        ); // DEBUG LOG
        await fetchContacts(currentSortBy);
        console.log("deleteContact: Re-fetch completed."); // DEBUG LOG
        return true;
      } catch (err: any) {
        console.error("deleteContact: Failed to delete contact:", err); // DEBUG LOG
        setError(err.message);
        return false;
      }
    },
    [fetchContacts, currentSortBy]
  );

  useEffect(() => {
    fetchContacts(currentSortBy);
  }, [fetchContacts, currentSortBy]);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
    setSortOrder: setCurrentSortBy,
  };
};
