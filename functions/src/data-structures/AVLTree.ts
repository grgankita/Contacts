import Contact from "./contact";
import type IContact from "./contact";

class AVLNode {
  value: IContact;
  left: AVLNode | null;
  right: AVLNode | null;
  height: number;
  parent: AVLNode | null;

  constructor(value: IContact) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.parent = null;
  }
}

// Define the AVL Tree class
class AVLTree {
  root: AVLNode | null = null;
  size: number = 0;
  instanceId: string = ""; // From index.ts, for debugging

  // Helper to get height of a node
  getHeight(node: AVLNode | null): number {
    if (node === null) {
      return 0;
    }
    return node.height;
  }
  // Helper to update height of a node
  updateHeight(node: AVLNode): void {
    node.height =
      1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }
  // Helper to get balance factor of a node
  getBalanceFactor(node: AVLNode | null): number {
    if (node === null) {
      return 0;
    }
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  // Right rotation
  rotateRight(y: AVLNode): AVLNode {
    const x = y.left as AVLNode;
    const T2 = x.right;
    // Perform rotation
    x.right = y;
    y.left = T2;
    // Update parents (crucial for maintaining tree structure)
    if (y.parent) {
      if (y.parent.left === y) {
        y.parent.left = x;
      } else {
        y.parent.right = x;
      }
    }
    x.parent = y.parent;
    y.parent = x;
    if (T2) T2.parent = y;

    // Update heights
    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }
  // Left rotation
  rotateLeft(x: AVLNode): AVLNode {
    const y = x.right as AVLNode; // Assert as AVLNode
    const T2 = y.left;
    // Perform rotation
    y.left = x;
    x.right = T2;
    // Update parents
    if (x.parent) {
      if (x.parent.left === x) {
        x.parent.left = y;
      } else {
        x.parent.right = y;
      }
    }
    y.parent = x.parent;
    x.parent = y;
    if (T2) T2.parent = x;

    // Update heights
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  // Balance a node
  balance(node: AVLNode): AVLNode {
    this.updateHeight(node);
    const balanceFactor = this.getBalanceFactor(node);
    // Left Left Case
    if (balanceFactor > 1 && this.getBalanceFactor(node.left) >= 0) {
      return this.rotateRight(node);
    }
    // Left Right Case
    if (balanceFactor > 1 && this.getBalanceFactor(node.left) < 0) {
      node.left = this.rotateLeft(node.left as AVLNode); // Assert as AVLNode
      return this.rotateRight(node);
    }
    // Right Right Case
    if (balanceFactor < -1 && this.getBalanceFactor(node.right) <= 0) {
      return this.rotateLeft(node);
    }
    // Right Left Case
    if (balanceFactor < -1 && this.getBalanceFactor(node.right) > 0) {
      node.right = this.rotateRight(node.right as AVLNode); // Assert as AVLNode
      return this.rotateLeft(node);
    }
    return node;
  }

  // Insert a contact into the AVL tree
  insert(contact: IContact): boolean {
    const newNode = new AVLNode(contact);

    if (this.root === null) {
      this.root = newNode;
      this.size++;
      return true;
    }
    let currentNode: AVLNode | null = this.root;
    let parentNode: AVLNode | null = null;
    while (currentNode !== null) {
      parentNode = currentNode;
      if (contact.name < currentNode.value.name) {
        currentNode = currentNode.left;
      } else if (contact.name > currentNode.value.name) {
        currentNode = currentNode.right;
      } else {
        console.warn(`Contact with name '${contact.name}' already exists.`);
        return true;
      }
    }
    // Link the new node
    newNode.parent = parentNode;
    if (parentNode === null) {
      this.root = newNode;
    } else if (contact.name < parentNode.value.name) {
      parentNode.left = newNode;
    } else {
      parentNode.right = newNode;
    }
    this.size++;
    // Rebalance up the tree
    let current: AVLNode | null = newNode.parent;
    while (current !== null) {
      current = this.balance(current);
      if (current.parent === null) {
        // If it's the new root
        if (this.root !== current) {
          // Only update if it actually changed
          this.root = current;
        }
        break;
      }
      current = current.parent;
    }
    return true;
  }
  // Delete a contact by name
  delete(name: string): boolean {
    if (this.root === null) {
      return true;
    }
    let nodeToDelete: AVLNode | null = this.root;
    let parentOfNodeToDelete: AVLNode | null = null;
    // Find the node
    while (nodeToDelete !== null && nodeToDelete.value.name !== name) {
      parentOfNodeToDelete = nodeToDelete;
      if (name < nodeToDelete.value.name) {
        nodeToDelete = nodeToDelete.left;
      } else {
        nodeToDelete = nodeToDelete.right;
      }
    }
    if (nodeToDelete === null) {
      console.warn(`Contact with name '${name}' not found.`);
      return true; // Node not found
    }
    this.size--;

    // Case 1: Node has no children (leaf node)
    if (nodeToDelete.left === null && nodeToDelete.right === null) {
      if (parentOfNodeToDelete === null) {
        if (nodeToDelete === this.root) {
          this.root = null;
        }
      } else if (parentOfNodeToDelete.left === nodeToDelete) {
        parentOfNodeToDelete.left = null;
      } else {
        parentOfNodeToDelete.right = null;
      }
      return true;
    }
    // Case 2: Node has only one child
    if (nodeToDelete.left === null) {
      // Only right child
      if (parentOfNodeToDelete === null) {
        if (nodeToDelete === this.root) {
          this.root = nodeToDelete.right;
          if (this.root) this.root.parent = null;
        }
      } else if (parentOfNodeToDelete.left === nodeToDelete) {
        parentOfNodeToDelete.left = nodeToDelete.right;
      } else {
        parentOfNodeToDelete.right = nodeToDelete.right;
      }
      if (nodeToDelete.right) nodeToDelete.right.parent = parentOfNodeToDelete;
      return true;
    }
    if (nodeToDelete.right === null) {
      // Only left child
      if (parentOfNodeToDelete === null) {
        if (nodeToDelete === this.root) {
          this.root = nodeToDelete.left;
          if (this.root) this.root.parent = null;
        }
      } else if (parentOfNodeToDelete.left === nodeToDelete) {
        parentOfNodeToDelete.left = nodeToDelete.left;
      } else {
        parentOfNodeToDelete.right = nodeToDelete.left;
      }
      if (nodeToDelete.left) nodeToDelete.left.parent = parentOfNodeToDelete;
      return true;
    }
    // Case 3: Node has two children (find in-order successor)
    let successorParent: AVLNode = nodeToDelete;
    let successor: AVLNode = nodeToDelete.right as AVLNode; // Assert as AVLNode

    while (successor.left !== null) {
      successorParent = successor;
      successor = successor.left;
    }
    nodeToDelete.value = successor.value;
    // Delete the successor (which now has at most one child - its right child)
    if (successorParent.left === successor) {
      successorParent.left = successor.right;
    } else {
      successorParent.right = successor.right;
    }
    if (successor.right) successor.right.parent = successorParent;
    // Rebalance from the successor's parent up to the root
    let current: AVLNode | null = successorParent;
    while (current !== null) {
      current = this.balance(current);
      if (current.parent === null) {
        // If it's the new root
        if (this.root !== current) {
          // Only update if it actually changed
          this.root = current;
        }
        break;
      }
      current = current.parent;
    }
    return true;
  }
  // In-order traversal (helper for collecting contacts)
  _inOrderCollect(node: AVLNode | null, contacts: IContact[]): any {
    if (node !== null) {
      this._inOrderCollect(node.left, contacts);
      contacts.push(node.value);
      this._inOrderCollect(node.right, contacts);
    }
  }
  // Get all contacts in name ascending order
  inOrderTraversal(): IContact[] {
    const contacts: IContact[] = [];
    this._inOrderCollect(this.root, contacts);
    return contacts;
  }
  // Get contacts sorted by dateAdded (newest first)
  getContactsNewlyAddedFirst(): IContact[] {
    const contacts: Contact[] = this._inOrderCollect(this.root, []);
    contacts.sort((a: IContact, b: IContact) => {
      const dateA = new Date(a.dateAdded ?? 0);
      const dateB = new Date(b.dateAdded ?? 0);
      return dateB.getTime() - dateA.getTime();
    });
    return contacts;
  }
  // Get contacts sorted by lastActivity (most recent first)
  getContactsMostRecentActivityFirst(): IContact[] {
    const contacts: Contact[] = this._inOrderCollect(this.root, []);
    contacts.sort((a: IContact, b: IContact) => {
      const dateA = a.lastActivity ? new Date(a.lastActivity) : new Date(0);
      const dateB = b.lastActivity ? new Date(b.lastActivity) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    return contacts;
  }
  // Search by name
  search(name: string): IContact | null {
    // Added search method to align with backend usage
    let currentNode: AVLNode | null = this.root;
    while (currentNode !== null) {
      if (name === currentNode.value.name) {
        return currentNode.value;
      } else if (name < currentNode.value.name) {
        currentNode = currentNode.left;
      } else {
        currentNode = currentNode.right;
      }
    }
    return null;
  }
}

// Export the AVLTree class
export default AVLTree;
