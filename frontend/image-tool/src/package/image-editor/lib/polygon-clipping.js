/* eslint-disable */
import SplayTree from 'splaytree';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _defineProperties(target, props) {
  for (let i = 0; i < props.length; i++) {
    const descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

/**
 * A bounding box has the format:
 *
 *  { ll: { x: xmin, y: ymin }, ur: { x: xmax, y: ymax } }
 *
 */
const isInBbox = function isInBbox(bbox, point) {
  return (
    bbox.ll.x <= point.x && point.x <= bbox.ur.x && bbox.ll.y <= point.y && point.y <= bbox.ur.y
  );
};
/* Returns either null, or a bbox (aka an ordered pair of points)
 * If there is only one point of overlap, a bbox with identical points
 * will be returned */

const getBboxOverlap = function getBboxOverlap(b1, b2) {
  // check if the bboxes overlap at all
  if (b2.ur.x < b1.ll.x || b1.ur.x < b2.ll.x || b2.ur.y < b1.ll.y || b1.ur.y < b2.ll.y) return null; // find the middle two X values

  const lowerX = b1.ll.x < b2.ll.x ? b2.ll.x : b1.ll.x;
  const upperX = b1.ur.x < b2.ur.x ? b1.ur.x : b2.ur.x; // find the middle two Y values

  const lowerY = b1.ll.y < b2.ll.y ? b2.ll.y : b1.ll.y;
  const upperY = b1.ur.y < b2.ur.y ? b1.ur.y : b2.ur.y; // put those middle values together to get the overlap

  return {
    ll: {
      x: lowerX,
      y: lowerY,
    },
    ur: {
      x: upperX,
      y: upperY,
    },
  };
};

/* Javascript doesn't do integer math. Everything is
 * floating point with percision Number.EPSILON.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
 */
let epsilon = Number.EPSILON; // IE Polyfill

if (epsilon === undefined) epsilon = Math.pow(2, -52);
const EPSILON_SQ = epsilon * epsilon;
/* FLP comparator */

const cmp = function cmp(a, b) {
  // check if they're both 0
  if (-epsilon < a && a < epsilon) {
    if (-epsilon < b && b < epsilon) {
      return 0;
    }
  } // check if they're flp equal

  const ab = a - b;

  if (ab * ab < EPSILON_SQ * a * b) {
    return 0;
  } // normal comparison

  return a < b ? -1 : 1;
};

/**
 * This class rounds incoming values sufficiently so that
 * floating points problems are, for the most part, avoided.
 *
 * Incoming points are have their x & y values tested against
 * all previously seen x & y values. If either is 'too close'
 * to a previously seen value, it's value is 'snapped' to the
 * previously seen value.
 *
 * All points should be rounded by this class before being
 * stored in any data structures in the rest of this algorithm.
 */

const PtRounder = /*#__PURE__*/ (function () {
  function PtRounder() {
    _classCallCheck(this, PtRounder);

    this.reset();
  }

  _createClass(PtRounder, [
    {
      key: 'reset',
      value: function reset() {
        this.xRounder = new CoordRounder();
        this.yRounder = new CoordRounder();
      },
    },
    {
      key: 'round',
      value: function round(x, y) {
        return {
          x: this.xRounder.round(x),
          y: this.yRounder.round(y),
        };
      },
    },
  ]);

  return PtRounder;
})();

var CoordRounder = /*#__PURE__*/ (function () {
  function CoordRounder() {
    _classCallCheck(this, CoordRounder);

    this.tree = new SplayTree(); // preseed with 0 so we don't end up with values < Number.EPSILON

    this.round(0);
  } // Note: this can rounds input values backwards or forwards.
  //       You might ask, why not restrict this to just rounding
  //       forwards? Wouldn't that allow left endpoints to always
  //       remain left endpoints during splitting (never change to
  //       right). No - it wouldn't, because we snap intersections
  //       to endpoints (to establish independence from the segment
  //       angle for t-intersections).

  _createClass(CoordRounder, [
    {
      key: 'round',
      value: function round(coord) {
        const node = this.tree.add(coord);
        const prevNode = this.tree.prev(node);

        if (prevNode !== null && cmp(node.key, prevNode.key) === 0) {
          this.tree.remove(coord);
          return prevNode.key;
        }

        const nextNode = this.tree.next(node);

        if (nextNode !== null && cmp(node.key, nextNode.key) === 0) {
          this.tree.remove(coord);
          return nextNode.key;
        }

        return coord;
      },
    },
  ]);

  return CoordRounder;
})(); // singleton available by import

const rounder = new PtRounder();

/* Cross Product of two vectors with first point at origin */

const crossProduct = function crossProduct(a, b) {
  return a.x * b.y - a.y * b.x;
};
/* Dot Product of two vectors with first point at origin */

const dotProduct = function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y;
};
/* Comparator for two vectors with same starting point */

const compareVectorAngles = function compareVectorAngles(basePt, endPt1, endPt2) {
  const v1 = {
    x: endPt1.x - basePt.x,
    y: endPt1.y - basePt.y,
  };
  const v2 = {
    x: endPt2.x - basePt.x,
    y: endPt2.y - basePt.y,
  };
  const kross = crossProduct(v1, v2);
  const epsilon = 0.001;
  return kross > epsilon ? 1 : kross < -epsilon ? -1 : 0;
};
const length = function length(v) {
  return Math.sqrt(dotProduct(v, v));
};
/* Get the sine of the angle from pShared -> pAngle to pShaed -> pBase */

const sineOfAngle = function sineOfAngle(pShared, pBase, pAngle) {
  const vBase = {
    x: pBase.x - pShared.x,
    y: pBase.y - pShared.y,
  };
  const vAngle = {
    x: pAngle.x - pShared.x,
    y: pAngle.y - pShared.y,
  };
  return crossProduct(vAngle, vBase) / length(vAngle) / length(vBase);
};
/* Get the cosine of the angle from pShared -> pAngle to pShaed -> pBase */

const cosineOfAngle = function cosineOfAngle(pShared, pBase, pAngle) {
  const vBase = {
    x: pBase.x - pShared.x,
    y: pBase.y - pShared.y,
  };
  const vAngle = {
    x: pAngle.x - pShared.x,
    y: pAngle.y - pShared.y,
  };
  return dotProduct(vAngle, vBase) / length(vAngle) / length(vBase);
};
/* Get the x coordinate where the given line (defined by a point and vector)
 * crosses the horizontal line with the given y coordiante.
 * In the case of parrallel lines (including overlapping ones) returns null. */

const horizontalIntersection = function horizontalIntersection(pt, v, y) {
  if (v.y === 0) return null;
  return {
    x: pt.x + (v.x / v.y) * (y - pt.y),
    y: y,
  };
};
/* Get the y coordinate where the given line (defined by a point and vector)
 * crosses the vertical line with the given x coordiante.
 * In the case of parrallel lines (including overlapping ones) returns null. */

const verticalIntersection = function verticalIntersection(pt, v, x) {
  if (v.x === 0) return null;
  return {
    x: x,
    y: pt.y + (v.y / v.x) * (x - pt.x),
  };
};
/* Get the intersection of two lines, each defined by a base point and a vector.
 * In the case of parrallel lines (including overlapping ones) returns null. */

const intersection = function intersection(pt1, v1, pt2, v2) {
  // take some shortcuts for vertical and horizontal lines
  // this also ensures we don't calculate an intersection and then discover
  // it's actually outside the bounding box of the line
  if (v1.x === 0) return verticalIntersection(pt2, v2, pt1.x);
  if (v2.x === 0) return verticalIntersection(pt1, v1, pt2.x);
  if (v1.y === 0) return horizontalIntersection(pt2, v2, pt1.y);
  if (v2.y === 0) return horizontalIntersection(pt1, v1, pt2.y); // General case for non-overlapping segments.
  // This algorithm is based on Schneider and Eberly.
  // http://www.cimec.org.ar/~ncalvo/Schneider_Eberly.pdf - pg 244

  const kross = crossProduct(v1, v2);
  if (kross == 0) return null;
  const ve = {
    x: pt2.x - pt1.x,
    y: pt2.y - pt1.y,
  };
  const d1 = crossProduct(ve, v1) / kross;
  const d2 = crossProduct(ve, v2) / kross; // take the average of the two calculations to minimize rounding error

  const x1 = pt1.x + d2 * v1.x,
    x2 = pt2.x + d1 * v2.x;
  const y1 = pt1.y + d2 * v1.y,
    y2 = pt2.y + d1 * v2.y;
  const x = (x1 + x2) / 2;
  const y = (y1 + y2) / 2;
  return {
    x: x,
    y: y,
  };
};

const SweepEvent = /*#__PURE__*/ (function () {
  _createClass(SweepEvent, null, [
    {
      key: 'compare',
      // for ordering sweep events in the sweep event queue
      value: function compare(a, b) {
        // favor event with a point that the sweep line hits first
        const ptCmp = SweepEvent.comparePoints(a.point, b.point);
        if (ptCmp !== 0) return ptCmp; // the points are the same, so link them if needed

        if (a.point !== b.point) a.link(b); // favor right events over left

        if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1; // we have two matching left or right endpoints
        // ordering of this case is the same as for their segments

        return Segment.compare(a.segment, b.segment);
      }, // for ordering points in sweep line order
    },
    {
      key: 'comparePoints',
      value: function comparePoints(aPt, bPt) {
        if (aPt.x < bPt.x) return -1;
        if (aPt.x > bPt.x) return 1;
        if (aPt.y < bPt.y) return -1;
        if (aPt.y > bPt.y) return 1;
        return 0;
      }, // Warning: 'point' input will be modified and re-used (for performance)
    },
  ]);

  function SweepEvent(point, isLeft) {
    _classCallCheck(this, SweepEvent);

    if (point.events === undefined) point.events = [this];
    else point.events.push(this);
    this.point = point;
    this.isLeft = isLeft; // this.segment, this.otherSE set by factory
  }

  _createClass(SweepEvent, [
    {
      key: 'link',
      value: function link(other) {
        if (other.point === this.point) {
          throw new Error('Tried to link already linked events');
        }

        const otherEvents = other.point.events;

        for (let i = 0, iMax = otherEvents.length; i < iMax; i++) {
          const evt = otherEvents[i];
          this.point.events.push(evt);
          evt.point = this.point;
        }

        this.checkForConsuming();
      },
      /* Do a pass over our linked events and check to see if any pair
       * of segments match, and should be consumed. */
    },
    {
      key: 'checkForConsuming',
      value: function checkForConsuming() {
        // FIXME: The loops in this method run O(n^2) => no good.
        //        Maintain little ordered sweep event trees?
        //        Can we maintaining an ordering that avoids the need
        //        for the re-sorting with getLeftmostComparator in geom-out?
        // Compare each pair of events to see if other events also match
        const numEvents = this.point.events.length;

        for (let i = 0; i < numEvents; i++) {
          const evt1 = this.point.events[i];
          if (evt1.segment.consumedBy !== undefined) continue;

          for (let j = i + 1; j < numEvents; j++) {
            const evt2 = this.point.events[j];
            if (evt2.consumedBy !== undefined) continue;
            if (evt1.otherSE.point.events !== evt2.otherSE.point.events) continue;
            evt1.segment.consume(evt2.segment);
          }
        }
      },
    },
    {
      key: 'getAvailableLinkedEvents',
      value: function getAvailableLinkedEvents() {
        // point.events is always of length 2 or greater
        const events = [];

        for (let i = 0, iMax = this.point.events.length; i < iMax; i++) {
          const evt = this.point.events[i];

          if (evt !== this && !evt.segment.ringOut && evt.segment.isInResult()) {
            events.push(evt);
          }
        }

        return events;
      },
      /**
       * Returns a comparator function for sorting linked events that will
       * favor the event that will give us the smallest left-side angle.
       * All ring construction starts as low as possible heading to the right,
       * so by always turning left as sharp as possible we'll get polygons
       * without uncessary loops & holes.
       *
       * The comparator function has a compute cache such that it avoids
       * re-computing already-computed values.
       */
    },
    {
      key: 'getLeftmostComparator',
      value: function getLeftmostComparator(baseEvent) {
        const _this = this;

        const cache = new Map();

        const fillCache = function fillCache(linkedEvent) {
          const nextEvent = linkedEvent.otherSE;
          cache.set(linkedEvent, {
            sine: sineOfAngle(_this.point, baseEvent.point, nextEvent.point),
            cosine: cosineOfAngle(_this.point, baseEvent.point, nextEvent.point),
          });
        };

        return function (a, b) {
          if (!cache.has(a)) fillCache(a);
          if (!cache.has(b)) fillCache(b);

          const _cache$get = cache.get(a),
            asine = _cache$get.sine,
            acosine = _cache$get.cosine;

          const _cache$get2 = cache.get(b),
            bsine = _cache$get2.sine,
            bcosine = _cache$get2.cosine; // both on or above x-axis

          if (asine >= 0 && bsine >= 0) {
            if (acosine < bcosine) return 1;
            if (acosine > bcosine) return -1;
            return 0;
          } // both below x-axis

          if (asine < 0 && bsine < 0) {
            if (acosine < bcosine) return -1;
            if (acosine > bcosine) return 1;
            return 0;
          } // one above x-axis, one below

          if (bsine < asine) return -1;
          if (bsine > asine) return 1;
          return 0;
        };
      },
    },
  ]);

  return SweepEvent;
})();

// segments and sweep events when all else is identical

let segmentId = 0;

var Segment = /*#__PURE__*/ (function () {
  _createClass(Segment, null, [
    {
      key: 'compare',

      /* This compare() function is for ordering segments in the sweep
       * line tree, and does so according to the following criteria:
       *
       * Consider the vertical line that lies an infinestimal step to the
       * right of the right-more of the two left endpoints of the input
       * segments. Imagine slowly moving a point up from negative infinity
       * in the increasing y direction. Which of the two segments will that
       * point intersect first? That segment comes 'before' the other one.
       *
       * If neither segment would be intersected by such a line, (if one
       * or more of the segments are vertical) then the line to be considered
       * is directly on the right-more of the two left inputs.
       */
      value: function compare(a, b) {
        const alx = a.leftSE.point.x;
        const blx = b.leftSE.point.x;
        const arx = a.rightSE.point.x;
        const brx = b.rightSE.point.x; // check if they're even in the same vertical plane

        if (brx < alx) return 1;
        if (arx < blx) return -1;
        const aly = a.leftSE.point.y;
        const bly = b.leftSE.point.y;
        const ary = a.rightSE.point.y;
        const bry = b.rightSE.point.y; // is left endpoint of segment B the right-more?

        if (alx < blx) {
          // are the two segments in the same horizontal plane?
          if (bly < aly && bly < ary) return 1;
          if (bly > aly && bly > ary) return -1; // is the B left endpoint colinear to segment A?

          const aCmpBLeft = a.comparePoint(b.leftSE.point);
          if (aCmpBLeft < 0) return 1;
          if (aCmpBLeft > 0) return -1; // is the A right endpoint colinear to segment B ?

          const bCmpARight = b.comparePoint(a.rightSE.point);
          if (bCmpARight !== 0) return bCmpARight; // colinear segments, consider the one with left-more
          // left endpoint to be first (arbitrary?)

          return -1;
        } // is left endpoint of segment A the right-more?

        if (alx > blx) {
          if (aly < bly && aly < bry) return -1;
          if (aly > bly && aly > bry) return 1; // is the A left endpoint colinear to segment B?

          const bCmpALeft = b.comparePoint(a.leftSE.point);
          if (bCmpALeft !== 0) return bCmpALeft; // is the B right endpoint colinear to segment A?

          const aCmpBRight = a.comparePoint(b.rightSE.point);
          if (aCmpBRight < 0) return 1;
          if (aCmpBRight > 0) return -1; // colinear segments, consider the one with left-more
          // left endpoint to be first (arbitrary?)

          return 1;
        } // if we get here, the two left endpoints are in the same
        // vertical plane, ie alx === blx
        // consider the lower left-endpoint to come first

        if (aly < bly) return -1;
        if (aly > bly) return 1; // left endpoints are identical
        // check for colinearity by using the left-more right endpoint
        // is the A right endpoint more left-more?

        if (arx < brx) {
          const _bCmpARight = b.comparePoint(a.rightSE.point);

          if (_bCmpARight !== 0) return _bCmpARight;
        } // is the B right endpoint more left-more?

        if (arx > brx) {
          const _aCmpBRight = a.comparePoint(b.rightSE.point);

          if (_aCmpBRight < 0) return 1;
          if (_aCmpBRight > 0) return -1;
        }

        if (arx !== brx) {
          // are these two [almost] vertical segments with opposite orientation?
          // if so, the one with the lower right endpoint comes first
          const ay = ary - aly;
          const ax = arx - alx;
          const by = bry - bly;
          const bx = brx - blx;
          if (ay > ax && by < bx) return 1;
          if (ay < ax && by > bx) return -1;
        } // we have colinear segments with matching orientation
        // consider the one with more left-more right endpoint to be first

        if (arx > brx) return 1;
        if (arx < brx) return -1; // if we get here, two two right endpoints are in the same
        // vertical plane, ie arx === brx
        // consider the lower right-endpoint to come first

        if (ary < bry) return -1;
        if (ary > bry) return 1; // right endpoints identical as well, so the segments are idential
        // fall back on creation order as consistent tie-breaker

        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1; // identical segment, ie a === b

        return 0;
      },
      /* Warning: a reference to ringWindings input will be stored,
       *  and possibly will be later modified */
    },
  ]);

  function Segment(leftSE, rightSE, rings, windings) {
    _classCallCheck(this, Segment);

    this.id = ++segmentId;
    this.leftSE = leftSE;
    leftSE.segment = this;
    leftSE.otherSE = rightSE;
    this.rightSE = rightSE;
    rightSE.segment = this;
    rightSE.otherSE = leftSE;
    this.rings = rings;
    this.windings = windings; // left unset for performance, set later in algorithm
    // this.ringOut, this.consumedBy, this.prev
  }

  _createClass(
    Segment,
    [
      {
        key: 'replaceRightSE',

        /* When a segment is split, the rightSE is replaced with a new sweep event */
        value: function replaceRightSE(newRightSE) {
          this.rightSE = newRightSE;
          this.rightSE.segment = this;
          this.rightSE.otherSE = this.leftSE;
          this.leftSE.otherSE = this.rightSE;
        },
      },
      {
        key: 'bbox',
        value: function bbox() {
          const y1 = this.leftSE.point.y;
          const y2 = this.rightSE.point.y;
          return {
            ll: {
              x: this.leftSE.point.x,
              y: y1 < y2 ? y1 : y2,
            },
            ur: {
              x: this.rightSE.point.x,
              y: y1 > y2 ? y1 : y2,
            },
          };
        },
        /* A vector from the left point to the right */
      },
      {
        key: 'vector',
        value: function vector() {
          return {
            x: this.rightSE.point.x - this.leftSE.point.x,
            y: this.rightSE.point.y - this.leftSE.point.y,
          };
        },
      },
      {
        key: 'isAnEndpoint',
        value: function isAnEndpoint(pt) {
          return (
            (pt.x === this.leftSE.point.x && pt.y === this.leftSE.point.y) ||
            (pt.x === this.rightSE.point.x && pt.y === this.rightSE.point.y)
          );
        },
        /* Compare this segment with a point.
         *
         * A point P is considered to be colinear to a segment if there
         * exists a distance D such that if we travel along the segment
         * from one * endpoint towards the other a distance D, we find
         * ourselves at point P.
         *
         * Return value indicates:
         *
         *   1: point lies above the segment (to the left of vertical)
         *   0: point is colinear to segment
         *  -1: point lies below the segment (to the right of vertical)
         */
      },
      {
        key: 'comparePoint',
        value: function comparePoint(point) {
          if (this.isAnEndpoint(point)) return 0;
          const lPt = this.leftSE.point;
          const rPt = this.rightSE.point;
          const v = this.vector(); // Exactly vertical segments.

          if (lPt.x === rPt.x) {
            if (point.x === lPt.x) return 0;
            return point.x < lPt.x ? 1 : -1;
          } // Nearly vertical segments with an intersection.
          // Check to see where a point on the line with matching Y coordinate is.

          const yDist = (point.y - lPt.y) / v.y;
          const xFromYDist = lPt.x + yDist * v.x;
          if (point.x === xFromYDist) return 0; // General case.
          // Check to see where a point on the line with matching X coordinate is.

          const xDist = (point.x - lPt.x) / v.x;
          const yFromXDist = lPt.y + xDist * v.y;
          if (point.y === yFromXDist) return 0;
          return point.y < yFromXDist ? -1 : 1;
        },
        /**
         * Given another segment, returns the first non-trivial intersection
         * between the two segments (in terms of sweep line ordering), if it exists.
         *
         * A 'non-trivial' intersection is one that will cause one or both of the
         * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
         *
         *   * endpoint of segA with endpoint of segB --> trivial
         *   * endpoint of segA with point along segB --> non-trivial
         *   * endpoint of segB with point along segA --> non-trivial
         *   * point along segA with point along segB --> non-trivial
         *
         * If no non-trivial intersection exists, return null
         * Else, return null.
         */
      },
      {
        key: 'getIntersection',
        value: function getIntersection(other) {
          // If bboxes don't overlap, there can't be any intersections
          const tBbox = this.bbox();
          const oBbox = other.bbox();
          const bboxOverlap = getBboxOverlap(tBbox, oBbox);
          if (bboxOverlap === null) return null; // We first check to see if the endpoints can be considered intersections.
          // This will 'snap' intersections to endpoints if possible, and will
          // handle cases of colinearity.

          const tlp = this.leftSE.point;
          const trp = this.rightSE.point;
          const olp = other.leftSE.point;
          const orp = other.rightSE.point; // does each endpoint touch the other segment?
          // note that we restrict the 'touching' definition to only allow segments
          // to touch endpoints that lie forward from where we are in the sweep line pass

          const touchesOtherLSE = isInBbox(tBbox, olp) && this.comparePoint(olp) === 0;
          const touchesThisLSE = isInBbox(oBbox, tlp) && other.comparePoint(tlp) === 0;
          const touchesOtherRSE = isInBbox(tBbox, orp) && this.comparePoint(orp) === 0;
          const touchesThisRSE = isInBbox(oBbox, trp) && other.comparePoint(trp) === 0; // do left endpoints match?

          if (touchesThisLSE && touchesOtherLSE) {
            // these two cases are for colinear segments with matching left
            // endpoints, and one segment being longer than the other
            if (touchesThisRSE && !touchesOtherRSE) return trp;
            if (!touchesThisRSE && touchesOtherRSE) return orp; // either the two segments match exactly (two trival intersections)
            // or just on their left endpoint (one trivial intersection

            return null;
          } // does this left endpoint matches (other doesn't)

          if (touchesThisLSE) {
            // check for segments that just intersect on opposing endpoints
            if (touchesOtherRSE) {
              if (tlp.x === orp.x && tlp.y === orp.y) return null;
            } // t-intersection on left endpoint

            return tlp;
          } // does other left endpoint matches (this doesn't)

          if (touchesOtherLSE) {
            // check for segments that just intersect on opposing endpoints
            if (touchesThisRSE) {
              if (trp.x === olp.x && trp.y === olp.y) return null;
            } // t-intersection on left endpoint

            return olp;
          } // trivial intersection on right endpoints

          if (touchesThisRSE && touchesOtherRSE) return null; // t-intersections on just one right endpoint

          if (touchesThisRSE) return trp;
          if (touchesOtherRSE) return orp; // None of our endpoints intersect. Look for a general intersection between
          // infinite lines laid over the segments

          const pt = intersection(tlp, this.vector(), olp, other.vector()); // are the segments parrallel? Note that if they were colinear with overlap,
          // they would have an endpoint intersection and that case was already handled above

          if (pt === null) return null; // is the intersection found between the lines not on the segments?

          if (!isInBbox(bboxOverlap, pt)) return null; // round the the computed point if needed

          return rounder.round(pt.x, pt.y);
        },
        /**
         * Split the given segment into multiple segments on the given points.
         *  * Each existing segment will retain its leftSE and a new rightSE will be
         *    generated for it.
         *  * A new segment will be generated which will adopt the original segment's
         *    rightSE, and a new leftSE will be generated for it.
         *  * If there are more than two points given to split on, new segments
         *    in the middle will be generated with new leftSE and rightSE's.
         *  * An array of the newly generated SweepEvents will be returned.
         *
         * Warning: input array of points is modified
         */
      },
      {
        key: 'split',
        value: function split(point) {
          const newEvents = [];
          const alreadyLinked = point.events !== undefined;
          const newLeftSE = new SweepEvent(point, true);
          const newRightSE = new SweepEvent(point, false);
          const oldRightSE = this.rightSE;
          this.replaceRightSE(newRightSE);
          newEvents.push(newRightSE);
          newEvents.push(newLeftSE);
          const newSeg = new Segment(
            newLeftSE,
            oldRightSE,
            this.rings.slice(),
            this.windings.slice(),
          ); // when splitting a nearly vertical downward-facing segment,
          // sometimes one of the resulting new segments is vertical, in which
          // case its left and right events may need to be swapped

          if (SweepEvent.comparePoints(newSeg.leftSE.point, newSeg.rightSE.point) > 0) {
            newSeg.swapEvents();
          }

          if (SweepEvent.comparePoints(this.leftSE.point, this.rightSE.point) > 0) {
            this.swapEvents();
          } // in the point we just used to create new sweep events with was already
          // linked to other events, we need to check if either of the affected
          // segments should be consumed

          if (alreadyLinked) {
            newLeftSE.checkForConsuming();
            newRightSE.checkForConsuming();
          }

          return newEvents;
        },
        /* Swap which event is left and right */
      },
      {
        key: 'swapEvents',
        value: function swapEvents() {
          const tmpEvt = this.rightSE;
          this.rightSE = this.leftSE;
          this.leftSE = tmpEvt;
          this.leftSE.isLeft = true;
          this.rightSE.isLeft = false;

          for (let i = 0, iMax = this.windings.length; i < iMax; i++) {
            this.windings[i] *= -1;
          }
        },
        /* Consume another segment. We take their rings under our wing
         * and mark them as consumed. Use for perfectly overlapping segments */
      },
      {
        key: 'consume',
        value: function consume(other) {
          let consumer = this;
          let consumee = other;

          while (consumer.consumedBy) {
            consumer = consumer.consumedBy;
          }

          while (consumee.consumedBy) {
            consumee = consumee.consumedBy;
          }

          const cmp = Segment.compare(consumer, consumee);
          if (cmp === 0) return; // already consumed
          // the winner of the consumption is the earlier segment
          // according to sweep line ordering

          if (cmp > 0) {
            const tmp = consumer;
            consumer = consumee;
            consumee = tmp;
          } // make sure a segment doesn't consume it's prev

          if (consumer.prev === consumee) {
            const _tmp = consumer;
            consumer = consumee;
            consumee = _tmp;
          }

          for (let i = 0, iMax = consumee.rings.length; i < iMax; i++) {
            const ring = consumee.rings[i];
            const winding = consumee.windings[i];
            const index = consumer.rings.indexOf(ring);

            if (index === -1) {
              consumer.rings.push(ring);
              consumer.windings.push(winding);
            } else consumer.windings[index] += winding;
          }

          consumee.rings = null;
          consumee.windings = null;
          consumee.consumedBy = consumer; // mark sweep events consumed as to maintain ordering in sweep event queue

          consumee.leftSE.consumedBy = consumer.leftSE;
          consumee.rightSE.consumedBy = consumer.rightSE;
        },
        /* The first segment previous segment chain that is in the result */
      },
      {
        key: 'prevInResult',
        value: function prevInResult() {
          if (this._prevInResult !== undefined) return this._prevInResult;
          if (!this.prev) this._prevInResult = null;
          else if (this.prev.isInResult()) this._prevInResult = this.prev;
          else this._prevInResult = this.prev.prevInResult();
          return this._prevInResult;
        },
      },
      {
        key: 'beforeState',
        value: function beforeState() {
          if (this._beforeState !== undefined) return this._beforeState;
          if (!this.prev)
            this._beforeState = {
              rings: [],
              windings: [],
              multiPolys: [],
            };
          else {
            const seg = this.prev.consumedBy || this.prev;
            this._beforeState = seg.afterState();
          }
          return this._beforeState;
        },
      },
      {
        key: 'afterState',
        value: function afterState() {
          if (this._afterState !== undefined) return this._afterState;
          const beforeState = this.beforeState();
          this._afterState = {
            rings: beforeState.rings.slice(0),
            windings: beforeState.windings.slice(0),
            multiPolys: [],
          };
          const ringsAfter = this._afterState.rings;
          const windingsAfter = this._afterState.windings;
          const mpsAfter = this._afterState.multiPolys; // calculate ringsAfter, windingsAfter

          for (let i = 0, iMax = this.rings.length; i < iMax; i++) {
            const ring = this.rings[i];
            const winding = this.windings[i];
            const index = ringsAfter.indexOf(ring);

            if (index === -1) {
              ringsAfter.push(ring);
              windingsAfter.push(winding);
            } else windingsAfter[index] += winding;
          } // calcualte polysAfter

          const polysAfter = [];
          const polysExclude = [];

          for (let _i = 0, _iMax = ringsAfter.length; _i < _iMax; _i++) {
            if (windingsAfter[_i] === 0) continue; // non-zero rule

            const _ring = ringsAfter[_i];
            const poly = _ring.poly;
            if (polysExclude.indexOf(poly) !== -1) continue;
            if (_ring.isExterior) polysAfter.push(poly);
            else {
              if (polysExclude.indexOf(poly) === -1) polysExclude.push(poly);

              const _index = polysAfter.indexOf(_ring.poly);

              if (_index !== -1) polysAfter.splice(_index, 1);
            }
          } // calculate multiPolysAfter

          for (let _i2 = 0, _iMax2 = polysAfter.length; _i2 < _iMax2; _i2++) {
            const mp = polysAfter[_i2].multiPoly;
            if (mpsAfter.indexOf(mp) === -1) mpsAfter.push(mp);
          }

          return this._afterState;
        },
        /* Is this segment part of the final result? */
      },
      {
        key: 'isInResult',
        value: function isInResult() {
          // if we've been consumed, we're not in the result
          if (this.consumedBy) return false;
          if (this._isInResult !== undefined) return this._isInResult;
          const mpsBefore = this.beforeState().multiPolys;
          const mpsAfter = this.afterState().multiPolys;

          switch (operation.type) {
            case 'union': {
              // UNION - included iff:
              //  * On one side of us there is 0 poly interiors AND
              //  * On the other side there is 1 or more.
              const noBefores = mpsBefore.length === 0;
              const noAfters = mpsAfter.length === 0;
              this._isInResult = noBefores !== noAfters;
              break;
            }

            case 'intersection': {
              // INTERSECTION - included iff:
              //  * on one side of us all multipolys are rep. with poly interiors AND
              //  * on the other side of us, not all multipolys are repsented
              //    with poly interiors
              let least;
              let most;

              if (mpsBefore.length < mpsAfter.length) {
                least = mpsBefore.length;
                most = mpsAfter.length;
              } else {
                least = mpsAfter.length;
                most = mpsBefore.length;
              }

              this._isInResult = most === operation.numMultiPolys && least < most;
              break;
            }

            case 'xor': {
              // XOR - included iff:
              //  * the difference between the number of multipolys represented
              //    with poly interiors on our two sides is an odd number
              const diff = Math.abs(mpsBefore.length - mpsAfter.length);
              this._isInResult = diff % 2 === 1;
              break;
            }

            case 'difference': {
              // DIFFERENCE included iff:
              //  * on exactly one side, we have just the subject
              const isJustSubject = function isJustSubject(mps) {
                return mps.length === 1 && mps[0].isSubject;
              };

              this._isInResult = isJustSubject(mpsBefore) !== isJustSubject(mpsAfter);
              break;
            }

            default:
              throw new Error('Unrecognized operation type found '.concat(operation.type));
          }

          return this._isInResult;
        },
      },
    ],
    [
      {
        key: 'fromRing',
        value: function fromRing(pt1, pt2, ring) {
          let leftPt, rightPt, winding; // ordering the two points according to sweep line ordering

          const cmpPts = SweepEvent.comparePoints(pt1, pt2);

          if (cmpPts < 0) {
            leftPt = pt1;
            rightPt = pt2;
            winding = 1;
          } else if (cmpPts > 0) {
            leftPt = pt2;
            rightPt = pt1;
            winding = -1;
          } else
            throw new Error(
              'Tried to create degenerate segment at ['.concat(pt1.x, ', ').concat(pt1.y, ']'),
            );

          const leftSE = new SweepEvent(leftPt, true);
          const rightSE = new SweepEvent(rightPt, false);
          return new Segment(leftSE, rightSE, [ring], [winding]);
        },
      },
    ],
  );

  return Segment;
})();

const RingIn = /*#__PURE__*/ (function () {
  function RingIn(geomRing, poly, isExterior) {
    _classCallCheck(this, RingIn);

    if (!Array.isArray(geomRing) || geomRing.length === 0) {
      throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
    }

    this.poly = poly;
    this.isExterior = isExterior;
    this.segments = [];

    if (typeof geomRing[0][0] !== 'number' || typeof geomRing[0][1] !== 'number') {
      throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
    }

    const firstPoint = rounder.round(geomRing[0][0], geomRing[0][1]);
    this.bbox = {
      ll: {
        x: firstPoint.x,
        y: firstPoint.y,
      },
      ur: {
        x: firstPoint.x,
        y: firstPoint.y,
      },
    };
    let prevPoint = firstPoint;

    for (let i = 1, iMax = geomRing.length; i < iMax; i++) {
      if (typeof geomRing[i][0] !== 'number' || typeof geomRing[i][1] !== 'number') {
        throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
      }

      const point = rounder.round(geomRing[i][0], geomRing[i][1]); // skip repeated points

      if (point.x === prevPoint.x && point.y === prevPoint.y) continue;
      this.segments.push(Segment.fromRing(prevPoint, point, this));
      if (point.x < this.bbox.ll.x) this.bbox.ll.x = point.x;
      if (point.y < this.bbox.ll.y) this.bbox.ll.y = point.y;
      if (point.x > this.bbox.ur.x) this.bbox.ur.x = point.x;
      if (point.y > this.bbox.ur.y) this.bbox.ur.y = point.y;
      prevPoint = point;
    } // add segment from last to first if last is not the same as first

    if (firstPoint.x !== prevPoint.x || firstPoint.y !== prevPoint.y) {
      this.segments.push(Segment.fromRing(prevPoint, firstPoint, this));
    }
  }

  _createClass(RingIn, [
    {
      key: 'getSweepEvents',
      value: function getSweepEvents() {
        const sweepEvents = [];

        for (let i = 0, iMax = this.segments.length; i < iMax; i++) {
          const segment = this.segments[i];
          sweepEvents.push(segment.leftSE);
          sweepEvents.push(segment.rightSE);
        }

        return sweepEvents;
      },
    },
  ]);

  return RingIn;
})();
const PolyIn = /*#__PURE__*/ (function () {
  function PolyIn(geomPoly, multiPoly) {
    _classCallCheck(this, PolyIn);

    if (!Array.isArray(geomPoly)) {
      throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
    }

    this.exteriorRing = new RingIn(geomPoly[0], this, true); // copy by value

    this.bbox = {
      ll: {
        x: this.exteriorRing.bbox.ll.x,
        y: this.exteriorRing.bbox.ll.y,
      },
      ur: {
        x: this.exteriorRing.bbox.ur.x,
        y: this.exteriorRing.bbox.ur.y,
      },
    };
    this.interiorRings = [];

    for (let i = 1, iMax = geomPoly.length; i < iMax; i++) {
      const ring = new RingIn(geomPoly[i], this, false);
      if (ring.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = ring.bbox.ll.x;
      if (ring.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = ring.bbox.ll.y;
      if (ring.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = ring.bbox.ur.x;
      if (ring.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = ring.bbox.ur.y;
      this.interiorRings.push(ring);
    }

    this.multiPoly = multiPoly;
  }

  _createClass(PolyIn, [
    {
      key: 'getSweepEvents',
      value: function getSweepEvents() {
        const sweepEvents = this.exteriorRing.getSweepEvents();

        for (let i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
          const ringSweepEvents = this.interiorRings[i].getSweepEvents();

          for (let j = 0, jMax = ringSweepEvents.length; j < jMax; j++) {
            sweepEvents.push(ringSweepEvents[j]);
          }
        }

        return sweepEvents;
      },
    },
  ]);

  return PolyIn;
})();
const MultiPolyIn = /*#__PURE__*/ (function () {
  function MultiPolyIn(geom, isSubject) {
    _classCallCheck(this, MultiPolyIn);

    if (!Array.isArray(geom)) {
      throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
    }

    try {
      // if the input looks like a polygon, convert it to a multipolygon
      if (typeof geom[0][0][0] === 'number') geom = [geom];
    } catch (ex) {
      // The input is either malformed or has empty arrays.
      // In either case, it will be handled later on.
    }

    this.polys = [];
    this.bbox = {
      ll: {
        x: Number.POSITIVE_INFINITY,
        y: Number.POSITIVE_INFINITY,
      },
      ur: {
        x: Number.NEGATIVE_INFINITY,
        y: Number.NEGATIVE_INFINITY,
      },
    };

    for (let i = 0, iMax = geom.length; i < iMax; i++) {
      const poly = new PolyIn(geom[i], this);
      if (poly.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = poly.bbox.ll.x;
      if (poly.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = poly.bbox.ll.y;
      if (poly.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = poly.bbox.ur.x;
      if (poly.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = poly.bbox.ur.y;
      this.polys.push(poly);
    }

    this.isSubject = isSubject;
  }

  _createClass(MultiPolyIn, [
    {
      key: 'getSweepEvents',
      value: function getSweepEvents() {
        const sweepEvents = [];

        for (let i = 0, iMax = this.polys.length; i < iMax; i++) {
          const polySweepEvents = this.polys[i].getSweepEvents();

          for (let j = 0, jMax = polySweepEvents.length; j < jMax; j++) {
            sweepEvents.push(polySweepEvents[j]);
          }
        }

        return sweepEvents;
      },
    },
  ]);

  return MultiPolyIn;
})();

const RingOut = /*#__PURE__*/ (function () {
  _createClass(RingOut, null, [
    {
      key: 'factory',

      /* Given the segments from the sweep line pass, compute & return a series
       * of closed rings from all the segments marked to be part of the result */
      value: function factory(allSegments) {
        const ringsOut = [];

        for (let i = 0, iMax = allSegments.length; i < iMax; i++) {
          const segment = allSegments[i];
          if (!segment.isInResult() || segment.ringOut) continue;
          let prevEvent = null;
          let event = segment.leftSE;
          let nextEvent = segment.rightSE;
          const events = [event];
          const startingPoint = event.point;
          const intersectionLEs = [];
          /* Walk the chain of linked events to form a closed ring */

          while (true) {
            prevEvent = event;
            event = nextEvent;
            events.push(event);
            /* Is the ring complete? */

            if (event.point === startingPoint) break;

            while (true) {
              const availableLEs = event.getAvailableLinkedEvents();
              /* Did we hit a dead end? This shouldn't happen. Indicates some earlier
               * part of the algorithm malfunctioned... please file a bug report. */

              if (availableLEs.length === 0) {
                const firstPt = events[0].point;
                const lastPt = events[events.length - 1].point;
                throw new Error(
                  'Unable to complete output ring starting at ['.concat(firstPt.x, ',') +
                    ' '.concat(firstPt.y, ']. Last matching segment found ends at') +
                    ' ['.concat(lastPt.x, ', ').concat(lastPt.y, '].'),
                );
              }
              /* Only one way to go, so cotinue on the path */

              if (availableLEs.length === 1) {
                nextEvent = availableLEs[0].otherSE;
                break;
              }
              /* We must have an intersection. Check for a completed loop */

              let indexLE = null;

              for (let j = 0, jMax = intersectionLEs.length; j < jMax; j++) {
                if (intersectionLEs[j].point === event.point) {
                  indexLE = j;
                  break;
                }
              }
              /* Found a completed loop. Cut that off and make a ring */

              if (indexLE !== null) {
                const intersectionLE = intersectionLEs.splice(indexLE)[0];
                const ringEvents = events.splice(intersectionLE.index);
                ringEvents.unshift(ringEvents[0].otherSE);
                ringsOut.push(new RingOut(ringEvents.reverse()));
                continue;
              }
              /* register the intersection */

              intersectionLEs.push({
                index: events.length,
                point: event.point,
              });
              /* Choose the left-most option to continue the walk */

              const comparator = event.getLeftmostComparator(prevEvent);
              nextEvent = availableLEs.sort(comparator)[0].otherSE;
              break;
            }
          }

          ringsOut.push(new RingOut(events));
        }

        return ringsOut;
      },
    },
  ]);

  function RingOut(events) {
    _classCallCheck(this, RingOut);

    this.events = events;

    for (let i = 0, iMax = events.length; i < iMax; i++) {
      events[i].segment.ringOut = this;
    }

    this.poly = null;
  }

  _createClass(RingOut, [
    {
      key: 'getGeom',
      value: function getGeom() {
        // Remove superfluous points (ie extra points along a straight line),
        let prevPt = this.events[0].point;
        const points = [prevPt];

        for (let i = 1, iMax = this.events.length - 1; i < iMax; i++) {
          const _pt = this.events[i].point;
          const _nextPt = this.events[i + 1].point;
          if (compareVectorAngles(_pt, prevPt, _nextPt) === 0) continue;
          points.push(_pt);
          prevPt = _pt;
        } // ring was all (within rounding error of angle calc) colinear points

        if (points.length === 1) return null; // check if the starting point is necessary

        const pt = points[0];
        const nextPt = points[1];
        if (compareVectorAngles(pt, prevPt, nextPt) === 0) points.shift();
        points.push(points[0]);
        const step = this.isExteriorRing() ? 1 : -1;
        const iStart = this.isExteriorRing() ? 0 : points.length - 1;
        const iEnd = this.isExteriorRing() ? points.length : -1;
        const orderedPoints = [];

        for (let _i = iStart; _i != iEnd; _i += step) {
          orderedPoints.push([points[_i].x, points[_i].y]);
        }

        return orderedPoints;
      },
    },
    {
      key: 'isExteriorRing',
      value: function isExteriorRing() {
        if (this._isExteriorRing === undefined) {
          const enclosing = this.enclosingRing();
          this._isExteriorRing = enclosing ? !enclosing.isExteriorRing() : true;
        }

        return this._isExteriorRing;
      },
    },
    {
      key: 'enclosingRing',
      value: function enclosingRing() {
        if (this._enclosingRing === undefined) {
          this._enclosingRing = this._calcEnclosingRing();
        }

        return this._enclosingRing;
      },
      /* Returns the ring that encloses this one, if any */
    },
    {
      key: '_calcEnclosingRing',
      value: function _calcEnclosingRing() {
        // start with the ealier sweep line event so that the prevSeg
        // chain doesn't lead us inside of a loop of ours
        let leftMostEvt = this.events[0];

        for (let i = 1, iMax = this.events.length; i < iMax; i++) {
          const evt = this.events[i];
          if (SweepEvent.compare(leftMostEvt, evt) > 0) leftMostEvt = evt;
        }

        let prevSeg = leftMostEvt.segment.prevInResult();
        let prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;

        while (true) {
          // no segment found, thus no ring can enclose us
          if (!prevSeg) return null; // no segments below prev segment found, thus the ring of the prev
          // segment must loop back around and enclose us

          if (!prevPrevSeg) return prevSeg.ringOut; // if the two segments are of different rings, the ring of the prev
          // segment must either loop around us or the ring of the prev prev
          // seg, which would make us and the ring of the prev peers

          if (prevPrevSeg.ringOut !== prevSeg.ringOut) {
            if (prevPrevSeg.ringOut.enclosingRing() !== prevSeg.ringOut) {
              return prevSeg.ringOut;
            } else return prevSeg.ringOut.enclosingRing();
          } // two segments are from the same ring, so this was a penisula
          // of that ring. iterate downward, keep searching

          prevSeg = prevPrevSeg.prevInResult();
          prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;
        }
      },
    },
  ]);

  return RingOut;
})();
const PolyOut = /*#__PURE__*/ (function () {
  function PolyOut(exteriorRing) {
    _classCallCheck(this, PolyOut);

    this.exteriorRing = exteriorRing;
    exteriorRing.poly = this;
    this.interiorRings = [];
  }

  _createClass(PolyOut, [
    {
      key: 'addInterior',
      value: function addInterior(ring) {
        this.interiorRings.push(ring);
        ring.poly = this;
      },
    },
    {
      key: 'getGeom',
      value: function getGeom() {
        const geom = [this.exteriorRing.getGeom()]; // exterior ring was all (within rounding error of angle calc) colinear points

        if (geom[0] === null) return null;

        for (let i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
          const ringGeom = this.interiorRings[i].getGeom(); // interior ring was all (within rounding error of angle calc) colinear points

          if (ringGeom === null) continue;
          geom.push(ringGeom);
        }

        return geom;
      },
    },
  ]);

  return PolyOut;
})();
const MultiPolyOut = /*#__PURE__*/ (function () {
  function MultiPolyOut(rings) {
    _classCallCheck(this, MultiPolyOut);

    this.rings = rings;
    this.polys = this._composePolys(rings);
  }

  _createClass(MultiPolyOut, [
    {
      key: 'getGeom',
      value: function getGeom() {
        const geom = [];

        for (let i = 0, iMax = this.polys.length; i < iMax; i++) {
          const polyGeom = this.polys[i].getGeom(); // exterior ring was all (within rounding error of angle calc) colinear points

          if (polyGeom === null) continue;
          geom.push(polyGeom);
        }

        return geom;
      },
    },
    {
      key: '_composePolys',
      value: function _composePolys(rings) {
        const polys = [];

        for (let i = 0, iMax = rings.length; i < iMax; i++) {
          const ring = rings[i];
          if (ring.poly) continue;
          if (ring.isExteriorRing()) polys.push(new PolyOut(ring));
          else {
            const enclosingRing = ring.enclosingRing();
            if (!enclosingRing.poly) polys.push(new PolyOut(enclosingRing));
            enclosingRing.poly.addInterior(ring);
          }
        }

        return polys;
      },
    },
  ]);

  return MultiPolyOut;
})();

/**
 * NOTE:  We must be careful not to change any segments while
 *        they are in the SplayTree. AFAIK, there's no way to tell
 *        the tree to rebalance itself - thus before splitting
 *        a segment that's in the tree, we remove it from the tree,
 *        do the split, then re-insert it. (Even though splitting a
 *        segment *shouldn't* change its correct position in the
 *        sweep line tree, the reality is because of rounding errors,
 *        it sometimes does.)
 */

const SweepLine = /*#__PURE__*/ (function () {
  function SweepLine(queue) {
    const comparator =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Segment.compare;

    _classCallCheck(this, SweepLine);

    this.queue = queue;
    this.tree = new SplayTree(comparator);
    this.segments = [];
  }

  _createClass(SweepLine, [
    {
      key: 'process',
      value: function process(event) {
        const segment = event.segment;
        const newEvents = []; // if we've already been consumed by another segment,
        // clean up our body parts and get out

        if (event.consumedBy) {
          if (event.isLeft) this.queue.remove(event.otherSE);
          else this.tree.remove(segment);
          return newEvents;
        }

        const node = event.isLeft ? this.tree.insert(segment) : this.tree.find(segment);
        if (!node)
          throw new Error(
            'Unable to find segment #'.concat(segment.id, ' ') +
              '['.concat(segment.leftSE.point.x, ', ').concat(segment.leftSE.point.y, '] -> ') +
              '['.concat(segment.rightSE.point.x, ', ').concat(segment.rightSE.point.y, '] ') +
              'in SweepLine tree. Please submit a bug report.',
          );
        let prevNode = node;
        let nextNode = node;
        let prevSeg = undefined;
        let nextSeg = undefined; // skip consumed segments still in tree

        while (prevSeg === undefined) {
          prevNode = this.tree.prev(prevNode);
          if (prevNode === null) prevSeg = null;
          else if (prevNode.key.consumedBy === undefined) prevSeg = prevNode.key;
        } // skip consumed segments still in tree

        while (nextSeg === undefined) {
          nextNode = this.tree.next(nextNode);
          if (nextNode === null) nextSeg = null;
          else if (nextNode.key.consumedBy === undefined) nextSeg = nextNode.key;
        }

        if (event.isLeft) {
          // Check for intersections against the previous segment in the sweep line
          let prevMySplitter = null;

          if (prevSeg) {
            const prevInter = prevSeg.getIntersection(segment);

            if (prevInter !== null) {
              if (!segment.isAnEndpoint(prevInter)) prevMySplitter = prevInter;

              if (!prevSeg.isAnEndpoint(prevInter)) {
                const newEventsFromSplit = this._splitSafely(prevSeg, prevInter);

                for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                  newEvents.push(newEventsFromSplit[i]);
                }
              }
            }
          } // Check for intersections against the next segment in the sweep line

          let nextMySplitter = null;

          if (nextSeg) {
            const nextInter = nextSeg.getIntersection(segment);

            if (nextInter !== null) {
              if (!segment.isAnEndpoint(nextInter)) nextMySplitter = nextInter;

              if (!nextSeg.isAnEndpoint(nextInter)) {
                const _newEventsFromSplit = this._splitSafely(nextSeg, nextInter);

                for (let _i = 0, _iMax = _newEventsFromSplit.length; _i < _iMax; _i++) {
                  newEvents.push(_newEventsFromSplit[_i]);
                }
              }
            }
          } // For simplicity, even if we find more than one intersection we only
          // spilt on the 'earliest' (sweep-line style) of the intersections.
          // The other intersection will be handled in a future process().

          if (prevMySplitter !== null || nextMySplitter !== null) {
            let mySplitter = null;
            if (prevMySplitter === null) mySplitter = nextMySplitter;
            else if (nextMySplitter === null) mySplitter = prevMySplitter;
            else {
              const cmpSplitters = SweepEvent.comparePoints(prevMySplitter, nextMySplitter);
              mySplitter = cmpSplitters <= 0 ? prevMySplitter : nextMySplitter;
            } // Rounding errors can cause changes in ordering,
            // so remove afected segments and right sweep events before splitting

            this.queue.remove(segment.rightSE);
            newEvents.push(segment.rightSE);

            const _newEventsFromSplit2 = segment.split(mySplitter);

            for (let _i2 = 0, _iMax2 = _newEventsFromSplit2.length; _i2 < _iMax2; _i2++) {
              newEvents.push(_newEventsFromSplit2[_i2]);
            }
          }

          if (newEvents.length > 0) {
            // We found some intersections, so re-do the current event to
            // make sure sweep line ordering is totally consistent for later
            // use with the segment 'prev' pointers
            this.tree.remove(segment);
            newEvents.push(event);
          } else {
            // done with left event
            this.segments.push(segment);
            segment.prev = prevSeg;
          }
        } else {
          // event.isRight
          // since we're about to be removed from the sweep line, check for
          // intersections between our previous and next segments
          if (prevSeg && nextSeg) {
            const inter = prevSeg.getIntersection(nextSeg);

            if (inter !== null) {
              if (!prevSeg.isAnEndpoint(inter)) {
                const _newEventsFromSplit3 = this._splitSafely(prevSeg, inter);

                for (let _i3 = 0, _iMax3 = _newEventsFromSplit3.length; _i3 < _iMax3; _i3++) {
                  newEvents.push(_newEventsFromSplit3[_i3]);
                }
              }

              if (!nextSeg.isAnEndpoint(inter)) {
                const _newEventsFromSplit4 = this._splitSafely(nextSeg, inter);

                for (let _i4 = 0, _iMax4 = _newEventsFromSplit4.length; _i4 < _iMax4; _i4++) {
                  newEvents.push(_newEventsFromSplit4[_i4]);
                }
              }
            }
          }

          this.tree.remove(segment);
        }

        return newEvents;
      },
      /* Safely split a segment that is currently in the datastructures
       * IE - a segment other than the one that is currently being processed. */
    },
    {
      key: '_splitSafely',
      value: function _splitSafely(seg, pt) {
        // Rounding errors can cause changes in ordering,
        // so remove afected segments and right sweep events before splitting
        // removeNode() doesn't work, so have re-find the seg
        // https://github.com/w8r/splay-tree/pull/5
        this.tree.remove(seg);
        const rightSE = seg.rightSE;
        this.queue.remove(rightSE);
        const newEvents = seg.split(pt);
        newEvents.push(rightSE); // splitting can trigger consumption

        if (seg.consumedBy === undefined) this.tree.insert(seg);
        return newEvents;
      },
    },
  ]);

  return SweepLine;
})();

const POLYGON_CLIPPING_MAX_QUEUE_SIZE =
  (typeof process !== 'undefined' && process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE) || 1000000;
const POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS =
  (typeof process !== 'undefined' && process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS) ||
  1000000;
const Operation = /*#__PURE__*/ (function () {
  function Operation() {
    _classCallCheck(this, Operation);
  }

  _createClass(Operation, [
    {
      key: 'run',
      value: function run(type, geom, moreGeoms) {
        operation.type = type;
        rounder.reset();
        /* Convert inputs to MultiPoly objects */
        const multipolys = [new MultiPolyIn(geom, true)];

        for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
          multipolys.push(new MultiPolyIn(moreGeoms[i], false));
        }

        operation.numMultiPolys = multipolys.length;
        /* BBox optimization for difference operation
         * If the bbox of a multipolygon that's part of the clipping doesn't
         * intersect the bbox of the subject at all, we can just drop that
         * multiploygon. */

        if (operation.type === 'difference') {
          // in place removal
          const subject = multipolys[0];
          let _i = 1;

          while (_i < multipolys.length) {
            if (getBboxOverlap(multipolys[_i].bbox, subject.bbox) !== null) _i++;
            else multipolys.splice(_i, 1);
          }
        }
        /* BBox optimization for intersection operation
         * If we can find any pair of multipolygons whose bbox does not overlap,
         * then the result will be empty. */

        if (operation.type === 'intersection') {
          // TODO: this is O(n^2) in number of polygons. By sorting the bboxes,
          //       it could be optimized to O(n * ln(n))
          for (let _i2 = 0, _iMax = multipolys.length; _i2 < _iMax; _i2++) {
            const mpA = multipolys[_i2];

            for (let j = _i2 + 1, jMax = multipolys.length; j < jMax; j++) {
              if (getBboxOverlap(mpA.bbox, multipolys[j].bbox) === null) return [];
            }
          }
        }
        /* Put segment endpoints in a priority queue */

        const queue = new SplayTree(SweepEvent.compare);

        for (let _i3 = 0, _iMax2 = multipolys.length; _i3 < _iMax2; _i3++) {
          const sweepEvents = multipolys[_i3].getSweepEvents();

          for (let _j = 0, _jMax = sweepEvents.length; _j < _jMax; _j++) {
            queue.insert(sweepEvents[_j]);

            if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
              // prevents an infinite loop, an otherwise common manifestation of bugs
              throw new Error(
                'Infinite loop when putting segment endpoints in a priority queue ' +
                  '(queue size too big). Please file a bug report.',
              );
            }
          }
        }
        /* Pass the sweep line over those endpoints */

        const sweepLine = new SweepLine(queue);
        let prevQueueSize = queue.size;
        let node = queue.pop();

        while (node) {
          const evt = node.key;

          if (queue.size === prevQueueSize) {
            // prevents an infinite loop, an otherwise common manifestation of bugs
            const seg = evt.segment;
            throw new Error(
              'Unable to pop() '.concat(evt.isLeft ? 'left' : 'right', ' SweepEvent ') +
                '['
                  .concat(evt.point.x, ', ')
                  .concat(evt.point.y, '] from segment #')
                  .concat(seg.id, ' ') +
                '['.concat(seg.leftSE.point.x, ', ').concat(seg.leftSE.point.y, '] -> ') +
                '['
                  .concat(seg.rightSE.point.x, ', ')
                  .concat(seg.rightSE.point.y, '] from queue. ') +
                'Please file a bug report.',
            );
          }

          if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
            // prevents an infinite loop, an otherwise common manifestation of bugs
            throw new Error(
              'Infinite loop when passing sweep line over endpoints ' +
                '(queue size too big). Please file a bug report.',
            );
          }

          if (sweepLine.segments.length > POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS) {
            // prevents an infinite loop, an otherwise common manifestation of bugs
            throw new Error(
              'Infinite loop when passing sweep line over endpoints ' +
                '(too many sweep line segments). Please file a bug report.',
            );
          }

          const newEvents = sweepLine.process(evt);

          for (let _i4 = 0, _iMax3 = newEvents.length; _i4 < _iMax3; _i4++) {
            const _evt = newEvents[_i4];
            if (_evt.consumedBy === undefined) queue.insert(_evt);
          }

          prevQueueSize = queue.size;
          node = queue.pop();
        } // free some memory we don't need anymore

        rounder.reset();
        /* Collect and compile segments we're keeping into a multipolygon */

        const ringsOut = RingOut.factory(sweepLine.segments);
        const result = new MultiPolyOut(ringsOut);
        return result.getGeom();
      },
    },
  ]);

  return Operation;
})(); // singleton available by import

var operation = new Operation();

const union = function union(geom) {
  for (
    var _len = arguments.length, moreGeoms = new Array(_len > 1 ? _len - 1 : 0), _key = 1;
    _key < _len;
    _key++
  ) {
    moreGeoms[_key - 1] = arguments[_key];
  }

  return operation.run('union', geom, moreGeoms);
};

const intersection$1 = function intersection(geom) {
  for (
    var _len2 = arguments.length, moreGeoms = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1;
    _key2 < _len2;
    _key2++
  ) {
    moreGeoms[_key2 - 1] = arguments[_key2];
  }

  return operation.run('intersection', geom, moreGeoms);
};

const xor = function xor(geom) {
  for (
    var _len3 = arguments.length, moreGeoms = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1;
    _key3 < _len3;
    _key3++
  ) {
    moreGeoms[_key3 - 1] = arguments[_key3];
  }

  return operation.run('xor', geom, moreGeoms);
};

const difference = function difference(subjectGeom) {
  for (
    var _len4 = arguments.length, clippingGeoms = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1;
    _key4 < _len4;
    _key4++
  ) {
    clippingGeoms[_key4 - 1] = arguments[_key4];
  }

  return operation.run('difference', subjectGeom, clippingGeoms);
};

const index = {
  union: union,
  intersection: intersection$1,
  xor: xor,
  difference: difference,
};

export default index;
