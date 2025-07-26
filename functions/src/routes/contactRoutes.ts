import express from "express";
import admin from "firebase-admin";
import db from "../firebase/firebaseConfig";
import Contact from "../data-structures/contact";
import { Router } from "express";
import { Request, Response } from "express";
import AVLTree from "../data-structures/AVLTree";
import { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

export default function createContactRoutes(contactTree: AVLTree) {
  const router = Router();

  // export default function createContactRoutes(contactTree) {
  //   const router = express.Router();
  router.get("/", async (req, res) => {
    const sortBy = req.query.sortBy || "name_asc";
    const searchTerm = (req.query.searchTerm as string) || "";

    try {
      // This initializes contactsToReturn from the shared contactTree
      let contactsToReturn = contactTree.inOrderTraversal();
      console.log(
        ` GET /contacts - Using tree ID: ${contactTree.instanceId}. Current size: ${contactTree.size}`
      );

      switch (sortBy) {
        case "dateAdded_desc":
          contactsToReturn = contactTree.getContactsNewlyAddedFirst();
          break;
        case "lastActivity_desc":
          contactsToReturn = contactTree.getContactsMostRecentActivityFirst();
          break;
        case "name_asc":
          contactsToReturn = contactTree.inOrderTraversal();
          break;
        case "name_desc":
          contactsToReturn = contactTree.inOrderTraversal().reverse();
          break;
        default:
          contactsToReturn = contactTree.inOrderTraversal();
          break;
      }

      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        contactsToReturn = contactsToReturn.filter(
          (contact: Contact) =>
            contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            contact.address.toLowerCase().includes(lowerCaseSearchTerm) ||
            (contact.phone && contact.phone.includes(searchTerm))
        );
      }
      res
        .status(200)
        .json(contactsToReturn.map((contact: Contact) => contact.toObject()));
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .json({ error: "Failed to retrieve contacts.", details: err.message });
    }
  });
  router.get("/newly-added", (req, res) => {
    try {
      console.log(
        ` GET /contacts/newly-added - Using tree ID: ${contactTree.instanceId}`
      );
      console.log(`Current contactTree size before sort: ${contactTree.size}`);
      const sortedContacts = contactTree.getContactsNewlyAddedFirst();
      res.json(sortedContacts.map((c: Contact) => c.toObject())); // Convert to plain objects
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .json({ message: "Error retrieving contacts", details: err.message });
    }
  });

  router.get("/most-recent-activity", (req, res) => {
    try {
      console.log(
        ` GET /contacts/most-recent-activity - Using tree ID: ${contactTree.instanceId}`
      );
      console.log(`Current contactTree size before sort: ${contactTree.size}`);
      const sortedContacts = contactTree.getContactsMostRecentActivityFirst();
      res.json(sortedContacts.map((c: Contact) => c.toObject())); // Convert to plain objects
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .json({ message: "Error retrieving contacts", details: err.message });
    }
  });
  router.post("/", async (req, res) => {
    const { name, phone, email, address } = req.body as {
      name: string;
      phone: string;
      email: string;
      address: string;
      id?: string;
    };
    if (!name || !phone || !email) {
      return res
        .status(400)
        .json({ error: "Name, phone, and email are required." });
    }

    try {
      const now = new Date();
      const timestamp = admin.firestore.Timestamp.fromDate(now);
      console.log(` POST /contacts - Using tree ID: ${contactTree.instanceId}`);

      const newContactData = {
        name,
        phone,
        email,
        address,
        addedDate: timestamp,
        lastActivity: timestamp,
      };

      const docRef = await db.collection("contacts").add(newContactData);

      const newContactInstance = new Contact(
        name,
        phone,
        email,
        address,
        docRef.id,
        now, // Pass actual Date objects to Contact constructor
        now
      );

      console.log(
        "New contact added to Firestore and in-memory tree:",
        newContactInstance.toObject()
      );
      const insertedIntoTree = contactTree.insert(newContactInstance);

      if (insertedIntoTree) {
        console.log(
          ` Successfully inserted ${newContactInstance.name} into in-memory contactTree. New tree size: ${contactTree.size}`
        );
      } else {
        console.warn(
          `Failed to insert ${newContactInstance.name} into in-memory contactTree (possible duplicate name). Current tree size: ${contactTree.size}`
        );
      }
      res.status(201).json({
        message: "Contact added successfully",
        contact: newContactInstance.toObject(), // Send the object version
      });
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .json({ error: "Failed to add contact", details: err.message });
    }
  });

  // Get a single contact by ID (GET /contacts/:id)
  router.get("/:id", async (req, res) => {
    const contactId = req.params.id;
    try {
      const doc = await db.collection("contacts").doc(contactId).get();
      if (doc.exists) {
        const data = doc.data();
        if (!data) {
          return res.status(500).json({ error: "No data found in document" });
        }
        const foundContact = new Contact(
          data.name ?? "",
          data.phone ?? "",
          data.email ?? "",
          data.address ?? "",
          doc.id,
          data.addedDate?.toDate(),
          data.lastActivity?.toDate()
        ).toObject();
        res.status(200).json(foundContact);
      } else {
        res
          .status(404)
          .json({ error: `Contact with ID "${contactId}" not found.` });
      }
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .json({ error: "Failed to fetch contact", details: err.message });
    }
  });

  router.put("/:id", async (req, res) => {
    const contactId = req.params.id;
    const { name, phone, email, address } = req.body;

    if (!name || !phone || !email) {
      return res
        .status(400)
        .json({ error: "Name, phone, and email are required for update." });
    }

    try {
      const contactRef = db.collection("contacts").doc(contactId);
      const doc = await contactRef.get();

      if (!doc.exists) {
        return res
          .status(404)
          .json({ error: `Contact with ID "${contactId}" not found.` });
      }

      const now = admin.firestore.Timestamp.now(); // CHANGED: Use Firestore Timestamp for consistency
      const updateData = {
        name,
        phone,
        email,
        address,
        lastActivity: now, // Update last activity
      };

      await contactRef.update(updateData);

      const updatedDoc = await contactRef.get();
      const updatedFirestoreData = updatedDoc.data();
      if (!updatedFirestoreData) {
        return res.status(500).json({ error: "No data found in document" });
      }

      // CHANGED: Construct responseContact to match frontend's Contact interface
      const responseContact = {
        id: updatedDoc.id,
        name: updatedFirestoreData.name ?? "",
        phone: updatedFirestoreData.phone ?? "",
        email: updatedFirestoreData.email ?? "",
        address: updatedFirestoreData.address ?? "",
        // Convert Firestore Timestamp to ISO string for 'addedDate'
        addedDate: updatedFirestoreData.addedDate
          ? updatedFirestoreData.addedDate.toDate().toISOString().split("T")[0]
          : undefined,
        lastActivity: updatedFirestoreData.lastActivity
          ? updatedFirestoreData.lastActivity.toDate().toISOString()
          : undefined,
        nickname: updatedFirestoreData.nickname || "",
        contactCount: updatedFirestoreData.contactCount || 0,
      };

      const contactToUpdateInTree = contactTree.search(
        updatedFirestoreData.name
      );
      if (contactToUpdateInTree) {
        contactToUpdateInTree.phone = updatedFirestoreData.phone;
        contactToUpdateInTree.email = updatedFirestoreData.email;
        contactToUpdateInTree.address = updatedFirestoreData.address;
        contactToUpdateInTree.lastActivity = now.toDate();
      }

      res.status(200).json(responseContact);
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .json({ error: "Failed to update contact", details: err.message });
    }
  });

  // Delete a contact by ID (DELETE /contacts/:id)
  router.delete("/:id", async (req, res) => {
    // Path is now "/:id"
    const contactId = req.params.id;
    try {
      const contactRef = db.collection("contacts").doc(contactId);
      const doc = await contactRef.get();

      if (!doc.exists) {
        return res
          .status(404)
          .json({ error: `Contact with ID "${contactId}" not found.` });
      }

      const deletedContactData = doc.data();
      if (!deletedContactData) {
        return res.status(500).json({ error: "No data found in document" });
      }
      await contactRef.delete();

      // Delete from the in-memory tree (important for newly-added/most-recent-activity routes)
      const deletedFromTree = contactTree.delete(deletedContactData.name);
      if (!deletedFromTree) {
        console.warn(
          `Contact ${deletedContactData.name} was not found in in-memory tree for deletion.`
        );
      }

      const deletedContact = new Contact(
        deletedContactData.name ?? "",
        deletedContactData.phone ?? "",
        deletedContactData.email ?? "",
        deletedContactData.address ?? "",
        doc.id,
        deletedContactData.addedDate?.toDate(),
        deletedContactData.lastActivity?.toDate()
      ).toObject();

      res.status(200).json({
        message: "Contact deleted successfully",
        contact: deletedContact,
      });
    } catch (error: unknown) {
      const err = error as Error;
      res
        .status(500)
        .json({ error: "Failed to delete contact", details: err.message });
    }
  });
  return router; // <--- Return the configured router
}
// export default router;
