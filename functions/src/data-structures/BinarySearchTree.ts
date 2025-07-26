import Node from "./node";
import Contact from "./contact";
class BinarySearchTree {
  root: Node | null = null;
  private _size: number;
  instanceId: string;

  constructor() {
    this.root = null;
    this._size = 0;
    this.instanceId = Math.random().toString(36).substring(2);
  }

  insert(contact: Contact): boolean {
    if (!contact || typeof contact !== "object" || !contact.name) {
      console.error(
        `AVLTree ${this.instanceId} Insert: Provided value is not a valid Contact:`,
        contact
      );
      return false;
    }

    const newNode = new Node(contact);
    this._size++;
    console.log(
      `AVLTree ${this.instanceId}: Added root contact: ${contact.name}. New size: ${this.size}`
    );

    if (this.root === null) {
      this.root = newNode;
      return true;
    }

    let currentNode = this.root;
    while (true) {
      const compareResult = contact.name.localeCompare(currentNode.value.name);

      if (compareResult === 0) {
        console.warn(
          `AVLTree ${this.instanceId}: Contact with name "${contact.name}" already exists. Not inserting.`
        );
        this._size--;
        return false;
      } else if (compareResult < 0) {
        if (currentNode.left === null) {
          currentNode.left = newNode;
          newNode.parent = currentNode;
          return true;
        }
        currentNode = currentNode.left;
      } else {
        if (currentNode.right === null) {
          currentNode.right = newNode;
          newNode.parent = currentNode;
          return true;
        }
        currentNode = currentNode.right;
      }
    }
  }

  search(name: string): Contact | null {
    if (this.root === null) {
      return null;
    }

    let currentNode: Node | null = this.root;
    while (currentNode !== null) {
      const compareResult = name.localeCompare(currentNode.value.name);

      if (compareResult === 0) {
        return currentNode.value;
      } else if (compareResult < 0) {
        currentNode = currentNode.left;
      } else {
        currentNode = currentNode.right;
      }
    }
    return null;
  }

  delete(name: string): Contact | null {
    if (this.root === null) {
      return null;
    }

    let nodeToDelete: Node | null = this.root;
    let parentNode: Node | null = nodeToDelete.parent;

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
      return null;
    }

    const deletedContact = nodeToDelete.value;
    this._size--;

    // Case 1: Node has no children
    if (nodeToDelete.left === null && nodeToDelete.right === null) {
      if (nodeToDelete === this.root) {
        this.root = null;
      } else if (parentNode && parentNode.left === nodeToDelete) {
        parentNode.left = null;
      } else if (parentNode) {
        parentNode.right = null;
      }
    }
    // Case 2: Node has one child
    else if (nodeToDelete.left === null) {
      if (nodeToDelete === this.root) {
        this.root = nodeToDelete.right;
        if (this.root) this.root.parent = null;
      } else if (parentNode?.left === nodeToDelete) {
        parentNode.left = nodeToDelete.right;
        if (nodeToDelete.right) {
          nodeToDelete.right.parent = parentNode;
        }
      } else if (parentNode) {
        parentNode.right = nodeToDelete.right;
        if (nodeToDelete.right) {
          nodeToDelete.right.parent = parentNode;
        }
      }
    } else if (nodeToDelete.right === null) {
      if (nodeToDelete === this.root) {
        this.root = nodeToDelete.left;
        if (this.root) this.root.parent = null;
      } else if (parentNode?.left === nodeToDelete) {
        parentNode.left = nodeToDelete.left;
        if (nodeToDelete.left) {
          nodeToDelete.left.parent = parentNode;
        }
      } else if (parentNode) {
        parentNode.right = nodeToDelete.left;
        if (nodeToDelete.left) {
          nodeToDelete.left.parent = parentNode;
        }
      }
    }
    // Case 3: Node has two children
    else {
      let successor: Node | null = nodeToDelete.right;
      let successorParent: Node | null = nodeToDelete;

      while (successor?.left !== null) {
        successorParent = successor;
        successor = successor.left;
      }

      if (!successor) {
        return deletedContact;
      }

      nodeToDelete.value = successor.value;

      if (successorParent && successorParent.left === successor) {
        successorParent.left = successor.right;
        if (successor.right) {
          successor.right.parent = successorParent;
        }
      } else if (successorParent) {
        successorParent.right = successor.right;
        if (successor.right) {
          successor.right.parent = successorParent;
        }
      }
    }
    return deletedContact;
  }

  inOrderTraversal(): Contact[] {
    const contacts: Contact[] = [];
    this._inOrderTraversalRecursive(this.root, contacts);
    return contacts;
  }

  private _inOrderTraversalRecursive(
    node: Node | null,
    contacts: Contact[]
  ): Contact[] {
    if (node !== null) {
      this._inOrderTraversalRecursive(node.left, contacts);
      contacts.push(node.value);
      this._inOrderTraversalRecursive(node.right, contacts);
    }
    return contacts;
  }

  getContactsNewlyAddedFirst(): Contact[] {
    const allContacts = this.inOrderTraversal();
    allContacts.sort((a, b) => {
      const bTime = b.dateAdded ? b.dateAdded.getTime() : 0;
      const aTime = a.dateAdded ? a.dateAdded.getTime() : 0;
      return bTime - aTime;
    });
    return allContacts;
  }

  getContactsMostRecentActivityFirst(): Contact[] {
    const allContacts = this.inOrderTraversal();
    allContacts.sort(
      (a, b) =>
        (b.lastActivity ? b.lastActivity.getTime() : 0) -
        (a.lastActivity ? a.lastActivity.getTime() : 0)
    );
    return allContacts;
  }

  isEmpty(): boolean {
    return this.root === null;
  }

  size(): number {
    return this._size;
  }
}
