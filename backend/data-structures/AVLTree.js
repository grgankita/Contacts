import BinarySearchTree from "./BinarySearchTree.js";
import Node from "./node.js";
import Contact from "./contact.js";

class AVLNode extends Node {
  constructor(value) {
    super(value);
    this.height = 1; // New nodes initially have a height of 1
  }
}
export default class AVLTree extends BinarySearchTree {
  constructor() {
    super();
  }

  /**
   * Helper function to get the height of a node. Returns 0 for a null node.
   * @param {AVLNode | null} node - The node to get the height of.
   * @returns {number} The height of the node.
   */
  getHeight(node) {
    return node ? node.height : 0;
  }

  /**
   * Helper function to update the height of a node based on its children's heights.
   * @param {AVLNode} node - The node to update.
   */
  updateHeight(node) {
    node.height =
      1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  /**
   * Helper function to get the balance factor of a node.
   * Balance Factor = Height of Left Subtree - Height of Right Subtree.
   * @param {AVLNode} node - The node to get the balance factor of.
   * @returns {number} The balance factor.
   */
  getBalanceFactor(node) {
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  /**
   * Performs a right rotation on the given node.
   * Used when the left subtree is too tall (LL or LR case).
   * @param {AVLNode} y - The node to rotate around (pivot).
   * @returns {AVLNode} The new root of the rotated subtree.
   */
  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update parents
    if (T2) T2.parent = y;
    x.parent = y.parent; // x takes y's parent
    y.parent = x; // y becomes child of x

    // Update heights
    this.updateHeight(y);
    this.updateHeight(x);

    return x; // Return new root
  }

  /**
   * Performs a left rotation on the given node.
   * Used when the right subtree is too tall (RR or RL case).
   * @param {AVLNode} x - The node to rotate around (pivot).
   * @returns {AVLNode} The new root of the rotated subtree.
   */
  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update parents
    if (T2) T2.parent = x;
    y.parent = x.parent; // y takes x's parent
    x.parent = y; // x becomes child of y

    // Update heights
    this.updateHeight(x);
    this.updateHeight(y);

    return y; // Return new root
  }

  /**
   * Balances the subtree rooted at the given node.
   * This method is called after insertion or deletion to restore AVL properties.
   * @param {AVLNode} node - The node to balance.
   * @returns {AVLNode} The new root of the balanced subtree.
   */
  balance(node) {
    this.updateHeight(node);
    const balanceFactor = this.getBalanceFactor(node);

    // Left Left Case
    if (balanceFactor > 1 && this.getBalanceFactor(node.left) >= 0) {
      return this.rotateRight(node);
    }

    // Left Right Case
    if (balanceFactor > 1 && this.getBalanceFactor(node.left) < 0) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // Right Right Case
    if (balanceFactor < -1 && this.getBalanceFactor(node.right) <= 0) {
      return this.rotateLeft(node);
    }

    // Right Left Case
    if (balanceFactor < -1 && this.getBalanceFactor(node.right) > 0) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node; // No rotation needed
  }

