"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createContactRoutes;
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebaseConfig_1 = __importDefault(require("../firebase/firebaseConfig"));
const contact_1 = __importDefault(require("../data-structures/contact"));
function createContactRoutes(contactTree) {
    const router = express_1.default.Router();
    router.get("/", async (req, res) => {
        const sortBy = req.query.sortBy || "name_asc";
        const searchTerm = req.query.searchTerm || "";
        try {
            // This initializes contactsToReturn from the shared contactTree
            let contactsToReturn = contactTree.inOrderTraversal();
            console.log(` GET /contacts - Using tree ID: ${contactTree.instanceId}. Current size: ${contactTree.size}`);
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
                contactsToReturn = contactsToReturn.filter((contact) => contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    contact.email.toLowerCase().includes(lowerCaseSearchTerm) ||
                    (contact.phone && contact.phone.includes(searchTerm)));
            }
            res
                .status(200)
                .json(contactsToReturn.map((contact) => contact.toObject()));
        }
        catch (error) {
            console.error("Error fetching or processing contacts:", error);
            res.status(500).json({
                error: "Failed to retrieve contacts.",
                details: error.message,
            });
        }
    });
    router.get("/newly-added", (req, res) => {
        try {
            console.log(` GET /contacts/newly-added - Using tree ID: ${contactTree.instanceId}`);
            console.log(`Current contactTree size before sort: ${contactTree.size}`);
            const sortedContacts = contactTree.getContactsNewlyAddedFirst();
            res.json(sortedContacts.map((c) => c.toObject())); // Convert to plain objects
        }
        catch (error) {
            console.error("Error getting newly added contacts:", error);
            res.status(500).json({ message: "Error retrieving contacts" });
        }
    });
    router.get("/most-recent-activity", (req, res) => {
        try {
            console.log(` GET /contacts/most-recent-activity - Using tree ID: ${contactTree.instanceId}`);
            console.log(`Current contactTree size before sort: ${contactTree.size}`);
            const sortedContacts = contactTree.getContactsMostRecentActivityFirst();
            res.json(sortedContacts.map((c) => c.toObject())); // Convert to plain objects
        }
        catch (error) {
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
            const timestamp = firebase_admin_1.default.firestore.Timestamp.fromDate(now);
            console.log(` POST /contacts - Using tree ID: ${contactTree.instanceId}`);
            const newContactData = {
                name,
                phone,
                email,
                address,
                addedDate: timestamp,
                lastActivity: timestamp,
            };
            const docRef = await firebaseConfig_1.default.collection("contacts").add(newContactData);
            const newContactInstance = new contact_1.default(name, phone, email, address, docRef.id, now, // Pass actual Date objects to Contact constructor
            now);
            console.log("New contact added to Firestore and in-memory tree:", newContactInstance.toObject());
            const insertedIntoTree = contactTree.insert(newContactInstance);
            if (insertedIntoTree) {
                console.log(` Successfully inserted ${newContactInstance.name} into in-memory contactTree. New tree size: ${contactTree.size}`);
            }
            else {
                console.warn(`Failed to insert ${newContactInstance.name} into in-memory contactTree (possible duplicate name). Current tree size: ${contactTree.size}`);
            }
            res.status(201).json({
                message: "Contact added successfully",
                contact: newContactInstance.toObject(), // Send the object version
            });
        }
        catch (error) {
            console.error("Error adding contact:", error);
            res
                .status(500)
                .json({ error: "Failed to add contact", details: error.message });
        }
    });
    // Get a single contact by ID (GET /contacts/:id)
    router.get("/:id", async (req, res) => {
        var _a, _b;
        const contactId = req.params.id;
        try {
            const doc = await firebaseConfig_1.default.collection("contacts").doc(contactId).get();
            if (doc.exists) {
                const data = doc.data();
                const foundContact = new contact_1.default(data.name, data.phone, data.email, data.address, doc.id, (_a = data.addedDate) === null || _a === void 0 ? void 0 : _a.toDate(), (_b = data.lastActivity) === null || _b === void 0 ? void 0 : _b.toDate()).toObject();
                res.status(200).json(foundContact);
            }
            else {
                res
                    .status(404)
                    .json({ error: `Contact with ID "${contactId}" not found.` });
            }
        }
        catch (error) {
            console.error("Error fetching single contact:", error);
            res
                .status(500)
                .json({ error: "Failed to fetch contact", details: error.message });
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
            const contactRef = firebaseConfig_1.default.collection("contacts").doc(contactId);
            const doc = await contactRef.get();
            if (!doc.exists) {
                return res
                    .status(404)
                    .json({ error: `Contact with ID "${contactId}" not found.` });
            }
            const now = firebase_admin_1.default.firestore.Timestamp.now(); // CHANGED: Use Firestore Timestamp for consistency
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
            // CHANGED: Construct responseContact to match frontend's Contact interface
            const responseContact = {
                id: updatedDoc.id,
                name: updatedFirestoreData.name,
                phone: updatedFirestoreData.phone,
                email: updatedFirestoreData.email,
                address: updatedFirestoreData.address,
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
            const contactToUpdateInTree = contactTree.search(updatedFirestoreData.name);
            if (contactToUpdateInTree) {
                contactToUpdateInTree.phone = updatedFirestoreData.phone;
                contactToUpdateInTree.email = updatedFirestoreData.email;
                contactToUpdateInTree.address = updatedFirestoreData.address;
                contactToUpdateInTree.lastActivity = now.toDate();
            }
            res.status(200).json(responseContact);
        }
        catch (error) {
            console.error("Error updating contact:", error);
            res
                .status(500)
                .json({ error: "Failed to update contact", details: error.message });
        }
    });
    // Delete a contact by ID (DELETE /contacts/:id)
    router.delete("/:id", async (req, res) => {
        var _a, _b;
        // Path is now "/:id"
        const contactId = req.params.id;
        try {
            const contactRef = firebaseConfig_1.default.collection("contacts").doc(contactId);
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
                console.warn(`Contact ${deletedContactData.name} was not found in in-memory tree for deletion.`);
            }
            const deletedContact = new contact_1.default(deletedContactData.name, deletedContactData.phone, deletedContactData.email, deletedContactData.address, doc.id, (_a = deletedContactData.addedDate) === null || _a === void 0 ? void 0 : _a.toDate(), (_b = deletedContactData.lastActivity) === null || _b === void 0 ? void 0 : _b.toDate()).toObject();
            res.status(200).json({
                message: "Contact deleted successfully",
                contact: deletedContact,
            });
        }
        catch (error) {
            console.error("Error deleting contact:", error);
            res
                .status(500)
                .json({ error: "Failed to delete contact", details: error.message });
        }
    });
    return router; // <--- Return the configured router
}
// export default router;
