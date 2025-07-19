import express from "express";
import admin from "firebase-admin";
import db from "../firebase/firebaseConfig.js";
import Contact from "../data-structures/contact.js";
import AVLTree from "../data-structures/AVLTree.js"; // You'll create a new one per request here

export default function createContactRoutes(contactTree) {
  router.get("/", async (req, res) => {
    const sortBy = req.query.sortBy || "name_asc";
    const searchTerm = req.query.searchTerm || "";

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
          (contact) =>
            contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            contact.email.toLowerCase().includes(lowerCaseSearchTerm) ||
            (contact.phone && contact.phone.includes(searchTerm))
        );
      }

      res
        .status(200)
        .json(contactsToReturn.map((contact) => contact.toObject()));
    } catch (error) {
      console.error("Error fetching or processing contacts:", error);
      res.status(500).json({
        error: "Failed to retrieve contacts.",
        details: error.message,
      });
    }
  });
  router.get("/newly-added", (req, res) => {
    try {
      console.log(
        ` GET /contacts/newly-added - Using tree ID: ${contactTree.instanceId}`
      );
      console.log(`Current contactTree size before sort: ${contactTree.size}`);
      const sortedContacts = contactTree.getContactsNewlyAddedFirst();
      res.json(sortedContacts.map((c) => c.toObject())); // Convert to plain objects
    } catch (error) {
      console.error("Error getting newly added contacts:", error);
      res.status(500).json({ message: "Error retrieving contacts" });
    }
  });

  router.get("/most-recent-activity", (req, res) => {
    try {
      console.log(
        ` GET /contacts/most-recent-activity - Using tree ID: ${contactTree.instanceId}`
      );
      console.log(`Current contactTree size before sort: ${contactTree.size}`);
      const sortedContacts = contactTree.getContactsMostRecentActivityFirst();
      res.json(sortedContacts.map((c) => c.toObject())); // Convert to plain objects
    } catch (error) {
      console.error("Error getting most recent activity contacts:", error);
      res.status(500).json({ message: "Error retrieving contacts" });
    }
  });
  router.post("/", async (req, res) => {
    const { name, phone, email, address } = req.body;
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
        dateAdded: timestamp,
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
    } catch (error) {
      console.error("Error adding contact:", error);
      res
        .status(500)
        .json({ error: "Failed to add contact", details: error.message });
    }
  });

  // Get a single contact by ID (GET /contacts/:id)
  router.get("/:id", async (req, res) => {
    const contactId = req.params.id;
    try {
      const doc = await db.collection("contacts").doc(contactId).get();
      if (doc.exists) {
        const data = doc.data();
        const foundContact = new Contact(
          data.name,
          data.phone,
          data.email,
          data.address,
          doc.id,
          data.dateAdded?.toDate(),
          data.lastActivity?.toDate()
        ).toObject();
        res.status(200).json(foundContact);
      } else {
        res
          .status(404)
          .json({ error: `Contact with ID "${contactId}" not found.` });
      }
    } catch (error) {
      console.error("Error fetching single contact:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch contact", details: error.message });
    }
  });

  // Update a contact by ID (PUT /contacts/:id)
  router.put("/:id", async (req, res) => {
    // Path is now "/:id"
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

      const now = new Date();
      const updateData = {
        name,
        phone,
        email,
        address,
        lastActivity: admin.firestore.Timestamp.fromDate(now), // Update last activity
      };
      await contactRef.update(updateData);
      // Fetch the updated document to get the latest state including original dateAdded
      const updatedDoc = await contactRef.get();
      const updatedData = updatedDoc.data();
      const contactToUpdateInTree = contactTree.search(updatedData.name);
      if (contactToUpdateInTree) {
        // Directly update properties on the Contact object within the tree node
        contactToUpdateInTree.phone = updatedData.phone;
        contactToUpdateInTree.email = updatedData.email;
        contactToUpdateInTree.address = updatedData.address;
        contactToUpdateInTree.lastActivity = now; // Update the Date object in the in-memory Contact
      }

      const updatedContact = new Contact(
        updatedData.name,
        updatedData.phone,
        updatedData.email,
        updatedData.address,
        updatedDoc.id,
        updatedData.dateAdded?.toDate(),
        updatedData.lastActivity?.toDate()
      ).toObject();

      res.status(200).json({
        message: "Contact updated successfully",
        contact: updatedContact,
      });
    } catch (error) {
      console.error("Error updating contact:", error);
      res
        .status(500)
        .json({ error: "Failed to update contact", details: error.message });
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
      await contactRef.delete();

      // Delete from the in-memory tree (important for newly-added/most-recent-activity routes)
      const deletedFromTree = contactTree.delete(deletedContactData.name);
      if (!deletedFromTree) {
        console.warn(
          `Contact ${deletedContactData.name} was not found in in-memory tree for deletion.`
        );
      }

      const deletedContact = new Contact(
        deletedContactData.name,
        deletedContactData.phone,
        deletedContactData.email,
        deletedContactData.address,
        doc.id,
        deletedContactData.dateAdded?.toDate(),
        deletedContactData.lastActivity?.toDate()
      ).toObject();

      res.status(200).json({
        message: "Contact deleted successfully",
        contact: deletedContact,
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
      res
        .status(500)
        .json({ error: "Failed to delete contact", details: error.message });
    }
  });
  return router; // <--- Return the configured router
}
// export default router;
