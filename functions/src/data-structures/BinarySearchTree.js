"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_js_1 = __importDefault(require("./node.js"));
const contact_js_1 = __importDefault(require("./contact.js"));
/**
 * Implements a basic Binary Search Tree (BST) for Contact objects,
 * ordered by contact name.
 */
class BinarySearchTree {
    constructor() {
        this.root = null;
        this.size = 0; // Keep track of the number of contacts
    }
    /**
     * Inserts a new contact into the BST.
     * @param {Contact} contact - The contact object to insert.
     * @returns {boolean} True if the contact was inserted, false if a contact with the same name already exists.
     */
    insert(contact) {
        if (!(contact instanceof contact_js_1.default)) {
            console.error(` AVLTree ${this.instanceId} Insert: Provided value is not a Contact instance:`, contact);
            return false;
        }
        const newNode = new node_js_1.default(contact);
        this.size++;
        console.log(` AVLTree ${this.instanceId}: Added root contact: ${contact.name}. New size: ${this.size}`);
        if (this.root === null) {
            this.root = newNode;
            return true;
        }
        let currentNode = this.root;
        while (true) {
            // Compare names (case-insensitive for ordering)
            const compareResult = contact.name.localeCompare(currentNode.value.name);
            if (compareResult === 0) {
                // Contact with the same name already exists.
                console.warn(` AVLTree ${this.instanceId}: Contact with name "${contact.name}" already exists. Not inserting.`);
                this.size--; // Decrement size as no new node was added
                return false;
            }
            else if (compareResult < 0) {
                // New contact's name is less than current node's name, go left
                if (currentNode.left === null) {
                    currentNode.left = newNode;
                    newNode.parent = currentNode;
                    return true;
                }
                currentNode = currentNode.left;
            }
            else {
                // New contact's name is greater than current node's name, go right
                if (currentNode.right === null) {
                    currentNode.right = newNode;
                    newNode.parent = currentNode;
                    return true;
                }
                currentNode = currentNode.right;
            }
        }
    }
    /**
     * Searches for a contact by name in the BST.
     * @param {string} name - The name of the contact to search for.
     * @returns {Contact | null} The contact object if found, otherwise null.
     */
    search(name) {
        if (this.root === null) {
            return null;
        }
        let currentNode = this.root;
        while (currentNode !== null) {
            const compareResult = name.localeCompare(currentNode.value.name);
            if (compareResult === 0) {
                return currentNode.value;
            }
            else if (compareResult < 0) {
                // Search name is less than current node's name, go left
                currentNode = currentNode.left;
            }
            else {
                // Search name is greater than current node's name, go right
                currentNode = currentNode.right;
            }
        }
        return null; // Contact not found
    }
    /**
     * Deletes a contact by name from the BST.
     * Handles 0, 1, or 2 children cases.
     * @param {string} name - The name of the contact to delete.
     * @returns {Contact | null} The deleted contact object if found and deleted, otherwise null.
     */
    delete(name) {
        if (this.root === null) {
            return null; // Tree is empty
        }
        let nodeToDelete = this.root;
        let parentNode = null;
        // Find the node to delete and its parent
        while (nodeToDelete !== null) {
            const compareResult = name.localeCompare(nodeToDelete.value.name);
            if (compareResult === 0) {
                break; // Found the node to delete
            }
            else if (compareResult < 0) {
                parentNode = nodeToDelete;
                nodeToDelete = nodeToDelete.left;
            }
            else {
                parentNode = nodeToDelete;
                nodeToDelete = nodeToDelete.right;
            }
        }
        if (nodeToDelete === null) {
            return null; // Contact not found
        }
        const deletedContact = nodeToDelete.value;
        this.size--; // Decrement size as a node is being removed
        // Case 1: Node has no children (leaf node)
        if (nodeToDelete.left === null && nodeToDelete.right === null) {
            if (nodeToDelete === this.root) {
                this.root = null;
            }
            else if (parentNode.left === nodeToDelete) {
                parentNode.left = null;
            }
            else {
                parentNode.right = null;
            }
        }
        // Case 2: Node has one child
        else if (nodeToDelete.left === null) {
            // Only right child
            if (nodeToDelete === this.root) {
                this.root = nodeToDelete.right;
                this.root.parent = null; // New root has no parent
            }
            else if (parentNode.left === nodeToDelete) {
                parentNode.left = nodeToDelete.right;
                nodeToDelete.right.parent = parentNode;
            }
            else {
                parentNode.right = nodeToDelete.right;
                nodeToDelete.right.parent = parentNode;
            }
        }
        else if (nodeToDelete.right === null) {
            // Only left child
            if (nodeToDelete === this.root) {
                this.root = nodeToDelete.left;
                this.root.parent = null; // New root has no parent
            }
            else if (parentNode.left === nodeToDelete) {
                parentNode.left = nodeToDelete.left;
                nodeToDelete.left.parent = parentNode;
            }
            else {
                parentNode.right = nodeToDelete.left;
                nodeToDelete.left.parent = parentNode;
            }
        }
        // Case 3: Node has two children
        else {
            // Find the in-order successor (smallest node in the right subtree)
            let successorParent = nodeToDelete;
            let successor = nodeToDelete.right;
            while (successor.left !== null) {
                successorParent = successor;
                successor = successor.left;
            }
            // Copy the successor's value to the node to be deleted
            nodeToDelete.value = successor.value;
            // Delete the successor node (which has at most one child - its right child)
            if (successorParent.left === successor) {
                successorParent.left = successor.right;
                if (successor.right)
                    successor.right.parent = successorParent;
            }
            else {
                successorParent.right = successor.right;
                if (successor.right)
                    successor.right.parent = successorParent;
            }
        }
        return deletedContact;
    }
    /**
     * Performs an in-order traversal of the BST and returns contacts in alphabetical order.
     * @returns {Contact[]} An array of contact objects.
     */
    inOrderTraversal() {
        const contacts = [];
        this._inOrderTraversalRecursive(this.root, contacts);
        return contacts;
    }
    /**
     * Helper function for in-order traversal.
     * @param {Node} node - The current node.
     * @param {Contact[]} contacts - The array to store contacts.
     * @private
     */
    _inOrderTraversalRecursive(node, contacts) {
        if (node !== null) {
            this._inOrderTraversalRecursive(node.left, contacts);
            contacts.push(node.value);
            this._inOrderTraversalRecursive(node.right, contacts);
        }
    }
    getContactsNewlyAddedFirst() {
        const allContacts = this.inOrderTraversal(); // This gets contacts sorted by name due to BST structure
        console.log("--- Contacts from BST (Alphabetical by Name) ---");
        allContacts.forEach((c) => console.log(c.name, c.dateAdded.toISOString()));
        allContacts.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
        console.log("--- Contacts Sorted by Date Added (Newest First) ---");
        allContacts.forEach((c) => console.log(c.name, c.dateAdded.toISOString()));
        return allContacts;
    }
    getContactsMostRecentActivityFirst() {
        const allContacts = this.inOrderTraversal(); // This gets contacts sorted by name due to BST structure
        console.log("--- Contacts from BST (Alphabetical by Name) ---");
        allContacts.forEach((c) => console.log(c.name, c.lastActivity ? c.lastActivity.toISOString() : "No activity")); // Handle potential null lastActivity
        allContacts.sort((a, b) => (b.lastActivity ? b.lastActivity.getTime() : 0) -
            (a.lastActivity ? a.lastActivity.getTime() : 0)); // Ensure handling of null lastActivity
        console.log("--- Contacts Sorted by Most Recent Activity ---");
        allContacts.forEach((c) => console.log(c.name, c.lastActivity ? c.lastActivity.toISOString() : "No activity"));
        return allContacts;
    }
    /**
     * Checks if the BST is empty.
     * @returns {boolean} True if the tree is empty, false otherwise.
     */
    isEmpty() {
        return this.root === null;
    }
    /**
     * Returns the number of contacts in the tree.
     * @returns {number} The current size of the tree.
     */
    size() {
        return this.size;
    }
}
exports.default = BinarySearchTree;
// module.exports = BinarySearchTree;
