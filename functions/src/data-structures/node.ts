import Contact from "./contact";
export default class Node {
  /**
   * @param {object} value - The data stored in the node (e.g., a Contact object).
   */
  value: Contact;
  left: Node | null;
  right: Node | null;
  parent: Node | null;
  constructor(value: Contact) {
    this.value = value; // The Contact object
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}
// module.exports = Node;
