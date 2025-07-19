import React, { useState, useEffect } from "react";
import { Contact } from "../hooks/useContacts";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    contact:
      | Omit<Contact, "id" | "addedDate" | "nickname" | "contactCount">
      | Partial<Omit<Contact, "id">>
  ) => Promise<boolean>;
  editingContact?: Contact | null;
}
const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingContact,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  useEffect(() => {
    if (isOpen && editingContact) {
      setName(editingContact.name);
      setPhone(editingContact.phone);
      setEmail(editingContact.email);
      setAddress(editingContact.address);
    } else if (isOpen) {
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
    }
    setErrors({ name: "", phone: "", email: "", address: "", general: "" });
    setIsSubmitting(false);
  }, [isOpen, editingContact]);

  const validateField = (fieldName: string, value: string): string => {
    let error = "";
    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          error = "Name is required.";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters.";
        }
        break;
      case "phone":
        // Basic phone validation
        if (!value.trim()) {
          error = "Phone number is required.";
        } else if (!/^\+?[0-9\s-]{7,20}$/.test(value.trim())) {
          error = "Invalid phone number format.";
        }
        break;
      case "email":
        // Basic email regex
        if (!value.trim()) {
          error = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = "Invalid email address.";
        }
        break;
      case "address":
        break;
      default:
        break;
    }
    return error;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      name: "",
      phone: "",
      email: "",
      address: "",
      general: "",
    };

    newErrors.name = validateField("name", name);
    newErrors.phone = validateField("phone", phone);
    newErrors.email = validateField("email", email);
    newErrors.address = validateField("address", address);

    if (
      newErrors.name ||
      newErrors.phone ||
      newErrors.email ||
      newErrors.address
    ) {
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ ...errors, general: "" });
    if (!validateForm()) {
      console.log("Form has validation errors. Stopping submission.");
      return;
    }
    setIsSubmitting(true);
    let success = false;

    if (editingContact) {
      const updatedFields: Partial<Omit<Contact, "id">> = {
        name,
        phone,
        email,
        address,
      };
      success = await onSubmit(updatedFields);
    } else {
      const newContact = { name, phone, email, address };
      success = await onSubmit(newContact);
    }
    setIsSubmitting(false);
    if (success) {
      onClose();
    } else {
      setErrors((prev) => ({
        ...prev,
        general: "Operation failed. Please try again.",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 transform transition-transform duration-300 ease-out scale-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {editingContact ? "Edit Contact" : "Add New Contact"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`shadow-sm appearance-none border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  name: validateField("name", e.target.value),
                }));
              }}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  name: validateField("name", name),
                }))
              }
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`shadow-sm appearance-none border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  phone: validateField("phone", e.target.value),
                }));
              }}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  phone: validateField("phone", phone),
                }))
              }
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs italic mt-1">{errors.phone}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`shadow-sm appearance-none border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  email: validateField("email", e.target.value),
                }));
              }}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  email: validateField("email", email),
                }))
              }
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>
            )}
          </div>
          <div className="mb-6">
            <label
              htmlFor="address"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className={`shadow-sm appearance-none border ${
                errors.address ? "border-red-500" : "border-gray-300"
              } rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  address: validateField("address", e.target.value),
                }));
              }}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  address: validateField("address", address),
                }))
              }
            />
            {errors.address && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.address}
              </p>
            )}
          </div>

          {errors.general && (
            <p className="text-red-600 text-sm italic mb-4 text-center">
              {errors.general}
            </p>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-5 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 transform hover:scale-105"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-sky-200 hover:bg-cyan-500 text-white font-bold py-2.5 px-5 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 transform hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editingContact
                ? "Update Contact"
                : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
