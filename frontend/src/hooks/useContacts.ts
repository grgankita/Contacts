import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Define the shape of a Contact object
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  dateAdded?: string;
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
    newContact: Omit<Contact, "id" | "dateAdded" | "nickname" | "contactCount">
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

  // Function to fetch contacts from the backend
  const fetchContacts = useCallback(
    async (sortByOption: string = currentSortBy) => {
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
        const enhancedData = data.map((contact) => {
          console.log("Rendering contact:", contact.dateAdded);
          return {
            ...contact,
            nickname: contact.name.split(" ")[0],
            // addedDate: contact.dateAdded,
            addedDate: contact.dateAdded
              ? new Date(contact.dateAdded)
              : undefined,
            contactCount: Math.floor(Math.random() * 10) + 1,
          };
        });
        setContacts(enhancedData);
        console.log(" Enhanced contacts before setting state:");
        enhancedData.forEach((c) =>
          console.log(
            c.name,
            typeof c.addedDate,
            c.addedDate instanceof Date,
            c.addedDate
          )
        );
        console.log("Contacts from backend:", data);
      } catch (err: any) {
        console.error("Failed to fetch contacts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [currentSortBy]
  );

  // Function to add a new contact
  const addContact = useCallback(
    async (
      newContact: Omit<
        Contact,
        "id" | "addedDate" | "nickname" | "contactCount"
      >
    ): Promise<boolean> => {
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

        await fetchContacts(currentSortBy); // Re-fetch contacts with current sort order
        return true;
      } catch (err: any) {
        console.error("Failed to add contact:", err);
        setError(err.message);
        return false;
      }
    },
    [fetchContacts, currentSortBy]
  );

  // Function to update an existing contact
  const updateContact = useCallback(
    async (id: string, updatedFields: Partial<Omit<Contact, "id">>) => {
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
        const updatedContact: Contact = {
          ...data.contact,
          nickname: data.contact.name.split(" ")[0],
          addedDate: new Date(data.contact.dateAdded),
          contactCount: Math.floor(Math.random() * 10) + 1, // Placeholder
        };
        setContacts((prev) =>
          prev.map((contact) => (contact.id === id ? updatedContact : contact))
        );
        return true;
      } catch (err: any) {
        console.error("Failed to update contact:", err);
        setError(err.message);
        return false;
      }
    },
    [fetchContacts, currentSortBy]
  );

  // Function to delete a contact
  const deleteContact = useCallback(
    async (id: string, name: string): Promise<boolean> => {
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
        await fetchContacts(currentSortBy);
        return true;
      } catch (err: any) {
        console.error("Failed to delete contact:", err);
        setError(err.message);
        return false;
      }
    },
    [fetchContacts, currentSortBy]
  );
  useEffect(() => {
    fetchContacts(currentSortBy); // Call fetchContacts in current sort order
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
