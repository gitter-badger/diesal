/**
 * @class BSTNode
 */
export class BSTNode {
  constructor(value, parent = null) {
    this.value = value;
    this.parent = parent;
    this.left = null;
    this.right = null;
  }

  getLeftmostDescendant() {
    return this.left ? this.left.getLeftmostDescendant() : this;
  }

  getRightmostDescendant() {
    return this.right ? this.right.getRightmostDescendant() : this;
  }
}

/**
 * A binary search tree.
 *
 * @class BinarySearchTree
 */
export default class BinarySearchTree {
  /**
   * @constructor
   * @param {Array} list A list of initial values to insert into the tree.
   * @param {Function} cmp A comparison function taking two arguments and
   * returning a boolean. Defaults to `(a, b) => a < b`
   */
  constructor(list = [], cmp = (a, b) => a < b) {
    this.root = null;
    this.cmp = cmp;
    this.length = 0;
    list.forEach(item => this.insert(item));
  }

  /**
   * Inserts a value into the tree.
   *
   * @param {*} value
   * @returns {number} The new size of the tree
   */
  insert(value, parent = this.root) {
    // Our tree has no nodes, so regardless of the value, it must be the root.
    if (!this.root) {
      this.root = new BSTNode(value);
      return ++this.length;
    }
    // Compare the value to the current parent's value. If it is lower, then it
    // should go on the left side.
    if (this.cmp(value, parent.value)) {
      // If the parent node doesn't have a left child, then we should put the
      // value there.
      if (parent.left === null) {
        parent.left = new BSTNode(value, parent);
        return ++this.length;
      }
      // Otherwise, recurse, with the left value as the new parent.
      else {
        this.insert(value, parent.left);
      }
    }
    // If it is greater than or equal to the value, then it should go on the
    // right side. Code is the same, but switch any 'left' with 'right'.
    else {
      if (parent.right === null) {
        parent.right = new BSTNode(value, parent);
        return ++this.length;
      }
      else {
        this.insert(value, parent.right);
      }
    }
  }

  /**
   * Search for a value in the tree.
   *
   * @param {*} value Value for which to search
   * @return {BSTNode|null} null if not found, otherwise the node
   */
  search(value, node = this.root) {
    // There are four possibilities:
    // 1. `node` is `null`: The value we're looking for isn't in the tree.
    // 2. `node.value` is `value`: We've found the value.
    // In both of these cases, we can simply return `node` -- in case 1, this
    // means it returns `null`, which is what we want if the value doesn't exist
    // in the tree.
    if (!node || node.value === value) return node;
    // 3. `value` is less than `node.value`: Search again, this time looking at
    //    only the values that are less than `node.value` (by looking at its
    //    left subtree)
    if (this.cmp(value, node.value)) return this.search(value, node.left);
    // 4. `value` is greater than `node.value`: Search again, this time looking
    //    at only the values that are greater than `node.value` (by looking at
    //    its right subtree)
    return this.search(value, node.right);
  }

  /**
   * Removes a value from the tree. If the value is in the tree multiple times,
   * it will remove the first one found.
   *
   * @param {*} value The value to remove.
   * @return {number} The new length of the array (or null if no matching node
   * found)
   */
  remove(value) {
    // First, find the node.
    let node = this.search(value);
    // If it doesn't exist in the tree, we can exit.
    if (!node) {
      return null;
    }
    let rootParent;
    if (node === this.root) {
      rootParent = node.parent = {left: this.root};
    }
    // If it has both left and right children, we need to do some extra work.
    // Find the next higher value (the right subtree's leftmost descendant),
    // swap out the values, and remove the other node.
    if (node.left && node.right) {
      let nextHigher = node.right.getLeftmostDescendant();
      node.value = nextHigher.value;
      // If the nextHigher node is the right child of its parent, replace it
      // with its own right children (if any). This can only happen if we had
      // a chain of only right children (or the node we're deleting only had one
      // right descendant)
      let nodeSide = nextHigher.parent.left === nextHigher ? 'left' : 'right';
      nextHigher.parent[nodeSide] = nextHigher.right;
      // Don't forget to reset parents
      if (nextHigher.right) nextHigher.right.parent = nextHigher.parent;
    }
    else {
      // If it only has one child, then we just replace it with its own child.
      // If it has no children, we can just remove it. This condition is rolled
      // into the final else, since with no children, `node.right` is `null`.
      let nodeSide = node.parent.left === node ? 'left' : 'right';
      if (node.left) {
        node.parent[nodeSide] = node.left;
        // Don't forget to reset parents
        if (node.left) node.left.parent = node.parent;
      }
      else {
        node.parent[nodeSide] = node.right;
        // Don't forget to reset parents
        if (node.right) node.right.parent = node.parent;
      }
    }
    if (rootParent) this.root = rootParent.left;
    return --this.length;
  }

  /**
   * Converts the tree into an array using an in-order traversal of the tree.
   *
   * @returns {Array}
   */
  toArray(node = this.root) {
    // An in-order traversal should (as you might expect) traverse the nodes in
    // value order. Since the tree is sorted so that smaller values go to the
    // left subtree, and larger values go to the right subtree, we want to visit
    // the left tree first, then include the current node itself, then all the
    // right subtree.
    let arr = [];
    if (node.left) arr = arr.concat(this.toArray(node.left));
    arr = arr.concat(node.value);
    if (node.right) arr = arr.concat(this.toArray(node.right));
    return arr;
  }

  /**
   * Finds the immediate predecessor of the given value
   *
   * @param {*} value The value to find the predecessor for
   * @returns {*|null} Predecessor value, or null if value not found or min
   */
  getPredecessor(value) {
    let foundNode = this.search(value);
    if (!foundNode) return null;
    if (foundNode.left) return foundNode.left.getRightmostDescendant().value;
    while (foundNode.parent && foundNode.parent.left === foundNode)
      foundNode = foundNode.parent;
    if (!foundNode.parent) return null;
    return foundNode.parent.value;
  }

  /**
   * Finds the immediate successor of the given value
   *
   * @param {*} value The value to find the successor for
   * @returns {*|null} Successor value, or null if value not found or max
   */
  getSuccessor(value) {
    let foundNode = this.search(value);
    if (!foundNode) return null;
    if (foundNode.right) return foundNode.right.getLeftmostDescendant().value;
    while (foundNode.parent && foundNode.parent.right === foundNode)
      foundNode = foundNode.parent;
    if (!foundNode.parent) return null;
    return foundNode.parent.value;
  }
}