import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import AVLTree from "./data-structures/AVLTree";
import createContactRoutes from "./routes/contactRoutes";

export const contactTree = new AVLTree();
contactTree.instanceId = Math.random().toString(36).substring(2, 15);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount the contact routes
const contactRoutes = createContactRoutes(contactTree);
app.use("/contacts", contactRoutes);

export const api = functions.https.onRequest(app);
