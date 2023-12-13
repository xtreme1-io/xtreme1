class InnerNode {
  split: any;
  left: any;
  right: any;
  parent: any;
  dim: any;
  constructor(split: any, dim: any, parent: any) {
    this.split = split;
    this.left = undefined;
    this.right = undefined;
    this.parent = parent;
    this.dim = dim;
  }
}
class LeafNode {
  split: any;
  children: any;
  parent: ITreeNode;
  constructor(children: any, parent: ITreeNode) {
    this.split = undefined;
    this.children = children;
    this.parent = parent;
  }
}

type ITreeNode = LeafNode | InnerNode | undefined;

class kdTree {
  root: ITreeNode;
  points: any[];
  dimensions: any[];
  metric: Function;
  leafSize: number;
  constructor(points: any[], metric: Function, dimensions: any[], leafSize = 10) {
    this.metric = metric;
    this.dimensions = dimensions;
    this.leafSize = leafSize;
    this.points = points;
    this.root = this.buildTree(points, 0, undefined);
  }

  buildTree(points: any[], depth: number, parent: ITreeNode) {
    if (points.length === 0) {
      return undefined;
    }
    const dimensions = this.dimensions;
    const leafSize = this.leafSize;
    const dim = depth % dimensions.length;
    if (points.length <= leafSize) {
      return new LeafNode(points, parent);
    }

    const dimName = dimensions[dim];
    points.sort(function (a, b) {
      return a[dimName] - b[dimName];
    });

    const median = Math.floor(points.length / 2);
    const split = points[median][dimName];
    const node = new InnerNode(split, dim, parent);
    node.left = this.buildTree(points.slice(0, median), depth + 1, node);
    node.right = this.buildTree(points.slice(median), depth + 1, node);

    return node;
  }

  nearest(
    point: any,
    maxNodes: number | undefined = undefined,
    maxDistance: number | undefined = undefined,
  ) {
    const bestNodes = new BinaryHeap(function (e: any) {
      return -e[1];
    });
    const metric = this.metric;
    const dimensions = this.dimensions;

    function nearestSearch(node: ITreeNode) {
      function trySaveNode(obj: any, distance: number) {
        // check maxDistance
        if (maxDistance != undefined && distance > maxDistance) {
          return;
        }

        // maxNodes
        if (maxNodes == undefined || bestNodes.size() < maxNodes) {
          bestNodes.push([obj, distance]);
        }
        // replace
        else if (distance < bestNodes.peek()[1]) {
          bestNodes.push([obj, distance]);
          bestNodes.pop();
        }
      }
      if (!node) return;
      // LeafNode
      if (node.split == undefined) {
        node = node as LeafNode;
        for (const obj of node.children) {
          const distance = metric(point, obj);
          trySaveNode(obj, distance);
        }
      }
      // InnerNode
      else {
        node = node as InnerNode;
        const dimName = dimensions[node.dim];
        if (
          node.left != undefined &&
          (maxDistance == undefined || node.split + maxDistance >= point[dimName])
        ) {
          nearestSearch(node.left);
        }

        if (
          node.right != undefined &&
          (maxDistance == undefined || node.split - maxDistance <= point[dimName])
        ) {
          nearestSearch(node.right);
        }
      }
    }

    if (this.root) {
      nearestSearch(this.root);
    }

    return bestNodes.content;
  }

  balanceFactor() {
    const self = this;
    function height(node: ITreeNode): number {
      if (node == undefined) {
        return 0;
      }
      node = node as InnerNode;
      return Math.max(height(node.left), height(node.right)) + 1;
    }

    function count(node: ITreeNode): number {
      if (node == undefined) {
        return 0;
      }
      node = node as InnerNode;
      return count(node.left) + count(node.right) + 1;
    }

    return height(self.root) / (Math.log(count(self.root)) / Math.log(2));
  }

  forEach(fn: Function) {
    const self = this;
    function visit(node: ITreeNode) {
      fn(node);
      if (!node) return;
      node = node as InnerNode;
      if (node.left != undefined) {
        visit(node.left);
      }

      if (node.right != undefined) {
        visit(node.right);
      }
    }
    visit(self.root);
  }
}

// Binary heap implementation from:
// http://eloquentjavascript.net/appendix2.html

class BinaryHeap {
  scoreFunction: Function;
  content: any[];
  constructor(scoreFunction: Function) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }
  push(element: any) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  }

  pop() {
    // Store the first element so we can return it later.
    const result = this.content[0];
    // Get the element at the end of the array.
    const end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  }

  peek() {
    return this.content[0];
  }

  remove(node: any) {
    const len = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (let i = 0; i < len; i++) {
      if (this.content[i] == node) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        const end = this.content.pop();
        if (i != len - 1) {
          this.content[i] = end;
          if (this.scoreFunction(end) < this.scoreFunction(node)) this.bubbleUp(i);
          else this.sinkDown(i);
        }
        return;
      }
    }
    throw new Error('Node not found.');
  }

  size() {
    return this.content.length;
  }

  bubbleUp(n: number) {
    // Fetch the element that has to be moved.
    const element = this.content[n];
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      const parentN = Math.floor((n + 1) / 2) - 1;
      const parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to move it further.
      else {
        break;
      }
    }
  }

  sinkDown(n: number) {
    // Look up the target element and its score.
    const length = this.content.length,
      element = this.content[n],
      elemScore = this.scoreFunction(element);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Compute the indices of the child elements.
      const child2N = (n + 1) * 2,
        child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      let swap, child1Score;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        const child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        const child2 = this.content[child2N],
          child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == undefined ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap != undefined) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
}

export { kdTree, BinaryHeap };