  /**
   * Overrides the insert method from BinarySearchTree to include AVL balancing.
   * @param {Contact} contact - The contact object to insert.
   * @returns {boolean} True if the contact was inserted, false if a contact with the same name already exists.
   */
  insert(contact) {
    console.log("Insert method 'this' object:", this);
    if (!(contact instanceof Contact)) {
      // console.error("Insert method requires a Contact object.");
      console.error(
        ` AVLTree ${this.instanceId} Insert: Provided value is not a Contact instance:`,
        contact
      );
      return false;
    }

    const newNode = new AVLNode(contact); // Create the node, but don't increment size yet

    if (this.root === null) {
      this.root = newNode;
      this.size++; // Increment size ONLY when actually adding
      console.log(
        ` Added root contact: ${contact.name}. Tree size: ${this.size}`
      );
      return true;
    }
    let currentNode = this.root;
    let parentNode = null;
    let inserted = false; // Flag to track actual insertion

    while (!inserted) {
      parentNode = currentNode;
      const compareResult = contact.name.localeCompare(currentNode.value.name);

      if (compareResult === 0) {
        // console.warn(
        //   `Contact with name "${contact.name}" already exists. Not inserting.`
        // );
        console.warn(
          `AVLTree ${this.instanceId}: Contact with name "${contact.name}" already exists. Not inserting.`
        );
        // this.size--; // No need to decrement here, as it was never incremented prematurely
        return false; // Contact already exists
      } else if (compareResult < 0) {
        if (currentNode.left === null) {
          currentNode.left = newNode;
          newNode.parent = currentNode;
          this.size++; // <--- Increment size HERE when linked to the tree
          inserted = true;
          console.log(
            ` AVLTree ${this.instanceId}: Added ${contact.name} to left. New size: ${this.size}`
          );
        } else {
          currentNode = currentNode.left;
        }
      } else {
        // compareResult > 0
        if (currentNode.right === null) {
          currentNode.right = newNode;
          newNode.parent = currentNode;
          this.size++; // <--- Increment size HERE when linked to the tree
          inserted = true;
          console.log(
            ` AVLTree ${this.instanceId}: Added ${contact.name} to right. New size: ${this.size}`
          );
        } else {
          currentNode = currentNode.right;
        }
      }
    }

    let current = newNode.parent; // Start from the direct parent of the newly added node
    while (current !== null) {
      // Update height of current node
      current.height =
        1 +
        Math.max(this.getHeight(current.left), this.getHeight(current.right));

      const balanceFactor = this.getBalanceFactor(current);

      // Rebalance if necessary
      if (balanceFactor > 1 || balanceFactor < -1) {
        // Determine which rotation is needed
        const balancedNode = this.balance(current); // balance method should return the new root of the subtree

        // If the root of the tree changed due to rotation
        if (current === this.root) {
          // If the node we just balanced was the root of the entire tree
          this.root = balancedNode; // Update the tree's root
        }
      }
      current = current.parent; // Move up to the next parent
    }
    return true;
  }

