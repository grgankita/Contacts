// frontend/src/components/ContactCard.tsx
import React from "react";
import { Phone, Mail, MapPin, Trash2, Edit } from "lucide-react";
import { Contact } from "../hooks/useContacts";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string, name: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
}) => {
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };
  console.log("Rendering contact:", contact.dateAdded);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col relative overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Edit/Delete Icons */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={() => onEdit(contact)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-sky-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          title="Edit Contact"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(contact.id, contact.name)}
          className="p-2 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
          title="Delete Contact"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Contact Header */}
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 bg-indigo-100 text-blue-800 rounded-full flex items-center justify-center text-xl font-bold mr-4 flex-shrink-0">
          {getInitials(contact.name)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{contact.name}</h2>
          {contact.nickname && (
            <p className="text-sm text-gray-500 mt-0.5">{contact.nickname}</p>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-3 text-gray-700 text-base">
        {" "}
        {/* Increased spacing and font size */}
        <div className="flex items-center">
          <Phone size={18} className="text-gray-500 mr-3 flex-shrink-0" />{" "}
          {/* Larger icon, more margin */}
          <span>{contact.phone}</span>
        </div>
        <div className="flex items-center">
          <Mail size={18} className="text-gray-500 mr-3 flex-shrink-0" />
          <span>{contact.email}</span>
        </div>
        <div className="flex items-center">
          <MapPin size={18} className="text-gray-500 mr-3 flex-shrink-0" />
          <span>{contact.address}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
        <span>
          Added:{" "}
          {contact.dateAdded
            ? new Date(contact.dateAdded).toLocaleDateString()
            : "No date found"}
        </span>

        {contact.contactCount !== undefined && (
          <span>Contacts: {contact.contactCount}</span>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
