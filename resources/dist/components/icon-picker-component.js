// node_modules/fuse.js/dist/fuse.mjs
function isArray(value) {
  return !Array.isArray ? getTag(value) === "[object Array]" : Array.isArray(value);
}
var INFINITY = 1 / 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  let result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
function toString(value) {
  return value == null ? "" : baseToString(value);
}
function isString(value) {
  return typeof value === "string";
}
function isNumber(value) {
  return typeof value === "number";
}
function isBoolean(value) {
  return value === true || value === false || isObjectLike(value) && getTag(value) == "[object Boolean]";
}
function isObject(value) {
  return typeof value === "object";
}
function isObjectLike(value) {
  return isObject(value) && value !== null;
}
function isDefined(value) {
  return value !== void 0 && value !== null;
}
function isBlank(value) {
  return !value.trim().length;
}
function getTag(value) {
  return value == null ? value === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(value);
}
var INCORRECT_INDEX_TYPE = "Incorrect 'index' type";
var LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY = (key) => `Invalid value for key ${key}`;
var PATTERN_LENGTH_TOO_LARGE = (max) => `Pattern length exceeds max of ${max}.`;
var MISSING_KEY_PROPERTY = (name) => `Missing ${name} property in key`;
var INVALID_KEY_WEIGHT_VALUE = (key) => `Property 'weight' in key '${key}' must be a positive integer`;
var hasOwn = Object.prototype.hasOwnProperty;
var KeyStore = class {
  constructor(keys) {
    this._keys = [];
    this._keyMap = {};
    let totalWeight = 0;
    keys.forEach((key) => {
      let obj = createKey(key);
      this._keys.push(obj);
      this._keyMap[obj.id] = obj;
      totalWeight += obj.weight;
    });
    this._keys.forEach((key) => {
      key.weight /= totalWeight;
    });
  }
  get(keyId) {
    return this._keyMap[keyId];
  }
  keys() {
    return this._keys;
  }
  toJSON() {
    return JSON.stringify(this._keys);
  }
};
function createKey(key) {
  let path = null;
  let id = null;
  let src = null;
  let weight = 1;
  let getFn = null;
  if (isString(key) || isArray(key)) {
    src = key;
    path = createKeyPath(key);
    id = createKeyId(key);
  } else {
    if (!hasOwn.call(key, "name")) {
      throw new Error(MISSING_KEY_PROPERTY("name"));
    }
    const name = key.name;
    src = name;
    if (hasOwn.call(key, "weight")) {
      weight = key.weight;
      if (weight <= 0) {
        throw new Error(INVALID_KEY_WEIGHT_VALUE(name));
      }
    }
    path = createKeyPath(name);
    id = createKeyId(name);
    getFn = key.getFn;
  }
  return { path, id, weight, src, getFn };
}
function createKeyPath(key) {
  return isArray(key) ? key : key.split(".");
}
function createKeyId(key) {
  return isArray(key) ? key.join(".") : key;
}
function get(obj, path) {
  let list = [];
  let arr = false;
  const deepGet = (obj2, path2, index) => {
    if (!isDefined(obj2)) {
      return;
    }
    if (!path2[index]) {
      list.push(obj2);
    } else {
      let key = path2[index];
      const value = obj2[key];
      if (!isDefined(value)) {
        return;
      }
      if (index === path2.length - 1 && (isString(value) || isNumber(value) || isBoolean(value))) {
        list.push(toString(value));
      } else if (isArray(value)) {
        arr = true;
        for (let i = 0, len = value.length; i < len; i += 1) {
          deepGet(value[i], path2, index + 1);
        }
      } else if (path2.length) {
        deepGet(value, path2, index + 1);
      }
    }
  };
  deepGet(obj, isString(path) ? path.split(".") : path, 0);
  return arr ? list : list[0];
}
var MatchOptions = {
  // Whether the matches should be included in the result set. When `true`, each record in the result
  // set will include the indices of the matched characters.
  // These can consequently be used for highlighting purposes.
  includeMatches: false,
  // When `true`, the matching function will continue to the end of a search pattern even if
  // a perfect match has already been located in the string.
  findAllMatches: false,
  // Minimum number of characters that must be matched before a result is considered a match
  minMatchCharLength: 1
};
var BasicOptions = {
  // When `true`, the algorithm continues searching to the end of the input even if a perfect
  // match is found before the end of the same input.
  isCaseSensitive: false,
  // When `true`, the algorithm will ignore diacritics (accents) in comparisons
  ignoreDiacritics: false,
  // When true, the matching function will continue to the end of a search pattern even if
  includeScore: false,
  // List of properties that will be searched. This also supports nested properties.
  keys: [],
  // Whether to sort the result list, by score
  shouldSort: true,
  // Default sort function: sort by ascending score, ascending index
  sortFn: (a, b) => a.score === b.score ? a.idx < b.idx ? -1 : 1 : a.score < b.score ? -1 : 1
};
var FuzzyOptions = {
  // Approximately where in the text is the pattern expected to be found?
  location: 0,
  // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match
  // (of both letters and location), a threshold of '1.0' would match anything.
  threshold: 0.6,
  // Determines how close the match must be to the fuzzy location (specified above).
  // An exact letter match which is 'distance' characters away from the fuzzy location
  // would score as a complete mismatch. A distance of '0' requires the match be at
  // the exact location specified, a threshold of '1000' would require a perfect match
  // to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
  distance: 100
};
var AdvancedOptions = {
  // When `true`, it enables the use of unix-like search commands
  useExtendedSearch: false,
  // The get function to use when fetching an object's properties.
  // The default will search nested paths *ie foo.bar.baz*
  getFn: get,
  // When `true`, search will ignore `location` and `distance`, so it won't matter
  // where in the string the pattern appears.
  // More info: https://fusejs.io/concepts/scoring-theory.html#fuzziness-score
  ignoreLocation: false,
  // When `true`, the calculation for the relevance score (used for sorting) will
  // ignore the field-length norm.
  // More info: https://fusejs.io/concepts/scoring-theory.html#field-length-norm
  ignoreFieldNorm: false,
  // The weight to determine how much field length norm effects scoring.
  fieldNormWeight: 1
};
var Config = {
  ...BasicOptions,
  ...MatchOptions,
  ...FuzzyOptions,
  ...AdvancedOptions
};
var SPACE = /[^ ]+/g;
function norm(weight = 1, mantissa = 3) {
  const cache = /* @__PURE__ */ new Map();
  const m = Math.pow(10, mantissa);
  return {
    get(value) {
      const numTokens = value.match(SPACE).length;
      if (cache.has(numTokens)) {
        return cache.get(numTokens);
      }
      const norm2 = 1 / Math.pow(numTokens, 0.5 * weight);
      const n = parseFloat(Math.round(norm2 * m) / m);
      cache.set(numTokens, n);
      return n;
    },
    clear() {
      cache.clear();
    }
  };
}
var FuseIndex = class {
  constructor({
    getFn = Config.getFn,
    fieldNormWeight = Config.fieldNormWeight
  } = {}) {
    this.norm = norm(fieldNormWeight, 3);
    this.getFn = getFn;
    this.isCreated = false;
    this.setIndexRecords();
  }
  setSources(docs = []) {
    this.docs = docs;
  }
  setIndexRecords(records = []) {
    this.records = records;
  }
  setKeys(keys = []) {
    this.keys = keys;
    this._keysMap = {};
    keys.forEach((key, idx) => {
      this._keysMap[key.id] = idx;
    });
  }
  create() {
    if (this.isCreated || !this.docs.length) {
      return;
    }
    this.isCreated = true;
    if (isString(this.docs[0])) {
      this.docs.forEach((doc, docIndex) => {
        this._addString(doc, docIndex);
      });
    } else {
      this.docs.forEach((doc, docIndex) => {
        this._addObject(doc, docIndex);
      });
    }
    this.norm.clear();
  }
  // Adds a doc to the end of the index
  add(doc) {
    const idx = this.size();
    if (isString(doc)) {
      this._addString(doc, idx);
    } else {
      this._addObject(doc, idx);
    }
  }
  // Removes the doc at the specified index of the index
  removeAt(idx) {
    this.records.splice(idx, 1);
    for (let i = idx, len = this.size(); i < len; i += 1) {
      this.records[i].i -= 1;
    }
  }
  getValueForItemAtKeyId(item, keyId) {
    return item[this._keysMap[keyId]];
  }
  size() {
    return this.records.length;
  }
  _addString(doc, docIndex) {
    if (!isDefined(doc) || isBlank(doc)) {
      return;
    }
    let record = {
      v: doc,
      i: docIndex,
      n: this.norm.get(doc)
    };
    this.records.push(record);
  }
  _addObject(doc, docIndex) {
    let record = { i: docIndex, $: {} };
    this.keys.forEach((key, keyIndex) => {
      let value = key.getFn ? key.getFn(doc) : this.getFn(doc, key.path);
      if (!isDefined(value)) {
        return;
      }
      if (isArray(value)) {
        let subRecords = [];
        const stack = [{ nestedArrIndex: -1, value }];
        while (stack.length) {
          const { nestedArrIndex, value: value2 } = stack.pop();
          if (!isDefined(value2)) {
            continue;
          }
          if (isString(value2) && !isBlank(value2)) {
            let subRecord = {
              v: value2,
              i: nestedArrIndex,
              n: this.norm.get(value2)
            };
            subRecords.push(subRecord);
          } else if (isArray(value2)) {
            value2.forEach((item, k) => {
              stack.push({
                nestedArrIndex: k,
                value: item
              });
            });
          } else
            ;
        }
        record.$[keyIndex] = subRecords;
      } else if (isString(value) && !isBlank(value)) {
        let subRecord = {
          v: value,
          n: this.norm.get(value)
        };
        record.$[keyIndex] = subRecord;
      }
    });
    this.records.push(record);
  }
  toJSON() {
    return {
      keys: this.keys,
      records: this.records
    };
  }
};
function createIndex(keys, docs, { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}) {
  const myIndex = new FuseIndex({ getFn, fieldNormWeight });
  myIndex.setKeys(keys.map(createKey));
  myIndex.setSources(docs);
  myIndex.create();
  return myIndex;
}
function parseIndex(data, { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}) {
  const { keys, records } = data;
  const myIndex = new FuseIndex({ getFn, fieldNormWeight });
  myIndex.setKeys(keys);
  myIndex.setIndexRecords(records);
  return myIndex;
}
function computeScore$1(pattern, {
  errors = 0,
  currentLocation = 0,
  expectedLocation = 0,
  distance = Config.distance,
  ignoreLocation = Config.ignoreLocation
} = {}) {
  const accuracy = errors / pattern.length;
  if (ignoreLocation) {
    return accuracy;
  }
  const proximity = Math.abs(expectedLocation - currentLocation);
  if (!distance) {
    return proximity ? 1 : accuracy;
  }
  return accuracy + proximity / distance;
}
function convertMaskToIndices(matchmask = [], minMatchCharLength = Config.minMatchCharLength) {
  let indices = [];
  let start = -1;
  let end = -1;
  let i = 0;
  for (let len = matchmask.length; i < len; i += 1) {
    let match = matchmask[i];
    if (match && start === -1) {
      start = i;
    } else if (!match && start !== -1) {
      end = i - 1;
      if (end - start + 1 >= minMatchCharLength) {
        indices.push([start, end]);
      }
      start = -1;
    }
  }
  if (matchmask[i - 1] && i - start >= minMatchCharLength) {
    indices.push([start, i - 1]);
  }
  return indices;
}
var MAX_BITS = 32;
function search(text, pattern, patternAlphabet, {
  location = Config.location,
  distance = Config.distance,
  threshold = Config.threshold,
  findAllMatches = Config.findAllMatches,
  minMatchCharLength = Config.minMatchCharLength,
  includeMatches = Config.includeMatches,
  ignoreLocation = Config.ignoreLocation
} = {}) {
  if (pattern.length > MAX_BITS) {
    throw new Error(PATTERN_LENGTH_TOO_LARGE(MAX_BITS));
  }
  const patternLen = pattern.length;
  const textLen = text.length;
  const expectedLocation = Math.max(0, Math.min(location, textLen));
  let currentThreshold = threshold;
  let bestLocation = expectedLocation;
  const computeMatches = minMatchCharLength > 1 || includeMatches;
  const matchMask = computeMatches ? Array(textLen) : [];
  let index;
  while ((index = text.indexOf(pattern, bestLocation)) > -1) {
    let score = computeScore$1(pattern, {
      currentLocation: index,
      expectedLocation,
      distance,
      ignoreLocation
    });
    currentThreshold = Math.min(score, currentThreshold);
    bestLocation = index + patternLen;
    if (computeMatches) {
      let i = 0;
      while (i < patternLen) {
        matchMask[index + i] = 1;
        i += 1;
      }
    }
  }
  bestLocation = -1;
  let lastBitArr = [];
  let finalScore = 1;
  let binMax = patternLen + textLen;
  const mask = 1 << patternLen - 1;
  for (let i = 0; i < patternLen; i += 1) {
    let binMin = 0;
    let binMid = binMax;
    while (binMin < binMid) {
      const score2 = computeScore$1(pattern, {
        errors: i,
        currentLocation: expectedLocation + binMid,
        expectedLocation,
        distance,
        ignoreLocation
      });
      if (score2 <= currentThreshold) {
        binMin = binMid;
      } else {
        binMax = binMid;
      }
      binMid = Math.floor((binMax - binMin) / 2 + binMin);
    }
    binMax = binMid;
    let start = Math.max(1, expectedLocation - binMid + 1);
    let finish = findAllMatches ? textLen : Math.min(expectedLocation + binMid, textLen) + patternLen;
    let bitArr = Array(finish + 2);
    bitArr[finish + 1] = (1 << i) - 1;
    for (let j = finish; j >= start; j -= 1) {
      let currentLocation = j - 1;
      let charMatch = patternAlphabet[text.charAt(currentLocation)];
      if (computeMatches) {
        matchMask[currentLocation] = +!!charMatch;
      }
      bitArr[j] = (bitArr[j + 1] << 1 | 1) & charMatch;
      if (i) {
        bitArr[j] |= (lastBitArr[j + 1] | lastBitArr[j]) << 1 | 1 | lastBitArr[j + 1];
      }
      if (bitArr[j] & mask) {
        finalScore = computeScore$1(pattern, {
          errors: i,
          currentLocation,
          expectedLocation,
          distance,
          ignoreLocation
        });
        if (finalScore <= currentThreshold) {
          currentThreshold = finalScore;
          bestLocation = currentLocation;
          if (bestLocation <= expectedLocation) {
            break;
          }
          start = Math.max(1, 2 * expectedLocation - bestLocation);
        }
      }
    }
    const score = computeScore$1(pattern, {
      errors: i + 1,
      currentLocation: expectedLocation,
      expectedLocation,
      distance,
      ignoreLocation
    });
    if (score > currentThreshold) {
      break;
    }
    lastBitArr = bitArr;
  }
  const result = {
    isMatch: bestLocation >= 0,
    // Count exact matches (those with a score of 0) to be "almost" exact
    score: Math.max(1e-3, finalScore)
  };
  if (computeMatches) {
    const indices = convertMaskToIndices(matchMask, minMatchCharLength);
    if (!indices.length) {
      result.isMatch = false;
    } else if (includeMatches) {
      result.indices = indices;
    }
  }
  return result;
}
function createPatternAlphabet(pattern) {
  let mask = {};
  for (let i = 0, len = pattern.length; i < len; i += 1) {
    const char = pattern.charAt(i);
    mask[char] = (mask[char] || 0) | 1 << len - i - 1;
  }
  return mask;
}
var stripDiacritics = String.prototype.normalize ? (str) => str.normalize("NFD").replace(/[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/g, "") : (str) => str;
var BitapSearch = class {
  constructor(pattern, {
    location = Config.location,
    threshold = Config.threshold,
    distance = Config.distance,
    includeMatches = Config.includeMatches,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    isCaseSensitive = Config.isCaseSensitive,
    ignoreDiacritics = Config.ignoreDiacritics,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    this.options = {
      location,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreDiacritics,
      ignoreLocation
    };
    pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
    pattern = ignoreDiacritics ? stripDiacritics(pattern) : pattern;
    this.pattern = pattern;
    this.chunks = [];
    if (!this.pattern.length) {
      return;
    }
    const addChunk = (pattern2, startIndex) => {
      this.chunks.push({
        pattern: pattern2,
        alphabet: createPatternAlphabet(pattern2),
        startIndex
      });
    };
    const len = this.pattern.length;
    if (len > MAX_BITS) {
      let i = 0;
      const remainder = len % MAX_BITS;
      const end = len - remainder;
      while (i < end) {
        addChunk(this.pattern.substr(i, MAX_BITS), i);
        i += MAX_BITS;
      }
      if (remainder) {
        const startIndex = len - MAX_BITS;
        addChunk(this.pattern.substr(startIndex), startIndex);
      }
    } else {
      addChunk(this.pattern, 0);
    }
  }
  searchIn(text) {
    const { isCaseSensitive, ignoreDiacritics, includeMatches } = this.options;
    text = isCaseSensitive ? text : text.toLowerCase();
    text = ignoreDiacritics ? stripDiacritics(text) : text;
    if (this.pattern === text) {
      let result2 = {
        isMatch: true,
        score: 0
      };
      if (includeMatches) {
        result2.indices = [[0, text.length - 1]];
      }
      return result2;
    }
    const {
      location,
      distance,
      threshold,
      findAllMatches,
      minMatchCharLength,
      ignoreLocation
    } = this.options;
    let allIndices = [];
    let totalScore = 0;
    let hasMatches = false;
    this.chunks.forEach(({ pattern, alphabet, startIndex }) => {
      const { isMatch, score, indices } = search(text, pattern, alphabet, {
        location: location + startIndex,
        distance,
        threshold,
        findAllMatches,
        minMatchCharLength,
        includeMatches,
        ignoreLocation
      });
      if (isMatch) {
        hasMatches = true;
      }
      totalScore += score;
      if (isMatch && indices) {
        allIndices = [...allIndices, ...indices];
      }
    });
    let result = {
      isMatch: hasMatches,
      score: hasMatches ? totalScore / this.chunks.length : 1
    };
    if (hasMatches && includeMatches) {
      result.indices = allIndices;
    }
    return result;
  }
};
var BaseMatch = class {
  constructor(pattern) {
    this.pattern = pattern;
  }
  static isMultiMatch(pattern) {
    return getMatch(pattern, this.multiRegex);
  }
  static isSingleMatch(pattern) {
    return getMatch(pattern, this.singleRegex);
  }
  search() {
  }
};
function getMatch(pattern, exp) {
  const matches = pattern.match(exp);
  return matches ? matches[1] : null;
}
var ExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "exact";
  }
  static get multiRegex() {
    return /^="(.*)"$/;
  }
  static get singleRegex() {
    return /^=(.*)$/;
  }
  search(text) {
    const isMatch = text === this.pattern;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
};
var InverseExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "inverse-exact";
  }
  static get multiRegex() {
    return /^!"(.*)"$/;
  }
  static get singleRegex() {
    return /^!(.*)$/;
  }
  search(text) {
    const index = text.indexOf(this.pattern);
    const isMatch = index === -1;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
};
var PrefixExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "prefix-exact";
  }
  static get multiRegex() {
    return /^\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^\^(.*)$/;
  }
  search(text) {
    const isMatch = text.startsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, this.pattern.length - 1]
    };
  }
};
var InversePrefixExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "inverse-prefix-exact";
  }
  static get multiRegex() {
    return /^!\^"(.*)"$/;
  }
  static get singleRegex() {
    return /^!\^(.*)$/;
  }
  search(text) {
    const isMatch = !text.startsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
};
var SuffixExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "suffix-exact";
  }
  static get multiRegex() {
    return /^"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^(.*)\$$/;
  }
  search(text) {
    const isMatch = text.endsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [text.length - this.pattern.length, text.length - 1]
    };
  }
};
var InverseSuffixExactMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "inverse-suffix-exact";
  }
  static get multiRegex() {
    return /^!"(.*)"\$$/;
  }
  static get singleRegex() {
    return /^!(.*)\$$/;
  }
  search(text) {
    const isMatch = !text.endsWith(this.pattern);
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices: [0, text.length - 1]
    };
  }
};
var FuzzyMatch = class extends BaseMatch {
  constructor(pattern, {
    location = Config.location,
    threshold = Config.threshold,
    distance = Config.distance,
    includeMatches = Config.includeMatches,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    isCaseSensitive = Config.isCaseSensitive,
    ignoreDiacritics = Config.ignoreDiacritics,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    super(pattern);
    this._bitapSearch = new BitapSearch(pattern, {
      location,
      threshold,
      distance,
      includeMatches,
      findAllMatches,
      minMatchCharLength,
      isCaseSensitive,
      ignoreDiacritics,
      ignoreLocation
    });
  }
  static get type() {
    return "fuzzy";
  }
  static get multiRegex() {
    return /^"(.*)"$/;
  }
  static get singleRegex() {
    return /^(.*)$/;
  }
  search(text) {
    return this._bitapSearch.searchIn(text);
  }
};
var IncludeMatch = class extends BaseMatch {
  constructor(pattern) {
    super(pattern);
  }
  static get type() {
    return "include";
  }
  static get multiRegex() {
    return /^'"(.*)"$/;
  }
  static get singleRegex() {
    return /^'(.*)$/;
  }
  search(text) {
    let location = 0;
    let index;
    const indices = [];
    const patternLen = this.pattern.length;
    while ((index = text.indexOf(this.pattern, location)) > -1) {
      location = index + patternLen;
      indices.push([index, location - 1]);
    }
    const isMatch = !!indices.length;
    return {
      isMatch,
      score: isMatch ? 0 : 1,
      indices
    };
  }
};
var searchers = [
  ExactMatch,
  IncludeMatch,
  PrefixExactMatch,
  InversePrefixExactMatch,
  InverseSuffixExactMatch,
  SuffixExactMatch,
  InverseExactMatch,
  FuzzyMatch
];
var searchersLen = searchers.length;
var SPACE_RE = / +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
var OR_TOKEN = "|";
function parseQuery(pattern, options = {}) {
  return pattern.split(OR_TOKEN).map((item) => {
    let query = item.trim().split(SPACE_RE).filter((item2) => item2 && !!item2.trim());
    let results = [];
    for (let i = 0, len = query.length; i < len; i += 1) {
      const queryItem = query[i];
      let found = false;
      let idx = -1;
      while (!found && ++idx < searchersLen) {
        const searcher = searchers[idx];
        let token = searcher.isMultiMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          found = true;
        }
      }
      if (found) {
        continue;
      }
      idx = -1;
      while (++idx < searchersLen) {
        const searcher = searchers[idx];
        let token = searcher.isSingleMatch(queryItem);
        if (token) {
          results.push(new searcher(token, options));
          break;
        }
      }
    }
    return results;
  });
}
var MultiMatchSet = /* @__PURE__ */ new Set([FuzzyMatch.type, IncludeMatch.type]);
var ExtendedSearch = class {
  constructor(pattern, {
    isCaseSensitive = Config.isCaseSensitive,
    ignoreDiacritics = Config.ignoreDiacritics,
    includeMatches = Config.includeMatches,
    minMatchCharLength = Config.minMatchCharLength,
    ignoreLocation = Config.ignoreLocation,
    findAllMatches = Config.findAllMatches,
    location = Config.location,
    threshold = Config.threshold,
    distance = Config.distance
  } = {}) {
    this.query = null;
    this.options = {
      isCaseSensitive,
      ignoreDiacritics,
      includeMatches,
      minMatchCharLength,
      findAllMatches,
      ignoreLocation,
      location,
      threshold,
      distance
    };
    pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
    pattern = ignoreDiacritics ? stripDiacritics(pattern) : pattern;
    this.pattern = pattern;
    this.query = parseQuery(this.pattern, this.options);
  }
  static condition(_, options) {
    return options.useExtendedSearch;
  }
  searchIn(text) {
    const query = this.query;
    if (!query) {
      return {
        isMatch: false,
        score: 1
      };
    }
    const { includeMatches, isCaseSensitive, ignoreDiacritics } = this.options;
    text = isCaseSensitive ? text : text.toLowerCase();
    text = ignoreDiacritics ? stripDiacritics(text) : text;
    let numMatches = 0;
    let allIndices = [];
    let totalScore = 0;
    for (let i = 0, qLen = query.length; i < qLen; i += 1) {
      const searchers2 = query[i];
      allIndices.length = 0;
      numMatches = 0;
      for (let j = 0, pLen = searchers2.length; j < pLen; j += 1) {
        const searcher = searchers2[j];
        const { isMatch, indices, score } = searcher.search(text);
        if (isMatch) {
          numMatches += 1;
          totalScore += score;
          if (includeMatches) {
            const type = searcher.constructor.type;
            if (MultiMatchSet.has(type)) {
              allIndices = [...allIndices, ...indices];
            } else {
              allIndices.push(indices);
            }
          }
        } else {
          totalScore = 0;
          numMatches = 0;
          allIndices.length = 0;
          break;
        }
      }
      if (numMatches) {
        let result = {
          isMatch: true,
          score: totalScore / numMatches
        };
        if (includeMatches) {
          result.indices = allIndices;
        }
        return result;
      }
    }
    return {
      isMatch: false,
      score: 1
    };
  }
};
var registeredSearchers = [];
function register(...args) {
  registeredSearchers.push(...args);
}
function createSearcher(pattern, options) {
  for (let i = 0, len = registeredSearchers.length; i < len; i += 1) {
    let searcherClass = registeredSearchers[i];
    if (searcherClass.condition(pattern, options)) {
      return new searcherClass(pattern, options);
    }
  }
  return new BitapSearch(pattern, options);
}
var LogicalOperator = {
  AND: "$and",
  OR: "$or"
};
var KeyType = {
  PATH: "$path",
  PATTERN: "$val"
};
var isExpression = (query) => !!(query[LogicalOperator.AND] || query[LogicalOperator.OR]);
var isPath = (query) => !!query[KeyType.PATH];
var isLeaf = (query) => !isArray(query) && isObject(query) && !isExpression(query);
var convertToExplicit = (query) => ({
  [LogicalOperator.AND]: Object.keys(query).map((key) => ({
    [key]: query[key]
  }))
});
function parse(query, options, { auto = true } = {}) {
  const next = (query2) => {
    let keys = Object.keys(query2);
    const isQueryPath = isPath(query2);
    if (!isQueryPath && keys.length > 1 && !isExpression(query2)) {
      return next(convertToExplicit(query2));
    }
    if (isLeaf(query2)) {
      const key = isQueryPath ? query2[KeyType.PATH] : keys[0];
      const pattern = isQueryPath ? query2[KeyType.PATTERN] : query2[key];
      if (!isString(pattern)) {
        throw new Error(LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY(key));
      }
      const obj = {
        keyId: createKeyId(key),
        pattern
      };
      if (auto) {
        obj.searcher = createSearcher(pattern, options);
      }
      return obj;
    }
    let node = {
      children: [],
      operator: keys[0]
    };
    keys.forEach((key) => {
      const value = query2[key];
      if (isArray(value)) {
        value.forEach((item) => {
          node.children.push(next(item));
        });
      }
    });
    return node;
  };
  if (!isExpression(query)) {
    query = convertToExplicit(query);
  }
  return next(query);
}
function computeScore(results, { ignoreFieldNorm = Config.ignoreFieldNorm }) {
  results.forEach((result) => {
    let totalScore = 1;
    result.matches.forEach(({ key, norm: norm2, score }) => {
      const weight = key ? key.weight : null;
      totalScore *= Math.pow(
        score === 0 && weight ? Number.EPSILON : score,
        (weight || 1) * (ignoreFieldNorm ? 1 : norm2)
      );
    });
    result.score = totalScore;
  });
}
function transformMatches(result, data) {
  const matches = result.matches;
  data.matches = [];
  if (!isDefined(matches)) {
    return;
  }
  matches.forEach((match) => {
    if (!isDefined(match.indices) || !match.indices.length) {
      return;
    }
    const { indices, value } = match;
    let obj = {
      indices,
      value
    };
    if (match.key) {
      obj.key = match.key.src;
    }
    if (match.idx > -1) {
      obj.refIndex = match.idx;
    }
    data.matches.push(obj);
  });
}
function transformScore(result, data) {
  data.score = result.score;
}
function format(results, docs, {
  includeMatches = Config.includeMatches,
  includeScore = Config.includeScore
} = {}) {
  const transformers = [];
  if (includeMatches)
    transformers.push(transformMatches);
  if (includeScore)
    transformers.push(transformScore);
  return results.map((result) => {
    const { idx } = result;
    const data = {
      item: docs[idx],
      refIndex: idx
    };
    if (transformers.length) {
      transformers.forEach((transformer) => {
        transformer(result, data);
      });
    }
    return data;
  });
}
var Fuse = class {
  constructor(docs, options = {}, index) {
    this.options = { ...Config, ...options };
    if (this.options.useExtendedSearch && false) {
      throw new Error(EXTENDED_SEARCH_UNAVAILABLE);
    }
    this._keyStore = new KeyStore(this.options.keys);
    this.setCollection(docs, index);
  }
  setCollection(docs, index) {
    this._docs = docs;
    if (index && !(index instanceof FuseIndex)) {
      throw new Error(INCORRECT_INDEX_TYPE);
    }
    this._myIndex = index || createIndex(this.options.keys, this._docs, {
      getFn: this.options.getFn,
      fieldNormWeight: this.options.fieldNormWeight
    });
  }
  add(doc) {
    if (!isDefined(doc)) {
      return;
    }
    this._docs.push(doc);
    this._myIndex.add(doc);
  }
  remove(predicate = () => false) {
    const results = [];
    for (let i = 0, len = this._docs.length; i < len; i += 1) {
      const doc = this._docs[i];
      if (predicate(doc, i)) {
        this.removeAt(i);
        i -= 1;
        len -= 1;
        results.push(doc);
      }
    }
    return results;
  }
  removeAt(idx) {
    this._docs.splice(idx, 1);
    this._myIndex.removeAt(idx);
  }
  getIndex() {
    return this._myIndex;
  }
  search(query, { limit = -1 } = {}) {
    const {
      includeMatches,
      includeScore,
      shouldSort,
      sortFn,
      ignoreFieldNorm
    } = this.options;
    let results = isString(query) ? isString(this._docs[0]) ? this._searchStringList(query) : this._searchObjectList(query) : this._searchLogical(query);
    computeScore(results, { ignoreFieldNorm });
    if (shouldSort) {
      results.sort(sortFn);
    }
    if (isNumber(limit) && limit > -1) {
      results = results.slice(0, limit);
    }
    return format(results, this._docs, {
      includeMatches,
      includeScore
    });
  }
  _searchStringList(query) {
    const searcher = createSearcher(query, this.options);
    const { records } = this._myIndex;
    const results = [];
    records.forEach(({ v: text, i: idx, n: norm2 }) => {
      if (!isDefined(text)) {
        return;
      }
      const { isMatch, score, indices } = searcher.searchIn(text);
      if (isMatch) {
        results.push({
          item: text,
          idx,
          matches: [{ score, value: text, norm: norm2, indices }]
        });
      }
    });
    return results;
  }
  _searchLogical(query) {
    const expression = parse(query, this.options);
    const evaluate = (node, item, idx) => {
      if (!node.children) {
        const { keyId, searcher } = node;
        const matches = this._findMatches({
          key: this._keyStore.get(keyId),
          value: this._myIndex.getValueForItemAtKeyId(item, keyId),
          searcher
        });
        if (matches && matches.length) {
          return [
            {
              idx,
              item,
              matches
            }
          ];
        }
        return [];
      }
      const res = [];
      for (let i = 0, len = node.children.length; i < len; i += 1) {
        const child = node.children[i];
        const result = evaluate(child, item, idx);
        if (result.length) {
          res.push(...result);
        } else if (node.operator === LogicalOperator.AND) {
          return [];
        }
      }
      return res;
    };
    const records = this._myIndex.records;
    const resultMap = {};
    const results = [];
    records.forEach(({ $: item, i: idx }) => {
      if (isDefined(item)) {
        let expResults = evaluate(expression, item, idx);
        if (expResults.length) {
          if (!resultMap[idx]) {
            resultMap[idx] = { idx, item, matches: [] };
            results.push(resultMap[idx]);
          }
          expResults.forEach(({ matches }) => {
            resultMap[idx].matches.push(...matches);
          });
        }
      }
    });
    return results;
  }
  _searchObjectList(query) {
    const searcher = createSearcher(query, this.options);
    const { keys, records } = this._myIndex;
    const results = [];
    records.forEach(({ $: item, i: idx }) => {
      if (!isDefined(item)) {
        return;
      }
      let matches = [];
      keys.forEach((key, keyIndex) => {
        matches.push(
          ...this._findMatches({
            key,
            value: item[keyIndex],
            searcher
          })
        );
      });
      if (matches.length) {
        results.push({
          idx,
          item,
          matches
        });
      }
    });
    return results;
  }
  _findMatches({ key, value, searcher }) {
    if (!isDefined(value)) {
      return [];
    }
    let matches = [];
    if (isArray(value)) {
      value.forEach(({ v: text, i: idx, n: norm2 }) => {
        if (!isDefined(text)) {
          return;
        }
        const { isMatch, score, indices } = searcher.searchIn(text);
        if (isMatch) {
          matches.push({
            score,
            key,
            value: text,
            idx,
            norm: norm2,
            indices
          });
        }
      });
    } else {
      const { v: text, n: norm2 } = value;
      const { isMatch, score, indices } = searcher.searchIn(text);
      if (isMatch) {
        matches.push({ score, key, value: text, norm: norm2, indices });
      }
    }
    return matches;
  }
};
Fuse.version = "7.1.0";
Fuse.createIndex = createIndex;
Fuse.parseIndex = parseIndex;
Fuse.config = Config;
{
  Fuse.parseQuery = parse;
}
{
  register(ExtendedSearch);
}

