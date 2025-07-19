"use client";

import { useState, useMemo } from "react";
import { User, Settings, Plus } from "lucide-react";
import { useContacts, Contact } from "../hooks/useContacts";

// Import the new components
import ContactCard from "../components/ContactCard";
import ContactFormModal from "../components/ContactFormModal";
import SearchBar from "../components/SearchBar";
import SortDropdown from "../components/SortDropdown";

export default function Home() {
  const [sortBy, setSortBy] = useState<string>("alphabetical");
  const {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    setSortOrder,
  } = useContacts(sortBy);

  const [showSearch, setShowSearch] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        (contact.nickname &&
          contact.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        contact.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortValue = e.target.value;
    setSortBy(newSortValue); // Updates the local state for the <select> element's value
    setSortOrder(newSortValue); // THIS IS CRITICAL: Tells the useContacts hook to re-fetch with the new sort order
  };

  const handleOpenEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleFormSubmit = async (
    formData:
      | Omit<Contact, "id" | "addedDate" | "nickname" | "contactCount">
      | Partial<Omit<Contact, "id">>
  ) => {
    let success = false;
    if (editingContact) {
      success = await updateContact(
        editingContact.id,
        formData as Partial<Omit<Contact, "id">>
      );
      if (success) {
        // await fetchContacts();
      }
    } else {
      success = await addContact(
        formData as Omit<
          Contact,
          "id" | "addedDate" | "nickname" | "contactCount"
        >
      );
      if (success) {
        // await fetchContacts();
      }
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-gray-800">
      <header className="bg-indigo-700 text-white py-3 px-6 flex items-center justify-between shadow-sm border-b border-blue-500">
        <div className="flex items-center">
          <img
            src="/cms.svg"
            alt="Contact Management System Logo"
            className="text-white mr-2"
            style={{ width: "28px", height: "28px" }}
          />
          <h1 className="flex items-center gap-x-2 text-3xl font-bold">
            <i className="fa-solid fa-rocket mr-3"></i>
            <span>Contact Management System</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-normal">
            {contacts.length} contacts
          </span>
          <button className="p-1.5 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200">
            <Settings size={18} className="text-white" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full py-8 px-8 sm:px-6 lg:px-8">
        {/* Search, Sort, Add Section */}
        <div className="bg-white p-6 rounded-xl shadow-xl mb-8 flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 ">
          <div className="flex justify-start space-x-4 w-[655px] ">
            {showSearch && (
              <SearchBar
                type="text"
                style={{ width: "500px", marginRight: "auto" }}
                className="w-100 h-11 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}

            <SortDropdown sortBy={sortBy} onSortChange={handleSortChange} />
          </div>
          <button
            onClick={handleOpenAddModal}
            className=" w-full sm:w-auto bg-sky-300 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Loading/Empty State */}
        {loading ? (
          <p className="text-center text-gray-600 text-lg py-10">
            Loading contacts...
          </p>
        ) : filteredContacts.length === 0 ? (
          <p className="text-center text-gray-600 text-lg py-10">
            No contacts found matching your criteria. Try adding one!
          </p>
        ) : (
          /* Contact Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleOpenEditModal}
                onDelete={deleteContact}
              />
            ))}
          </div>
        )}
      </main>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        editingContact={editingContact}
      />
    </div>
  );
}
