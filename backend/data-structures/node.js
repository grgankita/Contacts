export default class Node {
  /**
   * @param {object} value - The data stored in the node (e.g., a Contact object).
   */
  constructor(value) {
    this.value = value; // The Contact object
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}
// module.exports = Node;