  /**
   * Overrides the delete method from BinarySearchTree to include AVL balancing.
   * @param {string} name - The name of the contact to delete.
   * @returns {Contact | null} The deleted contact object if found and deleted, otherwise null.
   */
  delete(name) {
    if (this.root === null) {
      return null;
    }

    let nodeToDelete = this.root;
    let parentNode = null;
    let nodeToBalanceFrom = null; // Node from which to start balancing upwards

    // Find the node to delete and its parent
    while (nodeToDelete !== null) {
      const compareResult = name.localeCompare(nodeToDelete.value.name);

      if (compareResult === 0) {
        break;
      } else if (compareResult < 0) {
        parentNode = nodeToDelete;
        nodeToDelete = nodeToDelete.left;
      } else {
        parentNode = nodeToDelete;
        nodeToDelete = nodeToDelete.right;
      }
    }

    if (nodeToDelete === null) {
      return null; // Contact not found
    }

    const deletedContact = nodeToDelete.value;
    this.size--;

    // Case 1: Node has no children (leaf node)
    if (nodeToDelete.left === null && nodeToDelete.right === null) {
      if (nodeToDelete === this.root) {
        this.root = null;
      } else if (parentNode.left === nodeToDelete) {
        parentNode.left = null;
      } else {
        parentNode.right = null;
      }
      nodeToBalanceFrom = parentNode;
    }
    // Case 2: Node has one child
    else if (nodeToDelete.left === null) {
      // Only right child
      if (nodeToDelete === this.root) {
        this.root = nodeToDelete.right;
        if (this.root) this.root.parent = null;
      } else if (parentNode.left === nodeToDelete) {
        parentNode.left = nodeToDelete.right;
        if (nodeToDelete.right) nodeToDelete.right.parent = parentNode;
      } else {
        parentNode.right = nodeToDelete.right;
        if (nodeToDelete.right) nodeToDelete.right.parent = parentNode;
      }
      nodeToBalanceFrom = parentNode;
    } else if (nodeToDelete.right === null) {
      // Only left child
      if (nodeToDelete === this.root) {
        this.root = nodeToDelete.left;
        if (this.root) this.root.parent = null;
      } else if (parentNode.left === nodeToDelete) {
        parentNode.left = nodeToDelete.left;
        if (nodeToDelete.left) nodeToDelete.left.parent = parentNode;
      } else {
        parentNode.right = nodeToDelete.left;
        if (nodeToDelete.left) nodeToDelete.left.parent = parentNode;
      }
      nodeToBalanceFrom = parentNode;
    }
    // Case 3: Node has two children
    else {
      let successorParent = nodeToDelete;
      let successor = nodeToDelete.right;
      while (successor.left !== null) {
        successorParent = successor;
        successor = successor.left;
      }

      nodeToDelete.value = successor.value; // Copy successor's value

      // Delete the successor node (which has at most one child - its right child)
      if (successorParent.left === successor) {
        successorParent.left = successor.right;
        if (successor.right) successor.right.parent = successorParent;
      } else {
        successorParent.right = successor.right;
        if (successor.right) successor.right.parent = successorParent;
      }
      nodeToBalanceFrom = successorParent;
    }

    // Balance the tree starting from the node where deletion occurred upwards
    let current = nodeToBalanceFrom;
    while (current !== null) {
      const balancedNode = this.balance(current);
      if (balancedNode !== current) {
        // If a rotation occurred, update parent pointers
        if (balancedNode.parent === null) {
          // New root
          this.root = balancedNode;
        } else if (balancedNode.parent.left === current) {
          balancedNode.parent.left = balancedNode;
        } else {
          balancedNode.parent.right = balancedNode;
        }
      }
      current = balancedNode.parent;
    }
    return deletedContact;
  }
  _inOrderCollect(node, contacts) {
    if (node) {
      this._inOrderCollect(node.left, contacts);
      console.log(
        "Collecting node:",
        node.value ? node.value.name : "N/A",
        node.value instanceof Contact
      );
      contacts.push(node.value); // Assuming node.value is a Contact object
      this._inOrderCollect(node.right, contacts);
    }
    return contacts;
  }

  getContactsNewlyAddedFirst() {
    console.log("newly added first 'this' object:", this);
    const contacts = this._inOrderCollect(this.root, []);
    console.log(
      "Contacts before sort by dateAdded:",
      contacts.map((c) => ({ name: c.name, dateAdded: c.dateAdded }))
    );

    contacts.sort((a, b) => {
      const dateA = a.dateAdded instanceof Date ? a.dateAdded.getTime() : 0;
      const dateB = b.dateAdded instanceof Date ? b.dateAdded.getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });
    console.log(
      " Contacts after sort:",
      contacts.map((c) => ({ name: c.name, dateAdded: c.dateAdded }))
    );
    return contacts;
  }

  getContactsMostRecentActivityFirst() {
    const contacts = this._inOrderCollect(this.root, []);
    console.log(
      " Contacts before sort by lastActivity:",
      contacts.map((c) => ({ name: c.name, lastActivity: c.lastActivity }))
    );

    contacts.sort((a, b) => {
      const dateA =
        a.lastActivity instanceof Date ? a.lastActivity.getTime() : 0;
      const dateB =
        b.lastActivity instanceof Date ? b.lastActivity.getTime() : 0;
      return dateB - dateA; // Descending order (most recent first)
    });
    console.log(
      " Contacts after sort:",
      contacts.map((c) => ({ name: c.name, lastActivity: c.lastActivity }))
    );
    return contacts;
  }
}

// module.exports = AVLTree;
