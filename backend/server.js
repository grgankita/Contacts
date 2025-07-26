import express from "express";
import cors from "cors";
import admin from "firebase-admin"; // Import firebase-admin
import serviceAccount from "./firebase/firebase-service-account.json" with { type: "json" };
import AVLTree from "./data-structures/AVLTree.js";
import createContactRoutes from "./routes/contactRoutes.js";
import { populateContactTreeFromFirestore } from "./utils/startupLoader.js";

export const contactTree = new AVLTree(); 
contactTree.instanceId = Math.random().toString(36).substring(2, 15); // Add a unique ID
async function initializeServer() {
  try {
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

console.log(` Contact Tree Instance Created: ID ${contactTree.instanceId}`); // Log on creation
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// Root endpoint (can remain here)
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Contact Management System Backend is running!" });
});

// Mount the contact routes
const contactRoutes = createContactRoutes(contactTree);
app.use("/contacts", contactRoutes); 
await populateContactTreeFromFirestore(contactTree);
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
  console.log("--- API Endpoints (Firestore Enabled) ---");
  console.log(`GET /`);
  console.log(`POST /contacts (body: {name, phone, email, address})`);
  console.log(`GET /contacts?sortBy=...&searchTerm=...`); 
  console.log(`GET /contacts/:id (get by Firestore ID)`);
  console.log(`PUT /contacts/:id (update by Firestore ID, body: {name, phone, email, address})`
  );
  console.log(`DELETE /contacts/:id (delete by Firestore ID)`);
});
 } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}
initializeServer();