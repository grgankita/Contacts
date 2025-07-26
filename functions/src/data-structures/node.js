"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Node {
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
exports.default = Node;
// module.exports = Node;