// resources/js/components/icon-picker-component.js
function iconPickerComponent({
  key,
  state,
  // selectedIcon,
  displayName,
  isDropdown,
  shouldCloseOnSelect,
  getSetUsing,
  getIconsUsing,
  getIconSvgUsing,
  verifyStateUsing
}) {
  return {
    state,
    displayName,
    isDropdown,
    shouldCloseOnSelect,
    dropdownOpen: false,
    set: null,
    icons: [],
    search: "",
    // selectedIcon,
    fuse: null,
    results: [],
    resultsVisible: [],
    minimumItems: 300,
    resultsPerPage: 50,
    resultsIndex: 0,
    isLoading: false,
    async init() {
      await verifyStateUsing(this.state).then((result) => this.state = result);
      await this.loadIcons();
      this.$wire.on(`custom-icon-uploaded::${key}`, (icon) => {
        this.displayName = icon.label;
        this.set = icon.set;
        this.afterSetUpdated();
      });
    },
    deferLoadingState() {
      return setTimeout(() => this.isLoading = true, 150);
    },
    async loadIcons() {
      this.isLoading = true;
      return await getIconsUsing(this.set).then((icons) => {
        this.icons = icons;
        this.createFuseObject();
        this.resetSearchResults();
        this.isLoading = false;
      });
    },
    async loadSet() {
      this.isLoading = true;
      return await getSetUsing(this.state).then((set) => {
        this.set = set;
        this.isLoading = false;
      });
    },
    afterStateUpdated() {
    },
    afterSetUpdated() {
      this.loadIcons();
    },
    async updateSelectedIcon(reloadIfNotFound = true) {
      const found = this.icons.find((icon) => icon.id === this.state);
      if (found) {
      } else if (reloadIfNotFound) {
        await this.loadSet();
        await this.loadIcons();
        await this.updateSelectedIcon(false);
      }
    },
    setElementIcon(element, id, after = null) {
      getIconSvgUsing(id).then((svg) => element.innerHTML = svg).finally(after);
    },
    createFuseObject() {
      const options = {
        includeScore: true,
        keys: ["id"]
      };
      this.fuse = new Fuse(this.icons, options);
    },
    resetSearchResults() {
      this.resultsPerPage = 20;
      this.resultsIndex = 0;
      this.results = this.icons;
      this.resultsVisible = [];
      this.addSearchResultsChunk();
    },
    setSelect: {
      async ["x-on:change"](event) {
        const value = event.target.value;
        this.set = value ? value : null;
        this.afterSetUpdated();
      }
    },
    searchInput: {
      ["x-on:input.debounce"](event) {
        const value = event.target.value;
        const isLoadingDeferId = this.deferLoadingState();
        if (value.length) {
          this.resultsVisible = [];
          this.resultsIndex = 0;
          this.results = this.fuse.search(value).map((result) => result.item);
          this.addSearchResultsChunk();
        } else {
          this.resetSearchResults();
        }
        clearTimeout(isLoadingDeferId);
        this.isLoading = false;
      }
    },
    dropdownTrigger: {
      ["x-on:click.prevent"]() {
        this.dropdownOpen = true;
      }
    },
    dropdownMenu: {
      ["x-show"]() {
        return !this.isDropdown || this.dropdownOpen;
      },
      ["x-on:click.outside"]() {
        this.dropdownOpen = false;
      }
    },
    addSearchResultsChunk() {
      let endIndex = this.resultsIndex + this.resultsPerPage;
      if (endIndex < this.minimumItems) {
        endIndex = this.minimumItems;
      }
      this.resultsVisible.push(...this.results.slice(this.resultsIndex, endIndex));
      this.resultsIndex = endIndex;
    },
    updateState(icon) {
      if (icon) {
        this.state = icon.id;
        this.displayName = icon.label;
        if (this.shouldCloseOnSelect) {
          this.$nextTick(() => this.dropdownOpen = false);
        }
      } else {
        this.state = null;
        this.displayName = null;
      }
    }
  };
}
export {
  iconPickerComponent as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Z1c2UuanMvZGlzdC9mdXNlLm1qcyIsICIuLi8uLi9qcy9jb21wb25lbnRzL2ljb24tcGlja2VyLWNvbXBvbmVudC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBGdXNlLmpzIHY3LjEuMCAtIExpZ2h0d2VpZ2h0IGZ1enp5LXNlYXJjaCAoaHR0cDovL2Z1c2Vqcy5pbylcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjUgS2lybyBSaXNrIChodHRwOi8va2lyby5tZSlcbiAqIEFsbCBSaWdodHMgUmVzZXJ2ZWQuIEFwYWNoZSBTb2Z0d2FyZSBMaWNlbnNlIDIuMFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICovXG5cbmZ1bmN0aW9uIGlzQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuICFBcnJheS5pc0FycmF5XG4gICAgPyBnZXRUYWcodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgOiBBcnJheS5pc0FycmF5KHZhbHVlKVxufVxuXG4vLyBBZGFwdGVkIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9sb2Rhc2gvbG9kYXNoL2Jsb2IvbWFzdGVyLy5pbnRlcm5hbC9iYXNlVG9TdHJpbmcuanNcbmNvbnN0IElORklOSVRZID0gMSAvIDA7XG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGxldCByZXN1bHQgPSB2YWx1ZSArICcnO1xuICByZXR1cm4gcmVzdWx0ID09ICcwJyAmJiAxIC8gdmFsdWUgPT0gLUlORklOSVRZID8gJy0wJyA6IHJlc3VsdFxufVxuXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKVxufVxuXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJ1xufVxuXG5mdW5jdGlvbiBpc051bWJlcih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJ1xufVxuXG4vLyBBZGFwdGVkIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9sb2Rhc2gvbG9kYXNoL2Jsb2IvbWFzdGVyL2lzQm9vbGVhbi5qc1xuZnVuY3Rpb24gaXNCb29sZWFuKHZhbHVlKSB7XG4gIHJldHVybiAoXG4gICAgdmFsdWUgPT09IHRydWUgfHxcbiAgICB2YWx1ZSA9PT0gZmFsc2UgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBnZXRUYWcodmFsdWUpID09ICdbb2JqZWN0IEJvb2xlYW5dJylcbiAgKVxufVxuXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0J1xufVxuXG4vLyBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS5cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3QodmFsdWUpICYmIHZhbHVlICE9PSBudWxsXG59XG5cbmZ1bmN0aW9uIGlzRGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbFxufVxuXG5mdW5jdGlvbiBpc0JsYW5rKHZhbHVlKSB7XG4gIHJldHVybiAhdmFsdWUudHJpbSgpLmxlbmd0aFxufVxuXG4vLyBHZXRzIHRoZSBgdG9TdHJpbmdUYWdgIG9mIGB2YWx1ZWAuXG4vLyBBZGFwdGVkIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9sb2Rhc2gvbG9kYXNoL2Jsb2IvbWFzdGVyLy5pbnRlcm5hbC9nZXRUYWcuanNcbmZ1bmN0aW9uIGdldFRhZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbFxuICAgID8gdmFsdWUgPT09IHVuZGVmaW5lZFxuICAgICAgPyAnW29iamVjdCBVbmRlZmluZWRdJ1xuICAgICAgOiAnW29iamVjdCBOdWxsXSdcbiAgICA6IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSlcbn1cblxuY29uc3QgRVhURU5ERURfU0VBUkNIX1VOQVZBSUxBQkxFID0gJ0V4dGVuZGVkIHNlYXJjaCBpcyBub3QgYXZhaWxhYmxlJztcblxuY29uc3QgSU5DT1JSRUNUX0lOREVYX1RZUEUgPSBcIkluY29ycmVjdCAnaW5kZXgnIHR5cGVcIjtcblxuY29uc3QgTE9HSUNBTF9TRUFSQ0hfSU5WQUxJRF9RVUVSWV9GT1JfS0VZID0gKGtleSkgPT5cbiAgYEludmFsaWQgdmFsdWUgZm9yIGtleSAke2tleX1gO1xuXG5jb25zdCBQQVRURVJOX0xFTkdUSF9UT09fTEFSR0UgPSAobWF4KSA9PlxuICBgUGF0dGVybiBsZW5ndGggZXhjZWVkcyBtYXggb2YgJHttYXh9LmA7XG5cbmNvbnN0IE1JU1NJTkdfS0VZX1BST1BFUlRZID0gKG5hbWUpID0+IGBNaXNzaW5nICR7bmFtZX0gcHJvcGVydHkgaW4ga2V5YDtcblxuY29uc3QgSU5WQUxJRF9LRVlfV0VJR0hUX1ZBTFVFID0gKGtleSkgPT5cbiAgYFByb3BlcnR5ICd3ZWlnaHQnIGluIGtleSAnJHtrZXl9JyBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlcmA7XG5cbmNvbnN0IGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmNsYXNzIEtleVN0b3JlIHtcbiAgY29uc3RydWN0b3Ioa2V5cykge1xuICAgIHRoaXMuX2tleXMgPSBbXTtcbiAgICB0aGlzLl9rZXlNYXAgPSB7fTtcblxuICAgIGxldCB0b3RhbFdlaWdodCA9IDA7XG5cbiAgICBrZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgbGV0IG9iaiA9IGNyZWF0ZUtleShrZXkpO1xuXG4gICAgICB0aGlzLl9rZXlzLnB1c2gob2JqKTtcbiAgICAgIHRoaXMuX2tleU1hcFtvYmouaWRdID0gb2JqO1xuXG4gICAgICB0b3RhbFdlaWdodCArPSBvYmoud2VpZ2h0O1xuICAgIH0pO1xuXG4gICAgLy8gTm9ybWFsaXplIHdlaWdodHMgc28gdGhhdCB0aGVpciBzdW0gaXMgZXF1YWwgdG8gMVxuICAgIHRoaXMuX2tleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBrZXkud2VpZ2h0IC89IHRvdGFsV2VpZ2h0O1xuICAgIH0pO1xuICB9XG4gIGdldChrZXlJZCkge1xuICAgIHJldHVybiB0aGlzLl9rZXlNYXBba2V5SWRdXG4gIH1cbiAga2V5cygpIHtcbiAgICByZXR1cm4gdGhpcy5fa2V5c1xuICB9XG4gIHRvSlNPTigpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5fa2V5cylcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVLZXkoa2V5KSB7XG4gIGxldCBwYXRoID0gbnVsbDtcbiAgbGV0IGlkID0gbnVsbDtcbiAgbGV0IHNyYyA9IG51bGw7XG4gIGxldCB3ZWlnaHQgPSAxO1xuICBsZXQgZ2V0Rm4gPSBudWxsO1xuXG4gIGlmIChpc1N0cmluZyhrZXkpIHx8IGlzQXJyYXkoa2V5KSkge1xuICAgIHNyYyA9IGtleTtcbiAgICBwYXRoID0gY3JlYXRlS2V5UGF0aChrZXkpO1xuICAgIGlkID0gY3JlYXRlS2V5SWQoa2V5KTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoIWhhc093bi5jYWxsKGtleSwgJ25hbWUnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKE1JU1NJTkdfS0VZX1BST1BFUlRZKCduYW1lJykpXG4gICAgfVxuXG4gICAgY29uc3QgbmFtZSA9IGtleS5uYW1lO1xuICAgIHNyYyA9IG5hbWU7XG5cbiAgICBpZiAoaGFzT3duLmNhbGwoa2V5LCAnd2VpZ2h0JykpIHtcbiAgICAgIHdlaWdodCA9IGtleS53ZWlnaHQ7XG5cbiAgICAgIGlmICh3ZWlnaHQgPD0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoSU5WQUxJRF9LRVlfV0VJR0hUX1ZBTFVFKG5hbWUpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHBhdGggPSBjcmVhdGVLZXlQYXRoKG5hbWUpO1xuICAgIGlkID0gY3JlYXRlS2V5SWQobmFtZSk7XG4gICAgZ2V0Rm4gPSBrZXkuZ2V0Rm47XG4gIH1cblxuICByZXR1cm4geyBwYXRoLCBpZCwgd2VpZ2h0LCBzcmMsIGdldEZuIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlS2V5UGF0aChrZXkpIHtcbiAgcmV0dXJuIGlzQXJyYXkoa2V5KSA/IGtleSA6IGtleS5zcGxpdCgnLicpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUtleUlkKGtleSkge1xuICByZXR1cm4gaXNBcnJheShrZXkpID8ga2V5LmpvaW4oJy4nKSA6IGtleVxufVxuXG5mdW5jdGlvbiBnZXQob2JqLCBwYXRoKSB7XG4gIGxldCBsaXN0ID0gW107XG4gIGxldCBhcnIgPSBmYWxzZTtcblxuICBjb25zdCBkZWVwR2V0ID0gKG9iaiwgcGF0aCwgaW5kZXgpID0+IHtcbiAgICBpZiAoIWlzRGVmaW5lZChvYmopKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFwYXRoW2luZGV4XSkge1xuICAgICAgLy8gSWYgdGhlcmUncyBubyBwYXRoIGxlZnQsIHdlJ3ZlIGFycml2ZWQgYXQgdGhlIG9iamVjdCB3ZSBjYXJlIGFib3V0LlxuICAgICAgbGlzdC5wdXNoKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBrZXkgPSBwYXRoW2luZGV4XTtcblxuICAgICAgY29uc3QgdmFsdWUgPSBvYmpba2V5XTtcblxuICAgICAgaWYgKCFpc0RlZmluZWQodmFsdWUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgbGFzdCB2YWx1ZSBpbiB0aGUgcGF0aCwgYW5kIGlmIGl0J3MgYSBzdHJpbmcvbnVtYmVyL2Jvb2wsXG4gICAgICAvLyBhZGQgaXQgdG8gdGhlIGxpc3RcbiAgICAgIGlmIChcbiAgICAgICAgaW5kZXggPT09IHBhdGgubGVuZ3RoIC0gMSAmJlxuICAgICAgICAoaXNTdHJpbmcodmFsdWUpIHx8IGlzTnVtYmVyKHZhbHVlKSB8fCBpc0Jvb2xlYW4odmFsdWUpKVxuICAgICAgKSB7XG4gICAgICAgIGxpc3QucHVzaCh0b1N0cmluZyh2YWx1ZSkpO1xuICAgICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBhcnIgPSB0cnVlO1xuICAgICAgICAvLyBTZWFyY2ggZWFjaCBpdGVtIGluIHRoZSBhcnJheS5cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgZGVlcEdldCh2YWx1ZVtpXSwgcGF0aCwgaW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXRoLmxlbmd0aCkge1xuICAgICAgICAvLyBBbiBvYmplY3QuIFJlY3Vyc2UgZnVydGhlci5cbiAgICAgICAgZGVlcEdldCh2YWx1ZSwgcGF0aCwgaW5kZXggKyAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHkgKHNpbmNlIHBhdGggdXNlZCB0byBiZSBhIHN0cmluZylcbiAgZGVlcEdldChvYmosIGlzU3RyaW5nKHBhdGgpID8gcGF0aC5zcGxpdCgnLicpIDogcGF0aCwgMCk7XG5cbiAgcmV0dXJuIGFyciA/IGxpc3QgOiBsaXN0WzBdXG59XG5cbmNvbnN0IE1hdGNoT3B0aW9ucyA9IHtcbiAgLy8gV2hldGhlciB0aGUgbWF0Y2hlcyBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlIHJlc3VsdCBzZXQuIFdoZW4gYHRydWVgLCBlYWNoIHJlY29yZCBpbiB0aGUgcmVzdWx0XG4gIC8vIHNldCB3aWxsIGluY2x1ZGUgdGhlIGluZGljZXMgb2YgdGhlIG1hdGNoZWQgY2hhcmFjdGVycy5cbiAgLy8gVGhlc2UgY2FuIGNvbnNlcXVlbnRseSBiZSB1c2VkIGZvciBoaWdobGlnaHRpbmcgcHVycG9zZXMuXG4gIGluY2x1ZGVNYXRjaGVzOiBmYWxzZSxcbiAgLy8gV2hlbiBgdHJ1ZWAsIHRoZSBtYXRjaGluZyBmdW5jdGlvbiB3aWxsIGNvbnRpbnVlIHRvIHRoZSBlbmQgb2YgYSBzZWFyY2ggcGF0dGVybiBldmVuIGlmXG4gIC8vIGEgcGVyZmVjdCBtYXRjaCBoYXMgYWxyZWFkeSBiZWVuIGxvY2F0ZWQgaW4gdGhlIHN0cmluZy5cbiAgZmluZEFsbE1hdGNoZXM6IGZhbHNlLFxuICAvLyBNaW5pbXVtIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgbXVzdCBiZSBtYXRjaGVkIGJlZm9yZSBhIHJlc3VsdCBpcyBjb25zaWRlcmVkIGEgbWF0Y2hcbiAgbWluTWF0Y2hDaGFyTGVuZ3RoOiAxXG59O1xuXG5jb25zdCBCYXNpY09wdGlvbnMgPSB7XG4gIC8vIFdoZW4gYHRydWVgLCB0aGUgYWxnb3JpdGhtIGNvbnRpbnVlcyBzZWFyY2hpbmcgdG8gdGhlIGVuZCBvZiB0aGUgaW5wdXQgZXZlbiBpZiBhIHBlcmZlY3RcbiAgLy8gbWF0Y2ggaXMgZm91bmQgYmVmb3JlIHRoZSBlbmQgb2YgdGhlIHNhbWUgaW5wdXQuXG4gIGlzQ2FzZVNlbnNpdGl2ZTogZmFsc2UsXG4gIC8vIFdoZW4gYHRydWVgLCB0aGUgYWxnb3JpdGhtIHdpbGwgaWdub3JlIGRpYWNyaXRpY3MgKGFjY2VudHMpIGluIGNvbXBhcmlzb25zXG4gIGlnbm9yZURpYWNyaXRpY3M6IGZhbHNlLFxuICAvLyBXaGVuIHRydWUsIHRoZSBtYXRjaGluZyBmdW5jdGlvbiB3aWxsIGNvbnRpbnVlIHRvIHRoZSBlbmQgb2YgYSBzZWFyY2ggcGF0dGVybiBldmVuIGlmXG4gIGluY2x1ZGVTY29yZTogZmFsc2UsXG4gIC8vIExpc3Qgb2YgcHJvcGVydGllcyB0aGF0IHdpbGwgYmUgc2VhcmNoZWQuIFRoaXMgYWxzbyBzdXBwb3J0cyBuZXN0ZWQgcHJvcGVydGllcy5cbiAga2V5czogW10sXG4gIC8vIFdoZXRoZXIgdG8gc29ydCB0aGUgcmVzdWx0IGxpc3QsIGJ5IHNjb3JlXG4gIHNob3VsZFNvcnQ6IHRydWUsXG4gIC8vIERlZmF1bHQgc29ydCBmdW5jdGlvbjogc29ydCBieSBhc2NlbmRpbmcgc2NvcmUsIGFzY2VuZGluZyBpbmRleFxuICBzb3J0Rm46IChhLCBiKSA9PlxuICAgIGEuc2NvcmUgPT09IGIuc2NvcmUgPyAoYS5pZHggPCBiLmlkeCA/IC0xIDogMSkgOiBhLnNjb3JlIDwgYi5zY29yZSA/IC0xIDogMVxufTtcblxuY29uc3QgRnV6enlPcHRpb25zID0ge1xuICAvLyBBcHByb3hpbWF0ZWx5IHdoZXJlIGluIHRoZSB0ZXh0IGlzIHRoZSBwYXR0ZXJuIGV4cGVjdGVkIHRvIGJlIGZvdW5kP1xuICBsb2NhdGlvbjogMCxcbiAgLy8gQXQgd2hhdCBwb2ludCBkb2VzIHRoZSBtYXRjaCBhbGdvcml0aG0gZ2l2ZSB1cC4gQSB0aHJlc2hvbGQgb2YgJzAuMCcgcmVxdWlyZXMgYSBwZXJmZWN0IG1hdGNoXG4gIC8vIChvZiBib3RoIGxldHRlcnMgYW5kIGxvY2F0aW9uKSwgYSB0aHJlc2hvbGQgb2YgJzEuMCcgd291bGQgbWF0Y2ggYW55dGhpbmcuXG4gIHRocmVzaG9sZDogMC42LFxuICAvLyBEZXRlcm1pbmVzIGhvdyBjbG9zZSB0aGUgbWF0Y2ggbXVzdCBiZSB0byB0aGUgZnV6enkgbG9jYXRpb24gKHNwZWNpZmllZCBhYm92ZSkuXG4gIC8vIEFuIGV4YWN0IGxldHRlciBtYXRjaCB3aGljaCBpcyAnZGlzdGFuY2UnIGNoYXJhY3RlcnMgYXdheSBmcm9tIHRoZSBmdXp6eSBsb2NhdGlvblxuICAvLyB3b3VsZCBzY29yZSBhcyBhIGNvbXBsZXRlIG1pc21hdGNoLiBBIGRpc3RhbmNlIG9mICcwJyByZXF1aXJlcyB0aGUgbWF0Y2ggYmUgYXRcbiAgLy8gdGhlIGV4YWN0IGxvY2F0aW9uIHNwZWNpZmllZCwgYSB0aHJlc2hvbGQgb2YgJzEwMDAnIHdvdWxkIHJlcXVpcmUgYSBwZXJmZWN0IG1hdGNoXG4gIC8vIHRvIGJlIHdpdGhpbiA4MDAgY2hhcmFjdGVycyBvZiB0aGUgZnV6enkgbG9jYXRpb24gdG8gYmUgZm91bmQgdXNpbmcgYSAwLjggdGhyZXNob2xkLlxuICBkaXN0YW5jZTogMTAwXG59O1xuXG5jb25zdCBBZHZhbmNlZE9wdGlvbnMgPSB7XG4gIC8vIFdoZW4gYHRydWVgLCBpdCBlbmFibGVzIHRoZSB1c2Ugb2YgdW5peC1saWtlIHNlYXJjaCBjb21tYW5kc1xuICB1c2VFeHRlbmRlZFNlYXJjaDogZmFsc2UsXG4gIC8vIFRoZSBnZXQgZnVuY3Rpb24gdG8gdXNlIHdoZW4gZmV0Y2hpbmcgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgLy8gVGhlIGRlZmF1bHQgd2lsbCBzZWFyY2ggbmVzdGVkIHBhdGhzICppZSBmb28uYmFyLmJheipcbiAgZ2V0Rm46IGdldCxcbiAgLy8gV2hlbiBgdHJ1ZWAsIHNlYXJjaCB3aWxsIGlnbm9yZSBgbG9jYXRpb25gIGFuZCBgZGlzdGFuY2VgLCBzbyBpdCB3b24ndCBtYXR0ZXJcbiAgLy8gd2hlcmUgaW4gdGhlIHN0cmluZyB0aGUgcGF0dGVybiBhcHBlYXJzLlxuICAvLyBNb3JlIGluZm86IGh0dHBzOi8vZnVzZWpzLmlvL2NvbmNlcHRzL3Njb3JpbmctdGhlb3J5Lmh0bWwjZnV6emluZXNzLXNjb3JlXG4gIGlnbm9yZUxvY2F0aW9uOiBmYWxzZSxcbiAgLy8gV2hlbiBgdHJ1ZWAsIHRoZSBjYWxjdWxhdGlvbiBmb3IgdGhlIHJlbGV2YW5jZSBzY29yZSAodXNlZCBmb3Igc29ydGluZykgd2lsbFxuICAvLyBpZ25vcmUgdGhlIGZpZWxkLWxlbmd0aCBub3JtLlxuICAvLyBNb3JlIGluZm86IGh0dHBzOi8vZnVzZWpzLmlvL2NvbmNlcHRzL3Njb3JpbmctdGhlb3J5Lmh0bWwjZmllbGQtbGVuZ3RoLW5vcm1cbiAgaWdub3JlRmllbGROb3JtOiBmYWxzZSxcbiAgLy8gVGhlIHdlaWdodCB0byBkZXRlcm1pbmUgaG93IG11Y2ggZmllbGQgbGVuZ3RoIG5vcm0gZWZmZWN0cyBzY29yaW5nLlxuICBmaWVsZE5vcm1XZWlnaHQ6IDFcbn07XG5cbnZhciBDb25maWcgPSB7XG4gIC4uLkJhc2ljT3B0aW9ucyxcbiAgLi4uTWF0Y2hPcHRpb25zLFxuICAuLi5GdXp6eU9wdGlvbnMsXG4gIC4uLkFkdmFuY2VkT3B0aW9uc1xufTtcblxuY29uc3QgU1BBQ0UgPSAvW14gXSsvZztcblxuLy8gRmllbGQtbGVuZ3RoIG5vcm06IHRoZSBzaG9ydGVyIHRoZSBmaWVsZCwgdGhlIGhpZ2hlciB0aGUgd2VpZ2h0LlxuLy8gU2V0IHRvIDMgZGVjaW1hbHMgdG8gcmVkdWNlIGluZGV4IHNpemUuXG5mdW5jdGlvbiBub3JtKHdlaWdodCA9IDEsIG1hbnRpc3NhID0gMykge1xuICBjb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcbiAgY29uc3QgbSA9IE1hdGgucG93KDEwLCBtYW50aXNzYSk7XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQodmFsdWUpIHtcbiAgICAgIGNvbnN0IG51bVRva2VucyA9IHZhbHVlLm1hdGNoKFNQQUNFKS5sZW5ndGg7XG5cbiAgICAgIGlmIChjYWNoZS5oYXMobnVtVG9rZW5zKSkge1xuICAgICAgICByZXR1cm4gY2FjaGUuZ2V0KG51bVRva2VucylcbiAgICAgIH1cblxuICAgICAgLy8gRGVmYXVsdCBmdW5jdGlvbiBpcyAxL3NxcnQoeCksIHdlaWdodCBtYWtlcyB0aGF0IHZhcmlhYmxlXG4gICAgICBjb25zdCBub3JtID0gMSAvIE1hdGgucG93KG51bVRva2VucywgMC41ICogd2VpZ2h0KTtcblxuICAgICAgLy8gSW4gcGxhY2Ugb2YgYHRvRml4ZWQobWFudGlzc2EpYCwgZm9yIGZhc3RlciBjb21wdXRhdGlvblxuICAgICAgY29uc3QgbiA9IHBhcnNlRmxvYXQoTWF0aC5yb3VuZChub3JtICogbSkgLyBtKTtcblxuICAgICAgY2FjaGUuc2V0KG51bVRva2Vucywgbik7XG5cbiAgICAgIHJldHVybiBuXG4gICAgfSxcbiAgICBjbGVhcigpIHtcbiAgICAgIGNhY2hlLmNsZWFyKCk7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEZ1c2VJbmRleCB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICBnZXRGbiA9IENvbmZpZy5nZXRGbixcbiAgICBmaWVsZE5vcm1XZWlnaHQgPSBDb25maWcuZmllbGROb3JtV2VpZ2h0XG4gIH0gPSB7fSkge1xuICAgIHRoaXMubm9ybSA9IG5vcm0oZmllbGROb3JtV2VpZ2h0LCAzKTtcbiAgICB0aGlzLmdldEZuID0gZ2V0Rm47XG4gICAgdGhpcy5pc0NyZWF0ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuc2V0SW5kZXhSZWNvcmRzKCk7XG4gIH1cbiAgc2V0U291cmNlcyhkb2NzID0gW10pIHtcbiAgICB0aGlzLmRvY3MgPSBkb2NzO1xuICB9XG4gIHNldEluZGV4UmVjb3JkcyhyZWNvcmRzID0gW10pIHtcbiAgICB0aGlzLnJlY29yZHMgPSByZWNvcmRzO1xuICB9XG4gIHNldEtleXMoa2V5cyA9IFtdKSB7XG4gICAgdGhpcy5rZXlzID0ga2V5cztcbiAgICB0aGlzLl9rZXlzTWFwID0ge307XG4gICAga2V5cy5mb3JFYWNoKChrZXksIGlkeCkgPT4ge1xuICAgICAgdGhpcy5fa2V5c01hcFtrZXkuaWRdID0gaWR4O1xuICAgIH0pO1xuICB9XG4gIGNyZWF0ZSgpIHtcbiAgICBpZiAodGhpcy5pc0NyZWF0ZWQgfHwgIXRoaXMuZG9jcy5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuaXNDcmVhdGVkID0gdHJ1ZTtcblxuICAgIC8vIExpc3QgaXMgQXJyYXk8U3RyaW5nPlxuICAgIGlmIChpc1N0cmluZyh0aGlzLmRvY3NbMF0pKSB7XG4gICAgICB0aGlzLmRvY3MuZm9yRWFjaCgoZG9jLCBkb2NJbmRleCkgPT4ge1xuICAgICAgICB0aGlzLl9hZGRTdHJpbmcoZG9jLCBkb2NJbmRleCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGlzdCBpcyBBcnJheTxPYmplY3Q+XG4gICAgICB0aGlzLmRvY3MuZm9yRWFjaCgoZG9jLCBkb2NJbmRleCkgPT4ge1xuICAgICAgICB0aGlzLl9hZGRPYmplY3QoZG9jLCBkb2NJbmRleCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLm5vcm0uY2xlYXIoKTtcbiAgfVxuICAvLyBBZGRzIGEgZG9jIHRvIHRoZSBlbmQgb2YgdGhlIGluZGV4XG4gIGFkZChkb2MpIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLnNpemUoKTtcblxuICAgIGlmIChpc1N0cmluZyhkb2MpKSB7XG4gICAgICB0aGlzLl9hZGRTdHJpbmcoZG9jLCBpZHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hZGRPYmplY3QoZG9jLCBpZHgpO1xuICAgIH1cbiAgfVxuICAvLyBSZW1vdmVzIHRoZSBkb2MgYXQgdGhlIHNwZWNpZmllZCBpbmRleCBvZiB0aGUgaW5kZXhcbiAgcmVtb3ZlQXQoaWR4KSB7XG4gICAgdGhpcy5yZWNvcmRzLnNwbGljZShpZHgsIDEpO1xuXG4gICAgLy8gQ2hhbmdlIHJlZiBpbmRleCBvZiBldmVyeSBzdWJzcXVlbnQgZG9jXG4gICAgZm9yIChsZXQgaSA9IGlkeCwgbGVuID0gdGhpcy5zaXplKCk7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgdGhpcy5yZWNvcmRzW2ldLmkgLT0gMTtcbiAgICB9XG4gIH1cbiAgZ2V0VmFsdWVGb3JJdGVtQXRLZXlJZChpdGVtLCBrZXlJZCkge1xuICAgIHJldHVybiBpdGVtW3RoaXMuX2tleXNNYXBba2V5SWRdXVxuICB9XG4gIHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVjb3Jkcy5sZW5ndGhcbiAgfVxuICBfYWRkU3RyaW5nKGRvYywgZG9jSW5kZXgpIHtcbiAgICBpZiAoIWlzRGVmaW5lZChkb2MpIHx8IGlzQmxhbmsoZG9jKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IHJlY29yZCA9IHtcbiAgICAgIHY6IGRvYyxcbiAgICAgIGk6IGRvY0luZGV4LFxuICAgICAgbjogdGhpcy5ub3JtLmdldChkb2MpXG4gICAgfTtcblxuICAgIHRoaXMucmVjb3Jkcy5wdXNoKHJlY29yZCk7XG4gIH1cbiAgX2FkZE9iamVjdChkb2MsIGRvY0luZGV4KSB7XG4gICAgbGV0IHJlY29yZCA9IHsgaTogZG9jSW5kZXgsICQ6IHt9IH07XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgZXZlcnkga2V5IChpLmUsIHBhdGgpLCBhbmQgZmV0Y2ggdGhlIHZhbHVlIGF0IHRoYXQga2V5XG4gICAgdGhpcy5rZXlzLmZvckVhY2goKGtleSwga2V5SW5kZXgpID0+IHtcbiAgICAgIGxldCB2YWx1ZSA9IGtleS5nZXRGbiA/IGtleS5nZXRGbihkb2MpIDogdGhpcy5nZXRGbihkb2MsIGtleS5wYXRoKTtcblxuICAgICAgaWYgKCFpc0RlZmluZWQodmFsdWUpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgbGV0IHN1YlJlY29yZHMgPSBbXTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbeyBuZXN0ZWRBcnJJbmRleDogLTEsIHZhbHVlIH1dO1xuXG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCB7IG5lc3RlZEFyckluZGV4LCB2YWx1ZSB9ID0gc3RhY2sucG9wKCk7XG5cbiAgICAgICAgICBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzU3RyaW5nKHZhbHVlKSAmJiAhaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGxldCBzdWJSZWNvcmQgPSB7XG4gICAgICAgICAgICAgIHY6IHZhbHVlLFxuICAgICAgICAgICAgICBpOiBuZXN0ZWRBcnJJbmRleCxcbiAgICAgICAgICAgICAgbjogdGhpcy5ub3JtLmdldCh2YWx1ZSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN1YlJlY29yZHMucHVzaChzdWJSZWNvcmQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlLmZvckVhY2goKGl0ZW0sIGspID0+IHtcbiAgICAgICAgICAgICAgc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgbmVzdGVkQXJySW5kZXg6IGssXG4gICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgO1xuICAgICAgICB9XG4gICAgICAgIHJlY29yZC4kW2tleUluZGV4XSA9IHN1YlJlY29yZHM7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKHZhbHVlKSAmJiAhaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgICAgbGV0IHN1YlJlY29yZCA9IHtcbiAgICAgICAgICB2OiB2YWx1ZSxcbiAgICAgICAgICBuOiB0aGlzLm5vcm0uZ2V0KHZhbHVlKVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlY29yZC4kW2tleUluZGV4XSA9IHN1YlJlY29yZDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmVjb3Jkcy5wdXNoKHJlY29yZCk7XG4gIH1cbiAgdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICBrZXlzOiB0aGlzLmtleXMsXG4gICAgICByZWNvcmRzOiB0aGlzLnJlY29yZHNcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlSW5kZXgoXG4gIGtleXMsXG4gIGRvY3MsXG4gIHsgZ2V0Rm4gPSBDb25maWcuZ2V0Rm4sIGZpZWxkTm9ybVdlaWdodCA9IENvbmZpZy5maWVsZE5vcm1XZWlnaHQgfSA9IHt9XG4pIHtcbiAgY29uc3QgbXlJbmRleCA9IG5ldyBGdXNlSW5kZXgoeyBnZXRGbiwgZmllbGROb3JtV2VpZ2h0IH0pO1xuICBteUluZGV4LnNldEtleXMoa2V5cy5tYXAoY3JlYXRlS2V5KSk7XG4gIG15SW5kZXguc2V0U291cmNlcyhkb2NzKTtcbiAgbXlJbmRleC5jcmVhdGUoKTtcbiAgcmV0dXJuIG15SW5kZXhcbn1cblxuZnVuY3Rpb24gcGFyc2VJbmRleChcbiAgZGF0YSxcbiAgeyBnZXRGbiA9IENvbmZpZy5nZXRGbiwgZmllbGROb3JtV2VpZ2h0ID0gQ29uZmlnLmZpZWxkTm9ybVdlaWdodCB9ID0ge31cbikge1xuICBjb25zdCB7IGtleXMsIHJlY29yZHMgfSA9IGRhdGE7XG4gIGNvbnN0IG15SW5kZXggPSBuZXcgRnVzZUluZGV4KHsgZ2V0Rm4sIGZpZWxkTm9ybVdlaWdodCB9KTtcbiAgbXlJbmRleC5zZXRLZXlzKGtleXMpO1xuICBteUluZGV4LnNldEluZGV4UmVjb3JkcyhyZWNvcmRzKTtcbiAgcmV0dXJuIG15SW5kZXhcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNjb3JlJDEoXG4gIHBhdHRlcm4sXG4gIHtcbiAgICBlcnJvcnMgPSAwLFxuICAgIGN1cnJlbnRMb2NhdGlvbiA9IDAsXG4gICAgZXhwZWN0ZWRMb2NhdGlvbiA9IDAsXG4gICAgZGlzdGFuY2UgPSBDb25maWcuZGlzdGFuY2UsXG4gICAgaWdub3JlTG9jYXRpb24gPSBDb25maWcuaWdub3JlTG9jYXRpb25cbiAgfSA9IHt9XG4pIHtcbiAgY29uc3QgYWNjdXJhY3kgPSBlcnJvcnMgLyBwYXR0ZXJuLmxlbmd0aDtcblxuICBpZiAoaWdub3JlTG9jYXRpb24pIHtcbiAgICByZXR1cm4gYWNjdXJhY3lcbiAgfVxuXG4gIGNvbnN0IHByb3hpbWl0eSA9IE1hdGguYWJzKGV4cGVjdGVkTG9jYXRpb24gLSBjdXJyZW50TG9jYXRpb24pO1xuXG4gIGlmICghZGlzdGFuY2UpIHtcbiAgICAvLyBEb2RnZSBkaXZpZGUgYnkgemVybyBlcnJvci5cbiAgICByZXR1cm4gcHJveGltaXR5ID8gMS4wIDogYWNjdXJhY3lcbiAgfVxuXG4gIHJldHVybiBhY2N1cmFjeSArIHByb3hpbWl0eSAvIGRpc3RhbmNlXG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRNYXNrVG9JbmRpY2VzKFxuICBtYXRjaG1hc2sgPSBbXSxcbiAgbWluTWF0Y2hDaGFyTGVuZ3RoID0gQ29uZmlnLm1pbk1hdGNoQ2hhckxlbmd0aFxuKSB7XG4gIGxldCBpbmRpY2VzID0gW107XG4gIGxldCBzdGFydCA9IC0xO1xuICBsZXQgZW5kID0gLTE7XG4gIGxldCBpID0gMDtcblxuICBmb3IgKGxldCBsZW4gPSBtYXRjaG1hc2subGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICBsZXQgbWF0Y2ggPSBtYXRjaG1hc2tbaV07XG4gICAgaWYgKG1hdGNoICYmIHN0YXJ0ID09PSAtMSkge1xuICAgICAgc3RhcnQgPSBpO1xuICAgIH0gZWxzZSBpZiAoIW1hdGNoICYmIHN0YXJ0ICE9PSAtMSkge1xuICAgICAgZW5kID0gaSAtIDE7XG4gICAgICBpZiAoZW5kIC0gc3RhcnQgKyAxID49IG1pbk1hdGNoQ2hhckxlbmd0aCkge1xuICAgICAgICBpbmRpY2VzLnB1c2goW3N0YXJ0LCBlbmRdKTtcbiAgICAgIH1cbiAgICAgIHN0YXJ0ID0gLTE7XG4gICAgfVxuICB9XG5cbiAgLy8gKGktMSAtIHN0YXJ0KSArIDEgPT4gaSAtIHN0YXJ0XG4gIGlmIChtYXRjaG1hc2tbaSAtIDFdICYmIGkgLSBzdGFydCA+PSBtaW5NYXRjaENoYXJMZW5ndGgpIHtcbiAgICBpbmRpY2VzLnB1c2goW3N0YXJ0LCBpIC0gMV0pO1xuICB9XG5cbiAgcmV0dXJuIGluZGljZXNcbn1cblxuLy8gTWFjaGluZSB3b3JkIHNpemVcbmNvbnN0IE1BWF9CSVRTID0gMzI7XG5cbmZ1bmN0aW9uIHNlYXJjaChcbiAgdGV4dCxcbiAgcGF0dGVybixcbiAgcGF0dGVybkFscGhhYmV0LFxuICB7XG4gICAgbG9jYXRpb24gPSBDb25maWcubG9jYXRpb24sXG4gICAgZGlzdGFuY2UgPSBDb25maWcuZGlzdGFuY2UsXG4gICAgdGhyZXNob2xkID0gQ29uZmlnLnRocmVzaG9sZCxcbiAgICBmaW5kQWxsTWF0Y2hlcyA9IENvbmZpZy5maW5kQWxsTWF0Y2hlcyxcbiAgICBtaW5NYXRjaENoYXJMZW5ndGggPSBDb25maWcubWluTWF0Y2hDaGFyTGVuZ3RoLFxuICAgIGluY2x1ZGVNYXRjaGVzID0gQ29uZmlnLmluY2x1ZGVNYXRjaGVzLFxuICAgIGlnbm9yZUxvY2F0aW9uID0gQ29uZmlnLmlnbm9yZUxvY2F0aW9uXG4gIH0gPSB7fVxuKSB7XG4gIGlmIChwYXR0ZXJuLmxlbmd0aCA+IE1BWF9CSVRTKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFBBVFRFUk5fTEVOR1RIX1RPT19MQVJHRShNQVhfQklUUykpXG4gIH1cblxuICBjb25zdCBwYXR0ZXJuTGVuID0gcGF0dGVybi5sZW5ndGg7XG4gIC8vIFNldCBzdGFydGluZyBsb2NhdGlvbiBhdCBiZWdpbm5pbmcgdGV4dCBhbmQgaW5pdGlhbGl6ZSB0aGUgYWxwaGFiZXQuXG4gIGNvbnN0IHRleHRMZW4gPSB0ZXh0Lmxlbmd0aDtcbiAgLy8gSGFuZGxlIHRoZSBjYXNlIHdoZW4gbG9jYXRpb24gPiB0ZXh0Lmxlbmd0aFxuICBjb25zdCBleHBlY3RlZExvY2F0aW9uID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obG9jYXRpb24sIHRleHRMZW4pKTtcbiAgLy8gSGlnaGVzdCBzY29yZSBiZXlvbmQgd2hpY2ggd2UgZ2l2ZSB1cC5cbiAgbGV0IGN1cnJlbnRUaHJlc2hvbGQgPSB0aHJlc2hvbGQ7XG4gIC8vIElzIHRoZXJlIGEgbmVhcmJ5IGV4YWN0IG1hdGNoPyAoc3BlZWR1cClcbiAgbGV0IGJlc3RMb2NhdGlvbiA9IGV4cGVjdGVkTG9jYXRpb247XG5cbiAgLy8gUGVyZm9ybWFuY2U6IG9ubHkgY29tcHV0ZXIgbWF0Y2hlcyB3aGVuIHRoZSBtaW5NYXRjaENoYXJMZW5ndGggPiAxXG4gIC8vIE9SIGlmIGBpbmNsdWRlTWF0Y2hlc2AgaXMgdHJ1ZS5cbiAgY29uc3QgY29tcHV0ZU1hdGNoZXMgPSBtaW5NYXRjaENoYXJMZW5ndGggPiAxIHx8IGluY2x1ZGVNYXRjaGVzO1xuICAvLyBBIG1hc2sgb2YgdGhlIG1hdGNoZXMsIHVzZWQgZm9yIGJ1aWxkaW5nIHRoZSBpbmRpY2VzXG4gIGNvbnN0IG1hdGNoTWFzayA9IGNvbXB1dGVNYXRjaGVzID8gQXJyYXkodGV4dExlbikgOiBbXTtcblxuICBsZXQgaW5kZXg7XG5cbiAgLy8gR2V0IGFsbCBleGFjdCBtYXRjaGVzLCBoZXJlIGZvciBzcGVlZCB1cFxuICB3aGlsZSAoKGluZGV4ID0gdGV4dC5pbmRleE9mKHBhdHRlcm4sIGJlc3RMb2NhdGlvbikpID4gLTEpIHtcbiAgICBsZXQgc2NvcmUgPSBjb21wdXRlU2NvcmUkMShwYXR0ZXJuLCB7XG4gICAgICBjdXJyZW50TG9jYXRpb246IGluZGV4LFxuICAgICAgZXhwZWN0ZWRMb2NhdGlvbixcbiAgICAgIGRpc3RhbmNlLFxuICAgICAgaWdub3JlTG9jYXRpb25cbiAgICB9KTtcblxuICAgIGN1cnJlbnRUaHJlc2hvbGQgPSBNYXRoLm1pbihzY29yZSwgY3VycmVudFRocmVzaG9sZCk7XG4gICAgYmVzdExvY2F0aW9uID0gaW5kZXggKyBwYXR0ZXJuTGVuO1xuXG4gICAgaWYgKGNvbXB1dGVNYXRjaGVzKSB7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICB3aGlsZSAoaSA8IHBhdHRlcm5MZW4pIHtcbiAgICAgICAgbWF0Y2hNYXNrW2luZGV4ICsgaV0gPSAxO1xuICAgICAgICBpICs9IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmVzZXQgdGhlIGJlc3QgbG9jYXRpb25cbiAgYmVzdExvY2F0aW9uID0gLTE7XG5cbiAgbGV0IGxhc3RCaXRBcnIgPSBbXTtcbiAgbGV0IGZpbmFsU2NvcmUgPSAxO1xuICBsZXQgYmluTWF4ID0gcGF0dGVybkxlbiArIHRleHRMZW47XG5cbiAgY29uc3QgbWFzayA9IDEgPDwgKHBhdHRlcm5MZW4gLSAxKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdHRlcm5MZW47IGkgKz0gMSkge1xuICAgIC8vIFNjYW4gZm9yIHRoZSBiZXN0IG1hdGNoOyBlYWNoIGl0ZXJhdGlvbiBhbGxvd3MgZm9yIG9uZSBtb3JlIGVycm9yLlxuICAgIC8vIFJ1biBhIGJpbmFyeSBzZWFyY2ggdG8gZGV0ZXJtaW5lIGhvdyBmYXIgZnJvbSB0aGUgbWF0Y2ggbG9jYXRpb24gd2UgY2FuIHN0cmF5XG4gICAgLy8gYXQgdGhpcyBlcnJvciBsZXZlbC5cbiAgICBsZXQgYmluTWluID0gMDtcbiAgICBsZXQgYmluTWlkID0gYmluTWF4O1xuXG4gICAgd2hpbGUgKGJpbk1pbiA8IGJpbk1pZCkge1xuICAgICAgY29uc3Qgc2NvcmUgPSBjb21wdXRlU2NvcmUkMShwYXR0ZXJuLCB7XG4gICAgICAgIGVycm9yczogaSxcbiAgICAgICAgY3VycmVudExvY2F0aW9uOiBleHBlY3RlZExvY2F0aW9uICsgYmluTWlkLFxuICAgICAgICBleHBlY3RlZExvY2F0aW9uLFxuICAgICAgICBkaXN0YW5jZSxcbiAgICAgICAgaWdub3JlTG9jYXRpb25cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoc2NvcmUgPD0gY3VycmVudFRocmVzaG9sZCkge1xuICAgICAgICBiaW5NaW4gPSBiaW5NaWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiaW5NYXggPSBiaW5NaWQ7XG4gICAgICB9XG5cbiAgICAgIGJpbk1pZCA9IE1hdGguZmxvb3IoKGJpbk1heCAtIGJpbk1pbikgLyAyICsgYmluTWluKTtcbiAgICB9XG5cbiAgICAvLyBVc2UgdGhlIHJlc3VsdCBmcm9tIHRoaXMgaXRlcmF0aW9uIGFzIHRoZSBtYXhpbXVtIGZvciB0aGUgbmV4dC5cbiAgICBiaW5NYXggPSBiaW5NaWQ7XG5cbiAgICBsZXQgc3RhcnQgPSBNYXRoLm1heCgxLCBleHBlY3RlZExvY2F0aW9uIC0gYmluTWlkICsgMSk7XG4gICAgbGV0IGZpbmlzaCA9IGZpbmRBbGxNYXRjaGVzXG4gICAgICA/IHRleHRMZW5cbiAgICAgIDogTWF0aC5taW4oZXhwZWN0ZWRMb2NhdGlvbiArIGJpbk1pZCwgdGV4dExlbikgKyBwYXR0ZXJuTGVuO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgYml0IGFycmF5XG4gICAgbGV0IGJpdEFyciA9IEFycmF5KGZpbmlzaCArIDIpO1xuXG4gICAgYml0QXJyW2ZpbmlzaCArIDFdID0gKDEgPDwgaSkgLSAxO1xuXG4gICAgZm9yIChsZXQgaiA9IGZpbmlzaDsgaiA+PSBzdGFydDsgaiAtPSAxKSB7XG4gICAgICBsZXQgY3VycmVudExvY2F0aW9uID0gaiAtIDE7XG4gICAgICBsZXQgY2hhck1hdGNoID0gcGF0dGVybkFscGhhYmV0W3RleHQuY2hhckF0KGN1cnJlbnRMb2NhdGlvbildO1xuXG4gICAgICBpZiAoY29tcHV0ZU1hdGNoZXMpIHtcbiAgICAgICAgLy8gU3BlZWQgdXA6IHF1aWNrIGJvb2wgdG8gaW50IGNvbnZlcnNpb24gKGkuZSwgYGNoYXJNYXRjaCA/IDEgOiAwYClcbiAgICAgICAgbWF0Y2hNYXNrW2N1cnJlbnRMb2NhdGlvbl0gPSArISFjaGFyTWF0Y2g7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcnN0IHBhc3M6IGV4YWN0IG1hdGNoXG4gICAgICBiaXRBcnJbal0gPSAoKGJpdEFycltqICsgMV0gPDwgMSkgfCAxKSAmIGNoYXJNYXRjaDtcblxuICAgICAgLy8gU3Vic2VxdWVudCBwYXNzZXM6IGZ1enp5IG1hdGNoXG4gICAgICBpZiAoaSkge1xuICAgICAgICBiaXRBcnJbal0gfD1cbiAgICAgICAgICAoKGxhc3RCaXRBcnJbaiArIDFdIHwgbGFzdEJpdEFycltqXSkgPDwgMSkgfCAxIHwgbGFzdEJpdEFycltqICsgMV07XG4gICAgICB9XG5cbiAgICAgIGlmIChiaXRBcnJbal0gJiBtYXNrKSB7XG4gICAgICAgIGZpbmFsU2NvcmUgPSBjb21wdXRlU2NvcmUkMShwYXR0ZXJuLCB7XG4gICAgICAgICAgZXJyb3JzOiBpLFxuICAgICAgICAgIGN1cnJlbnRMb2NhdGlvbixcbiAgICAgICAgICBleHBlY3RlZExvY2F0aW9uLFxuICAgICAgICAgIGRpc3RhbmNlLFxuICAgICAgICAgIGlnbm9yZUxvY2F0aW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoaXMgbWF0Y2ggd2lsbCBhbG1vc3QgY2VydGFpbmx5IGJlIGJldHRlciB0aGFuIGFueSBleGlzdGluZyBtYXRjaC5cbiAgICAgICAgLy8gQnV0IGNoZWNrIGFueXdheS5cbiAgICAgICAgaWYgKGZpbmFsU2NvcmUgPD0gY3VycmVudFRocmVzaG9sZCkge1xuICAgICAgICAgIC8vIEluZGVlZCBpdCBpc1xuICAgICAgICAgIGN1cnJlbnRUaHJlc2hvbGQgPSBmaW5hbFNjb3JlO1xuICAgICAgICAgIGJlc3RMb2NhdGlvbiA9IGN1cnJlbnRMb2NhdGlvbjtcblxuICAgICAgICAgIC8vIEFscmVhZHkgcGFzc2VkIGBsb2NgLCBkb3duaGlsbCBmcm9tIGhlcmUgb24gaW4uXG4gICAgICAgICAgaWYgKGJlc3RMb2NhdGlvbiA8PSBleHBlY3RlZExvY2F0aW9uKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFdoZW4gcGFzc2luZyBgYmVzdExvY2F0aW9uYCwgZG9uJ3QgZXhjZWVkIG91ciBjdXJyZW50IGRpc3RhbmNlIGZyb20gYGV4cGVjdGVkTG9jYXRpb25gLlxuICAgICAgICAgIHN0YXJ0ID0gTWF0aC5tYXgoMSwgMiAqIGV4cGVjdGVkTG9jYXRpb24gLSBiZXN0TG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTm8gaG9wZSBmb3IgYSAoYmV0dGVyKSBtYXRjaCBhdCBncmVhdGVyIGVycm9yIGxldmVscy5cbiAgICBjb25zdCBzY29yZSA9IGNvbXB1dGVTY29yZSQxKHBhdHRlcm4sIHtcbiAgICAgIGVycm9yczogaSArIDEsXG4gICAgICBjdXJyZW50TG9jYXRpb246IGV4cGVjdGVkTG9jYXRpb24sXG4gICAgICBleHBlY3RlZExvY2F0aW9uLFxuICAgICAgZGlzdGFuY2UsXG4gICAgICBpZ25vcmVMb2NhdGlvblxuICAgIH0pO1xuXG4gICAgaWYgKHNjb3JlID4gY3VycmVudFRocmVzaG9sZCkge1xuICAgICAgYnJlYWtcbiAgICB9XG5cbiAgICBsYXN0Qml0QXJyID0gYml0QXJyO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIGlzTWF0Y2g6IGJlc3RMb2NhdGlvbiA+PSAwLFxuICAgIC8vIENvdW50IGV4YWN0IG1hdGNoZXMgKHRob3NlIHdpdGggYSBzY29yZSBvZiAwKSB0byBiZSBcImFsbW9zdFwiIGV4YWN0XG4gICAgc2NvcmU6IE1hdGgubWF4KDAuMDAxLCBmaW5hbFNjb3JlKVxuICB9O1xuXG4gIGlmIChjb21wdXRlTWF0Y2hlcykge1xuICAgIGNvbnN0IGluZGljZXMgPSBjb252ZXJ0TWFza1RvSW5kaWNlcyhtYXRjaE1hc2ssIG1pbk1hdGNoQ2hhckxlbmd0aCk7XG4gICAgaWYgKCFpbmRpY2VzLmxlbmd0aCkge1xuICAgICAgcmVzdWx0LmlzTWF0Y2ggPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGluY2x1ZGVNYXRjaGVzKSB7XG4gICAgICByZXN1bHQuaW5kaWNlcyA9IGluZGljZXM7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBjcmVhdGVQYXR0ZXJuQWxwaGFiZXQocGF0dGVybikge1xuICBsZXQgbWFzayA9IHt9O1xuXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBwYXR0ZXJuLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgY29uc3QgY2hhciA9IHBhdHRlcm4uY2hhckF0KGkpO1xuICAgIG1hc2tbY2hhcl0gPSAobWFza1tjaGFyXSB8fCAwKSB8ICgxIDw8IChsZW4gLSBpIC0gMSkpO1xuICB9XG5cbiAgcmV0dXJuIG1hc2tcbn1cblxuY29uc3Qgc3RyaXBEaWFjcml0aWNzID0gU3RyaW5nLnByb3RvdHlwZS5ub3JtYWxpemVcbiAgICA/ICgoc3RyKSA9PiBzdHIubm9ybWFsaXplKCdORkQnKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZGXFx1MDQ4My1cXHUwNDg5XFx1MDU5MS1cXHUwNUJEXFx1MDVCRlxcdTA1QzFcXHUwNUMyXFx1MDVDNFxcdTA1QzVcXHUwNUM3XFx1MDYxMC1cXHUwNjFBXFx1MDY0Qi1cXHUwNjVGXFx1MDY3MFxcdTA2RDYtXFx1MDZEQ1xcdTA2REYtXFx1MDZFNFxcdTA2RTdcXHUwNkU4XFx1MDZFQS1cXHUwNkVEXFx1MDcxMVxcdTA3MzAtXFx1MDc0QVxcdTA3QTYtXFx1MDdCMFxcdTA3RUItXFx1MDdGM1xcdTA3RkRcXHUwODE2LVxcdTA4MTlcXHUwODFCLVxcdTA4MjNcXHUwODI1LVxcdTA4MjdcXHUwODI5LVxcdTA4MkRcXHUwODU5LVxcdTA4NUJcXHUwOEQzLVxcdTA4RTFcXHUwOEUzLVxcdTA5MDNcXHUwOTNBLVxcdTA5M0NcXHUwOTNFLVxcdTA5NEZcXHUwOTUxLVxcdTA5NTdcXHUwOTYyXFx1MDk2M1xcdTA5ODEtXFx1MDk4M1xcdTA5QkNcXHUwOUJFLVxcdTA5QzRcXHUwOUM3XFx1MDlDOFxcdTA5Q0ItXFx1MDlDRFxcdTA5RDdcXHUwOUUyXFx1MDlFM1xcdTA5RkVcXHUwQTAxLVxcdTBBMDNcXHUwQTNDXFx1MEEzRS1cXHUwQTQyXFx1MEE0N1xcdTBBNDhcXHUwQTRCLVxcdTBBNERcXHUwQTUxXFx1MEE3MFxcdTBBNzFcXHUwQTc1XFx1MEE4MS1cXHUwQTgzXFx1MEFCQ1xcdTBBQkUtXFx1MEFDNVxcdTBBQzctXFx1MEFDOVxcdTBBQ0ItXFx1MEFDRFxcdTBBRTJcXHUwQUUzXFx1MEFGQS1cXHUwQUZGXFx1MEIwMS1cXHUwQjAzXFx1MEIzQ1xcdTBCM0UtXFx1MEI0NFxcdTBCNDdcXHUwQjQ4XFx1MEI0Qi1cXHUwQjREXFx1MEI1NlxcdTBCNTdcXHUwQjYyXFx1MEI2M1xcdTBCODJcXHUwQkJFLVxcdTBCQzJcXHUwQkM2LVxcdTBCQzhcXHUwQkNBLVxcdTBCQ0RcXHUwQkQ3XFx1MEMwMC1cXHUwQzA0XFx1MEMzRS1cXHUwQzQ0XFx1MEM0Ni1cXHUwQzQ4XFx1MEM0QS1cXHUwQzREXFx1MEM1NVxcdTBDNTZcXHUwQzYyXFx1MEM2M1xcdTBDODEtXFx1MEM4M1xcdTBDQkNcXHUwQ0JFLVxcdTBDQzRcXHUwQ0M2LVxcdTBDQzhcXHUwQ0NBLVxcdTBDQ0RcXHUwQ0Q1XFx1MENENlxcdTBDRTJcXHUwQ0UzXFx1MEQwMC1cXHUwRDAzXFx1MEQzQlxcdTBEM0NcXHUwRDNFLVxcdTBENDRcXHUwRDQ2LVxcdTBENDhcXHUwRDRBLVxcdTBENERcXHUwRDU3XFx1MEQ2MlxcdTBENjNcXHUwRDgyXFx1MEQ4M1xcdTBEQ0FcXHUwRENGLVxcdTBERDRcXHUwREQ2XFx1MEREOC1cXHUwRERGXFx1MERGMlxcdTBERjNcXHUwRTMxXFx1MEUzNC1cXHUwRTNBXFx1MEU0Ny1cXHUwRTRFXFx1MEVCMVxcdTBFQjQtXFx1MEVCOVxcdTBFQkJcXHUwRUJDXFx1MEVDOC1cXHUwRUNEXFx1MEYxOFxcdTBGMTlcXHUwRjM1XFx1MEYzN1xcdTBGMzlcXHUwRjNFXFx1MEYzRlxcdTBGNzEtXFx1MEY4NFxcdTBGODZcXHUwRjg3XFx1MEY4RC1cXHUwRjk3XFx1MEY5OS1cXHUwRkJDXFx1MEZDNlxcdTEwMkItXFx1MTAzRVxcdTEwNTYtXFx1MTA1OVxcdTEwNUUtXFx1MTA2MFxcdTEwNjItXFx1MTA2NFxcdTEwNjctXFx1MTA2RFxcdTEwNzEtXFx1MTA3NFxcdTEwODItXFx1MTA4RFxcdTEwOEZcXHUxMDlBLVxcdTEwOURcXHUxMzVELVxcdTEzNUZcXHUxNzEyLVxcdTE3MTRcXHUxNzMyLVxcdTE3MzRcXHUxNzUyXFx1MTc1M1xcdTE3NzJcXHUxNzczXFx1MTdCNC1cXHUxN0QzXFx1MTdERFxcdTE4MEItXFx1MTgwRFxcdTE4ODVcXHUxODg2XFx1MThBOVxcdTE5MjAtXFx1MTkyQlxcdTE5MzAtXFx1MTkzQlxcdTFBMTctXFx1MUExQlxcdTFBNTUtXFx1MUE1RVxcdTFBNjAtXFx1MUE3Q1xcdTFBN0ZcXHUxQUIwLVxcdTFBQkVcXHUxQjAwLVxcdTFCMDRcXHUxQjM0LVxcdTFCNDRcXHUxQjZCLVxcdTFCNzNcXHUxQjgwLVxcdTFCODJcXHUxQkExLVxcdTFCQURcXHUxQkU2LVxcdTFCRjNcXHUxQzI0LVxcdTFDMzdcXHUxQ0QwLVxcdTFDRDJcXHUxQ0Q0LVxcdTFDRThcXHUxQ0VEXFx1MUNGMi1cXHUxQ0Y0XFx1MUNGNy1cXHUxQ0Y5XFx1MURDMC1cXHUxREY5XFx1MURGQi1cXHUxREZGXFx1MjBEMC1cXHUyMEYwXFx1MkNFRi1cXHUyQ0YxXFx1MkQ3RlxcdTJERTAtXFx1MkRGRlxcdTMwMkEtXFx1MzAyRlxcdTMwOTlcXHUzMDlBXFx1QTY2Ri1cXHVBNjcyXFx1QTY3NC1cXHVBNjdEXFx1QTY5RVxcdUE2OUZcXHVBNkYwXFx1QTZGMVxcdUE4MDJcXHVBODA2XFx1QTgwQlxcdUE4MjMtXFx1QTgyN1xcdUE4ODBcXHVBODgxXFx1QThCNC1cXHVBOEM1XFx1QThFMC1cXHVBOEYxXFx1QThGRlxcdUE5MjYtXFx1QTkyRFxcdUE5NDctXFx1QTk1M1xcdUE5ODAtXFx1QTk4M1xcdUE5QjMtXFx1QTlDMFxcdUE5RTVcXHVBQTI5LVxcdUFBMzZcXHVBQTQzXFx1QUE0Q1xcdUFBNERcXHVBQTdCLVxcdUFBN0RcXHVBQUIwXFx1QUFCMi1cXHVBQUI0XFx1QUFCN1xcdUFBQjhcXHVBQUJFXFx1QUFCRlxcdUFBQzFcXHVBQUVCLVxcdUFBRUZcXHVBQUY1XFx1QUFGNlxcdUFCRTMtXFx1QUJFQVxcdUFCRUNcXHVBQkVEXFx1RkIxRVxcdUZFMDAtXFx1RkUwRlxcdUZFMjAtXFx1RkUyRl0vZywgJycpKVxuICAgIDogKChzdHIpID0+IHN0cik7XG5cbmNsYXNzIEJpdGFwU2VhcmNoIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcGF0dGVybixcbiAgICB7XG4gICAgICBsb2NhdGlvbiA9IENvbmZpZy5sb2NhdGlvbixcbiAgICAgIHRocmVzaG9sZCA9IENvbmZpZy50aHJlc2hvbGQsXG4gICAgICBkaXN0YW5jZSA9IENvbmZpZy5kaXN0YW5jZSxcbiAgICAgIGluY2x1ZGVNYXRjaGVzID0gQ29uZmlnLmluY2x1ZGVNYXRjaGVzLFxuICAgICAgZmluZEFsbE1hdGNoZXMgPSBDb25maWcuZmluZEFsbE1hdGNoZXMsXG4gICAgICBtaW5NYXRjaENoYXJMZW5ndGggPSBDb25maWcubWluTWF0Y2hDaGFyTGVuZ3RoLFxuICAgICAgaXNDYXNlU2Vuc2l0aXZlID0gQ29uZmlnLmlzQ2FzZVNlbnNpdGl2ZSxcbiAgICAgIGlnbm9yZURpYWNyaXRpY3MgPSBDb25maWcuaWdub3JlRGlhY3JpdGljcyxcbiAgICAgIGlnbm9yZUxvY2F0aW9uID0gQ29uZmlnLmlnbm9yZUxvY2F0aW9uXG4gICAgfSA9IHt9XG4gICkge1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIGxvY2F0aW9uLFxuICAgICAgdGhyZXNob2xkLFxuICAgICAgZGlzdGFuY2UsXG4gICAgICBpbmNsdWRlTWF0Y2hlcyxcbiAgICAgIGZpbmRBbGxNYXRjaGVzLFxuICAgICAgbWluTWF0Y2hDaGFyTGVuZ3RoLFxuICAgICAgaXNDYXNlU2Vuc2l0aXZlLFxuICAgICAgaWdub3JlRGlhY3JpdGljcyxcbiAgICAgIGlnbm9yZUxvY2F0aW9uXG4gICAgfTtcblxuICAgIHBhdHRlcm4gPSBpc0Nhc2VTZW5zaXRpdmUgPyBwYXR0ZXJuIDogcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuICAgIHBhdHRlcm4gPSBpZ25vcmVEaWFjcml0aWNzID8gc3RyaXBEaWFjcml0aWNzKHBhdHRlcm4pIDogcGF0dGVybjtcbiAgICB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuO1xuXG4gICAgdGhpcy5jaHVua3MgPSBbXTtcblxuICAgIGlmICghdGhpcy5wYXR0ZXJuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgYWRkQ2h1bmsgPSAocGF0dGVybiwgc3RhcnRJbmRleCkgPT4ge1xuICAgICAgdGhpcy5jaHVua3MucHVzaCh7XG4gICAgICAgIHBhdHRlcm4sXG4gICAgICAgIGFscGhhYmV0OiBjcmVhdGVQYXR0ZXJuQWxwaGFiZXQocGF0dGVybiksXG4gICAgICAgIHN0YXJ0SW5kZXhcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBsZW4gPSB0aGlzLnBhdHRlcm4ubGVuZ3RoO1xuXG4gICAgaWYgKGxlbiA+IE1BWF9CSVRTKSB7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBjb25zdCByZW1haW5kZXIgPSBsZW4gJSBNQVhfQklUUztcbiAgICAgIGNvbnN0IGVuZCA9IGxlbiAtIHJlbWFpbmRlcjtcblxuICAgICAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICAgICAgYWRkQ2h1bmsodGhpcy5wYXR0ZXJuLnN1YnN0cihpLCBNQVhfQklUUyksIGkpO1xuICAgICAgICBpICs9IE1BWF9CSVRTO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVtYWluZGVyKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0SW5kZXggPSBsZW4gLSBNQVhfQklUUztcbiAgICAgICAgYWRkQ2h1bmsodGhpcy5wYXR0ZXJuLnN1YnN0cihzdGFydEluZGV4KSwgc3RhcnRJbmRleCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZENodW5rKHRoaXMucGF0dGVybiwgMCk7XG4gICAgfVxuICB9XG5cbiAgc2VhcmNoSW4odGV4dCkge1xuICAgIGNvbnN0IHsgaXNDYXNlU2Vuc2l0aXZlLCBpZ25vcmVEaWFjcml0aWNzLCBpbmNsdWRlTWF0Y2hlcyB9ID0gdGhpcy5vcHRpb25zO1xuXG4gICAgdGV4dCA9IGlzQ2FzZVNlbnNpdGl2ZSA/IHRleHQgOiB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgdGV4dCA9IGlnbm9yZURpYWNyaXRpY3MgPyBzdHJpcERpYWNyaXRpY3ModGV4dCkgOiB0ZXh0O1xuXG4gICAgLy8gRXhhY3QgbWF0Y2hcbiAgICBpZiAodGhpcy5wYXR0ZXJuID09PSB0ZXh0KSB7XG4gICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICBpc01hdGNoOiB0cnVlLFxuICAgICAgICBzY29yZTogMFxuICAgICAgfTtcblxuICAgICAgaWYgKGluY2x1ZGVNYXRjaGVzKSB7XG4gICAgICAgIHJlc3VsdC5pbmRpY2VzID0gW1swLCB0ZXh0Lmxlbmd0aCAtIDFdXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgdXNlIEJpdGFwIGFsZ29yaXRobVxuICAgIGNvbnN0IHtcbiAgICAgIGxvY2F0aW9uLFxuICAgICAgZGlzdGFuY2UsXG4gICAgICB0aHJlc2hvbGQsXG4gICAgICBmaW5kQWxsTWF0Y2hlcyxcbiAgICAgIG1pbk1hdGNoQ2hhckxlbmd0aCxcbiAgICAgIGlnbm9yZUxvY2F0aW9uXG4gICAgfSA9IHRoaXMub3B0aW9ucztcblxuICAgIGxldCBhbGxJbmRpY2VzID0gW107XG4gICAgbGV0IHRvdGFsU2NvcmUgPSAwO1xuICAgIGxldCBoYXNNYXRjaGVzID0gZmFsc2U7XG5cbiAgICB0aGlzLmNodW5rcy5mb3JFYWNoKCh7IHBhdHRlcm4sIGFscGhhYmV0LCBzdGFydEluZGV4IH0pID0+IHtcbiAgICAgIGNvbnN0IHsgaXNNYXRjaCwgc2NvcmUsIGluZGljZXMgfSA9IHNlYXJjaCh0ZXh0LCBwYXR0ZXJuLCBhbHBoYWJldCwge1xuICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24gKyBzdGFydEluZGV4LFxuICAgICAgICBkaXN0YW5jZSxcbiAgICAgICAgdGhyZXNob2xkLFxuICAgICAgICBmaW5kQWxsTWF0Y2hlcyxcbiAgICAgICAgbWluTWF0Y2hDaGFyTGVuZ3RoLFxuICAgICAgICBpbmNsdWRlTWF0Y2hlcyxcbiAgICAgICAgaWdub3JlTG9jYXRpb25cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaXNNYXRjaCkge1xuICAgICAgICBoYXNNYXRjaGVzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdG90YWxTY29yZSArPSBzY29yZTtcblxuICAgICAgaWYgKGlzTWF0Y2ggJiYgaW5kaWNlcykge1xuICAgICAgICBhbGxJbmRpY2VzID0gWy4uLmFsbEluZGljZXMsIC4uLmluZGljZXNdO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgIGlzTWF0Y2g6IGhhc01hdGNoZXMsXG4gICAgICBzY29yZTogaGFzTWF0Y2hlcyA/IHRvdGFsU2NvcmUgLyB0aGlzLmNodW5rcy5sZW5ndGggOiAxXG4gICAgfTtcblxuICAgIGlmIChoYXNNYXRjaGVzICYmIGluY2x1ZGVNYXRjaGVzKSB7XG4gICAgICByZXN1bHQuaW5kaWNlcyA9IGFsbEluZGljZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG59XG5cbmNsYXNzIEJhc2VNYXRjaCB7XG4gIGNvbnN0cnVjdG9yKHBhdHRlcm4pIHtcbiAgICB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuO1xuICB9XG4gIHN0YXRpYyBpc011bHRpTWF0Y2gocGF0dGVybikge1xuICAgIHJldHVybiBnZXRNYXRjaChwYXR0ZXJuLCB0aGlzLm11bHRpUmVnZXgpXG4gIH1cbiAgc3RhdGljIGlzU2luZ2xlTWF0Y2gocGF0dGVybikge1xuICAgIHJldHVybiBnZXRNYXRjaChwYXR0ZXJuLCB0aGlzLnNpbmdsZVJlZ2V4KVxuICB9XG4gIHNlYXJjaCgvKnRleHQqLykge31cbn1cblxuZnVuY3Rpb24gZ2V0TWF0Y2gocGF0dGVybiwgZXhwKSB7XG4gIGNvbnN0IG1hdGNoZXMgPSBwYXR0ZXJuLm1hdGNoKGV4cCk7XG4gIHJldHVybiBtYXRjaGVzID8gbWF0Y2hlc1sxXSA6IG51bGxcbn1cblxuLy8gVG9rZW46ICdmaWxlXG5cbmNsYXNzIEV4YWN0TWF0Y2ggZXh0ZW5kcyBCYXNlTWF0Y2gge1xuICBjb25zdHJ1Y3RvcihwYXR0ZXJuKSB7XG4gICAgc3VwZXIocGF0dGVybik7XG4gIH1cbiAgc3RhdGljIGdldCB0eXBlKCkge1xuICAgIHJldHVybiAnZXhhY3QnXG4gIH1cbiAgc3RhdGljIGdldCBtdWx0aVJlZ2V4KCkge1xuICAgIHJldHVybiAvXj1cIiguKilcIiQvXG4gIH1cbiAgc3RhdGljIGdldCBzaW5nbGVSZWdleCgpIHtcbiAgICByZXR1cm4gL149KC4qKSQvXG4gIH1cbiAgc2VhcmNoKHRleHQpIHtcbiAgICBjb25zdCBpc01hdGNoID0gdGV4dCA9PT0gdGhpcy5wYXR0ZXJuO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGlzTWF0Y2gsXG4gICAgICBzY29yZTogaXNNYXRjaCA/IDAgOiAxLFxuICAgICAgaW5kaWNlczogWzAsIHRoaXMucGF0dGVybi5sZW5ndGggLSAxXVxuICAgIH1cbiAgfVxufVxuXG4vLyBUb2tlbjogIWZpcmVcblxuY2xhc3MgSW52ZXJzZUV4YWN0TWF0Y2ggZXh0ZW5kcyBCYXNlTWF0Y2gge1xuICBjb25zdHJ1Y3RvcihwYXR0ZXJuKSB7XG4gICAgc3VwZXIocGF0dGVybik7XG4gIH1cbiAgc3RhdGljIGdldCB0eXBlKCkge1xuICAgIHJldHVybiAnaW52ZXJzZS1leGFjdCdcbiAgfVxuICBzdGF0aWMgZ2V0IG11bHRpUmVnZXgoKSB7XG4gICAgcmV0dXJuIC9eIVwiKC4qKVwiJC9cbiAgfVxuICBzdGF0aWMgZ2V0IHNpbmdsZVJlZ2V4KCkge1xuICAgIHJldHVybiAvXiEoLiopJC9cbiAgfVxuICBzZWFyY2godGV4dCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGV4dC5pbmRleE9mKHRoaXMucGF0dGVybik7XG4gICAgY29uc3QgaXNNYXRjaCA9IGluZGV4ID09PSAtMTtcblxuICAgIHJldHVybiB7XG4gICAgICBpc01hdGNoLFxuICAgICAgc2NvcmU6IGlzTWF0Y2ggPyAwIDogMSxcbiAgICAgIGluZGljZXM6IFswLCB0ZXh0Lmxlbmd0aCAtIDFdXG4gICAgfVxuICB9XG59XG5cbi8vIFRva2VuOiBeZmlsZVxuXG5jbGFzcyBQcmVmaXhFeGFjdE1hdGNoIGV4dGVuZHMgQmFzZU1hdGNoIHtcbiAgY29uc3RydWN0b3IocGF0dGVybikge1xuICAgIHN1cGVyKHBhdHRlcm4pO1xuICB9XG4gIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gJ3ByZWZpeC1leGFjdCdcbiAgfVxuICBzdGF0aWMgZ2V0IG11bHRpUmVnZXgoKSB7XG4gICAgcmV0dXJuIC9eXFxeXCIoLiopXCIkL1xuICB9XG4gIHN0YXRpYyBnZXQgc2luZ2xlUmVnZXgoKSB7XG4gICAgcmV0dXJuIC9eXFxeKC4qKSQvXG4gIH1cbiAgc2VhcmNoKHRleHQpIHtcbiAgICBjb25zdCBpc01hdGNoID0gdGV4dC5zdGFydHNXaXRoKHRoaXMucGF0dGVybik7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaXNNYXRjaCxcbiAgICAgIHNjb3JlOiBpc01hdGNoID8gMCA6IDEsXG4gICAgICBpbmRpY2VzOiBbMCwgdGhpcy5wYXR0ZXJuLmxlbmd0aCAtIDFdXG4gICAgfVxuICB9XG59XG5cbi8vIFRva2VuOiAhXmZpcmVcblxuY2xhc3MgSW52ZXJzZVByZWZpeEV4YWN0TWF0Y2ggZXh0ZW5kcyBCYXNlTWF0Y2gge1xuICBjb25zdHJ1Y3RvcihwYXR0ZXJuKSB7XG4gICAgc3VwZXIocGF0dGVybik7XG4gIH1cbiAgc3RhdGljIGdldCB0eXBlKCkge1xuICAgIHJldHVybiAnaW52ZXJzZS1wcmVmaXgtZXhhY3QnXG4gIH1cbiAgc3RhdGljIGdldCBtdWx0aVJlZ2V4KCkge1xuICAgIHJldHVybiAvXiFcXF5cIiguKilcIiQvXG4gIH1cbiAgc3RhdGljIGdldCBzaW5nbGVSZWdleCgpIHtcbiAgICByZXR1cm4gL14hXFxeKC4qKSQvXG4gIH1cbiAgc2VhcmNoKHRleHQpIHtcbiAgICBjb25zdCBpc01hdGNoID0gIXRleHQuc3RhcnRzV2l0aCh0aGlzLnBhdHRlcm4pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGlzTWF0Y2gsXG4gICAgICBzY29yZTogaXNNYXRjaCA/IDAgOiAxLFxuICAgICAgaW5kaWNlczogWzAsIHRleHQubGVuZ3RoIC0gMV1cbiAgICB9XG4gIH1cbn1cblxuLy8gVG9rZW46IC5maWxlJFxuXG5jbGFzcyBTdWZmaXhFeGFjdE1hdGNoIGV4dGVuZHMgQmFzZU1hdGNoIHtcbiAgY29uc3RydWN0b3IocGF0dGVybikge1xuICAgIHN1cGVyKHBhdHRlcm4pO1xuICB9XG4gIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gJ3N1ZmZpeC1leGFjdCdcbiAgfVxuICBzdGF0aWMgZ2V0IG11bHRpUmVnZXgoKSB7XG4gICAgcmV0dXJuIC9eXCIoLiopXCJcXCQkL1xuICB9XG4gIHN0YXRpYyBnZXQgc2luZ2xlUmVnZXgoKSB7XG4gICAgcmV0dXJuIC9eKC4qKVxcJCQvXG4gIH1cbiAgc2VhcmNoKHRleHQpIHtcbiAgICBjb25zdCBpc01hdGNoID0gdGV4dC5lbmRzV2l0aCh0aGlzLnBhdHRlcm4pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGlzTWF0Y2gsXG4gICAgICBzY29yZTogaXNNYXRjaCA/IDAgOiAxLFxuICAgICAgaW5kaWNlczogW3RleHQubGVuZ3RoIC0gdGhpcy5wYXR0ZXJuLmxlbmd0aCwgdGV4dC5sZW5ndGggLSAxXVxuICAgIH1cbiAgfVxufVxuXG4vLyBUb2tlbjogIS5maWxlJFxuXG5jbGFzcyBJbnZlcnNlU3VmZml4RXhhY3RNYXRjaCBleHRlbmRzIEJhc2VNYXRjaCB7XG4gIGNvbnN0cnVjdG9yKHBhdHRlcm4pIHtcbiAgICBzdXBlcihwYXR0ZXJuKTtcbiAgfVxuICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuICdpbnZlcnNlLXN1ZmZpeC1leGFjdCdcbiAgfVxuICBzdGF0aWMgZ2V0IG11bHRpUmVnZXgoKSB7XG4gICAgcmV0dXJuIC9eIVwiKC4qKVwiXFwkJC9cbiAgfVxuICBzdGF0aWMgZ2V0IHNpbmdsZVJlZ2V4KCkge1xuICAgIHJldHVybiAvXiEoLiopXFwkJC9cbiAgfVxuICBzZWFyY2godGV4dCkge1xuICAgIGNvbnN0IGlzTWF0Y2ggPSAhdGV4dC5lbmRzV2l0aCh0aGlzLnBhdHRlcm4pO1xuICAgIHJldHVybiB7XG4gICAgICBpc01hdGNoLFxuICAgICAgc2NvcmU6IGlzTWF0Y2ggPyAwIDogMSxcbiAgICAgIGluZGljZXM6IFswLCB0ZXh0Lmxlbmd0aCAtIDFdXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEZ1enp5TWF0Y2ggZXh0ZW5kcyBCYXNlTWF0Y2gge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwYXR0ZXJuLFxuICAgIHtcbiAgICAgIGxvY2F0aW9uID0gQ29uZmlnLmxvY2F0aW9uLFxuICAgICAgdGhyZXNob2xkID0gQ29uZmlnLnRocmVzaG9sZCxcbiAgICAgIGRpc3RhbmNlID0gQ29uZmlnLmRpc3RhbmNlLFxuICAgICAgaW5jbHVkZU1hdGNoZXMgPSBDb25maWcuaW5jbHVkZU1hdGNoZXMsXG4gICAgICBmaW5kQWxsTWF0Y2hlcyA9IENvbmZpZy5maW5kQWxsTWF0Y2hlcyxcbiAgICAgIG1pbk1hdGNoQ2hhckxlbmd0aCA9IENvbmZpZy5taW5NYXRjaENoYXJMZW5ndGgsXG4gICAgICBpc0Nhc2VTZW5zaXRpdmUgPSBDb25maWcuaXNDYXNlU2Vuc2l0aXZlLFxuICAgICAgaWdub3JlRGlhY3JpdGljcyA9IENvbmZpZy5pZ25vcmVEaWFjcml0aWNzLFxuICAgICAgaWdub3JlTG9jYXRpb24gPSBDb25maWcuaWdub3JlTG9jYXRpb25cbiAgICB9ID0ge31cbiAgKSB7XG4gICAgc3VwZXIocGF0dGVybik7XG4gICAgdGhpcy5fYml0YXBTZWFyY2ggPSBuZXcgQml0YXBTZWFyY2gocGF0dGVybiwge1xuICAgICAgbG9jYXRpb24sXG4gICAgICB0aHJlc2hvbGQsXG4gICAgICBkaXN0YW5jZSxcbiAgICAgIGluY2x1ZGVNYXRjaGVzLFxuICAgICAgZmluZEFsbE1hdGNoZXMsXG4gICAgICBtaW5NYXRjaENoYXJMZW5ndGgsXG4gICAgICBpc0Nhc2VTZW5zaXRpdmUsXG4gICAgICBpZ25vcmVEaWFjcml0aWNzLFxuICAgICAgaWdub3JlTG9jYXRpb25cbiAgICB9KTtcbiAgfVxuICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuICdmdXp6eSdcbiAgfVxuICBzdGF0aWMgZ2V0IG11bHRpUmVnZXgoKSB7XG4gICAgcmV0dXJuIC9eXCIoLiopXCIkL1xuICB9XG4gIHN0YXRpYyBnZXQgc2luZ2xlUmVnZXgoKSB7XG4gICAgcmV0dXJuIC9eKC4qKSQvXG4gIH1cbiAgc2VhcmNoKHRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5fYml0YXBTZWFyY2guc2VhcmNoSW4odGV4dClcbiAgfVxufVxuXG4vLyBUb2tlbjogJ2ZpbGVcblxuY2xhc3MgSW5jbHVkZU1hdGNoIGV4dGVuZHMgQmFzZU1hdGNoIHtcbiAgY29uc3RydWN0b3IocGF0dGVybikge1xuICAgIHN1cGVyKHBhdHRlcm4pO1xuICB9XG4gIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gJ2luY2x1ZGUnXG4gIH1cbiAgc3RhdGljIGdldCBtdWx0aVJlZ2V4KCkge1xuICAgIHJldHVybiAvXidcIiguKilcIiQvXG4gIH1cbiAgc3RhdGljIGdldCBzaW5nbGVSZWdleCgpIHtcbiAgICByZXR1cm4gL14nKC4qKSQvXG4gIH1cbiAgc2VhcmNoKHRleHQpIHtcbiAgICBsZXQgbG9jYXRpb24gPSAwO1xuICAgIGxldCBpbmRleDtcblxuICAgIGNvbnN0IGluZGljZXMgPSBbXTtcbiAgICBjb25zdCBwYXR0ZXJuTGVuID0gdGhpcy5wYXR0ZXJuLmxlbmd0aDtcblxuICAgIC8vIEdldCBhbGwgZXhhY3QgbWF0Y2hlc1xuICAgIHdoaWxlICgoaW5kZXggPSB0ZXh0LmluZGV4T2YodGhpcy5wYXR0ZXJuLCBsb2NhdGlvbikpID4gLTEpIHtcbiAgICAgIGxvY2F0aW9uID0gaW5kZXggKyBwYXR0ZXJuTGVuO1xuICAgICAgaW5kaWNlcy5wdXNoKFtpbmRleCwgbG9jYXRpb24gLSAxXSk7XG4gICAgfVxuXG4gICAgY29uc3QgaXNNYXRjaCA9ICEhaW5kaWNlcy5sZW5ndGg7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaXNNYXRjaCxcbiAgICAgIHNjb3JlOiBpc01hdGNoID8gMCA6IDEsXG4gICAgICBpbmRpY2VzXG4gICAgfVxuICB9XG59XG5cbi8vIFx1Mjc1N09yZGVyIGlzIGltcG9ydGFudC4gRE8gTk9UIENIQU5HRS5cbmNvbnN0IHNlYXJjaGVycyA9IFtcbiAgRXhhY3RNYXRjaCxcbiAgSW5jbHVkZU1hdGNoLFxuICBQcmVmaXhFeGFjdE1hdGNoLFxuICBJbnZlcnNlUHJlZml4RXhhY3RNYXRjaCxcbiAgSW52ZXJzZVN1ZmZpeEV4YWN0TWF0Y2gsXG4gIFN1ZmZpeEV4YWN0TWF0Y2gsXG4gIEludmVyc2VFeGFjdE1hdGNoLFxuICBGdXp6eU1hdGNoXG5dO1xuXG5jb25zdCBzZWFyY2hlcnNMZW4gPSBzZWFyY2hlcnMubGVuZ3RoO1xuXG4vLyBSZWdleCB0byBzcGxpdCBieSBzcGFjZXMsIGJ1dCBrZWVwIGFueXRoaW5nIGluIHF1b3RlcyB0b2dldGhlclxuY29uc3QgU1BBQ0VfUkUgPSAvICsoPz0oPzpbXlxcXCJdKlxcXCJbXlxcXCJdKlxcXCIpKlteXFxcIl0qJCkvO1xuY29uc3QgT1JfVE9LRU4gPSAnfCc7XG5cbi8vIFJldHVybiBhIDJEIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBxdWVyeSwgZm9yIHNpbXBsZXIgcGFyc2luZy5cbi8vIEV4YW1wbGU6XG4vLyBcIl5jb3JlIGdvJCB8IHJiJCB8IHB5JCB4eSRcIiA9PiBbW1wiXmNvcmVcIiwgXCJnbyRcIl0sIFtcInJiJFwiXSwgW1wicHkkXCIsIFwieHkkXCJdXVxuZnVuY3Rpb24gcGFyc2VRdWVyeShwYXR0ZXJuLCBvcHRpb25zID0ge30pIHtcbiAgcmV0dXJuIHBhdHRlcm4uc3BsaXQoT1JfVE9LRU4pLm1hcCgoaXRlbSkgPT4ge1xuICAgIGxldCBxdWVyeSA9IGl0ZW1cbiAgICAgIC50cmltKClcbiAgICAgIC5zcGxpdChTUEFDRV9SRSlcbiAgICAgIC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gJiYgISFpdGVtLnRyaW0oKSk7XG5cbiAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBxdWVyeS5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgY29uc3QgcXVlcnlJdGVtID0gcXVlcnlbaV07XG5cbiAgICAgIC8vIDEuIEhhbmRsZSBtdWx0aXBsZSBxdWVyeSBtYXRjaCAoaS5lLCBvbmNlIHRoYXQgYXJlIHF1b3RlZCwgbGlrZSBgXCJoZWxsbyB3b3JsZFwiYClcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgbGV0IGlkeCA9IC0xO1xuICAgICAgd2hpbGUgKCFmb3VuZCAmJiArK2lkeCA8IHNlYXJjaGVyc0xlbikge1xuICAgICAgICBjb25zdCBzZWFyY2hlciA9IHNlYXJjaGVyc1tpZHhdO1xuICAgICAgICBsZXQgdG9rZW4gPSBzZWFyY2hlci5pc011bHRpTWF0Y2gocXVlcnlJdGVtKTtcbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBzZWFyY2hlcih0b2tlbiwgb3B0aW9ucykpO1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMi4gSGFuZGxlIHNpbmdsZSBxdWVyeSBtYXRjaGVzIChpLmUsIG9uY2UgdGhhdCBhcmUgKm5vdCogcXVvdGVkKVxuICAgICAgaWR4ID0gLTE7XG4gICAgICB3aGlsZSAoKytpZHggPCBzZWFyY2hlcnNMZW4pIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoZXIgPSBzZWFyY2hlcnNbaWR4XTtcbiAgICAgICAgbGV0IHRva2VuID0gc2VhcmNoZXIuaXNTaW5nbGVNYXRjaChxdWVyeUl0ZW0pO1xuICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2gobmV3IHNlYXJjaGVyKHRva2VuLCBvcHRpb25zKSk7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzXG4gIH0pXG59XG5cbi8vIFRoZXNlIGV4dGVuZGVkIG1hdGNoZXJzIGNhbiByZXR1cm4gYW4gYXJyYXkgb2YgbWF0Y2hlcywgYXMgb3Bwb3NlZFxuLy8gdG8gYSBzaW5nbCBtYXRjaFxuY29uc3QgTXVsdGlNYXRjaFNldCA9IG5ldyBTZXQoW0Z1enp5TWF0Y2gudHlwZSwgSW5jbHVkZU1hdGNoLnR5cGVdKTtcblxuLyoqXG4gKiBDb21tYW5kLWxpa2Ugc2VhcmNoaW5nXG4gKiA9PT09PT09PT09PT09PT09PT09PT09XG4gKlxuICogR2l2ZW4gbXVsdGlwbGUgc2VhcmNoIHRlcm1zIGRlbGltaXRlZCBieSBzcGFjZXMuZS5nLiBgXmpzY3JpcHQgLnB5dGhvbiQgcnVieSAhamF2YWAsXG4gKiBzZWFyY2ggaW4gYSBnaXZlbiB0ZXh0LlxuICpcbiAqIFNlYXJjaCBzeW50YXg6XG4gKlxuICogfCBUb2tlbiAgICAgICB8IE1hdGNoIHR5cGUgICAgICAgICAgICAgICAgIHwgRGVzY3JpcHRpb24gICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCAtLS0tLS0tLS0tLSB8IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gfFxuICogfCBganNjcmlwdGAgICB8IGZ1enp5LW1hdGNoICAgICAgICAgICAgICAgIHwgSXRlbXMgdGhhdCBmdXp6eSBtYXRjaCBganNjcmlwdGAgICAgICAgfFxuICogfCBgPXNjaGVtZWAgICB8IGV4YWN0LW1hdGNoICAgICAgICAgICAgICAgIHwgSXRlbXMgdGhhdCBhcmUgYHNjaGVtZWAgICAgICAgICAgICAgICAgfFxuICogfCBgJ3B5dGhvbmAgICB8IGluY2x1ZGUtbWF0Y2ggICAgICAgICAgICAgIHwgSXRlbXMgdGhhdCBpbmNsdWRlIGBweXRob25gICAgICAgICAgICAgfFxuICogfCBgIXJ1YnlgICAgICB8IGludmVyc2UtZXhhY3QtbWF0Y2ggICAgICAgIHwgSXRlbXMgdGhhdCBkbyBub3QgaW5jbHVkZSBgcnVieWAgICAgICAgfFxuICogfCBgXmphdmFgICAgICB8IHByZWZpeC1leGFjdC1tYXRjaCAgICAgICAgIHwgSXRlbXMgdGhhdCBzdGFydCB3aXRoIGBqYXZhYCAgICAgICAgICAgfFxuICogfCBgIV5lYXJsYW5nYCB8IGludmVyc2UtcHJlZml4LWV4YWN0LW1hdGNoIHwgSXRlbXMgdGhhdCBkbyBub3Qgc3RhcnQgd2l0aCBgZWFybGFuZ2AgfFxuICogfCBgLmpzJGAgICAgICB8IHN1ZmZpeC1leGFjdC1tYXRjaCAgICAgICAgIHwgSXRlbXMgdGhhdCBlbmQgd2l0aCBgLmpzYCAgICAgICAgICAgICAgfFxuICogfCBgIS5nbyRgICAgICB8IGludmVyc2Utc3VmZml4LWV4YWN0LW1hdGNoIHwgSXRlbXMgdGhhdCBkbyBub3QgZW5kIHdpdGggYC5nb2AgICAgICAgfFxuICpcbiAqIEEgc2luZ2xlIHBpcGUgY2hhcmFjdGVyIGFjdHMgYXMgYW4gT1Igb3BlcmF0b3IuIEZvciBleGFtcGxlLCB0aGUgZm9sbG93aW5nXG4gKiBxdWVyeSBtYXRjaGVzIGVudHJpZXMgdGhhdCBzdGFydCB3aXRoIGBjb3JlYCBhbmQgZW5kIHdpdGggZWl0aGVyYGdvYCwgYHJiYCxcbiAqIG9yYHB5YC5cbiAqXG4gKiBgYGBcbiAqIF5jb3JlIGdvJCB8IHJiJCB8IHB5JFxuICogYGBgXG4gKi9cbmNsYXNzIEV4dGVuZGVkU2VhcmNoIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcGF0dGVybixcbiAgICB7XG4gICAgICBpc0Nhc2VTZW5zaXRpdmUgPSBDb25maWcuaXNDYXNlU2Vuc2l0aXZlLFxuICAgICAgaWdub3JlRGlhY3JpdGljcyA9IENvbmZpZy5pZ25vcmVEaWFjcml0aWNzLFxuICAgICAgaW5jbHVkZU1hdGNoZXMgPSBDb25maWcuaW5jbHVkZU1hdGNoZXMsXG4gICAgICBtaW5NYXRjaENoYXJMZW5ndGggPSBDb25maWcubWluTWF0Y2hDaGFyTGVuZ3RoLFxuICAgICAgaWdub3JlTG9jYXRpb24gPSBDb25maWcuaWdub3JlTG9jYXRpb24sXG4gICAgICBmaW5kQWxsTWF0Y2hlcyA9IENvbmZpZy5maW5kQWxsTWF0Y2hlcyxcbiAgICAgIGxvY2F0aW9uID0gQ29uZmlnLmxvY2F0aW9uLFxuICAgICAgdGhyZXNob2xkID0gQ29uZmlnLnRocmVzaG9sZCxcbiAgICAgIGRpc3RhbmNlID0gQ29uZmlnLmRpc3RhbmNlXG4gICAgfSA9IHt9XG4gICkge1xuICAgIHRoaXMucXVlcnkgPSBudWxsO1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIGlzQ2FzZVNlbnNpdGl2ZSxcbiAgICAgIGlnbm9yZURpYWNyaXRpY3MsXG4gICAgICBpbmNsdWRlTWF0Y2hlcyxcbiAgICAgIG1pbk1hdGNoQ2hhckxlbmd0aCxcbiAgICAgIGZpbmRBbGxNYXRjaGVzLFxuICAgICAgaWdub3JlTG9jYXRpb24sXG4gICAgICBsb2NhdGlvbixcbiAgICAgIHRocmVzaG9sZCxcbiAgICAgIGRpc3RhbmNlXG4gICAgfTtcblxuICAgIHBhdHRlcm4gPSBpc0Nhc2VTZW5zaXRpdmUgPyBwYXR0ZXJuIDogcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuICAgIHBhdHRlcm4gPSBpZ25vcmVEaWFjcml0aWNzID8gc3RyaXBEaWFjcml0aWNzKHBhdHRlcm4pIDogcGF0dGVybjtcbiAgICB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuO1xuICAgIHRoaXMucXVlcnkgPSBwYXJzZVF1ZXJ5KHRoaXMucGF0dGVybiwgdGhpcy5vcHRpb25zKTtcbiAgfVxuXG4gIHN0YXRpYyBjb25kaXRpb24oXywgb3B0aW9ucykge1xuICAgIHJldHVybiBvcHRpb25zLnVzZUV4dGVuZGVkU2VhcmNoXG4gIH1cblxuICBzZWFyY2hJbih0ZXh0KSB7XG4gICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJ5O1xuXG4gICAgaWYgKCFxdWVyeSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNNYXRjaDogZmFsc2UsXG4gICAgICAgIHNjb3JlOiAxXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgeyBpbmNsdWRlTWF0Y2hlcywgaXNDYXNlU2Vuc2l0aXZlLCBpZ25vcmVEaWFjcml0aWNzIH0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgICB0ZXh0ID0gaXNDYXNlU2Vuc2l0aXZlID8gdGV4dCA6IHRleHQudG9Mb3dlckNhc2UoKTtcbiAgICB0ZXh0ID0gaWdub3JlRGlhY3JpdGljcyA/IHN0cmlwRGlhY3JpdGljcyh0ZXh0KSA6IHRleHQ7XG5cbiAgICBsZXQgbnVtTWF0Y2hlcyA9IDA7XG4gICAgbGV0IGFsbEluZGljZXMgPSBbXTtcbiAgICBsZXQgdG90YWxTY29yZSA9IDA7XG5cbiAgICAvLyBPUnNcbiAgICBmb3IgKGxldCBpID0gMCwgcUxlbiA9IHF1ZXJ5Lmxlbmd0aDsgaSA8IHFMZW47IGkgKz0gMSkge1xuICAgICAgY29uc3Qgc2VhcmNoZXJzID0gcXVlcnlbaV07XG5cbiAgICAgIC8vIFJlc2V0IGluZGljZXNcbiAgICAgIGFsbEluZGljZXMubGVuZ3RoID0gMDtcbiAgICAgIG51bU1hdGNoZXMgPSAwO1xuXG4gICAgICAvLyBBTkRzXG4gICAgICBmb3IgKGxldCBqID0gMCwgcExlbiA9IHNlYXJjaGVycy5sZW5ndGg7IGogPCBwTGVuOyBqICs9IDEpIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoZXIgPSBzZWFyY2hlcnNbal07XG4gICAgICAgIGNvbnN0IHsgaXNNYXRjaCwgaW5kaWNlcywgc2NvcmUgfSA9IHNlYXJjaGVyLnNlYXJjaCh0ZXh0KTtcblxuICAgICAgICBpZiAoaXNNYXRjaCkge1xuICAgICAgICAgIG51bU1hdGNoZXMgKz0gMTtcbiAgICAgICAgICB0b3RhbFNjb3JlICs9IHNjb3JlO1xuICAgICAgICAgIGlmIChpbmNsdWRlTWF0Y2hlcykge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHNlYXJjaGVyLmNvbnN0cnVjdG9yLnR5cGU7XG4gICAgICAgICAgICBpZiAoTXVsdGlNYXRjaFNldC5oYXModHlwZSkpIHtcbiAgICAgICAgICAgICAgYWxsSW5kaWNlcyA9IFsuLi5hbGxJbmRpY2VzLCAuLi5pbmRpY2VzXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGFsbEluZGljZXMucHVzaChpbmRpY2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG90YWxTY29yZSA9IDA7XG4gICAgICAgICAgbnVtTWF0Y2hlcyA9IDA7XG4gICAgICAgICAgYWxsSW5kaWNlcy5sZW5ndGggPSAwO1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gT1IgY29uZGl0aW9uLCBzbyBpZiBUUlVFLCByZXR1cm5cbiAgICAgIGlmIChudW1NYXRjaGVzKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgaXNNYXRjaDogdHJ1ZSxcbiAgICAgICAgICBzY29yZTogdG90YWxTY29yZSAvIG51bU1hdGNoZXNcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaW5jbHVkZU1hdGNoZXMpIHtcbiAgICAgICAgICByZXN1bHQuaW5kaWNlcyA9IGFsbEluZGljZXM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTm90aGluZyB3YXMgbWF0Y2hlZFxuICAgIHJldHVybiB7XG4gICAgICBpc01hdGNoOiBmYWxzZSxcbiAgICAgIHNjb3JlOiAxXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IHJlZ2lzdGVyZWRTZWFyY2hlcnMgPSBbXTtcblxuZnVuY3Rpb24gcmVnaXN0ZXIoLi4uYXJncykge1xuICByZWdpc3RlcmVkU2VhcmNoZXJzLnB1c2goLi4uYXJncyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNlYXJjaGVyKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHJlZ2lzdGVyZWRTZWFyY2hlcnMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICBsZXQgc2VhcmNoZXJDbGFzcyA9IHJlZ2lzdGVyZWRTZWFyY2hlcnNbaV07XG4gICAgaWYgKHNlYXJjaGVyQ2xhc3MuY29uZGl0aW9uKHBhdHRlcm4sIG9wdGlvbnMpKSB7XG4gICAgICByZXR1cm4gbmV3IHNlYXJjaGVyQ2xhc3MocGF0dGVybiwgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IEJpdGFwU2VhcmNoKHBhdHRlcm4sIG9wdGlvbnMpXG59XG5cbmNvbnN0IExvZ2ljYWxPcGVyYXRvciA9IHtcbiAgQU5EOiAnJGFuZCcsXG4gIE9SOiAnJG9yJ1xufTtcblxuY29uc3QgS2V5VHlwZSA9IHtcbiAgUEFUSDogJyRwYXRoJyxcbiAgUEFUVEVSTjogJyR2YWwnXG59O1xuXG5jb25zdCBpc0V4cHJlc3Npb24gPSAocXVlcnkpID0+XG4gICEhKHF1ZXJ5W0xvZ2ljYWxPcGVyYXRvci5BTkRdIHx8IHF1ZXJ5W0xvZ2ljYWxPcGVyYXRvci5PUl0pO1xuXG5jb25zdCBpc1BhdGggPSAocXVlcnkpID0+ICEhcXVlcnlbS2V5VHlwZS5QQVRIXTtcblxuY29uc3QgaXNMZWFmID0gKHF1ZXJ5KSA9PlxuICAhaXNBcnJheShxdWVyeSkgJiYgaXNPYmplY3QocXVlcnkpICYmICFpc0V4cHJlc3Npb24ocXVlcnkpO1xuXG5jb25zdCBjb252ZXJ0VG9FeHBsaWNpdCA9IChxdWVyeSkgPT4gKHtcbiAgW0xvZ2ljYWxPcGVyYXRvci5BTkRdOiBPYmplY3Qua2V5cyhxdWVyeSkubWFwKChrZXkpID0+ICh7XG4gICAgW2tleV06IHF1ZXJ5W2tleV1cbiAgfSkpXG59KTtcblxuLy8gV2hlbiBgYXV0b2AgaXMgYHRydWVgLCB0aGUgcGFyc2UgZnVuY3Rpb24gd2lsbCBpbmZlciBhbmQgaW5pdGlhbGl6ZSBhbmQgYWRkXG4vLyB0aGUgYXBwcm9wcmlhdGUgYFNlYXJjaGVyYCBpbnN0YW5jZVxuZnVuY3Rpb24gcGFyc2UocXVlcnksIG9wdGlvbnMsIHsgYXV0byA9IHRydWUgfSA9IHt9KSB7XG4gIGNvbnN0IG5leHQgPSAocXVlcnkpID0+IHtcbiAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKHF1ZXJ5KTtcblxuICAgIGNvbnN0IGlzUXVlcnlQYXRoID0gaXNQYXRoKHF1ZXJ5KTtcblxuICAgIGlmICghaXNRdWVyeVBhdGggJiYga2V5cy5sZW5ndGggPiAxICYmICFpc0V4cHJlc3Npb24ocXVlcnkpKSB7XG4gICAgICByZXR1cm4gbmV4dChjb252ZXJ0VG9FeHBsaWNpdChxdWVyeSkpXG4gICAgfVxuXG4gICAgaWYgKGlzTGVhZihxdWVyeSkpIHtcbiAgICAgIGNvbnN0IGtleSA9IGlzUXVlcnlQYXRoID8gcXVlcnlbS2V5VHlwZS5QQVRIXSA6IGtleXNbMF07XG5cbiAgICAgIGNvbnN0IHBhdHRlcm4gPSBpc1F1ZXJ5UGF0aCA/IHF1ZXJ5W0tleVR5cGUuUEFUVEVSTl0gOiBxdWVyeVtrZXldO1xuXG4gICAgICBpZiAoIWlzU3RyaW5nKHBhdHRlcm4pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihMT0dJQ0FMX1NFQVJDSF9JTlZBTElEX1FVRVJZX0ZPUl9LRVkoa2V5KSlcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb2JqID0ge1xuICAgICAgICBrZXlJZDogY3JlYXRlS2V5SWQoa2V5KSxcbiAgICAgICAgcGF0dGVyblxuICAgICAgfTtcblxuICAgICAgaWYgKGF1dG8pIHtcbiAgICAgICAgb2JqLnNlYXJjaGVyID0gY3JlYXRlU2VhcmNoZXIocGF0dGVybiwgb3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmpcbiAgICB9XG5cbiAgICBsZXQgbm9kZSA9IHtcbiAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgIG9wZXJhdG9yOiBrZXlzWzBdXG4gICAgfTtcblxuICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHF1ZXJ5W2tleV07XG5cbiAgICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgbm9kZS5jaGlsZHJlbi5wdXNoKG5leHQoaXRlbSkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBub2RlXG4gIH07XG5cbiAgaWYgKCFpc0V4cHJlc3Npb24ocXVlcnkpKSB7XG4gICAgcXVlcnkgPSBjb252ZXJ0VG9FeHBsaWNpdChxdWVyeSk7XG4gIH1cblxuICByZXR1cm4gbmV4dChxdWVyeSlcbn1cblxuLy8gUHJhY3RpY2FsIHNjb3JpbmcgZnVuY3Rpb25cbmZ1bmN0aW9uIGNvbXB1dGVTY29yZShcbiAgcmVzdWx0cyxcbiAgeyBpZ25vcmVGaWVsZE5vcm0gPSBDb25maWcuaWdub3JlRmllbGROb3JtIH1cbikge1xuICByZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgIGxldCB0b3RhbFNjb3JlID0gMTtcblxuICAgIHJlc3VsdC5tYXRjaGVzLmZvckVhY2goKHsga2V5LCBub3JtLCBzY29yZSB9KSA9PiB7XG4gICAgICBjb25zdCB3ZWlnaHQgPSBrZXkgPyBrZXkud2VpZ2h0IDogbnVsbDtcblxuICAgICAgdG90YWxTY29yZSAqPSBNYXRoLnBvdyhcbiAgICAgICAgc2NvcmUgPT09IDAgJiYgd2VpZ2h0ID8gTnVtYmVyLkVQU0lMT04gOiBzY29yZSxcbiAgICAgICAgKHdlaWdodCB8fCAxKSAqIChpZ25vcmVGaWVsZE5vcm0gPyAxIDogbm9ybSlcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXN1bHQuc2NvcmUgPSB0b3RhbFNjb3JlO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtTWF0Y2hlcyhyZXN1bHQsIGRhdGEpIHtcbiAgY29uc3QgbWF0Y2hlcyA9IHJlc3VsdC5tYXRjaGVzO1xuICBkYXRhLm1hdGNoZXMgPSBbXTtcblxuICBpZiAoIWlzRGVmaW5lZChtYXRjaGVzKSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgbWF0Y2hlcy5mb3JFYWNoKChtYXRjaCkgPT4ge1xuICAgIGlmICghaXNEZWZpbmVkKG1hdGNoLmluZGljZXMpIHx8ICFtYXRjaC5pbmRpY2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgeyBpbmRpY2VzLCB2YWx1ZSB9ID0gbWF0Y2g7XG5cbiAgICBsZXQgb2JqID0ge1xuICAgICAgaW5kaWNlcyxcbiAgICAgIHZhbHVlXG4gICAgfTtcblxuICAgIGlmIChtYXRjaC5rZXkpIHtcbiAgICAgIG9iai5rZXkgPSBtYXRjaC5rZXkuc3JjO1xuICAgIH1cblxuICAgIGlmIChtYXRjaC5pZHggPiAtMSkge1xuICAgICAgb2JqLnJlZkluZGV4ID0gbWF0Y2guaWR4O1xuICAgIH1cblxuICAgIGRhdGEubWF0Y2hlcy5wdXNoKG9iaik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1TY29yZShyZXN1bHQsIGRhdGEpIHtcbiAgZGF0YS5zY29yZSA9IHJlc3VsdC5zY29yZTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0KFxuICByZXN1bHRzLFxuICBkb2NzLFxuICB7XG4gICAgaW5jbHVkZU1hdGNoZXMgPSBDb25maWcuaW5jbHVkZU1hdGNoZXMsXG4gICAgaW5jbHVkZVNjb3JlID0gQ29uZmlnLmluY2x1ZGVTY29yZVxuICB9ID0ge31cbikge1xuICBjb25zdCB0cmFuc2Zvcm1lcnMgPSBbXTtcblxuICBpZiAoaW5jbHVkZU1hdGNoZXMpIHRyYW5zZm9ybWVycy5wdXNoKHRyYW5zZm9ybU1hdGNoZXMpO1xuICBpZiAoaW5jbHVkZVNjb3JlKSB0cmFuc2Zvcm1lcnMucHVzaCh0cmFuc2Zvcm1TY29yZSk7XG5cbiAgcmV0dXJuIHJlc3VsdHMubWFwKChyZXN1bHQpID0+IHtcbiAgICBjb25zdCB7IGlkeCB9ID0gcmVzdWx0O1xuXG4gICAgY29uc3QgZGF0YSA9IHtcbiAgICAgIGl0ZW06IGRvY3NbaWR4XSxcbiAgICAgIHJlZkluZGV4OiBpZHhcbiAgICB9O1xuXG4gICAgaWYgKHRyYW5zZm9ybWVycy5sZW5ndGgpIHtcbiAgICAgIHRyYW5zZm9ybWVycy5mb3JFYWNoKCh0cmFuc2Zvcm1lcikgPT4ge1xuICAgICAgICB0cmFuc2Zvcm1lcihyZXN1bHQsIGRhdGEpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGFcbiAgfSlcbn1cblxuY2xhc3MgRnVzZSB7XG4gIGNvbnN0cnVjdG9yKGRvY3MsIG9wdGlvbnMgPSB7fSwgaW5kZXgpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB7IC4uLkNvbmZpZywgLi4ub3B0aW9ucyB9O1xuXG4gICAgaWYgKFxuICAgICAgdGhpcy5vcHRpb25zLnVzZUV4dGVuZGVkU2VhcmNoICYmXG4gICAgICAhdHJ1ZVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEVYVEVOREVEX1NFQVJDSF9VTkFWQUlMQUJMRSlcbiAgICB9XG5cbiAgICB0aGlzLl9rZXlTdG9yZSA9IG5ldyBLZXlTdG9yZSh0aGlzLm9wdGlvbnMua2V5cyk7XG5cbiAgICB0aGlzLnNldENvbGxlY3Rpb24oZG9jcywgaW5kZXgpO1xuICB9XG5cbiAgc2V0Q29sbGVjdGlvbihkb2NzLCBpbmRleCkge1xuICAgIHRoaXMuX2RvY3MgPSBkb2NzO1xuXG4gICAgaWYgKGluZGV4ICYmICEoaW5kZXggaW5zdGFuY2VvZiBGdXNlSW5kZXgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSU5DT1JSRUNUX0lOREVYX1RZUEUpXG4gICAgfVxuXG4gICAgdGhpcy5fbXlJbmRleCA9XG4gICAgICBpbmRleCB8fFxuICAgICAgY3JlYXRlSW5kZXgodGhpcy5vcHRpb25zLmtleXMsIHRoaXMuX2RvY3MsIHtcbiAgICAgICAgZ2V0Rm46IHRoaXMub3B0aW9ucy5nZXRGbixcbiAgICAgICAgZmllbGROb3JtV2VpZ2h0OiB0aGlzLm9wdGlvbnMuZmllbGROb3JtV2VpZ2h0XG4gICAgICB9KTtcbiAgfVxuXG4gIGFkZChkb2MpIHtcbiAgICBpZiAoIWlzRGVmaW5lZChkb2MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9kb2NzLnB1c2goZG9jKTtcbiAgICB0aGlzLl9teUluZGV4LmFkZChkb2MpO1xuICB9XG5cbiAgcmVtb3ZlKHByZWRpY2F0ZSA9ICgvKiBkb2MsIGlkeCAqLykgPT4gZmFsc2UpIHtcbiAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdGhpcy5fZG9jcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgY29uc3QgZG9jID0gdGhpcy5fZG9jc1tpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUoZG9jLCBpKSkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0KGkpO1xuICAgICAgICBpIC09IDE7XG4gICAgICAgIGxlbiAtPSAxO1xuXG4gICAgICAgIHJlc3VsdHMucHVzaChkb2MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cblxuICByZW1vdmVBdChpZHgpIHtcbiAgICB0aGlzLl9kb2NzLnNwbGljZShpZHgsIDEpO1xuICAgIHRoaXMuX215SW5kZXgucmVtb3ZlQXQoaWR4KTtcbiAgfVxuXG4gIGdldEluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLl9teUluZGV4XG4gIH1cblxuICBzZWFyY2gocXVlcnksIHsgbGltaXQgPSAtMSB9ID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBpbmNsdWRlTWF0Y2hlcyxcbiAgICAgIGluY2x1ZGVTY29yZSxcbiAgICAgIHNob3VsZFNvcnQsXG4gICAgICBzb3J0Rm4sXG4gICAgICBpZ25vcmVGaWVsZE5vcm1cbiAgICB9ID0gdGhpcy5vcHRpb25zO1xuXG4gICAgbGV0IHJlc3VsdHMgPSBpc1N0cmluZyhxdWVyeSlcbiAgICAgID8gaXNTdHJpbmcodGhpcy5fZG9jc1swXSlcbiAgICAgICAgPyB0aGlzLl9zZWFyY2hTdHJpbmdMaXN0KHF1ZXJ5KVxuICAgICAgICA6IHRoaXMuX3NlYXJjaE9iamVjdExpc3QocXVlcnkpXG4gICAgICA6IHRoaXMuX3NlYXJjaExvZ2ljYWwocXVlcnkpO1xuXG4gICAgY29tcHV0ZVNjb3JlKHJlc3VsdHMsIHsgaWdub3JlRmllbGROb3JtIH0pO1xuXG4gICAgaWYgKHNob3VsZFNvcnQpIHtcbiAgICAgIHJlc3VsdHMuc29ydChzb3J0Rm4pO1xuICAgIH1cblxuICAgIGlmIChpc051bWJlcihsaW1pdCkgJiYgbGltaXQgPiAtMSkge1xuICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuc2xpY2UoMCwgbGltaXQpO1xuICAgIH1cblxuICAgIHJldHVybiBmb3JtYXQocmVzdWx0cywgdGhpcy5fZG9jcywge1xuICAgICAgaW5jbHVkZU1hdGNoZXMsXG4gICAgICBpbmNsdWRlU2NvcmVcbiAgICB9KVxuICB9XG5cbiAgX3NlYXJjaFN0cmluZ0xpc3QocXVlcnkpIHtcbiAgICBjb25zdCBzZWFyY2hlciA9IGNyZWF0ZVNlYXJjaGVyKHF1ZXJ5LCB0aGlzLm9wdGlvbnMpO1xuICAgIGNvbnN0IHsgcmVjb3JkcyB9ID0gdGhpcy5fbXlJbmRleDtcbiAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgZXZlcnkgc3RyaW5nIGluIHRoZSBpbmRleFxuICAgIHJlY29yZHMuZm9yRWFjaCgoeyB2OiB0ZXh0LCBpOiBpZHgsIG46IG5vcm0gfSkgPT4ge1xuICAgICAgaWYgKCFpc0RlZmluZWQodGV4dCkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgaXNNYXRjaCwgc2NvcmUsIGluZGljZXMgfSA9IHNlYXJjaGVyLnNlYXJjaEluKHRleHQpO1xuXG4gICAgICBpZiAoaXNNYXRjaCkge1xuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIGl0ZW06IHRleHQsXG4gICAgICAgICAgaWR4LFxuICAgICAgICAgIG1hdGNoZXM6IFt7IHNjb3JlLCB2YWx1ZTogdGV4dCwgbm9ybSwgaW5kaWNlcyB9XVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cblxuICBfc2VhcmNoTG9naWNhbChxdWVyeSkge1xuXG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IHBhcnNlKHF1ZXJ5LCB0aGlzLm9wdGlvbnMpO1xuXG4gICAgY29uc3QgZXZhbHVhdGUgPSAobm9kZSwgaXRlbSwgaWR4KSA9PiB7XG4gICAgICBpZiAoIW5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgY29uc3QgeyBrZXlJZCwgc2VhcmNoZXIgfSA9IG5vZGU7XG5cbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMuX2ZpbmRNYXRjaGVzKHtcbiAgICAgICAgICBrZXk6IHRoaXMuX2tleVN0b3JlLmdldChrZXlJZCksXG4gICAgICAgICAgdmFsdWU6IHRoaXMuX215SW5kZXguZ2V0VmFsdWVGb3JJdGVtQXRLZXlJZChpdGVtLCBrZXlJZCksXG4gICAgICAgICAgc2VhcmNoZXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKG1hdGNoZXMgJiYgbWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZHgsXG4gICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgIG1hdGNoZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGV2YWx1YXRlKGNoaWxkLCBpdGVtLCBpZHgpO1xuICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICAgIHJlcy5wdXNoKC4uLnJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5vcGVyYXRvciA9PT0gTG9naWNhbE9wZXJhdG9yLkFORCkge1xuICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzXG4gICAgfTtcblxuICAgIGNvbnN0IHJlY29yZHMgPSB0aGlzLl9teUluZGV4LnJlY29yZHM7XG4gICAgY29uc3QgcmVzdWx0TWFwID0ge307XG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gICAgcmVjb3Jkcy5mb3JFYWNoKCh7ICQ6IGl0ZW0sIGk6IGlkeCB9KSA9PiB7XG4gICAgICBpZiAoaXNEZWZpbmVkKGl0ZW0pKSB7XG4gICAgICAgIGxldCBleHBSZXN1bHRzID0gZXZhbHVhdGUoZXhwcmVzc2lvbiwgaXRlbSwgaWR4KTtcblxuICAgICAgICBpZiAoZXhwUmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBEZWR1cGUgd2hlbiBhZGRpbmdcbiAgICAgICAgICBpZiAoIXJlc3VsdE1hcFtpZHhdKSB7XG4gICAgICAgICAgICByZXN1bHRNYXBbaWR4XSA9IHsgaWR4LCBpdGVtLCBtYXRjaGVzOiBbXSB9O1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdE1hcFtpZHhdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXhwUmVzdWx0cy5mb3JFYWNoKCh7IG1hdGNoZXMgfSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0TWFwW2lkeF0ubWF0Y2hlcy5wdXNoKC4uLm1hdGNoZXMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0c1xuICB9XG5cbiAgX3NlYXJjaE9iamVjdExpc3QocXVlcnkpIHtcbiAgICBjb25zdCBzZWFyY2hlciA9IGNyZWF0ZVNlYXJjaGVyKHF1ZXJ5LCB0aGlzLm9wdGlvbnMpO1xuICAgIGNvbnN0IHsga2V5cywgcmVjb3JkcyB9ID0gdGhpcy5fbXlJbmRleDtcbiAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICAvLyBMaXN0IGlzIEFycmF5PE9iamVjdD5cbiAgICByZWNvcmRzLmZvckVhY2goKHsgJDogaXRlbSwgaTogaWR4IH0pID0+IHtcbiAgICAgIGlmICghaXNEZWZpbmVkKGl0ZW0pKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBsZXQgbWF0Y2hlcyA9IFtdO1xuXG4gICAgICAvLyBJdGVyYXRlIG92ZXIgZXZlcnkga2V5IChpLmUsIHBhdGgpLCBhbmQgZmV0Y2ggdGhlIHZhbHVlIGF0IHRoYXQga2V5XG4gICAgICBrZXlzLmZvckVhY2goKGtleSwga2V5SW5kZXgpID0+IHtcbiAgICAgICAgbWF0Y2hlcy5wdXNoKFxuICAgICAgICAgIC4uLnRoaXMuX2ZpbmRNYXRjaGVzKHtcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHZhbHVlOiBpdGVtW2tleUluZGV4XSxcbiAgICAgICAgICAgIHNlYXJjaGVyXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICBpZHgsXG4gICAgICAgICAgaXRlbSxcbiAgICAgICAgICBtYXRjaGVzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuICBfZmluZE1hdGNoZXMoeyBrZXksIHZhbHVlLCBzZWFyY2hlciB9KSB7XG4gICAgaWYgKCFpc0RlZmluZWQodmFsdWUpKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG5cbiAgICBsZXQgbWF0Y2hlcyA9IFtdO1xuXG4gICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB2YWx1ZS5mb3JFYWNoKCh7IHY6IHRleHQsIGk6IGlkeCwgbjogbm9ybSB9KSA9PiB7XG4gICAgICAgIGlmICghaXNEZWZpbmVkKHRleHQpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IGlzTWF0Y2gsIHNjb3JlLCBpbmRpY2VzIH0gPSBzZWFyY2hlci5zZWFyY2hJbih0ZXh0KTtcblxuICAgICAgICBpZiAoaXNNYXRjaCkge1xuICAgICAgICAgIG1hdGNoZXMucHVzaCh7XG4gICAgICAgICAgICBzY29yZSxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHZhbHVlOiB0ZXh0LFxuICAgICAgICAgICAgaWR4LFxuICAgICAgICAgICAgbm9ybSxcbiAgICAgICAgICAgIGluZGljZXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHsgdjogdGV4dCwgbjogbm9ybSB9ID0gdmFsdWU7XG5cbiAgICAgIGNvbnN0IHsgaXNNYXRjaCwgc2NvcmUsIGluZGljZXMgfSA9IHNlYXJjaGVyLnNlYXJjaEluKHRleHQpO1xuXG4gICAgICBpZiAoaXNNYXRjaCkge1xuICAgICAgICBtYXRjaGVzLnB1c2goeyBzY29yZSwga2V5LCB2YWx1ZTogdGV4dCwgbm9ybSwgaW5kaWNlcyB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2hlc1xuICB9XG59XG5cbkZ1c2UudmVyc2lvbiA9ICc3LjEuMCc7XG5GdXNlLmNyZWF0ZUluZGV4ID0gY3JlYXRlSW5kZXg7XG5GdXNlLnBhcnNlSW5kZXggPSBwYXJzZUluZGV4O1xuRnVzZS5jb25maWcgPSBDb25maWc7XG5cbntcbiAgRnVzZS5wYXJzZVF1ZXJ5ID0gcGFyc2U7XG59XG5cbntcbiAgcmVnaXN0ZXIoRXh0ZW5kZWRTZWFyY2gpO1xufVxuXG5leHBvcnQgeyBGdXNlIGFzIGRlZmF1bHQgfTtcbiIsICJpbXBvcnQgRnVzZSBmcm9tICdmdXNlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaWNvblBpY2tlckNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbGVjdGVkSWNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNEcm9wZG93bixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZENsb3NlT25TZWxlY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRTZXRVc2luZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldEljb25zVXNpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRJY29uU3ZnVXNpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZnlTdGF0ZVVzaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIGRpc3BsYXlOYW1lLFxuICAgICAgICBpc0Ryb3Bkb3duLFxuICAgICAgICBzaG91bGRDbG9zZU9uU2VsZWN0LFxuICAgICAgICBkcm9wZG93bk9wZW46IGZhbHNlLFxuICAgICAgICBzZXQ6IG51bGwsXG4gICAgICAgIGljb25zOiBbXSxcbiAgICAgICAgc2VhcmNoOiAnJyxcbiAgICAgICAgLy8gc2VsZWN0ZWRJY29uLFxuXG4gICAgICAgIGZ1c2U6IG51bGwsXG4gICAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgICByZXN1bHRzVmlzaWJsZTogW10sXG4gICAgICAgIG1pbmltdW1JdGVtczogMzAwLFxuICAgICAgICByZXN1bHRzUGVyUGFnZTogNTAsXG4gICAgICAgIHJlc3VsdHNJbmRleDogMCxcblxuICAgICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuXG4gICAgICAgIGFzeW5jIGluaXQoKSB7XG4gICAgICAgICAgICBhd2FpdCB2ZXJpZnlTdGF0ZVVzaW5nKHRoaXMuc3RhdGUpXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHRoaXMuc3RhdGUgPSByZXN1bHQpXG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMubG9hZEljb25zKClcblxuICAgICAgICAgICAgdGhpcy4kd2lyZS5vbihgY3VzdG9tLWljb24tdXBsb2FkZWQ6OiR7a2V5fWAsIChpY29uKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5TmFtZSA9IGljb24ubGFiZWxcbiAgICAgICAgICAgICAgICB0aGlzLnNldCA9IGljb24uc2V0XG4gICAgICAgICAgICAgICAgdGhpcy5hZnRlclNldFVwZGF0ZWQoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBkZWZlckxvYWRpbmdTdGF0ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaXNMb2FkaW5nID0gdHJ1ZSwgMTUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhc3luYyBsb2FkSWNvbnMoKSB7XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0SWNvbnNVc2luZyh0aGlzLnNldClcbiAgICAgICAgICAgICAgICAudGhlbigoaWNvbnMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pY29ucyA9IGljb25zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUZ1c2VPYmplY3QoKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0U2VhcmNoUmVzdWx0cygpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBhc3luYyBsb2FkU2V0KCkge1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGdldFNldFVzaW5nKHRoaXMuc3RhdGUpLnRoZW4oKHNldCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0ID0gc2V0XG4gICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgYWZ0ZXJTdGF0ZVVwZGF0ZWQoKSB7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWZ0ZXJTZXRVcGRhdGVkKCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSWNvbnMoKVxuICAgICAgICB9LFxuXG4gICAgICAgIGFzeW5jIHVwZGF0ZVNlbGVjdGVkSWNvbihyZWxvYWRJZk5vdEZvdW5kID0gdHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgZm91bmQgPSB0aGlzLmljb25zLmZpbmQoaWNvbiA9PiBpY29uLmlkID09PSB0aGlzLnN0YXRlKTtcbiAgICAgICAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZWxvYWRJZk5vdEZvdW5kKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5sb2FkU2V0KClcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmxvYWRJY29ucygpXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVTZWxlY3RlZEljb24oZmFsc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RWxlbWVudEljb24oZWxlbWVudCwgaWQsIGFmdGVyID0gbnVsbCkge1xuICAgICAgICAgICAgZ2V0SWNvblN2Z1VzaW5nKGlkKVxuICAgICAgICAgICAgICAgIC50aGVuKChzdmcpID0+IGVsZW1lbnQuaW5uZXJIVE1MID0gc3ZnKVxuICAgICAgICAgICAgICAgIC5maW5hbGx5KGFmdGVyKVxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUZ1c2VPYmplY3QoKSB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGluY2x1ZGVTY29yZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBrZXlzOiBbJ2lkJ11cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5mdXNlID0gbmV3IEZ1c2UodGhpcy5pY29ucywgb3B0aW9ucylcbiAgICAgICAgfSxcblxuICAgICAgICByZXNldFNlYXJjaFJlc3VsdHMoKSB7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdHNQZXJQYWdlID0gMjA7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdHNJbmRleCA9IDA7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSB0aGlzLmljb25zO1xuICAgICAgICAgICAgdGhpcy5yZXN1bHRzVmlzaWJsZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5hZGRTZWFyY2hSZXN1bHRzQ2h1bmsoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRTZWxlY3Q6IHtcbiAgICAgICAgICAgIGFzeW5jIFsneC1vbjpjaGFuZ2UnXShldmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0ID0gdmFsdWUgPyB2YWx1ZSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFmdGVyU2V0VXBkYXRlZCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VhcmNoSW5wdXQ6IHtcbiAgICAgICAgICAgIFsneC1vbjppbnB1dC5kZWJvdW5jZSddKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBldmVudC50YXJnZXQudmFsdWVcbiAgICAgICAgICAgICAgICBjb25zdCBpc0xvYWRpbmdEZWZlcklkID0gdGhpcy5kZWZlckxvYWRpbmdTdGF0ZSgpXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHNWaXNpYmxlID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0c0luZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzID0gdGhpcy5mdXNlLnNlYXJjaCh2YWx1ZSkubWFwKHJlc3VsdCA9PiByZXN1bHQuaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VhcmNoUmVzdWx0c0NodW5rKClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0U2VhcmNoUmVzdWx0cygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChpc0xvYWRpbmdEZWZlcklkKVxuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuXG4gICAgICAgIGRyb3Bkb3duVHJpZ2dlcjoge1xuICAgICAgICAgICAgWyd4LW9uOmNsaWNrLnByZXZlbnQnXSgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3Bkb3duT3BlbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZHJvcGRvd25NZW51OiB7XG4gICAgICAgICAgICBbJ3gtc2hvdyddKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhdGhpcy5pc0Ryb3Bkb3duIHx8IHRoaXMuZHJvcGRvd25PcGVuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWyd4LW9uOmNsaWNrLm91dHNpZGUnXSgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3Bkb3duT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFkZFNlYXJjaFJlc3VsdHNDaHVuaygpIHtcbiAgICAgICAgICAgIGxldCBlbmRJbmRleCA9IHRoaXMucmVzdWx0c0luZGV4ICsgdGhpcy5yZXN1bHRzUGVyUGFnZTtcbiAgICAgICAgICAgIGlmIChlbmRJbmRleCA8IHRoaXMubWluaW11bUl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgZW5kSW5kZXggPSB0aGlzLm1pbmltdW1JdGVtcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucmVzdWx0c1Zpc2libGUucHVzaCguLi50aGlzLnJlc3VsdHMuc2xpY2UodGhpcy5yZXN1bHRzSW5kZXgsIGVuZEluZGV4KSk7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdHNJbmRleCA9IGVuZEluZGV4O1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVN0YXRlKGljb24pIHtcbiAgICAgICAgICAgIGlmIChpY29uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IGljb24uaWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5TmFtZSA9IGljb24ubGFiZWw7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hvdWxkQ2xvc2VPblNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB0aGlzLmRyb3Bkb3duT3BlbiA9IGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheU5hbWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQVNBLFNBQVMsUUFBUSxPQUFPO0FBQ3RCLFNBQU8sQ0FBQyxNQUFNLFVBQ1YsT0FBTyxLQUFLLE1BQU0sbUJBQ2xCLE1BQU0sUUFBUSxLQUFLO0FBQ3pCO0FBR0EsSUFBTSxXQUFXLElBQUk7QUFDckIsU0FBUyxhQUFhLE9BQU87QUFFM0IsTUFBSSxPQUFPLFNBQVMsVUFBVTtBQUM1QixXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksU0FBUyxR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QUFFM0IsYUFBSyxnQkFBZ0I7QUFBQSxNQUN6QjtBQUFBLElBQ0o7QUFBQSxJQUVBLGFBQWE7QUFBQSxNQUNULENBQUMscUJBQXFCLEVBQUUsT0FBTztBQUMzQixjQUFNLFFBQVEsTUFBTSxPQUFPO0FBQzNCLGNBQU0sbUJBQW1CLEtBQUssa0JBQWtCO0FBQ2hELFlBQUksTUFBTSxRQUFRO0FBQ2QsZUFBSyxpQkFBaUIsQ0FBQztBQUN2QixlQUFLLGVBQWU7QUFDcEIsZUFBSyxVQUFVLEtBQUssS0FBSyxPQUFPLEtBQUssRUFBRSxJQUFJLFlBQVUsT0FBTyxJQUFJO0FBQ2hFLGVBQUssc0JBQXNCO0FBQUEsUUFDL0IsT0FBTztBQUNILGVBQUssbUJBQW1CO0FBQUEsUUFDNUI7QUFDQSxxQkFBYSxnQkFBZ0I7QUFDN0IsYUFBSyxZQUFZO0FBQUEsTUFDckI7QUFBQSxJQUNKO0FBQUEsSUFFQSxpQkFBaUI7QUFBQSxNQUNiLENBQUMsb0JBQW9CLElBQUk7QUFDckIsYUFBSyxlQUFlO0FBQUEsTUFDeEI7QUFBQSxJQUNKO0FBQUEsSUFFQSxjQUFjO0FBQUEsTUFDVixDQUFDLFFBQVEsSUFBSTtBQUNULGVBQU8sQ0FBQyxLQUFLLGNBQWMsS0FBSztBQUFBLE1BQ3BDO0FBQUEsTUFDQSxDQUFDLG9CQUFvQixJQUFJO0FBQ3JCLGFBQUssZUFBZTtBQUFBLE1BQ3hCO0FBQUEsSUFDSjtBQUFBLElBRUEsd0JBQXdCO0FBQ3BCLFVBQUksV0FBVyxLQUFLLGVBQWUsS0FBSztBQUN4QyxVQUFJLFdBQVcsS0FBSyxjQUFjO0FBQzlCLG1CQUFXLEtBQUs7QUFBQSxNQUNwQjtBQUNBLFdBQUssZUFBZSxLQUFLLEdBQUcsS0FBSyxRQUFRLE1BQU0sS0FBSyxjQUFjLFFBQVEsQ0FBQztBQUMzRSxXQUFLLGVBQWU7QUFBQSxJQUN4QjtBQUFBLElBRUEsWUFBWSxNQUFNO0FBQ2QsVUFBSSxNQUFNO0FBQ04sYUFBSyxRQUFRLEtBQUs7QUFDbEIsYUFBSyxjQUFjLEtBQUs7QUFDeEIsWUFBSSxLQUFLLHFCQUFxQjtBQUMxQixlQUFLLFVBQVUsTUFBTSxLQUFLLGVBQWUsS0FBSztBQUFBLFFBQ2xEO0FBQUEsTUFDSixPQUFPO0FBQ0gsYUFBSyxRQUFRO0FBQ2IsYUFBSyxjQUFjO0FBQUEsTUFDdkI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKOyIsCiAgIm5hbWVzIjogWyJvYmoiLCAicGF0aCIsICJub3JtIiwgInZhbHVlIiwgInNjb3JlIiwgInBhdHRlcm4iLCAicmVzdWx0IiwgIml0ZW0iLCAic2VhcmNoZXJzIiwgInF1ZXJ5Il0KfQo=
