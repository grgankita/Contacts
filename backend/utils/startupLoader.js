// backend/utils/startupLoader.js

import db from "../firebase/firebaseConfig.js";
import Contact from "../data-structures/contact.js";

/**
 * Populates the given contactTree instance with contacts from Firestore.
 * @param {AVLTree} contactTree - The AVLTree instance to populate.
 */
export async function populateContactTreeFromFirestore(contactTree) {
  try {
    const contactsCollection = await db.collection("contacts").get();
    let contactsLoadedCount = 0;
    contactsCollection.docs.forEach((doc) => {
      const data = doc.data();
      // Ensure dateAdded and lastActivity are Date objects when creating Contact instance
      const dateAdded =
        data.dateAdded && data.dateAdded.toDate
          ? data.dateAdded.toDate()
          : null;
      const lastActivity =
        data.lastActivity && data.lastActivity.toDate
          ? data.lastActivity.toDate()
          : null;

      const contactInstance = new Contact(
        data.name,
        data.phone,
        data.email,
        data.address,
        doc.id, // Pass Firestore document ID
        dateAdded,
        lastActivity
      );
      const inserted = contactTree.insert(contactInstance);
      if (inserted) {
        contactsLoadedCount++;
      }
    });
    console.log(
      `✅ Loaded ${contactsLoadedCount} contacts from Firestore into in-memory tree.`
    );
    console.log(`🌳 In-memory tree size after load: ${contactTree.size}`);
  } catch (error) {
    console.error("❌ Error populating contact tree from Firestore:", error);
  }
}
