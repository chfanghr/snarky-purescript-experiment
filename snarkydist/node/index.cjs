"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

// dist/node/index.js
var node_exports = {};
__export(node_exports, {
  Account: () => Account5,
  AccountUpdate: () => AccountUpdate3,
  Bool: () => Bool4,
  Character: () => Character,
  Circuit: () => Circuit,
  CircuitString: () => CircuitString,
  CircuitValue: () => CircuitValue,
  Empty: () => Empty,
  Encoding: () => encoding_exports,
  Encryption: () => encryption_exports,
  Experimental: () => Experimental,
  Field: () => Field4,
  Group: () => Group3,
  Int64: () => Int64,
  Keypair: () => Keypair,
  Ledger: () => Ledger,
  MerkleMap: () => MerkleMap,
  MerkleMapWitness: () => MerkleMapWitness,
  MerkleTree: () => MerkleTree,
  MerkleWitness: () => MerkleWitness,
  Mina: () => mina_exports,
  Nullifier: () => Nullifier,
  Permissions: () => Permissions,
  Poseidon: () => Poseidon2,
  PrivateKey: () => PrivateKey2,
  Proof: () => Proof2,
  Provable: () => Provable,
  PublicKey: () => PublicKey2,
  Reducer: () => Reducer,
  Scalar: () => Scalar3,
  SelfProof: () => SelfProof,
  Sign: () => Sign3,
  Signature: () => Signature2,
  SmartContract: () => SmartContract,
  State: () => State,
  Struct: () => Struct,
  Token: () => Token,
  TokenId: () => TokenId4,
  TokenSymbol: () => TokenSymbol,
  Types: () => transaction_exports,
  UInt32: () => UInt322,
  UInt64: () => UInt642,
  Undefined: () => Undefined,
  VerificationKey: () => VerificationKey2,
  Void: () => Void,
  ZkappPublicInput: () => ZkappPublicInput,
  addCachedAccount: () => addCachedAccount,
  arrayProp: () => arrayProp,
  checkZkappTransaction: () => checkZkappTransaction,
  circuitMain: () => circuitMain,
  declareMethods: () => declareMethods,
  declareState: () => declareState,
  fetchAccount: () => fetchAccount,
  fetchEvents: () => fetchEvents,
  fetchLastBlock: () => fetchLastBlock,
  fetchTransactionStatus: () => fetchTransactionStatus,
  isReady: () => isReady,
  matrixProp: () => matrixProp,
  method: () => method,
  prop: () => prop,
  provable: () => provable2,
  provablePure: () => provablePure,
  public_: () => public_,
  scaleShifted: () => scaleShifted,
  sendZkapp: () => sendZkapp,
  setArchiveGraphqlEndpoint: () => setArchiveGraphqlEndpoint,
  setGraphqlEndpoint: () => setGraphqlEndpoint,
  setGraphqlEndpoints: () => setGraphqlEndpoints,
  shutdown: () => shutdown,
  state: () => state2,
  verify: () => verify2
});
module.exports = __toCommonJS(node_exports);

// dist/node/bindings/js/node/node-backend.js
var import_worker_threads = require("worker_threads");
var import_os = __toESM(require("os"), 1);
var import_plonk_wasm = __toESM(require("./bindings/compiled/_node_bindings/plonk_wasm.cjs"), 1);
var import_url = require("url");
var import_meta = {};
var url = import_meta.url;
var filename = url !== void 0 ? (0, import_url.fileURLToPath)(url) : __filename;
var wasm = import_plonk_wasm.default;
var workersReadyResolve;
var workersReady;
globalThis.startWorkers = startWorkers;
globalThis.terminateWorkers = terminateWorkers;
if (!import_worker_threads.isMainThread) {
  import_worker_threads.parentPort.postMessage({ type: "wasm_bindgen_worker_ready" });
  wasm.wbg_rayon_start_worker(import_worker_threads.workerData.receiver);
}
var state = "none";
var isNeededBy = 0;
var initializingPromise;
var exitingPromise;
async function withThreadPool(run) {
  isNeededBy++;
  switch (state) {
    case "none":
      initializingPromise = initThreadPool();
      state = "initializing";
      break;
    case "initializing":
    case "running":
      break;
    case "exiting":
      initializingPromise = exitingPromise.then(initThreadPool);
      state = "initializing";
      break;
  }
  await initializingPromise;
  initializingPromise = void 0;
  state = "running";
  let result;
  try {
    result = await run();
  } finally {
    isNeededBy--;
    switch (state) {
      case "none":
      case "initializing":
      case "exiting":
        console.error("bug in thread pool state machine");
        break;
      case "running":
        if (isNeededBy < 1) {
          exitingPromise = exitThreadPool();
          state = "exiting";
          await exitingPromise;
          if (state === "exiting") {
            exitingPromise = void 0;
            state = "none";
          }
        }
        break;
    }
  }
  return result;
}
async function initThreadPool() {
  if (!import_worker_threads.isMainThread)
    return;
  workersReady = new Promise((resolve) => workersReadyResolve = resolve);
  await wasm.initThreadPool(getEfficientNumWorkers(), filename);
  await workersReady;
  workersReady = void 0;
}
async function exitThreadPool() {
  if (!import_worker_threads.isMainThread)
    return;
  await wasm.exitThreadPool();
}
var wasmWorkers = [];
async function startWorkers(src, memory, builder) {
  wasmWorkers = [];
  await Promise.all(Array.from({ length: builder.numThreads() }, () => {
    let worker = new import_worker_threads.Worker(src, {
      workerData: { memory, receiver: builder.receiver() }
    });
    wasmWorkers.push(worker);
    let target = worker;
    let type = "wasm_bindgen_worker_ready";
    return new Promise((resolve) => {
      let done = false;
      target.on("message", function onMsg(data) {
        if (data == null || data.type !== type || done)
          return;
        done = true;
        resolve(worker);
      });
    });
  }));
  builder.build();
  workersReadyResolve();
}
async function terminateWorkers() {
  return Promise.all(wasmWorkers.map((w) => w.terminate())).then(() => wasmWorkers = void 0);
}
function getEfficientNumWorkers() {
  let cpus = import_os.default.cpus();
  let numCpus = cpus.length;
  let cpuModel = cpus[0].model;
  let numWorkers = {
    "Apple M1": 2,
    "Apple M1 Pro": numCpus === 10 ? 3 : 2,
    "Apple M1 Max": 3,
    "Apple M1 Ultra": 7,
    "Apple M2": 2
  }[cpuModel] || numCpus - 1;
  return numWorkers;
}

// dist/node/bindings/js/wrapper.js
var import_snarky_js_node_bc = __toESM(require("./bindings/compiled/_node_bindings/snarky_js_node.bc.cjs"), 1);
var getSnarky = () => import_snarky_js_node_bc.default;

// dist/node/bindings/js/snarky-class-spec.js
var snarky_class_spec_default = [
  {
    name: "Snarky",
    props: [
      { name: "exists", type: "function" },
      { name: "existsVar", type: "function" },
      {
        name: "run",
        type: "object"
      },
      {
        name: "field",
        type: "object"
      },
      {
        name: "bool",
        type: "object"
      },
      {
        name: "group",
        type: "object"
      },
      {
        name: "circuit",
        type: "object"
      },
      {
        name: "poseidon",
        type: "object"
      }
    ]
  },
  {
    name: "Ledger",
    props: [
      {
        name: "create",
        type: "function"
      }
    ]
  },
  {
    name: "Pickles",
    props: [
      {
        name: "compile",
        type: "function"
      },
      {
        name: "verify",
        type: "function"
      },
      {
        name: "dummyBase64Proof",
        type: "function"
      },
      {
        name: "dummyVerificationKey",
        type: "function"
      },
      {
        name: "proofToBase64",
        type: "function"
      },
      {
        name: "proofOfBase64",
        type: "function"
      },
      {
        name: "proofToBase64Transaction",
        type: "function"
      }
    ]
  },
  {
    name: "Test",
    props: [
      {
        name: "encoding",
        type: "object"
      },
      {
        name: "tokenId",
        type: "object"
      },
      {
        name: "poseidon",
        type: "object"
      },
      {
        name: "signature",
        type: "object"
      },
      {
        name: "fieldsFromJson",
        type: "object"
      },
      {
        name: "hashFromJson",
        type: "object"
      },
      {
        name: "hashInputFromJson",
        type: "object"
      },
      {
        name: "transactionHash",
        type: "object"
      }
    ]
  }
];

// dist/node/bindings/js/proxy.js
function proxyClasses(getModuleObject, isItReady2, moduleSpec) {
  let moduleProxy = {};
  for (let classSpec of moduleSpec) {
    let className = classSpec.name;
    let Class = function(...args) {
      if (!isItReady2())
        throw Error(constructError(className));
      let moduleObject = getModuleObject();
      return new moduleObject[className](...args);
    };
    for (let prop2 of classSpec.props) {
      let propName = prop2.name;
      if (prop2.type === "function") {
        Class[propName] = function(...args) {
          if (!isItReady2())
            throw Error(methodError(className, propName));
          let moduleObject = getModuleObject();
          return moduleObject[className][propName].apply(this, args);
        };
      } else {
        Object.defineProperty(Class, propName, {
          get: function() {
            let moduleObject = getModuleObject();
            return moduleObject[className][propName];
          }
        });
      }
    }
    moduleProxy[className] = Class;
  }
  return moduleProxy;
}
var constructError = (className) => `Cannot call class constructor because snarkyjs has not finished loading.
Try calling \`await isReady\` before \`new ${className}()\``;
var methodError = (className, methodName) => `Cannot call static method because snarkyjs has not finished loading.
Try calling \`await isReady\` before \`${className}.${methodName}()\``;

// dist/node/snarky.js
var isReadyBoolean = true;
var isItReady = () => isReadyBoolean;
var { Snarky, Ledger, Pickles, Test } = proxyClasses(getSnarky, isItReady, snarky_class_spec_default);

// dist/node/lib/field.js
var import_tslib2 = require("tslib");

// dist/node/bindings/crypto/random.js
var import_crypto = require("crypto");
function randomBytes(n) {
  return new Uint8Array((0, import_crypto.randomBytes)(n));
}

// dist/node/bindings/crypto/bigint-helpers.js
function bytesToBigInt(bytes) {
  let x = 0n;
  let bitPosition = 0n;
  for (let byte of bytes) {
    x += BigInt(byte) << bitPosition;
    bitPosition += 8n;
  }
  return x;
}
function bigIntToBytes(x, length) {
  if (x < 0n) {
    throw Error(`bigIntToBytes: negative numbers are not supported, got ${x}`);
  }
  let bytes = Array(length);
  for (let i2 = 0; i2 < length; i2++, x >>= 8n) {
    bytes[i2] = Number(x & 0xffn);
  }
  if (x > 0n) {
    throw Error(`bigIntToBytes: input does not fit in ${length} bytes`);
  }
  return bytes;
}
function changeBase(digits, base, newBase) {
  let x = fromBase(digits, base);
  let newDigits = toBase(x, newBase);
  return newDigits;
}
function fromBase(digits, base) {
  if (base <= 0n)
    throw Error("fromBase: base must be positive");
  let basePowers = [];
  for (let power2 = base, n = 1; n < digits.length; power2 **= 2n, n *= 2) {
    basePowers.push(power2);
  }
  let k = basePowers.length;
  digits = digits.concat(Array(2 ** k - digits.length).fill(0n));
  for (let i2 = 0; i2 < k; i2++) {
    let newDigits = Array(digits.length >> 1);
    let basePower = basePowers[i2];
    for (let j = 0; j < newDigits.length; j++) {
      newDigits[j] = digits[2 * j] + basePower * digits[2 * j + 1];
    }
    digits = newDigits;
  }
  console.assert(digits.length === 1);
  let [digit] = digits;
  return digit;
}
function toBase(x, base) {
  if (base <= 0n)
    throw Error("toBase: base must be positive");
  let basePowers = [];
  for (let power2 = base; power2 < x; power2 **= 2n) {
    basePowers.push(power2);
  }
  let digits = [x];
  let k = basePowers.length;
  for (let i2 = 0; i2 < k; i2++) {
    let newDigits = Array(2 * digits.length);
    let basePower = basePowers[k - 1 - i2];
    for (let j = 0; j < digits.length; j++) {
      let x2 = digits[j];
      let high = x2 / basePower;
      newDigits[2 * j + 1] = high;
      newDigits[2 * j] = x2 - high * basePower;
    }
    digits = newDigits;
  }
  while (digits[digits.length - 1] === 0n) {
    digits.pop();
  }
  return digits;
}

// dist/node/bindings/crypto/finite_field.js
var p = 0x40000000000000000000000000000000224698fc094cf91b992d30ed00000001n;
var q = 0x40000000000000000000000000000000224698fc0994a8dd8c46eb2100000001n;
var pMinusOneOddFactor = 0x40000000000000000000000000000000224698fc094cf91b992d30edn;
var qMinusOneOddFactor = 0x40000000000000000000000000000000224698fc0994a8dd8c46eb21n;
var twoadicRootFp = 0x2bce74deac30ebda362120830561f81aea322bf2b7bb7584bdad6fabd87ea32fn;
var twoadicRootFq = 0x2de6a9b8746d3f589e5c4dfd492ae26e9bb97ea3c106f049a70e2c1102b6d05fn;
function mod(x, p3) {
  x = x % p3;
  if (x < 0)
    return x + p3;
  return x;
}
function power(a2, n, p3) {
  a2 = mod(a2, p3);
  let x = 1n;
  for (; n > 0n; n >>= 1n) {
    if (n & 1n)
      x = mod(x * a2, p3);
    a2 = mod(a2 * a2, p3);
  }
  return x;
}
function inverse(a2, p3) {
  a2 = mod(a2, p3);
  if (a2 === 0n)
    return void 0;
  let b2 = p3;
  let x = 0n;
  let y = 1n;
  let u = 1n;
  let v = 0n;
  while (a2 !== 0n) {
    let q3 = b2 / a2;
    let r = mod(b2, a2);
    let m = x - u * q3;
    let n = y - v * q3;
    b2 = a2;
    a2 = r;
    x = u;
    y = v;
    u = m;
    v = n;
  }
  if (b2 !== 1n)
    return void 0;
  return mod(x, p3);
}
var precomputed_c = {};
function sqrt(n, p3, Q, z) {
  let M = 32n;
  let c = precomputed_c[p3.toString()] || (precomputed_c[p3.toString()] = power(z, Q, p3));
  let t = power(n, Q, p3);
  let R = power(n, (Q + 1n) / 2n, p3);
  while (true) {
    if (t === 0n)
      return 0n;
    if (t === 1n)
      return R;
    let i2 = 0n;
    let s = t;
    while (s !== 1n) {
      s = mod(s * s, p3);
      i2 = i2 + 1n;
    }
    if (i2 === M)
      return void 0;
    let b2 = power(c, 1n << M - i2 - 1n, p3);
    M = i2;
    c = mod(b2 * b2, p3);
    t = mod(t * c, p3);
    R = mod(R * b2, p3);
  }
}
function isSquare(x, p3) {
  if (x === 0n)
    return true;
  let sqrt1 = power(x, (p3 - 1n) / 2n, p3);
  return sqrt1 === 1n;
}
function randomField(p3) {
  while (true) {
    let bytes = randomBytes(32);
    bytes[31] &= 127;
    let x = bytesToBigInt(bytes);
    if (x < p3)
      return x;
  }
}
var Fp = createField(p, pMinusOneOddFactor, twoadicRootFp);
var Fq = createField(q, qMinusOneOddFactor, twoadicRootFq);
function createField(p3, t, twoadicRoot) {
  return {
    modulus: p3,
    sizeInBits: 255,
    t,
    twoadicRoot,
    add(x, y) {
      return mod(x + y, p3);
    },
    negate(x) {
      return x === 0n ? 0n : p3 - x;
    },
    sub(x, y) {
      return mod(x - y, p3);
    },
    mul(x, y) {
      return mod(x * y, p3);
    },
    inverse(x) {
      return inverse(x, p3);
    },
    div(x, y) {
      let yinv = inverse(y, p3);
      if (yinv === void 0)
        return;
      return mod(x * yinv, p3);
    },
    square(x) {
      return mod(x * x, p3);
    },
    isSquare(x) {
      return isSquare(x, p3);
    },
    sqrt(x) {
      return sqrt(x, p3, t, twoadicRoot);
    },
    power(x, n) {
      return power(x, n, p3);
    },
    dot(x, y) {
      let z = 0n;
      let n = x.length;
      for (let i2 = 0; i2 < n; i2++) {
        z += x[i2] * y[i2];
      }
      return mod(z, p3);
    },
    equal(x, y) {
      return mod(x - y, p3) === 0n;
    },
    isEven(x) {
      return !(x & 1n);
    },
    random() {
      return randomField(p3);
    },
    fromNumber(x) {
      return mod(BigInt(x), p3);
    },
    fromBigint(x) {
      return mod(x, p3);
    }
  };
}

// dist/node/bindings/lib/provable-generic.js
function createProvable() {
  const HashInput3 = createHashInput();
  let complexTypes2 = /* @__PURE__ */ new Set(["object", "function"]);
  function provable3(typeObj, options) {
    let objectKeys = typeof typeObj === "object" && typeObj !== null ? options?.customObjectKeys ?? Object.keys(typeObj).sort() : [];
    let nonCircuitPrimitives = /* @__PURE__ */ new Set([
      Number,
      String,
      Boolean,
      BigInt,
      null,
      void 0
    ]);
    if (!nonCircuitPrimitives.has(typeObj) && !complexTypes2.has(typeof typeObj)) {
      throw Error(`provable: unsupported type "${typeObj}"`);
    }
    function sizeInFields(typeObj2) {
      if (nonCircuitPrimitives.has(typeObj2))
        return 0;
      if (!complexTypes2.has(typeof typeObj2))
        throw Error(`provable: unsupported type "${typeObj2}"`);
      if (Array.isArray(typeObj2))
        return typeObj2.map(sizeInFields).reduce((a2, b2) => a2 + b2, 0);
      if ("sizeInFields" in typeObj2)
        return typeObj2.sizeInFields();
      return Object.values(typeObj2).map(sizeInFields).reduce((a2, b2) => a2 + b2, 0);
    }
    function toFields(typeObj2, obj, isToplevel = false) {
      if (nonCircuitPrimitives.has(typeObj2))
        return [];
      if (!complexTypes2.has(typeof typeObj2))
        throw Error(`provable: unsupported type "${typeObj2}"`);
      if (Array.isArray(typeObj2))
        return typeObj2.map((t, i2) => toFields(t, obj[i2])).flat();
      if ("toFields" in typeObj2)
        return typeObj2.toFields(obj);
      return (isToplevel ? objectKeys : Object.keys(typeObj2).sort()).map((k) => toFields(typeObj2[k], obj[k])).flat();
    }
    function toAuxiliary(typeObj2, obj, isToplevel = false) {
      if (typeObj2 === Number)
        return [obj ?? 0];
      if (typeObj2 === String)
        return [obj ?? ""];
      if (typeObj2 === Boolean)
        return [obj ?? false];
      if (typeObj2 === BigInt)
        return [obj ?? 0n];
      if (typeObj2 === void 0 || typeObj2 === null)
        return [];
      if (!complexTypes2.has(typeof typeObj2))
        throw Error(`provable: unsupported type "${typeObj2}"`);
      if (Array.isArray(typeObj2))
        return typeObj2.map((t, i2) => toAuxiliary(t, obj?.[i2]));
      if ("toAuxiliary" in typeObj2)
        return typeObj2.toAuxiliary(obj);
      return (isToplevel ? objectKeys : Object.keys(typeObj2).sort()).map((k) => toAuxiliary(typeObj2[k], obj?.[k]));
    }
    function toInput(typeObj2, obj, isToplevel = false) {
      if (nonCircuitPrimitives.has(typeObj2))
        return {};
      if (!complexTypes2.has(typeof typeObj2))
        throw Error(`provable: unsupported type "${typeObj2}"`);
      if (Array.isArray(typeObj2)) {
        return typeObj2.map((t, i2) => toInput(t, obj[i2])).reduce(HashInput3.append, HashInput3.empty);
      }
      if ("toInput" in typeObj2)
        return typeObj2.toInput(obj);
      if ("toFields" in typeObj2) {
        return { fields: typeObj2.toFields(obj) };
      }
      return (isToplevel ? objectKeys : Object.keys(typeObj2).sort()).map((k) => toInput(typeObj2[k], obj[k])).reduce(HashInput3.append, HashInput3.empty);
    }
    function toJSON(typeObj2, obj, isToplevel = false) {
      if (typeObj2 === BigInt)
        return obj.toString();
      if (typeObj2 === String || typeObj2 === Number || typeObj2 === Boolean)
        return obj;
      if (typeObj2 === void 0 || typeObj2 === null)
        return null;
      if (!complexTypes2.has(typeof typeObj2))
        throw Error(`provable: unsupported type "${typeObj2}"`);
      if (Array.isArray(typeObj2))
        return typeObj2.map((t, i2) => toJSON(t, obj[i2]));
      if ("toJSON" in typeObj2)
        return typeObj2.toJSON(obj);
      return Object.fromEntries((isToplevel ? objectKeys : Object.keys(typeObj2).sort()).map((k) => [
        k,
        toJSON(typeObj2[k], obj[k])
      ]));
    }
    function fromFields(typeObj2, fields, aux = [], isToplevel = false) {
      if (typeObj2 === Number || typeObj2 === String || typeObj2 === Boolean || typeObj2 === BigInt)
        return aux[0];
      if (typeObj2 === void 0 || typeObj2 === null)
        return typeObj2;
      if (!complexTypes2.has(typeof typeObj2))
        throw Error(`provable: unsupported type "${typeObj2}"`);
      if (Array.isArray(typeObj2)) {
        let array = [];
        let i2 = 0;
        let offset = 0;
        for (let subObj of typeObj2) {
          let size = sizeInFields(subObj);
          array.push(fromFields(subObj, fields.slice(offset, offset + size), aux[i2]));
          offset += size;
          i2++;
        }
        return array;
      }
      if ("fromFields" in typeObj2)
        return typeObj2.fromFields(fields, aux);
      let keys = isToplevel ? objectKeys : Object.keys(typeObj2).sort();
      let values = fromFields(keys.map((k) => typeObj2[k]), fields, aux);
      return Object.fromEntries(keys.map((k, i2) => [k, values[i2]]));
    }
    function fromJSON(typeObj2, json, isToplevel = false) {
      if (typeObj2 === BigInt)
        return BigInt(json);
      if (typeObj2 === String || typeObj2 === Number || typeObj2 === Boolean)
        return json;
      if (typeObj2 === null || typeObj2 === void 0)
        return void 0;
      if (!complexTypes2.has(typeof typeObj2))
        throw Error(`provable: unsupported type "${typeObj2}"`);
      if (Array.isArray(typeObj2))
        return typeObj2.map((t, i2) => fromJSON(t, json[i2]));
      if ("fromJSON" in typeObj2)
        return typeObj2.fromJSON(json);
      let keys = isToplevel ? objectKeys : Object.keys(typeObj2).sort();
      let values = fromJSON(keys.map((k) => typeObj2[k]), json);
      return Object.fromEntries(keys.map((k, i2) => [k, values[i2]]));
    }
    function check(typeObj2, obj, isToplevel = false) {
      if (nonCircuitPrimitives.has(typeObj2))
        return;
      if (!complexTypes2.has(typeof typeObj2))
        throw Error(`provable: unsupported type "${typeObj2}"`);
      if (Array.isArray(typeObj2))
        return typeObj2.forEach((t, i2) => check(t, obj[i2]));
      if ("check" in typeObj2)
        return typeObj2.check(obj);
      return (isToplevel ? objectKeys : Object.keys(typeObj2).sort()).forEach((k) => check(typeObj2[k], obj[k]));
    }
    if (options?.isPure === true) {
      return {
        sizeInFields: () => sizeInFields(typeObj),
        toFields: (obj) => toFields(typeObj, obj, true),
        toAuxiliary: () => [],
        fromFields: (fields) => fromFields(typeObj, fields, [], true),
        toInput: (obj) => toInput(typeObj, obj, true),
        toJSON: (obj) => toJSON(typeObj, obj, true),
        fromJSON: (json) => fromJSON(typeObj, json, true),
        check: (obj) => check(typeObj, obj, true)
      };
    }
    return {
      sizeInFields: () => sizeInFields(typeObj),
      toFields: (obj) => toFields(typeObj, obj, true),
      toAuxiliary: (obj) => toAuxiliary(typeObj, obj, true),
      fromFields: (fields, aux) => fromFields(typeObj, fields, aux, true),
      toInput: (obj) => toInput(typeObj, obj, true),
      toJSON: (obj) => toJSON(typeObj, obj, true),
      fromJSON: (json) => fromJSON(typeObj, json, true),
      check: (obj) => check(typeObj, obj, true)
    };
  }
  return provable3;
}
function createHashInput() {
  return {
    get empty() {
      return {};
    },
    append(input1, input2) {
      return {
        fields: (input1.fields ?? []).concat(input2.fields ?? []),
        packed: (input1.packed ?? []).concat(input2.packed ?? [])
      };
    }
  };
}

// dist/node/bindings/crypto/non-negative.js
function assertNonNegativeInteger(n, message) {
  if (!Number.isInteger(n) || n < 0)
    throw Error(message);
}
function assertPositiveInteger(n, message) {
  if (!Number.isInteger(n) || n <= 0)
    throw Error(message);
}

// dist/node/bindings/lib/binable.js
function defineBinable({ toBytes, readBytes }) {
  let readBytes_ = (bytes, offset) => {
    assertNonNegativeInteger(offset, "readBytes: offset must be integer >= 0");
    if (offset >= bytes.length)
      throw Error("readBytes: offset must be within bytes length");
    let [value, end] = readBytes(bytes, offset);
    if (end < offset)
      throw Error("offset returned by readBytes must be greater than initial offset");
    if (end > bytes.length)
      throw Error("offset returned by readBytes must not exceed bytes length");
    return [value, end];
  };
  return {
    toBytes,
    readBytes: readBytes_,
    // spec: fromBytes throws if the input bytes are not all used
    fromBytes(bytes) {
      let [value, offset] = readBytes_(bytes, 0);
      if (offset < bytes.length)
        throw Error("fromBytes: input bytes left over");
      return value;
    }
  };
}
function withVersionNumber(binable, versionNumber) {
  return defineBinable({
    toBytes(t) {
      let bytes = binable.toBytes(t);
      bytes.unshift(versionNumber);
      return bytes;
    },
    readBytes(bytes, offset) {
      let version = bytes[offset++];
      if (version !== versionNumber) {
        throw Error(`fromBytes: Invalid version byte. Expected ${versionNumber}, got ${version}.`);
      }
      return binable.readBytes(bytes, offset);
    }
  });
}
function withCheck({ toBytes, readBytes }, check) {
  return defineBinable({
    toBytes,
    readBytes(bytes, start) {
      let [value, end] = readBytes(bytes, start);
      check(value);
      return [value, end];
    }
  });
}
function record(binables, keys) {
  let binablesTuple = keys.map((key) => binables[key]);
  let tupleBinable = tuple(binablesTuple);
  return defineBinable({
    toBytes(t) {
      let array = keys.map((key) => t[key]);
      return tupleBinable.toBytes(array);
    },
    readBytes(bytes, start) {
      let [tupleValue, end] = tupleBinable.readBytes(bytes, start);
      let value = Object.fromEntries(keys.map((key, i2) => [key, tupleValue[i2]]));
      return [value, end];
    }
  });
}
function tuple(binables) {
  let n = binables.length;
  return defineBinable({
    toBytes(t) {
      let bytes = [];
      for (let i2 = 0; i2 < n; i2++) {
        let subBytes = binables[i2].toBytes(t[i2]);
        bytes.push(...subBytes);
      }
      return bytes;
    },
    readBytes(bytes, offset) {
      let values = [];
      for (let i2 = 0; i2 < n; i2++) {
        let [value, newOffset] = binables[i2].readBytes(bytes, offset);
        offset = newOffset;
        values.push(value);
      }
      return [values, offset];
    }
  });
}
var BinableString = defineBinable({
  toBytes(t) {
    return [stringLengthInBytes(t), ...stringToBytes(t)];
  },
  readBytes(bytes, offset) {
    let length = bytes[offset++];
    let end = offset + length;
    let string = stringFromBytes(bytes.slice(offset, end));
    return [string, end];
  }
});
var CODE_NEG_INT8 = 255;
var CODE_INT16 = 254;
var CODE_INT32 = 253;
var CODE_INT64 = 252;
function BinableInt(bits2) {
  let maxValue = 1n << BigInt(bits2 - 1);
  let nBytes = bits2 >> 3;
  if (nBytes * 8 !== bits2)
    throw Error("bits must be evenly divisible by 8");
  return defineBinable({
    toBytes(n) {
      if (n < -maxValue || n >= maxValue)
        throw Error(`int${bits2} out of range, got ${n}`);
      if (n >= 0) {
        if (n < 0x80n)
          return bigIntToBytes(n, 1);
        if (n < 0x8000n)
          return [CODE_INT16, ...bigIntToBytes(n, 2)];
        if (n < 2147483648)
          return [CODE_INT32, ...bigIntToBytes(n, 4)];
        else
          return [CODE_INT64, ...bigIntToBytes(n, 8)];
      } else {
        let M = 1n << 64n;
        if (n >= -0x80n)
          return [CODE_NEG_INT8, ...bigIntToBytes(M + n & 0xffn, 1)];
        if (n >= -0x8000n)
          return [CODE_INT16, ...bigIntToBytes(M + n & 0xffffn, 2)];
        if (n >= -2147483648)
          return [CODE_INT32, ...bigIntToBytes(M + n & 0xffffffffn, 4)];
        else
          return [CODE_INT64, ...bigIntToBytes(M + n, 8)];
      }
    },
    readBytes(bytes, offset) {
      let code = bytes[offset++];
      if (code < 128)
        return [BigInt(code), offset];
      let size = {
        [CODE_NEG_INT8]: 1,
        [CODE_INT16]: 2,
        [CODE_INT32]: 4,
        [CODE_INT64]: 8
      }[code];
      if (size === void 0) {
        throw Error("binable integer: invalid start byte");
      }
      let end = offset + size;
      let x = fillUInt(bytes.slice(offset, end), nBytes);
      if (x >= maxValue) {
        x -= 2n * maxValue;
      }
      if (x < -maxValue || x >= maxValue) {
        throw Error(`int${bits2} out of range, got ${x}`);
      }
      return [x, end];
    }
  });
}
function fillUInt(startBytes, nBytes) {
  let n = startBytes.length;
  let lastBit = startBytes[n - 1] >> 7;
  let fillByte = lastBit === 1 ? 255 : 0;
  let intBytes = startBytes.concat(Array(nBytes - n).fill(fillByte));
  let x = bytesToBigInt(intBytes);
  return x;
}
function BinableUint(bits2) {
  let binableInt = BinableInt(bits2);
  let maxValue = 1n << BigInt(bits2 - 1);
  return iso(binableInt, {
    to(uint) {
      if (uint < 0n || uint >= 2n * maxValue)
        throw Error(`uint${bits2} out of range, got ${uint}`);
      let ret = uint >= maxValue ? uint - 2n * maxValue : uint;
      return ret;
    },
    from(int) {
      let uint = int < 0n ? int + 2n * maxValue : int;
      if (uint < 0n || uint >= 2n * maxValue)
        throw Error(`uint${bits2} out of range, got ${uint}`);
      return uint;
    }
  });
}
var BinableInt64 = BinableInt(64);
var BinableInt32 = BinableInt(32);
var BinableUint64 = BinableUint(64);
var BinableUint32 = BinableUint(32);
function prefixToField(Field5, prefix) {
  let fieldSize = Field5.sizeInBytes();
  if (prefix.length >= fieldSize)
    throw Error("prefix too long");
  let stringBytes = stringToBytes(prefix);
  return Field5.fromBytes(stringBytes.concat(Array(fieldSize - stringBytes.length).fill(0)));
}
function bitsToBytes([...bits2]) {
  let bytes = [];
  while (bits2.length > 0) {
    let byteBits = bits2.splice(0, 8);
    let byte = 0;
    for (let i2 = 0; i2 < 8; i2++) {
      if (!byteBits[i2])
        continue;
      byte |= 1 << i2;
    }
    bytes.push(byte);
  }
  return bytes;
}
function bytesToBits(bytes) {
  return bytes.map((byte) => {
    let bits2 = Array(8);
    for (let i2 = 0; i2 < 8; i2++) {
      bits2[i2] = !!(byte & 1);
      byte >>= 1;
    }
    return bits2;
  }).flat();
}
function withBits(binable, sizeInBits2) {
  return {
    ...binable,
    toBits(t) {
      return bytesToBits(binable.toBytes(t)).slice(0, sizeInBits2);
    },
    fromBits(bits2) {
      return binable.fromBytes(bitsToBytes(bits2));
    },
    sizeInBytes() {
      return Math.ceil(sizeInBits2 / 8);
    },
    sizeInBits() {
      return sizeInBits2;
    }
  };
}
function iso(binable, { to, from }) {
  return defineBinable({
    toBytes(s) {
      return binable.toBytes(to(s));
    },
    readBytes(bytes, offset) {
      let [value, end] = binable.readBytes(bytes, offset);
      return [from(value), end];
    }
  });
}
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function stringToBytes(s) {
  return [...encoder.encode(s)];
}
function stringFromBytes(bytes) {
  return decoder.decode(Uint8Array.from(bytes));
}
function stringLengthInBytes(s) {
  return encoder.encode(s).length;
}

// dist/node/bindings/lib/provable-bigint.js
var provable = createProvable();
function ProvableBigint(check) {
  return {
    sizeInFields() {
      return 1;
    },
    toFields(x) {
      return [x];
    },
    toAuxiliary() {
      return [];
    },
    check,
    fromFields([x]) {
      check(x);
      return x;
    },
    toInput(x) {
      return { fields: [x], packed: [] };
    },
    toJSON(x) {
      return x.toString();
    },
    fromJSON(json) {
      if (isNaN(json) || isNaN(parseFloat(json))) {
        throw Error(`fromJSON: expected a numeric string, got "${json}"`);
      }
      let x = BigInt(json);
      check(x);
      return x;
    }
  };
}
function BinableBigint(sizeInBits2, check) {
  let sizeInBytes = Math.ceil(sizeInBits2 / 8);
  return withBits(defineBinable({
    toBytes(x) {
      return bigIntToBytes(x, sizeInBytes);
    },
    readBytes(bytes, start) {
      let x = 0n;
      let bitPosition = 0n;
      let end = Math.min(start + sizeInBytes, bytes.length);
      for (let i2 = start; i2 < end; i2++) {
        x += BigInt(bytes[i2]) << bitPosition;
        bitPosition += 8n;
      }
      check(x);
      return [x, end];
    }
  }), sizeInBits2);
}

// dist/node/provable/field-bigint.js
var sizeInBits = Fp.sizeInBits;
var minusOne = 0x40000000000000000000000000000000224698fc094cf91b992d30ed00000000n;
var checkField = checkRange(0n, Fp.modulus, "Field");
var checkBool = checkAllowList(/* @__PURE__ */ new Set([0n, 1n]), "Bool");
var checkSign = checkAllowList(/* @__PURE__ */ new Set([1n, minusOne]), "Sign");
var Field = pseudoClass(function Field2(value) {
  return mod(BigInt(value), Fp.modulus);
}, {
  ...ProvableBigint(checkField),
  ...BinableBigint(Fp.sizeInBits, checkField),
  ...Fp
});
var Bool = pseudoClass(function Bool2(value) {
  return BigInt(value);
}, {
  ...ProvableBigint(checkBool),
  ...BinableBigint(1, checkBool),
  toInput(x) {
    return { fields: [], packed: [[x, 1]] };
  },
  toBoolean(x) {
    return !!x;
  },
  toJSON(x) {
    return !!x;
  },
  fromJSON(b2) {
    let x = BigInt(b2);
    checkBool(x);
    return x;
  },
  sizeInBytes() {
    return 1;
  },
  fromField(x) {
    checkBool(x);
    return x;
  }
});
function Unsigned(bits2) {
  let maxValue = (1n << BigInt(bits2)) - 1n;
  let checkUnsigned = checkRange(0n, 1n << BigInt(bits2), `UInt${bits2}`);
  let binable = BinableBigint(bits2, checkUnsigned);
  let bytes = Math.ceil(bits2 / 8);
  return pseudoClass(function Unsigned2(value) {
    let x = BigInt(value);
    checkUnsigned(x);
    return x;
  }, {
    ...ProvableBigint(checkUnsigned),
    ...binable,
    toInput(x) {
      return { fields: [], packed: [[x, bits2]] };
    },
    maxValue,
    random() {
      return binable.fromBytes([...randomBytes(bytes)]);
    }
  });
}
var UInt32 = Unsigned(32);
var UInt64 = Unsigned(64);
var Sign = pseudoClass(function Sign2(value) {
  if (value !== 1 && value !== -1)
    throw Error("Sign: input must be 1 or -1.");
  return mod(BigInt(value), Fp.modulus);
}, {
  ...ProvableBigint(checkSign),
  ...BinableBigint(1, checkSign),
  emptyValue() {
    return 1n;
  },
  toInput(x) {
    return { fields: [], packed: [[x === 1n ? 1n : 0n, 1]] };
  },
  fromFields([x]) {
    if (x === 0n)
      return 1n;
    checkSign(x);
    return x;
  },
  toJSON(x) {
    return x === 1n ? "Positive" : "Negative";
  },
  fromJSON(x) {
    if (x !== "Positive" && x !== "Negative")
      throw Error("Sign: invalid input");
    return x === "Positive" ? 1n : minusOne;
  }
});
function pseudoClass(constructor, module2) {
  return Object.assign(constructor, module2);
}
function checkRange(lower, upper, name) {
  return (x) => {
    if (x < lower)
      throw Error(`${name}: inputs smaller than ${lower} are not allowed, got ${x}`);
    if (x >= upper)
      throw Error(`${name}: inputs larger than ${upper - 1n} are not allowed, got ${x}`);
  };
}
function checkAllowList(valid, name) {
  return (x) => {
    if (!valid.has(x)) {
      throw Error(`${name}: input must be one of ${[...valid].join(", ")}, got ${x}`);
    }
  };
}

// dist/node/lib/global-context.js
var Context = { create };
function create(options = {
  allowsNesting: true,
  default: void 0
}) {
  let t = Object.assign(function() {
    return t.data[t.data.length - 1]?.context;
  }, {
    data: [],
    allowsNesting: options.allowsNesting ?? true,
    get: () => get(t),
    has: () => t.data.length !== 0,
    runWith(context, func) {
      let id = enter(t, context);
      let result;
      let resultContext;
      try {
        result = func(context);
      } finally {
        resultContext = leave(t, id);
      }
      return [resultContext, result];
    },
    async runWithAsync(context, func) {
      let id = enter(t, context);
      let result;
      let resultContext;
      try {
        result = await func(context);
      } finally {
        resultContext = leave(t, id);
      }
      return [resultContext, result];
    },
    enter: (context) => enter(t, context),
    leave: (id) => leave(t, id),
    id: () => {
      if (t.data.length === 0)
        throw Error(contextConflictMessage);
      return t.data[t.data.length - 1].id;
    }
  });
  if (options.default !== void 0)
    enter(t, options.default);
  return t;
}
function enter(t, context) {
  if (t.data.length > 0 && !t.allowsNesting) {
    throw Error(contextConflictMessage);
  }
  let id = Math.random();
  t.data.push({ context, id });
  return id;
}
function leave(t, id) {
  let current = t.data.pop();
  if (current === void 0)
    throw Error(contextConflictMessage);
  if (current.id !== id)
    throw Error(contextConflictMessage);
  return current.context;
}
function get(t) {
  if (t.data.length === 0)
    throw Error(contextConflictMessage);
  let current = t.data[t.data.length - 1];
  return current.context;
}
var contextConflictMessage = "It seems you're running multiple provers concurrently within the same JavaScript thread, which, at the moment, is not supported and would lead to bugs.";

// dist/node/lib/errors.js
var lineRemovalKeywords = [
  "snarky_js_node.bc.cjs",
  "/builtin/",
  "CatchAndPrettifyStacktrace"
  // Decorator name to remove from stacktrace (covers both class and method decorator)
];
function prettifyStacktrace(error) {
  error = unwrapMlException(error);
  if (!(error instanceof Error) || !error.stack)
    return error;
  const stacktrace = error.stack;
  const stacktraceLines = stacktrace.split("\n");
  const newStacktrace = [];
  for (let i2 = 0; i2 < stacktraceLines.length; i2++) {
    const shouldRemoveLine = lineRemovalKeywords.some((lineToRemove) => stacktraceLines[i2].includes(lineToRemove));
    if (shouldRemoveLine) {
      continue;
    }
    const trimmedLine = trimPaths(stacktraceLines[i2]);
    newStacktrace.push(trimmedLine);
  }
  error.stack = newStacktrace.join("\n");
  return error;
}
async function prettifyStacktracePromise(result) {
  try {
    return await result;
  } catch (error) {
    throw prettifyStacktrace(error);
  }
}
function unwrapMlException(error) {
  if (error instanceof Error)
    return error;
  if (Array.isArray(error) && error[2] instanceof Error)
    return error[2];
  return error;
}
function trimPaths(stacktracePath) {
  const includesSnarkyJS = stacktracePath.includes("snarkyjs");
  if (includesSnarkyJS) {
    return trimSnarkyJSPath(stacktracePath);
  }
  const includesOpam = stacktracePath.includes("opam");
  if (includesOpam) {
    return trimOpamPath(stacktracePath);
  }
  const includesWorkspace = stacktracePath.includes("workspace_root");
  if (includesWorkspace) {
    return trimWorkspacePath(stacktracePath);
  }
  return stacktracePath;
}
function trimSnarkyJSPath(stacktraceLine) {
  const fullPath = getDirectoryPath(stacktraceLine);
  if (!fullPath) {
    return stacktraceLine;
  }
  const snarkyJSIndex = fullPath.indexOf("snarkyjs");
  if (snarkyJSIndex === -1) {
    return stacktraceLine;
  }
  const prefix = stacktraceLine.slice(0, stacktraceLine.indexOf("(") + 1);
  const updatedPath = fullPath.slice(snarkyJSIndex);
  return `${prefix}${updatedPath})`;
}
function trimOpamPath(stacktraceLine) {
  const fullPath = getDirectoryPath(stacktraceLine);
  if (!fullPath) {
    return stacktraceLine;
  }
  const opamIndex = fullPath.indexOf("opam");
  if (opamIndex === -1) {
    return stacktraceLine;
  }
  const updatedPathArray = fullPath.slice(opamIndex).split("/");
  const libIndex = updatedPathArray.lastIndexOf("lib");
  if (libIndex === -1) {
    return stacktraceLine;
  }
  const prefix = stacktraceLine.slice(0, stacktraceLine.indexOf("(") + 1);
  const trimmedPath = updatedPathArray.slice(libIndex + 1);
  trimmedPath.unshift("ocaml");
  return `${prefix}${trimmedPath.join("/")})`;
}
function trimWorkspacePath(stacktraceLine) {
  const fullPath = getDirectoryPath(stacktraceLine);
  if (!fullPath) {
    return stacktraceLine;
  }
  const workspaceIndex = fullPath.indexOf("workspace_root");
  if (workspaceIndex === -1) {
    return stacktraceLine;
  }
  const updatedPathArray = fullPath.slice(workspaceIndex).split("/");
  const prefix = stacktraceLine.slice(0, stacktraceLine.indexOf("(") + 1);
  const trimmedPath = updatedPathArray.slice(workspaceIndex);
  return `${prefix}${trimmedPath.join("/")})`;
}
function getDirectoryPath(stacktraceLine) {
  const fullPathRegex = /\(([^)]+)\)/;
  const matchedPaths = stacktraceLine.match(fullPathRegex);
  if (matchedPaths) {
    return matchedPaths[1];
  }
}
function Bug(message) {
  return Error(`${message}
This shouldn't have happened and indicates an internal bug.`);
}
function assert(condition, message = "Failed assertion.") {
  if (!condition)
    throw Bug(message);
}

// dist/node/lib/provable-context.js
var snarkContext = Context.create({ default: {} });
function inProver() {
  return !!snarkContext.get().inProver;
}
function inCheckedComputation() {
  let ctx = snarkContext.get();
  return !!ctx.inCompile || !!ctx.inProver || !!ctx.inCheckedComputation;
}
function inCompile() {
  return !!snarkContext.get().inCompile;
}
function inAnalyze() {
  return !!snarkContext.get().inAnalyze;
}
function asProver(f) {
  if (inCheckedComputation()) {
    Snarky.run.asProver(f);
  } else {
    f();
  }
}
function runAndCheck(f) {
  let id = snarkContext.enter({ inCheckedComputation: true });
  try {
    Snarky.run.runAndCheck(f);
  } catch (error) {
    throw prettifyStacktrace(error);
  } finally {
    snarkContext.leave(id);
  }
}
function runUnchecked(f) {
  let id = snarkContext.enter({ inCheckedComputation: true });
  try {
    Snarky.run.runUnchecked(f);
  } catch (error) {
    throw prettifyStacktrace(error);
  } finally {
    snarkContext.leave(id);
  }
}
function constraintSystem(f) {
  let id = snarkContext.enter({ inAnalyze: true, inCheckedComputation: true });
  try {
    let result;
    let { rows, digest, json } = Snarky.run.constraintSystem(() => {
      result = f();
    });
    let { gates, publicInputSize } = gatesFromJson(json);
    return { rows, digest, result, gates, publicInputSize };
  } catch (error) {
    throw prettifyStacktrace(error);
  } finally {
    snarkContext.leave(id);
  }
}
function gatesFromJson(cs) {
  let gates = cs.gates.map(({ typ, wires, coeffs: byteCoeffs }) => {
    let coeffs = [];
    for (let coefficient of byteCoeffs) {
      let arr = new Uint8Array(coefficient);
      coeffs.push(bytesToBigInt(arr).toString());
    }
    return { type: typ, wires, coeffs };
  });
  return { publicInputSize: cs.public_input_size, gates };
}

// dist/node/lib/bool.js
var import_tslib = require("tslib");
var _a;
var _Bool_isBool;
var _Bool_toVar;
var Bool3 = class {
  constructor(x) {
    if ((0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_isBool).call(Bool3, x)) {
      this.value = x.value;
      return;
    }
    if (Array.isArray(x)) {
      this.value = x;
      return;
    }
    this.value = FieldVar.constant(Bool(x));
  }
  isConstant() {
    return this.value[0] === FieldType.Constant;
  }
  /**
   * Converts a {@link Bool} to a {@link Field}. `false` becomes 0 and `true` becomes 1.
   */
  toField() {
    return Bool3.toField(this);
  }
  /**
   * @returns a new {@link Bool} that is the negation of this {@link Bool}.
   */
  not() {
    if (this.isConstant()) {
      return new Bool3(!this.toBoolean());
    }
    return new Bool3(Snarky.bool.not(this.value));
  }
  /**
   * @param y A {@link Bool} to AND with this {@link Bool}.
   * @returns a new {@link Bool} that is set to true only if
   * this {@link Bool} and `y` are also true.
   */
  and(y) {
    if (this.isConstant() && isConstant(y)) {
      return new Bool3(this.toBoolean() && toBoolean(y));
    }
    return new Bool3(Snarky.bool.and(this.value, (0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_toVar).call(Bool3, y)));
  }
  /**
   * @param y a {@link Bool} to OR with this {@link Bool}.
   * @returns a new {@link Bool} that is set to true if either
   * this {@link Bool} or `y` is true.
   */
  or(y) {
    if (this.isConstant() && isConstant(y)) {
      return new Bool3(this.toBoolean() || toBoolean(y));
    }
    return new Bool3(Snarky.bool.or(this.value, (0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_toVar).call(Bool3, y)));
  }
  /**
   * Proves that this {@link Bool} is equal to `y`.
   * @param y a {@link Bool}.
   */
  assertEquals(y, message) {
    try {
      if (this.isConstant() && isConstant(y)) {
        if (this.toBoolean() !== toBoolean(y)) {
          throw Error(`Bool.assertEquals(): ${this} != ${y}`);
        }
        return;
      }
      Snarky.bool.assertEqual(this.value, (0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_toVar).call(Bool3, y));
    } catch (err) {
      throw withMessage(err, message);
    }
  }
  /**
   * Proves that this {@link Bool} is `true`.
   */
  assertTrue(message) {
    try {
      if (this.isConstant() && !this.toBoolean()) {
        throw Error(`Bool.assertTrue(): ${this} != ${true}`);
      }
      this.assertEquals(true);
    } catch (err) {
      throw withMessage(err, message);
    }
  }
  /**
   * Proves that this {@link Bool} is `false`.
   */
  assertFalse(message) {
    try {
      if (this.isConstant() && this.toBoolean()) {
        throw Error(`Bool.assertFalse(): ${this} != ${false}`);
      }
      this.assertEquals(false);
    } catch (err) {
      throw withMessage(err, message);
    }
  }
  /**
   * Returns true if this {@link Bool} is equal to `y`.
   * @param y a {@link Bool}.
   */
  equals(y) {
    if (this.isConstant() && isConstant(y)) {
      return new Bool3(this.toBoolean() === toBoolean(y));
    }
    return new Bool3(Snarky.bool.equals(this.value, (0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_toVar).call(Bool3, y)));
  }
  /**
   * Returns the size of this type.
   */
  sizeInFields() {
    return 1;
  }
  /**
   * Serializes this {@link Bool} into {@link Field} elements.
   */
  toFields() {
    return Bool3.toFields(this);
  }
  /**
   * Serialize the {@link Bool} to a string, e.g. for printing.
   * This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the Field.
   */
  toString() {
    return this.toBoolean().toString();
  }
  /**
   * Serialize the {@link Bool} to a JSON string.
   * This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the Field.
   */
  toJSON() {
    return this.toBoolean();
  }
  /**
   * This converts the {@link Bool} to a javascript [[boolean]].
   * This can only be called on non-witness values.
   */
  toBoolean() {
    let value;
    if (this.isConstant()) {
      value = this.value[1];
    } else if (Snarky.run.inProverBlock()) {
      value = Snarky.field.readVar(this.value);
    } else {
      throw Error(readVarMessage("toBoolean", "b", "Bool"));
    }
    return FieldConst.equal(value, FieldConst[1]);
  }
  static toField(x) {
    return new Field3((0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_toVar).call(Bool3, x));
  }
  /**
   * Boolean negation.
   */
  static not(x) {
    if ((0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_isBool).call(Bool3, x)) {
      return x.not();
    }
    return new Bool3(!x);
  }
  /**
   * Boolean AND operation.
   */
  static and(x, y) {
    if ((0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_isBool).call(Bool3, x)) {
      return x.and(y);
    }
    return new Bool3(x).and(y);
  }
  /**
   * Boolean OR operation.
   */
  static or(x, y) {
    if ((0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_isBool).call(Bool3, x)) {
      return x.or(y);
    }
    return new Bool3(x).or(y);
  }
  /**
   * Asserts if both {@link Bool} are equal.
   */
  static assertEqual(x, y) {
    if ((0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_isBool).call(Bool3, x)) {
      x.assertEquals(y);
      return;
    }
    new Bool3(x).assertEquals(y);
  }
  /**
   * Checks two {@link Bool} for equality.
   */
  static equal(x, y) {
    if ((0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_isBool).call(Bool3, x)) {
      return x.equals(y);
    }
    return new Bool3(x).equals(y);
  }
  /**
   * Static method to serialize a {@link Bool} into an array of {@link Field} elements.
   */
  static toFields(x) {
    return [Bool3.toField(x)];
  }
  /**
   * Static method to serialize a {@link Bool} into its auxiliary data.
   */
  static toAuxiliary(_) {
    return [];
  }
  /**
   * Creates a data structure from an array of serialized {@link Field} elements.
   */
  static fromFields(fields) {
    if (fields.length !== 1) {
      throw Error(`Bool.fromFields(): expected 1 field, got ${fields.length}`);
    }
    return new Bool3(fields[0].value);
  }
  /**
   * Serialize a {@link Bool} to a JSON string.
   * This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the Field.
   */
  static toJSON(x) {
    return x.toBoolean();
  }
  /**
   * Deserialize a JSON structure into a {@link Bool}.
   * This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the Field.
   */
  static fromJSON(b2) {
    return new Bool3(b2);
  }
  /**
   * Returns the size of this type.
   */
  static sizeInFields() {
    return 1;
  }
  static toInput(x) {
    return { packed: [[x.toField(), 1]] };
  }
  static toBytes(b2) {
    return BoolBinable.toBytes(b2);
  }
  static fromBytes(bytes) {
    return BoolBinable.fromBytes(bytes);
  }
  static readBytes(bytes, offset) {
    return BoolBinable.readBytes(bytes, offset);
  }
  static sizeInBytes() {
    return 1;
  }
  static check(x) {
    Snarky.field.assertBoolean(x.value);
  }
};
_a = Bool3, _Bool_isBool = function _Bool_isBool2(x) {
  return x instanceof Bool3;
}, _Bool_toVar = function _Bool_toVar2(x) {
  if ((0, import_tslib.__classPrivateFieldGet)(Bool3, _a, "m", _Bool_isBool).call(Bool3, x))
    return x.value;
  return FieldVar.constant(Bool(x));
};
Bool3.Unsafe = {
  /**
   * Converts a {@link Field} into a {@link Bool}. This is a **dangerous** operation
   * as it assumes that the field element is either 0 or 1 (which might not be true).
   *
   * Only use this with constants or if you have already constrained the Field element to be 0 or 1.
   *
   * @param x a {@link Field}
   */
  ofField(x) {
    asProver(() => {
      let x0 = x.toBigInt();
      if (x0 !== 0n && x0 !== 1n)
        throw Error(`Bool.Unsafe.ofField(): Expected 0 or 1, got ${x0}`);
    });
    return new Bool3(x.value);
  }
};
var BoolBinable = defineBinable({
  toBytes(b2) {
    return [Number(b2.toBoolean())];
  },
  readBytes(bytes, offset) {
    return [new Bool3(!!bytes[offset]), offset + 1];
  }
});
function isConstant(x) {
  if (typeof x === "boolean") {
    return true;
  }
  return x.isConstant();
}
function isBool(x) {
  return x instanceof Bool3;
}
function toBoolean(x) {
  if (typeof x === "boolean") {
    return x;
  }
  return x.toBoolean();
}
function withMessage(error, message) {
  if (message === void 0 || !(error instanceof Error))
    return error;
  error.message = `${message}
${error.message}`;
  return error;
}

// dist/node/lib/field.js
var _Field_instances;
var _a2;
var _Field_isField;
var _Field_toConst;
var _Field_toVar;
var _Field_toConstant;
var _Field_compare;
var _Field_checkBitLength;
function constToBigint(x) {
  return Field.fromBytes([...x]);
}
function constFromBigint(x) {
  return Uint8Array.from(Field.toBytes(x));
}
var FieldConst = {
  fromBigint: constFromBigint,
  toBigint: constToBigint,
  equal(x, y) {
    for (let i2 = 0, n = Field.sizeInBytes(); i2 < n; i2++) {
      if (x[i2] !== y[i2])
        return false;
    }
    return true;
  },
  [0]: constFromBigint(0n),
  [1]: constFromBigint(1n),
  [-1]: constFromBigint(Field(-1n))
};
var FieldType;
(function(FieldType2) {
  FieldType2[FieldType2["Constant"] = 0] = "Constant";
  FieldType2[FieldType2["Var"] = 1] = "Var";
  FieldType2[FieldType2["Add"] = 2] = "Add";
  FieldType2[FieldType2["Scale"] = 3] = "Scale";
})(FieldType || (FieldType = {}));
var FieldVar = {
  constant(x) {
    let x0 = typeof x === "bigint" ? FieldConst.fromBigint(x) : x;
    return [FieldType.Constant, x0];
  },
  isConstant(x) {
    return x[0] === FieldType.Constant;
  },
  // TODO: handle (special) constants
  add(x, y) {
    return [FieldType.Add, x, y];
  },
  // TODO: handle (special) constants
  scale(c, x) {
    return [FieldType.Scale, c, x];
  },
  [0]: [FieldType.Constant, FieldConst[0]],
  [1]: [FieldType.Constant, FieldConst[1]],
  [-1]: [FieldType.Constant, FieldConst[-1]]
};
var Field3 = class {
  /**
   * Coerce anything "field-like" (bigint, number, string, and {@link Field}) to a Field.
   */
  constructor(x) {
    _Field_instances.add(this);
    if ((0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_isField).call(Field3, x)) {
      this.value = x.value;
      return;
    }
    if (Array.isArray(x)) {
      this.value = x;
      return;
    }
    if (x instanceof Uint8Array) {
      this.value = FieldVar.constant(x);
      return;
    }
    this.value = FieldVar.constant(Field(x));
  }
  static from(x) {
    if ((0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_isField).call(Field3, x))
      return x;
    return new Field3(x);
  }
  /**
   * Check whether this {@link Field} element is a hard-coded constant in the constraint system.
   * If a {@link Field} is constructed outside a zkApp method, it is a constant.
   *
   * @example
   * ```ts
   * console.log(Field(42).isConstant()); // true
   * ```
   *
   * @example
   * ```ts
   * \@method myMethod(x: Field) {
   *    console.log(x.isConstant()); // false
   * }
   * ```
   *
   * @return A `boolean` showing if this {@link Field} is a constant or not.
   */
  isConstant() {
    return this.value[0] === FieldType.Constant;
  }
  /**
   * Create a {@link Field} element equivalent to this {@link Field} element's value,
   * but is a constant.
   * See {@link Field.isConstant} for more information about what is a constant {@link Field}.
   *
   * @example
   * ```ts
   * const someField = Field(42);
   * someField.toConstant().assertEquals(someField); // Always true
   * ```
   *
   * @return A constant {@link Field} element equivalent to this {@link Field} element.
   */
  toConstant() {
    return (0, import_tslib2.__classPrivateFieldGet)(this, _Field_instances, "m", _Field_toConstant).call(this, "toConstant");
  }
  /**
   * Serialize the {@link Field} to a bigint, e.g. for printing. Trying to print a {@link Field} without this function will directly stringify the Field object, resulting in unreadable output.
   *
   * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the bigint representation of the {@link Field}. Use the operation only during debugging.
   *
   * @example
   * ```ts
   * const someField = Field(42);
   * console.log(someField.toBigInt());
   * ```
   *
   * @return A bigint equivalent to the bigint representation of the Field.
   */
  toBigInt() {
    let x = (0, import_tslib2.__classPrivateFieldGet)(this, _Field_instances, "m", _Field_toConstant).call(this, "toBigInt");
    return FieldConst.toBigint(x.value[1]);
  }
  /**
   * Serialize the {@link Field} to a string, e.g. for printing. Trying to print a {@link Field} without this function will directly stringify the Field object, resulting in unreadable output.
   *
   * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the {@link Field}. Use the operation only during debugging.
   *
   * @example
   * ```ts
   * const someField = Field(42);
   * console.log(someField.toString());
   * ```
   *
   * @return A string equivalent to the string representation of the Field.
   */
  toString() {
    return (0, import_tslib2.__classPrivateFieldGet)(this, _Field_instances, "m", _Field_toConstant).call(this, "toString").toBigInt().toString();
  }
  /**
   * Assert that this {@link Field} is equal another "field-like" value.
   * Calling this function is equivalent to `Field(...).equals(...).assertEquals(Bool(true))`.
   * See {@link Field.equals} for more details.
   *
   * **Important**: If an assertion fails, the code throws an error.
   *
   * @param value - the "field-like" value to compare & assert with this {@link Field}.
   * @param message? - a string error message to print if the assertion fails, optional.
   */
  assertEquals(y, message) {
    try {
      if (this.isConstant() && isConstant2(y)) {
        if (this.toBigInt() !== toFp(y)) {
          throw Error(`Field.assertEquals(): ${this} != ${y}`);
        }
        return;
      }
      Snarky.field.assertEqual(this.value, (0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_toVar).call(Field3, y));
    } catch (err) {
      throw withMessage2(err, message);
    }
  }
  /**
   * Add a "field-like" value to this {@link Field} element.
   *
   * @example
   * ```ts
   * const x = Field(3);
   * const sum = x.add(5);
   *
   * sum.assertEquals(Field(8));
   * ```
   *
   * **Warning**: This is a modular addition in the pasta field.
   * @example
   * ```ts
   * const x = Field(1);
   * const sum = x.add(Field(-7));
   *
   * // If you try to print sum - `console.log(sum.toBigInt())` - you will realize that it prints a very big integer because this is modular arithmetic, and 1 + (-7) circles around the field to become p - 6.
   * // You can use the reverse operation of addition (substraction) to prove the sum is calculated correctly.
   *
   * sum.sub(x).assertEquals(Field(-7));
   * sum.sub(Field(-7)).assertEquals(x);
   * ```
   *
   * @param value - a "field-like" value to add to the {@link Field}.
   *
   * @return A {@link Field} element equivalent to the modular addition of the two value.
   */
  add(y) {
    if (this.isConstant() && isConstant2(y)) {
      return new Field3(Field.add(this.toBigInt(), toFp(y)));
    }
    let z = Snarky.field.add(this.value, (0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_toVar).call(Field3, y));
    return new Field3(z);
  }
  /**
   * Negate a {@link Field}. This is equivalent to multiplying the {@link Field} by -1.
   *
   * @example
   * ```ts
   * const negOne = Field(1).neg();
   * negOne.assertEquals(-1);
   * ```
   *
   * @example
   * ```ts
   * const someField = Field(42);
   * someField.neg().assertEquals(someField.mul(Field(-1))); // This statement is always true regardless of the value of `someField`
   * ```
   *
   * **Warning**: This is a modular negation. For details, see the {@link sub} method.
   *
   * @return A {@link Field} element that is equivalent to the element multiplied by -1.
   */
  neg() {
    if (this.isConstant()) {
      return new Field3(Field.negate(this.toBigInt()));
    }
    let z = Snarky.field.scale(FieldConst[-1], this.value);
    return new Field3(z);
  }
  /**
   * Substract another "field-like" value from this {@link Field} element.
   *
   * @example
   * ```ts
   * const x = Field(3);
   * const difference = x.sub(5);
   *
   * difference.assertEquals(Field(-2));
   * ```
   *
   * **Warning**: This is a modular substraction in the pasta field.
   *
   * @example
   * ```ts
   * const x = Field(1);
   * const difference = x.sub(Field(2));
   *
   * // If you try to print difference - `console.log(difference.toBigInt())` - you will realize that it prints a very big integer because this is modular arithmetic, and 1 - 2 circles around the field to become p - 1.
   * // You can use the reverse operation of substraction (addition) to prove the difference is calculated correctly.
   * difference.add(Field(2)).assertEquals(x);
   * ```
   *
   * @param value - a "field-like" value to substract from the {@link Field}.
   *
   * @return A {@link Field} element equivalent to the modular difference of the two value.
   */
  sub(y) {
    return this.add(Field3.from(y).neg());
  }
  /**
   * Checks if this {@link Field} is even. Returns `true` for even elements and `false` for odd elements.
   *
   * @example
   * ```ts
   * let a = Field(5);
   * a.isEven(); // false
   * a.isEven().assertTrue(); // throws, as expected!
   *
   * let b = Field(4);
   * b.isEven(); // true
   * b.isEven().assertTrue(); // does not throw, as expected!
   * ```
   */
  isEven() {
    if (this.isConstant())
      return new Bool3(this.toBigInt() % 2n === 0n);
    let [, isOddVar, xDiv2Var] = Snarky.exists(2, () => {
      let bits2 = Field.toBits(this.toBigInt());
      let isOdd2 = bits2.shift() ? 1n : 0n;
      return [
        0,
        FieldConst.fromBigint(isOdd2),
        FieldConst.fromBigint(Field.fromBits(bits2))
      ];
    });
    let isOdd = new Field3(isOddVar);
    let xDiv2 = new Field3(xDiv2Var);
    xDiv2.toBits(253);
    xDiv2.mul(2).add(isOdd).assertEquals(this);
    return new Bool3(isOddVar).not();
  }
  /**
   * Multiply another "field-like" value with this {@link Field} element.
   *
   * @example
   * ```ts
   * const x = Field(3);
   * const product = x.mul(Field(5));
   *
   * product.assertEquals(Field(15));
   * ```
   *
   * @param value - a "field-like" value to multiply with the {@link Field}.
   *
   * @return A {@link Field} element equivalent to the modular difference of the two value.
   */
  mul(y) {
    if (this.isConstant() && isConstant2(y)) {
      return new Field3(Field.mul(this.toBigInt(), toFp(y)));
    }
    if (isConstant2(y)) {
      let z2 = Snarky.field.scale((0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_toConst).call(Field3, y), this.value);
      return new Field3(z2);
    }
    if (this.isConstant()) {
      let z2 = Snarky.field.scale(this.value[1], y.value);
      return new Field3(z2);
    }
    let z = Snarky.existsVar(() => FieldConst.fromBigint(Field.mul(this.toBigInt(), toFp(y))));
    Snarky.field.assertMul(this.value, y.value, z);
    return new Field3(z);
  }
  /**
   * [Modular inverse](https://en.wikipedia.org/wiki/Modular_multiplicative_inverse) of this {@link Field} element.
   * Equivalent to 1 divided by this {@link Field}, in the sense of modular arithmetic.
   *
   * Proves that this Field is non-zero, or throws a "Division by zero" error.
   *
   * @example
   * ```ts
   * const someField = Field(42);
   * const inverse = someField.inv();
   * inverse.assertEquals(Field(1).div(example)); // This statement is always true regardless of the value of `someField`
   * ```
   *
   * **Warning**: This is a modular inverse. See {@link div} method for more details.
   *
   * @return A {@link Field} element that is equivalent to one divided by this element.
   */
  inv() {
    if (this.isConstant()) {
      let z2 = Field.inverse(this.toBigInt());
      if (z2 === void 0)
        throw Error("Field.inv(): Division by zero");
      return new Field3(z2);
    }
    let z = Snarky.existsVar(() => {
      let z2 = Field.inverse(this.toBigInt()) ?? 0n;
      return FieldConst.fromBigint(z2);
    });
    Snarky.field.assertMul(this.value, z, FieldVar[1]);
    return new Field3(z);
  }
  /**
   * Divide another "field-like" value through this {@link Field}.
   *
   * Proves that the denominator is non-zero, or throws a "Division by zero" error.
   *
   * @example
   * ```ts
   * const x = Field(6);
   * const quotient = x.div(Field(3));
   *
   * quotient.assertEquals(Field(2));
   * ```
   *
   * **Warning**: This is a modular division in the pasta field. You can think this as the reverse operation of modular multiplication.
   *
   * @example
   * ```ts
   * const x = Field(2);
   * const y = Field(5);
   *
   * const quotient = x.div(y);
   *
   * // If you try to print quotient - `console.log(quotient.toBigInt())` - you will realize that it prints a very big integer because this is a modular inverse.
   * // You can use the reverse operation of division (multiplication) to prove the quotient is calculated correctly.
   *
   * quotient.mul(y).assertEquals(x);
   * ```
   *
   * @param value - a "field-like" value to divide with the {@link Field}.
   *
   * @return A {@link Field} element equivalent to the modular division of the two value.
   */
  div(y) {
    return this.mul(Field3.from(y).inv());
  }
  /**
   * Square this {@link Field} element.
   *
   * @example
   * ```ts
   * const someField = Field(7);
   * const square = someField.square();
   *
   * square.assertEquals(someField.mul(someField)); // This statement is always true regardless of the value of `someField`
   * ```
   *
   * ** Warning: This is a modular multiplication. See `mul()` method for more details.
   *
   * @return A {@link Field} element equivalent to the multiplication of the {@link Field} element with itself.
   */
  square() {
    if (this.isConstant()) {
      return new Field3(Field.square(this.toBigInt()));
    }
    let z = Snarky.existsVar(() => FieldConst.fromBigint(Field.square(this.toBigInt())));
    Snarky.field.assertSquare(this.value, z);
    return new Field3(z);
  }
  /**
   * Take the square root of this {@link Field} element.
   *
   * Proves that the Field element has a square root in the finite field, or throws if it doesn't.
   *
   * @example
   * ```ts
   * let z = x.sqrt();
   * z.mul(z).assertEquals(x); // true for every `x`
   * ```
   *
   * **Warning**: This is a modular square root, which is any number z that satisfies z*z = x (mod p).
   * Note that, if a square root z exists, there also exists a second one, -z (which is different if z != 0).
   * Therefore, this method leaves an adversarial prover the choice between two different values to return.
   *
   * @return A {@link Field} element equivalent to the square root of the {@link Field} element.
   */
  sqrt() {
    if (this.isConstant()) {
      let z2 = Field.sqrt(this.toBigInt());
      if (z2 === void 0)
        throw Error(`Field.sqrt(): input ${this} has no square root in the field.`);
      return new Field3(z2);
    }
    let z = Snarky.existsVar(() => {
      let z2 = Field.sqrt(this.toBigInt()) ?? 0n;
      return FieldConst.fromBigint(z2);
    });
    Snarky.field.assertSquare(z, this.value);
    return new Field3(z);
  }
  /**
   * @deprecated use `x.equals(0)` which is equivalent
   */
  isZero() {
    if (this.isConstant()) {
      return new Bool3(this.toBigInt() === 0n);
    }
    let [, b2, z] = Snarky.exists(2, () => {
      let x = this.toBigInt();
      let z2 = Field.inverse(x) ?? 0n;
      let b3 = Field.sub(1n, Field.mul(z2, x));
      return [0, FieldConst.fromBigint(b3), FieldConst.fromBigint(z2)];
    });
    Snarky.field.assertMul(b2, this.value, FieldVar[0]);
    Snarky.field.assertMul(z, this.value, Snarky.field.add(FieldVar[1], Snarky.field.scale(FieldConst[-1], b2)));
    return Bool3.Unsafe.ofField(new Field3(b2));
  }
  /**
   * Check if this {@link Field} is equal another "field-like" value.
   * Returns a {@link Bool}, which is a provable type and can be used to prove the validity of this statement.
   *
   * @example
   * ```ts
   * Field(5).equals(5).assertEquals(Bool(true));
   * ```
   *
   * @param value - the "field-like" value to compare with this {@link Field}.
   *
   * @return A {@link Bool} representing if this {@link Field} is equal another "field-like" value.
   */
  equals(y) {
    return this.sub(y).isZero();
  }
  /**
   * Check if this {@link Field} is less than another "field-like" value.
   * Returns a {@link Bool}, which is a provable type and can be used prove to the validity of this statement.
   *
   * @example
   * ```ts
   * Field(2).lessThan(3).assertEquals(Bool(true));
   * ```
   *
   * **Warning**: Comparison methods only support Field elements of size <= 253 bits in provable code.
   * The method will throw if one of the inputs exceeds 253 bits.
   *
   * **Warning**: As this method compares the bigint value of a {@link Field}, it can result in unexpected behavior when used with negative inputs or modular division.
   *
   * @example
   * ```ts
   * Field(1).div(Field(3)).lessThan(Field(1).div(Field(2))).assertEquals(Bool(true)); // This code will throw an error
   * ```
   *
   * @param value - the "field-like" value to compare with this {@link Field}.
   *
   * @return A {@link Bool} representing if this {@link Field} is less than another "field-like" value.
   */
  lessThan(y) {
    if (this.isConstant() && isConstant2(y)) {
      return new Bool3(this.toBigInt() < toFp(y));
    }
    return (0, import_tslib2.__classPrivateFieldGet)(this, _Field_instances, "m", _Field_compare).call(this, (0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_toVar).call(Field3, y)).less;
  }
  /**
   * Check if this {@link Field} is less than or equal to another "field-like" value.
   * Returns a {@link Bool}, which is a provable type and can be used to prove the validity of this statement.
   *
   * @example
   * ```ts
   * Field(3).lessThanOrEqual(3).assertEquals(Bool(true));
   * ```
   *
   * **Warning**: Comparison methods only support Field elements of size <= 253 bits in provable code.
   * The method will throw if one of the inputs exceeds 253 bits.
   *
   * **Warning**: As this method compares the bigint value of a {@link Field}, it can result in unexpected behaviour when used with negative inputs or modular division.
   *
   * @example
   * ```ts
   * Field(1).div(Field(3)).lessThanOrEqual(Field(1).div(Field(2))).assertEquals(Bool(true)); // This code will throw an error
   * ```
   *
   * @param value - the "field-like" value to compare with this {@link Field}.
   *
   * @return A {@link Bool} representing if this {@link Field} is less than or equal another "field-like" value.
   */
  lessThanOrEqual(y) {
    if (this.isConstant() && isConstant2(y)) {
      return new Bool3(this.toBigInt() <= toFp(y));
    }
    return (0, import_tslib2.__classPrivateFieldGet)(this, _Field_instances, "m", _Field_compare).call(this, (0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_toVar).call(Field3, y)).lessOrEqual;
  }
  /**
   * Check if this {@link Field} is greater than another "field-like" value.
   * Returns a {@link Bool}, which is a provable type and can be used to prove the validity of this statement.
   *
   * @example
   * ```ts
   * Field(5).greaterThan(3).assertEquals(Bool(true));
   * ```
   *
   * **Warning**: Comparison methods currently only support Field elements of size <= 253 bits in provable code.
   * The method will throw if one of the inputs exceeds 253 bits.
   *
   * **Warning**: As this method compares the bigint value of a {@link Field}, it can result in unexpected behaviour when used with negative inputs or modular division.
   *
   * @example
   * ```ts
   * Field(1).div(Field(2)).greaterThan(Field(1).div(Field(3))).assertEquals(Bool(true)); // This code will throw an error
   * ```
   *
   * @param value - the "field-like" value to compare with this {@link Field}.
   *
   * @return A {@link Bool} representing if this {@link Field} is greater than another "field-like" value.
   */
  greaterThan(y) {
    return this.lessThanOrEqual(y).not();
  }
  /**
   * Check if this {@link Field} is greater than or equal another "field-like" value.
   * Returns a {@link Bool}, which is a provable type and can be used to prove the validity of this statement.
   *
   * @example
   * ```ts
   * Field(3).greaterThanOrEqual(3).assertEquals(Bool(true));
   * ```
   *
   * **Warning**: Comparison methods only support Field elements of size <= 253 bits in provable code.
   * The method will throw if one of the inputs exceeds 253 bits.
   *
   * **Warning**: As this method compares the bigint value of a {@link Field}, it can result in unexpected behaviour when used with negative inputs or modular division.
   *
   * @example
   * ```ts
   * Field(1).div(Field(2)).greaterThanOrEqual(Field(1).div(Field(3))).assertEquals(Bool(true)); // This code will throw an error
   * ```
   *
   * @param value - the "field-like" value to compare with this {@link Field}.
   *
   * @return A {@link Bool} representing if this {@link Field} is greater than or equal another "field-like" value.
   */
  greaterThanOrEqual(y) {
    return this.lessThan(y).not();
  }
  /**
   * Assert that this {@link Field} is less than another "field-like" value.
   * Calling this function is equivalent to `Field(...).lessThan(...).assertEquals(Bool(true))`.
   * See {@link Field.lessThan} for more details.
   *
   * **Important**: If an assertion fails, the code throws an error.
   *
   * **Warning**: Comparison methods only support Field elements of size <= 253 bits in provable code.
   * The method will throw if one of the inputs exceeds 253 bits.
   *
   * @param value - the "field-like" value to compare & assert with this {@link Field}.
   * @param message? - a string error message to print if the assertion fails, optional.
   */
  assertLessThan(y, message) {
    try {
      if (this.isConstant() && isConstant2(y)) {
        if (!(this.toBigInt() < toFp(y))) {
          throw Error(`Field.assertLessThan(): expected ${this} < ${y}`);
        }
        return;
      }
      let { less } = (0, import_tslib2.__classPrivateFieldGet)(this, _Field_instances, "m", _Field_compare).call(this, (0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_toVar).call(Field3, y));
      less.assertTrue();
    } catch (err) {
      throw withMessage2(err, message);
    }
  }
  /**
   * Assert that this {@link Field} is less than or equal to another "field-like" value.
   * Calling this function is equivalent to `Field(...).lessThanOrEqual(...).assertEquals(Bool(true))`.
   * See {@link Field.lessThanOrEqual} for more details.
   *
   * **Important**: If an assertion fails, the code throws an error.
   *
   * **Warning**: Comparison methods only support Field elements of size <= 253 bits in provable code.
   * The method will throw if one of the inputs exceeds 253 bits.
   *
   * @param value - the "field-like" value to compare & assert with this {@link Field}.
   * @param message? - a string error message to print if the assertion fails, optional.
   */
  assertLessThanOrEqual(y, message) {
    try {
      if (this.isConstant() && isConstant2(y)) {
        if (!(this.toBigInt() <= toFp(y))) {
          throw Error(`Field.assertLessThan(): expected ${this} <= ${y}`);
        }
        return;
      }
      let { lessOrEqual } = (0, import_tslib2.__classPrivateFieldGet)(this, _Field_instances, "m", _Field_compare).call(this, (0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_toVar).call(Field3, y));
      lessOrEqual.assertTrue();
    } catch (err) {
      throw withMessage2(err, message);
    }
  }
  /**
   * Assert that this {@link Field} is greater than another "field-like" value.
   * Calling this function is equivalent to `Field(...).greaterThan(...).assertEquals(Bool(true))`.
   * See {@link Field.greaterThan} for more details.
   *
   * **Important**: If an assertion fails, the code throws an error.
   *
   * **Warning**: Comparison methods only support Field elements of size <= 253 bits in provable code.
   * The method will throw if one of the inputs exceeds 253 bits.
   *
   * @param value - the "field-like" value to compare & assert with this {@link Field}.
   * @param message? - a string error message to print if the assertion fails, optional.
   */
  assertGreaterThan(y, message) {
    Field3.from(y).assertLessThan(this, message);
  }
  /**
   * Assert that this {@link Field} is greater than or equal to another "field-like" value.
   * Calling this function is equivalent to `Field(...).greaterThanOrEqual(...).assertEquals(Bool(true))`.
   * See {@link Field.greaterThanOrEqual} for more details.
   *
   * **Important**: If an assertion fails, the code throws an error.
   *
   * **Warning**: Comparison methods only support Field elements of size <= 253 bits in provable code.
   * The method will throw if one of the inputs exceeds 253 bits.
   *
   * @param value - the "field-like" value to compare & assert with this {@link Field}.
   * @param message? - a string error message to print if the assertion fails, optional.
   */
  assertGreaterThanOrEqual(y, message) {
    Field3.from(y).assertLessThanOrEqual(this, message);
  }
  /**
   * Assert that this {@link Field} does not equal another field-like value.
   *
   * Note: This uses fewer constraints than `x.equals(y).assertFalse()`.
   *
   * @example
   * ```ts
   * x.assertNotEquals(0, "expect x to be non-zero");
   * ```
   */
  assertNotEquals(y, message) {
    try {
      if (this.isConstant() && isConstant2(y)) {
        if (this.toBigInt() === toFp(y)) {
          throw Error(`Field.assertNotEquals(): ${this} = ${y}`);
        }
        return;
      }
      this.sub(y).inv();
    } catch (err) {
      throw withMessage2(err, message);
    }
  }
  /**
   * Assert that this {@link Field} is equal to 1 or 0 as a "field-like" value.
   * Calling this function is equivalent to `Bool.or(Field(...).equals(1), Field(...).equals(0)).assertEquals(Bool(true))`.
   *
   * **Important**: If an assertion fails, the code throws an error.
   *
   * @param value - the "field-like" value to compare & assert with this {@link Field}.
   * @param message? - a string error message to print if the assertion fails, optional.
   */
  assertBool(message) {
    try {
      if (this.isConstant()) {
        let x = this.toBigInt();
        if (x !== 0n && x !== 1n) {
          throw Error(`Field.assertBool(): expected ${x} to be 0 or 1`);
        }
        return;
      }
      Snarky.field.assertBoolean(this.value);
    } catch (err) {
      throw withMessage2(err, message);
    }
  }
  /**
   * Returns an array of {@link Bool} elements representing [little endian binary representation](https://en.wikipedia.org/wiki/Endianness) of this {@link Field} element.
   *
   * If you use the optional `length` argument, proves that the field element fits in `length` bits.
   * The `length` has to be between 0 and 255 and the method throws if it isn't.
   *
   * **Warning**: The cost of this operation in a zk proof depends on the `length` you specify,
   * which by default is 255 bits. Prefer to pass a smaller `length` if possible.
   *
   * @param length - the number of bits to fit the element. If the element does not fit in `length` bits, the functions throws an error.
   *
   * @return An array of {@link Bool} element representing little endian binary representation of this {@link Field}.
   */
  toBits(length) {
    if (length !== void 0)
      (0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_checkBitLength).call(Field3, "Field.toBits()", length);
    if (this.isConstant()) {
      let bits3 = Field.toBits(this.toBigInt());
      if (length !== void 0) {
        if (bits3.slice(length).some((bit) => bit))
          throw Error(`Field.toBits(): ${this} does not fit in ${length} bits`);
        return bits3.slice(0, length).map((b2) => new Bool3(b2));
      }
      return bits3.map((b2) => new Bool3(b2));
    }
    let [, ...bits2] = Snarky.field.toBits(length ?? Field.sizeInBits, this.value);
    return bits2.map((b2) => Bool3.Unsafe.ofField(new Field3(b2)));
  }
  /**
   * Convert a bit array into a {@link Field} element using [little endian binary representation](https://en.wikipedia.org/wiki/Endianness)
   *
   * The method throws if the given bits do not fit in a single Field element. A Field element can be at most 255 bits.
   *
   * **Important**: If the given `bytes` array is an array of `booleans` or {@link Bool} elements that all are `constant`, the resulting {@link Field} element will be a constant as well. Or else, if the given array is a mixture of constants and variables of {@link Bool} type, the resulting {@link Field} will be a variable as well.
   *
   * @param bytes - An array of {@link Bool} or `boolean` type.
   *
   * @return A {@link Field} element matching the [little endian binary representation](https://en.wikipedia.org/wiki/Endianness) of the given `bytes` array.
   */
  static fromBits(bits2) {
    let length = bits2.length;
    (0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_checkBitLength).call(Field3, "Field.fromBits()", length);
    if (bits2.every((b2) => typeof b2 === "boolean" || b2.toField().isConstant())) {
      let bits_ = bits2.map((b2) => typeof b2 === "boolean" ? b2 : b2.toBoolean()).concat(Array(Field.sizeInBits - length).fill(false));
      return new Field3(Field.fromBits(bits_));
    }
    let bitsVars = bits2.map((b2) => {
      if (typeof b2 === "boolean")
        return b2 ? FieldVar[1] : FieldVar[0];
      return b2.toField().value;
    });
    let x = Snarky.field.fromBits([0, ...bitsVars]);
    return new Field3(x);
  }
  /**
   * Create a new {@link Field} element from the first `length` bits of this {@link Field} element.
   *
   * The `length` has to be a multiple of 16, and has to be between 0 and 255, otherwise the method throws.
   *
   * As {@link Field} elements are represented using [little endian binary representation](https://en.wikipedia.org/wiki/Endianness),
   * the resulting {@link Field} element will equal the original one if it fits in `length` bits.
   *
   * @param length - The number of bits to take from this {@link Field} element.
   *
   * @return A {@link Field} element that is equal to the `length` of this {@link Field} element.
   */
  rangeCheckHelper(length) {
    (0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_checkBitLength).call(Field3, "Field.rangeCheckHelper()", length);
    if (length % 16 !== 0)
      throw Error("Field.rangeCheckHelper(): `length` has to be a multiple of 16.");
    let lengthDiv16 = length / 16;
    if (this.isConstant()) {
      let bits2 = Field.toBits(this.toBigInt()).slice(0, length).concat(Array(Field.sizeInBits - length).fill(false));
      return new Field3(Field.fromBits(bits2));
    }
    let x = Snarky.field.truncateToBits16(lengthDiv16, this.value);
    return new Field3(x);
  }
  /**
   * **Warning**: This function is mainly for internal use. Normally it is not intended to be used by a zkApp developer.
   *
   * In SnarkyJS, addition and scaling (multiplication of variables by a constant) of variables is represented as an AST - [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree). For example, the expression `x.add(y).mul(2)` is represented as `Scale(2, Add(x, y))`.
   *
   *  A new internal variable is created only when the variable is needed in a multiplicative or any higher level constraint (for example multiplication of two {@link Field} elements) to represent the operation.
   *
   * The `seal()` function tells SnarkyJS to stop building an AST and create a new variable right away.
   *
   * @return A {@link Field} element that is equal to the result of AST that was previously on this {@link Field} element.
   */
  seal() {
    let x = Snarky.field.seal(this.value);
    return new Field3(x);
  }
  /**
   * A random {@link Field} element.
   *
   * @example
   * ```ts
   * console.log(Field.random().toBigInt()); // Run this code twice!
   * ```
   *
   * @return A random {@link Field} element.
   */
  static random() {
    return new Field3(Field.random());
  }
  // internal stuff
  // Provable<Field>
  /**
   * This function is the implementation of {@link Provable.toFields} for the {@link Field} type.
   *
   * Static function to serializes a {@link Field} into an array of {@link Field} elements.
   * This will be always an array of length 1, where the first and only element equals the given parameter itself.
   *
   * @param value - the {@link Field} element to cast the array from.
   *
   * @return A {@link Field} array of length 1 created from this {@link Field}.
   */
  static toFields(x) {
    return [x];
  }
  /**
   * This function is the implementation of {@link Provable.toAuxiliary} for the {@link Field} type.
   *
   * As the primitive {@link Field} type has no auxiliary data associated with it, this function will always return an empty array.
   *
   * @param value - The {@link Field} element to get the auxiliary data of, optional. If not provided, the function returns an empty array.
   */
  static toAuxiliary() {
    return [];
  }
  /**
   * This function is the implementation of {@link Provable.sizeInFields} for the {@link Field} type.
   *
   * Size of the {@link Field} type is 1, as it is the primitive type.
   * This function returns a regular number, so you cannot use it to prove something on chain. You can use it during debugging or to understand the memory complexity of some type.
   *
   * @example
   * ```ts
   * console.log(Field.sizeInFields()); // Prints 1
   * ```
   *
   * @return A number representing the size of the {@link Field} type in terms of {@link Field} type itself.
   */
  static sizeInFields() {
    return 1;
  }
  /**
   * Implementation of {@link Provable.fromFields} for the {@link Field} type.
   *
   * **Warning**: This function is designed for internal use. It is not intended to be used by a zkApp developer.
   *
   * Creates a {@link Field} from an array of Fields of length 1.
   *
   * @param fields - an array of length 1 serialized from {@link Field} elements.
   *
   * @return The first {@link Field} element of the given array.
   */
  static fromFields([x]) {
    return x;
  }
  /**
   * This function is the implementation of {@link Provable.check} in {@link Field} type.
   *
   * As any field element can be a {@link Field}, this function does not create any assertions, so it does nothing.
   *
   * @param value - the {@link Field} element to check.
   */
  static check() {
  }
  /**
   * This function is the implementation of {@link Provable.toFields} for the {@link Field} type.
   *
   * The result will be always an array of length 1, where the first and only element equals the {@link Field} itself.
   *
   * @return A {@link Field} array of length 1 created from this {@link Field}.
   */
  toFields() {
    return Field3.toFields(this);
  }
  /**
   * This function is the implementation of {@link Provable.toAuxiliary} for the {@link Field} type.
   *
   * As the primitive {@link Field} type has no auxiliary data associated with it, this function will always return an empty array.
   */
  toAuxiliary() {
    return Field3.toAuxiliary();
  }
  // ProvableExtended<Field>
  /**
   * Serialize the {@link Field} to a JSON string, e.g. for printing. Trying to print a {@link Field} without this function will directly stringify the Field object, resulting in unreadable output.
   *
   * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the JSON string representation of the {@link Field}. Use the operation only during debugging.
   *
   * @example
   * ```ts
   * const someField = Field(42);
   * console.log(someField.toJSON());
   * ```
   *
   * @return A string equivalent to the JSON representation of the {@link Field}.
   */
  toJSON() {
    return (0, import_tslib2.__classPrivateFieldGet)(this, _Field_instances, "m", _Field_toConstant).call(this, "toJSON").toString();
  }
  /**
   * Serialize the given {@link Field} element to a JSON string, e.g. for printing. Trying to print a {@link Field} without this function will directly stringify the Field object, resulting in unreadable output.
   *
   * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the JSON string representation of the {@link Field}. Use the operation only during debugging.
   *
   * @example
   * ```ts
   * const someField = Field(42);
   * console.log(Field.toJSON(someField));
   * ```
   *
   * @param value - The JSON string to coerce the {@link Field} from.
   *
   * @return A string equivalent to the JSON representation of the given {@link Field}.
   */
  static toJSON(x) {
    return x.toJSON();
  }
  /**
   * Deserialize a JSON string containing a "field-like" value into a {@link Field} element.
   *
   * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the {@link Field}.
   *
   * @param value - the "field-like" value to coerce the {@link Field} from.
   *
   * @return A {@link Field} coerced from the given JSON string.
   */
  static fromJSON(json) {
    return new Field3(Field.fromJSON(json));
  }
  /**
   * **Warning**: This function is mainly for internal use. Normally it is not intended to be used by a zkApp developer.
   *
   * This function is the implementation of `ProvableExtended.toInput()` for the {@link Field} type.
   *
   * @param value - The {@link Field} element to get the `input` array.
   *
   * @return An object where the `fields` key is a {@link Field} array of length 1 created from this {@link Field}.
   *
   */
  static toInput(x) {
    return { fields: [x] };
  }
  // Binable<Field>
  /**
   * Create an array of digits equal to the [little-endian](https://en.wikipedia.org/wiki/Endianness) byte order of the given {@link Field} element.
   * Note that the array has always 32 elements as the {@link Field} is a `finite-field` in the order of {@link Field.ORDER}.
   *
   * @param value - The {@link Field} element to generate the array of bytes of.
   *
   * @return An array of digits equal to the [little-endian](https://en.wikipedia.org/wiki/Endianness) byte order of the given {@link Field} element.
   *
   */
  static toBytes(x) {
    return FieldBinable.toBytes(x);
  }
  /**
   * Part of the `Binable` interface.
   *
   * **Warning**: This function is for internal use. It is not intended to be used by a zkApp developer.
   */
  static readBytes(bytes, offset) {
    return FieldBinable.readBytes(bytes, offset);
  }
  /**
   * Coerce a new {@link Field} element using the [little-endian](https://en.wikipedia.org/wiki/Endianness) representation of the given `bytes` array.
   * Note that the given `bytes` array may have at most 32 elements as the {@link Field} is a `finite-field` in the order of {@link Field.ORDER}.
   *
   * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the byte representation of the {@link Field}.
   *
   * @param bytes - The bytes array to coerce the {@link Field} from.
   *
   * @return A new {@link Field} element created using the [little-endian](https://en.wikipedia.org/wiki/Endianness) representation of the given `bytes` array.
   */
  static fromBytes(bytes) {
    return FieldBinable.fromBytes(bytes);
  }
  /**
   * **Warning**: This function is mainly for internal use. Normally it is not intended to be used by a zkApp developer.
   *
   * As all {@link Field} elements have 31 bits, this function returns 31.
   *
   * @return The size of a {@link Field} element - 31.
   */
  static sizeInBytes() {
    return Field.sizeInBytes();
  }
};
_a2 = Field3, _Field_instances = /* @__PURE__ */ new WeakSet(), _Field_isField = function _Field_isField2(x) {
  return x instanceof Field3;
}, _Field_toConst = function _Field_toConst2(x) {
  if ((0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_isField).call(Field3, x))
    return x.value[1];
  return FieldConst.fromBigint(Field(x));
}, _Field_toVar = function _Field_toVar2(x) {
  if ((0, import_tslib2.__classPrivateFieldGet)(Field3, _a2, "m", _Field_isField).call(Field3, x))
    return x.value;
  return FieldVar.constant(Field(x));
}, _Field_toConstant = function _Field_toConstant2(name) {
  return toConstantField(this, name, "x", "field element");
}, _Field_compare = function _Field_compare2(y) {
  let maxLength = Field.sizeInBits - 2;
  asProver(() => {
    let actualLength = Math.max(this.toBigInt().toString(2).length, new Field3(y).toBigInt().toString(2).length);
    if (actualLength > maxLength)
      throw Error(`Provable comparison functions can only be used on Fields of size <= ${maxLength} bits, got ${actualLength} bits.`);
  });
  let [, less, lessOrEqual] = Snarky.field.compare(maxLength, this.value, y);
  return {
    less: Bool3.Unsafe.ofField(new Field3(less)),
    lessOrEqual: Bool3.Unsafe.ofField(new Field3(lessOrEqual))
  };
}, _Field_checkBitLength = function _Field_checkBitLength2(name, length) {
  if (length > Field.sizeInBits)
    throw Error(`${name}: bit length must be ${Field.sizeInBits} or less, got ${length}`);
  if (length <= 0)
    throw Error(`${name}: bit length must be positive, got ${length}`);
};
Field3.ORDER = Field.modulus;
var FieldBinable = defineBinable({
  toBytes(t) {
    return [...toConstantField(t, "toBytes").value[1]];
  },
  readBytes(bytes, offset) {
    let uint8array = new Uint8Array(32);
    uint8array.set(bytes.slice(offset, offset + 32));
    return [new Field3(uint8array), offset + 32];
  }
});
function isField(x) {
  return x instanceof Field3;
}
function isConstant2(x) {
  let type = typeof x;
  if (type === "bigint" || type === "number" || type === "string") {
    return true;
  }
  return x.isConstant();
}
function toFp(x) {
  let type = typeof x;
  if (type === "bigint" || type === "number" || type === "string") {
    return Field(x);
  }
  return x.toBigInt();
}
function withMessage2(error, message) {
  if (message === void 0 || !(error instanceof Error))
    return error;
  error.message = `${message}
${error.message}`;
  return error;
}
function toConstantField(x, methodName, varName = "x", varDescription = "field element") {
  if (x.isConstant())
    return x;
  assert(inCheckedComputation(), "variables only exist inside checked computations");
  if (Snarky.run.inProverBlock()) {
    let value = Snarky.field.readVar(x.value);
    return new Field3(value);
  }
  throw Error(readVarMessage(methodName, varName, varDescription));
}
function readVarMessage(methodName, varName, varDescription) {
  return `${varName}.${methodName}() was called on a variable ${varDescription} \`${varName}\` in provable code.
This is not supported, because variables represent an abstract computation, 
which only carries actual values during proving, but not during compiling.

Also, reading out JS values means that whatever you're doing with those values will no longer be
linked to the original variable in the proof, which makes this pattern prone to security holes.

You can check whether your ${varDescription} is a variable or a constant by using ${varName}.isConstant().

To inspect values for debugging, use Provable.log(${varName}). For more advanced use cases,
there is \`Provable.asProver(() => { ... })\` which allows you to use ${varName}.${methodName}() inside the callback.
Warning: whatever happens inside asProver() will not be part of the zk proof.
`;
}

// dist/node/lib/group.js
var import_tslib4 = require("tslib");

// dist/node/lib/scalar.js
var import_tslib3 = require("tslib");

// dist/node/bindings/crypto/elliptic_curve.js
var pallasGeneratorProjective = {
  x: 1n,
  y: 12418654782883325593414442427049395787963493412651469444558597405572177144507n,
  z: 1n
};
var vestaGeneratorProjective = {
  x: 1n,
  y: 11426906929455361843568202299992114520848200991084027513389447476559454104162n,
  z: 1n
};
var vestaEndoBase = 2942865608506852014473558576493638302197734138389222805617480874486368177743n;
var pallasEndoBase = 20444556541222657078399132219657928148671392403212669005631716460534733845831n;
var vestaEndoScalar = 8503465768106391777493614032514048814691664078728891710322960303815233784505n;
var pallasEndoScalar = 26005156700822196841419187675678338661165322343552424574062261873906994770353n;
var b = 5n;
var a = 0n;
var projectiveZero = { x: 1n, y: 1n, z: 0n };
var GroupMap = {
  create: (F, params) => {
    const { a: a2, b: b2 } = params.spec;
    function tryDecode(x) {
      const pow3 = F.power(x, 3n);
      const y = F.add(pow3, b2);
      if (!F.isSquare(y))
        return void 0;
      return { x, y: F.sqrt(y) };
    }
    function sToVTruncated(s) {
      const { u, v, y } = s;
      return [v, F.negate(F.add(u, v)), F.add(u, F.square(y))];
    }
    function conic_to_s(c) {
      const d = F.div(c.z, c.y);
      if (d === void 0)
        throw Error(`Division undefined! ${c.z}/${c.y}`);
      const v = F.sub(d, params.u_over_2);
      return { u: params.u, v, y: c.y };
    }
    function field_to_conic(t) {
      const { z: z0, y: y0 } = params.projection_point;
      const ct = F.mul(params.conic_c, t);
      const d1 = F.add(F.mul(ct, y0), z0);
      const d2 = F.add(F.mul(ct, t), 1n);
      const d = F.div(d1, d2);
      if (d === void 0)
        throw Error(`Division undefined! ${d1}/${d2}`);
      const s = F.mul(2n, d);
      return {
        z: F.sub(z0, s),
        y: F.sub(y0, F.mul(s, t))
      };
    }
    return {
      potentialXs: (t) => sToVTruncated(conic_to_s(field_to_conic(t))),
      tryDecode
    };
  }
};
var GroupMapParamsFp = {
  u: 2n,
  u_over_2: 1n,
  conic_c: 3n,
  projection_point: {
    z: 12196889842669319921865617096620076994180062626450149327690483414064673774441n,
    y: 1n
  },
  spec: {
    a: 0n,
    b: 5n
  }
};
var GroupMapPallas = GroupMap.create(Fp, GroupMapParamsFp);
function projectiveNeg({ x, y, z }, p3) {
  return { x, y: y === 0n ? 0n : p3 - y, z };
}
function projectiveAdd(g, h, p3) {
  if (g.z === 0n)
    return h;
  if (h.z === 0n)
    return g;
  let X1 = g.x, Y1 = g.y, Z1 = g.z, X2 = h.x, Y2 = h.y, Z2 = h.z;
  let Z1Z1 = mod(Z1 * Z1, p3);
  let Z2Z2 = mod(Z2 * Z2, p3);
  let U1 = mod(X1 * Z2Z2, p3);
  let U2 = mod(X2 * Z1Z1, p3);
  let S1 = mod(Y1 * Z2 * Z2Z2, p3);
  let S2 = mod(Y2 * Z1 * Z1Z1, p3);
  let H = mod(U2 - U1, p3);
  if (H === 0n) {
    if (S1 === S2)
      return projectiveDouble(g, p3);
    if (mod(S1 + S2, p3) === 0n)
      return projectiveZero;
    throw Error("projectiveAdd: invalid point");
  }
  let I = mod(H * H << 2n, p3);
  let J = mod(H * I, p3);
  let r = 2n * (S2 - S1);
  let V = mod(U1 * I, p3);
  let X3 = mod(r * r - J - 2n * V, p3);
  let Y3 = mod(r * (V - X3) - 2n * S1 * J, p3);
  let Z3 = mod(((Z1 + Z2) * (Z1 + Z2) - Z1Z1 - Z2Z2) * H, p3);
  return { x: X3, y: Y3, z: Z3 };
}
function projectiveDouble(g, p3) {
  if (g.z === 0n)
    return g;
  let X1 = g.x, Y1 = g.y, Z1 = g.z;
  let A = mod(X1 * X1, p3);
  let B = mod(Y1 * Y1, p3);
  let C = mod(B * B, p3);
  let D = mod(2n * ((X1 + B) * (X1 + B) - A - C), p3);
  let E = 3n * A;
  let F = mod(E * E, p3);
  let X3 = mod(F - 2n * D, p3);
  let Y3 = mod(E * (D - X3) - 8n * C, p3);
  let Z3 = mod(2n * Y1 * Z1, p3);
  return { x: X3, y: Y3, z: Z3 };
}
function projectiveSub(g, h, p3) {
  return projectiveAdd(g, projectiveNeg(h, p3), p3);
}
function projectiveScale(g, x, p3) {
  let h = projectiveZero;
  while (x > 0n) {
    if (x & 1n)
      h = projectiveAdd(h, g, p3);
    g = projectiveDouble(g, p3);
    x >>= 1n;
  }
  return h;
}
function projectiveToAffine(g, p3) {
  let z = g.z;
  if (z === 0n) {
    return { x: 1n, y: 1n, infinity: true };
  } else if (z === 1n) {
    return { x: g.x, y: g.y, infinity: false };
  } else {
    let zinv = inverse(z, p3);
    let zinv_squared = mod(zinv * zinv, p3);
    let x = mod(g.x * zinv_squared, p3);
    let y = mod(g.y * zinv * zinv_squared, p3);
    return { x, y, infinity: false };
  }
}
function projectiveEqual(g, h, p3) {
  if ((g.z === 0n || h.z === 0n) && !(g.z === 0n && h.z === 0n))
    return false;
  let gz2 = mod(g.z * g.z, p3);
  let hz2 = mod(h.z * h.z, p3);
  if (mod(g.x * hz2, p3) !== mod(h.x * gz2, p3))
    return false;
  let gz3 = mod(gz2 * g.z, p3);
  let hz3 = mod(hz2 * h.z, p3);
  return mod(g.y * hz3, p3) === mod(h.y * gz3, p3);
}
function projectiveOnCurve({ x, y, z }, p3, b2) {
  let x3 = mod(mod(x * x, p3) * x, p3);
  let y2 = mod(y * y, p3);
  let z3 = mod(mod(z * z, p3) * z, p3);
  let z6 = mod(z3 * z3, p3);
  return mod(y2 - x3 - b2 * z6, p3) === 0n;
}
function createCurveProjective(p3, generator, endoBase, endoScalar, b2, a2) {
  return {
    zero: projectiveZero,
    one: generator,
    endoBase,
    endoScalar,
    b: b2,
    a: a2,
    equal(g, h) {
      return projectiveEqual(g, h, p3);
    },
    isOnCurve(g) {
      return projectiveOnCurve(g, p3, b2);
    },
    add(g, h) {
      return projectiveAdd(g, h, p3);
    },
    double(g) {
      return projectiveDouble(g, p3);
    },
    negate(g) {
      return projectiveNeg(g, p3);
    },
    sub(g, h) {
      return projectiveSub(g, h, p3);
    },
    scale(g, s) {
      return projectiveScale(g, s, p3);
    },
    endomorphism({ x, y, z }) {
      return { x: mod(endoBase * x, p3), y, z };
    },
    toAffine(g) {
      return projectiveToAffine(g, p3);
    },
    fromAffine({ x, y, infinity }) {
      if (infinity)
        return projectiveZero;
      return { x, y, z: 1n };
    }
  };
}
var Pallas = createCurveProjective(p, pallasGeneratorProjective, pallasEndoBase, pallasEndoScalar, b, a);
var Vesta = createCurveProjective(q, vestaGeneratorProjective, vestaEndoBase, vestaEndoScalar, b, a);

// dist/node/bindings/crypto/constants.js
var prefixes = {
  "event": "MinaZkappEvent******",
  "events": "MinaZkappEvents*****",
  "sequenceEvents": "MinaZkappSeqEvents**",
  "body": "MinaZkappBody*******",
  "accountUpdateCons": "MinaAcctUpdateCons**",
  "accountUpdateNode": "MinaAcctUpdateNode**",
  "zkappMemo": "MinaZkappMemo*******",
  "signatureMainnet": "MinaSignatureMainnet",
  "signatureTestnet": "CodaSignature*******",
  "zkappUri": "MinaZkappUri********",
  "deriveTokenId": "MinaDeriveTokenId***"
};
var versionBytes = {
  "tokenIdKey": 28,
  "receiptChainHash": 12,
  "ledgerHash": 5,
  "epochSeed": 13,
  "stateHash": 16,
  "publicKey": 203,
  "userCommandMemo": 20,
  "privateKey": 90,
  "signature": 154,
  "transactionHash": 29,
  "signedCommandV1": 19
};
var poseidonParamsKimchiFp = {
  "mds": [
    [
      "12035446894107573964500871153637039653510326950134440362813193268448863222019",
      "25461374787957152039031444204194007219326765802730624564074257060397341542093",
      "27667907157110496066452777015908813333407980290333709698851344970789663080149"
    ],
    [
      "4491931056866994439025447213644536587424785196363427220456343191847333476930",
      "14743631939509747387607291926699970421064627808101543132147270746750887019919",
      "9448400033389617131295304336481030167723486090288313334230651810071857784477"
    ],
    [
      "10525578725509990281643336361904863911009900817790387635342941550657754064843",
      "27437632000253211280915908546961303399777448677029255413769125486614773776695",
      "27566319851776897085443681456689352477426926500749993803132851225169606086988"
    ]
  ],
  "roundConstants": [
    [
      "21155079691556475130150866428468322463125560312786319980770950159250751855431",
      "16883442198399350202652499677723930673110172289234921799701652810789093522349",
      "17030687036425314703519085065002231920937594822150793091243263847382891822670"
    ],
    [
      "25216718237129482752721276445368692059997901880654047883630276346421457427360",
      "9054264347380455706540423067244764093107767235485930776517975315876127782582",
      "26439087121446593160953570192891907825526260324480347638727375735543609856888"
    ],
    [
      "15251000790817261169639394496851831733819930596125214313084182526610855787494",
      "10861916012597714684433535077722887124099023163589869801449218212493070551767",
      "18597653523270601187312528478986388028263730767495975370566527202946430104139"
    ],
    [
      "15831416454198644276563319006805490049460322229057756462580029181847589006611",
      "15171856919255965617705854914448645702014039524159471542852132430360867202292",
      "15488495958879593647482715143904752785889816789652405888927117106448507625751"
    ],
    [
      "19039802679983063488134304670998725949842655199289961967801223969839823940152",
      "4720101937153217036737330058775388037616286510783561045464678919473230044408",
      "10226318327254973427513859412126640040910264416718766418164893837597674300190"
    ],
    [
      "20878756131129218406920515859235137275859844638301967889441262030146031838819",
      "7178475685651744631172532830973371642652029385893667810726019303466125436953",
      "1996970955918516145107673266490486752153434673064635795711751450164177339618"
    ],
    [
      "15205545916434157464929420145756897321482314798910153575340430817222504672630",
      "25660296961552699573824264215804279051322332899472350724416657386062327210698",
      "13842611741937412200312851417353455040950878279339067816479233688850376089318"
    ],
    [
      "1383799642177300432144836486981606294838630135265094078921115713566691160459",
      "1135532281155277588005319334542025976079676424839948500020664227027300010929",
      "4384117336930380014868572224801371377488688194169758696438185377724744869360"
    ],
    [
      "21725577575710270071808882335900370909424604447083353471892004026180492193649",
      "676128913284806802699862508051022306366147359505124346651466289788974059668",
      "25186611339598418732666781049829183886812651492845008333418424746493100589207"
    ],
    [
      "10402240124664763733060094237696964473609580414190944671778761753887884341073",
      "11918307118590866200687906627767559273324023585642003803337447146531313172441",
      "16895677254395661024186292503536662354181715337630376909778003268311296637301"
    ],
    [
      "23818602699032741669874498456696325705498383130221297580399035778119213224810",
      "4285193711150023248690088154344086684336247475445482883105661485741762600154",
      "19133204443389422404056150665863951250222934590192266371578950735825153238612"
    ],
    [
      "5515589673266504033533906836494002702866463791762187140099560583198974233395",
      "11830435563729472715615302060564876527985621376031612798386367965451821182352",
      "7510711479224915247011074129666445216001563200717943545636462819681638560128"
    ],
    [
      "24694843201907722940091503626731830056550128225297370217610328578733387733444",
      "27361655066973784653563425664091383058914302579694897188019422193564924110528",
      "21606788186194534241166833954371013788633495786419718955480491478044413102713"
    ],
    [
      "19934060063390905409309407607814787335159021816537006003398035237707924006757",
      "8495813630060004961768092461554180468161254914257386012937942498774724649553",
      "27524960680529762202005330464726908693944660961000958842417927307941561848461"
    ],
    [
      "15178481650950399259757805400615635703086255035073919114667254549690862896985",
      "16164780354695672259791105197274509251141405713012804937107314962551600380870",
      "10529167793600778056702353412758954281652843049850979705476598375597148191979"
    ],
    [
      "721141070179074082553302896292167103755384741083338957818644728290501449040",
      "22044408985956234023934090378372374883099115753118261312473550998188148912041",
      "27068254103241989852888872162525066148367014691482601147536314217249046186315"
    ],
    [
      "3880429241956357176819112098792744584376727450211873998699580893624868748961",
      "17387097125522937623262508065966749501583017524609697127088211568136333655623",
      "6256814421247770895467770393029354017922744712896100913895513234184920631289"
    ],
    [
      "2942627347777337187690939671601251987500285937340386328746818861972711408579",
      "24031654937764287280548628128490074801809101323243546313826173430897408945397",
      "14401457902976567713827506689641442844921449636054278900045849050301331732143"
    ],
    [
      "20170632877385406450742199836933900257692624353889848352407590794211839130727",
      "24056496193857444725324410428861722338174099794084586764867109123681727290181",
      "11257913009612703357266904349759250619633397075667824800196659858304604714965"
    ],
    [
      "22228158921984425749199071461510152694025757871561406897041788037116931009246",
      "9152163378317846541430311327336774331416267016980485920222768197583559318682",
      "13906695403538884432896105059360907560653506400343268230130536740148070289175"
    ],
    [
      "7220714562509721437034241786731185291972496952091254931195414855962344025067",
      "27608867305903811397208862801981345878179337369367554478205559689592889691927",
      "13288465747219756218882697408422850918209170830515545272152965967042670763153"
    ],
    [
      "8251343892709140154567051772980662609566359215743613773155065627504813327653",
      "22035238365102171608166944627493632660244312563934708756134297161332908879090",
      "13560937766273321037807329177749403409731524715067067740487246745322577571823"
    ],
    [
      "21652518608959234550262559135285358020552897349934571164032339186996805408040",
      "22479086963324173427634460342145551255011746993910136574926173581069603086891",
      "13676501958531751140966255121288182631772843001727158043704693838707387130095"
    ],
    [
      "5680310394102577950568930199056707827608275306479994663197187031893244826674",
      "25125360450906166639190392763071557410047335755341060350879819485506243289998",
      "22659254028501616785029594492374243581602744364859762239504348429834224676676"
    ],
    [
      "23101411405087512171421838856759448177512679869882987631073569441496722536782",
      "24149774013240355952057123660656464942409328637280437515964899830988178868108",
      "5782097512368226173095183217893826020351125522160843964147125728530147423065"
    ],
    [
      "13540762114500083869920564649399977644344247485313990448129838910231204868111",
      "20421637734328811337527547703833013277831804985438407401987624070721139913982",
      "7742664118615900772129122541139124149525273579639574972380600206383923500701"
    ],
    [
      "1109643801053963021778418773196543643970146666329661268825691230294798976318",
      "16580663920817053843121063692728699890952505074386761779275436996241901223840",
      "14638514680222429058240285918830106208025229459346033470787111294847121792366"
    ],
    [
      "17080385857812672649489217965285727739557573467014392822992021264701563205891",
      "26176268111736737558502775993925696791974738793095023824029827577569530708665",
      "4382756253392449071896813428140986330161215829425086284611219278674857536001"
    ],
    [
      "13934033814940585315406666445960471293638427404971553891617533231178815348902",
      "27054912732979753314774418228399230433963143177662848084045249524271046173121",
      "28916070403698593376490976676534962592542013020010643734621202484860041243391"
    ],
    [
      "24820015636966360150164458094894587765384135259446295278101998130934963922381",
      "7969535238488580655870884015145760954416088335296905520306227531221721881868",
      "7690547696740080985104189563436871930607055124031711216224219523236060212249"
    ],
    [
      "9712576468091272384496248353414290908377825697488757134833205246106605867289",
      "12148698031438398980683630141370402088785182722473169207262735228500190477924",
      "14359657643133476969781351728574842164124292705609900285041476162075031948227"
    ],
    [
      "23563839965372067275137992801035780013422228997724286060975035719045352435470",
      "4184634822776323233231956802962638484057536837393405750680645555481330909086",
      "16249511905185772125762038789038193114431085603985079639889795722501216492487"
    ],
    [
      "11001863048692031559800673473526311616702863826063550559568315794438941516621",
      "4702354107983530219070178410740869035350641284373933887080161024348425080464",
      "23751680507533064238793742311430343910720206725883441625894258483004979501613"
    ],
    [
      "28670526516158451470169873496541739545860177757793329093045522432279094518766",
      "3568312993091537758218792253361873752799472566055209125947589819564395417072",
      "1819755756343439646550062754332039103654718693246396323207323333948654200950"
    ],
    [
      "5372129954699791301953948907349887257752247843844511069896766784624930478273",
      "17512156688034945920605615850550150476471921176481039715733979181538491476080",
      "25777105342317622165159064911913148785971147228777677435200128966844208883059"
    ],
    [
      "25350392006158741749134238306326265756085455157012701586003300872637887157982",
      "20096724945283767296886159120145376967480397366990493578897615204296873954844",
      "8063283381910110762785892100479219642751540456251198202214433355775540036851"
    ],
    [
      "4393613870462297385565277757207010824900723217720226130342463666351557475823",
      "9874972555132910032057499689351411450892722671352476280351715757363137891038",
      "23590926474329902351439438151596866311245682682435235170001347511997242904868"
    ],
    [
      "17723373371137275859467518615551278584842947963894791032296774955869958211070",
      "2350345015303336966039836492267992193191479606566494799781846958620636621159",
      "27755207882790211140683010581856487965587066971982625511152297537534623405016"
    ],
    [
      "6584607987789185408123601849106260907671314994378225066806060862710814193906",
      "609759108847171587253578490536519506369136135254150754300671591987320319770",
      "28435187585965602110074342250910608316032945187476441868666714022529803033083"
    ],
    [
      "16016664911651770663938916450245705908287192964254704641717751103464322455303",
      "17551273293154696089066968171579395800922204266630874071186322718903959339163",
      "20414195497994754529479032467015716938594722029047207834858832838081413050198"
    ],
    [
      "19773307918850685463180290966774465805537520595602496529624568184993487593855",
      "24598603838812162820757838364185126333280131847747737533989799467867231166980",
      "11040972566103463398651864390163813377135738019556270484707889323659789290225"
    ],
    [
      "5189242080957784038860188184443287562488963023922086723850863987437818393811",
      "1435203288979376557721239239445613396009633263160237764653161500252258220144",
      "13066591163578079667911016543985168493088721636164837520689376346534152547210"
    ],
    [
      "17345901407013599418148210465150865782628422047458024807490502489711252831342",
      "22139633362249671900128029132387275539363684188353969065288495002671733200348",
      "1061056418502836172283188490483332922126033656372467737207927075184389487061"
    ],
    [
      "10241738906190857416046229928455551829189196941239601756375665129874835232299",
      "27808033332417845112292408673209999320983657696373938259351951416571545364415",
      "18820154989873674261497645724903918046694142479240549687085662625471577737140"
    ],
    [
      "7983688435214640842673294735439196010654951226956101271763849527529940619307",
      "17067928657801807648925755556866676899145460770352731818062909643149568271566",
      "24472070825156236829515738091791182856425635433388202153358580534810244942762"
    ],
    [
      "25752201169361795911258625731016717414310986450004737514595241038036936283227",
      "26041505376284666160132119888949817249574689146924196064963008712979256107535",
      "23977050489096115210391718599021827780049209314283111721864956071820102846008"
    ],
    [
      "26678257097278788410676026718736087312816016749016738933942134600725962413805",
      "10480026985951498884090911619636977502506079971893083605102044931823547311729",
      "21126631300593007055117122830961273871167754554670317425822083333557535463396"
    ],
    [
      "1564862894215434177641156287699106659379648851457681469848362532131406827573",
      "13247162472821152334486419054854847522301612781818744556576865965657773174584",
      "8673615954922496961704442777870253767001276027366984739283715623634850885984"
    ],
    [
      "2794525076937490807476666942602262298677291735723129868457629508555429470085",
      "4656175953888995612264371467596648522808911819700660048695373348629527757049",
      "23221574237857660318443567292601561932489621919104226163978909845174616477329"
    ],
    [
      "1878392460078272317716114458784636517603142716091316893054365153068227117145",
      "2370412714505757731457251173604396662292063533194555369091306667486647634097",
      "17409784861870189930766639925394191888667317762328427589153989811980152373276"
    ],
    [
      "25869136641898166514111941708608048269584233242773814014385564101168774293194",
      "11361209360311194794795494027949518465383235799633128250259863567683341091323",
      "14913258820718821235077379851098720071902170702113538811112331615559409988569"
    ],
    [
      "12957012022018304419868287033513141736995211906682903915897515954290678373899",
      "17128889547450684566010972445328859295804027707361763477802050112063630550300",
      "23329219085372232771288306767242735245018143857623151155581182779769305489903"
    ],
    [
      "1607741027962933685476527275858938699728586794398382348454736018784568853937",
      "2611953825405141009309433982109911976923326848135736099261873796908057448476",
      "7372230383134982628913227482618052530364724821976589156840317933676130378411"
    ],
    [
      "20203606758501212620842735123770014952499754751430660463060696990317556818571",
      "4678361398979174017885631008335559529633853759463947250620930343087749944307",
      "27176462634198471376002287271754121925750749676999036165457559387195124025594"
    ],
    [
      "6361981813552614697928697527332318530502852015189048838072565811230204474643",
      "13815234633287489023151647353581705241145927054858922281829444557905946323248",
      "10888828634279127981352133512429657747610298502219125571406085952954136470354"
    ]
  ],
  "fullRounds": 55,
  "partialRounds": 0,
  "hasInitialRoundConstant": false,
  "stateSize": 3,
  "rate": 2,
  "power": 7
};
var poseidonParamsLegacyFp = {
  "mds": [
    [
      "5328350144166205084223774245058198666309664348635459768305312917086056785354",
      "15214731724107930304595906373487084110291887262136882623959435918484004667388",
      "22399519358931858664262538157042328690232277435337286643350379269028878354609"
    ],
    [
      "10086628405675314879458652402278736459294354590428582803795166650930540770072",
      "17127968360683744052278857147989507037142007029142438136689352416106177192235",
      "14207324749280135281015658576564097509614634975132487654324863824516044294735"
    ],
    [
      "3059104278162906687184746935153057867173086006783171716838577369156969739687",
      "16755849208683706534025643823697988418063305979108082130624352443958404325985",
      "16889774624482628108075965871448623911656600744832339664842346756371603433407"
    ]
  ],
  "roundConstants": [
    [
      "1346081094044643970582493287085428191977688221215786919106342366360741041016",
      "10635969173348128974923358283368657934408577270968219574411363948927109531877",
      "18431955373344919956072236142080066866861234899777299873162413437379924987003"
    ],
    [
      "5797044060651575840084283729791357462720161727701814038830889113712361837236",
      "931288489507796144596974766082847744938192694315568692730730202141894005205",
      "13659894470945121760517769979107966886673294523737498361566285362771110125394"
    ],
    [
      "6076231707445968054305995680347976771585015308155855387339303513025362636128",
      "28822740034050339685362260108484262889265034407340240070058997651710236456303",
      "23420266473857869790486107029614186913447272961845992963194006142267563993493"
    ],
    [
      "13753917374184785903125509246122783296344288469304898921025291716613575849357",
      "22396739346703340038555577564698139382745239004673153148674304627904081092826",
      "13064238335532551154986111986409392866270911640785653458047811526842088084911"
    ],
    [
      "23165923875642452719095776619341762858050322341374771345641255745672274104746",
      "1876216571769482372914291210815859835162659440705283782713345335434924136736",
      "25448252060136178247213604035267580231762596830634036926922217427938159849142"
    ],
    [
      "2161875315509206970842862195937323600322108268401381254431163181777726747153",
      "19159855698625842998331760283165907305622417625829203038229273729196960321630",
      "24828563875172432296791053766778475681869974948122169083176331088266823626561"
    ],
    [
      "15959479662608710141128458274961057999257961784282074767105536637788386907463",
      "8006369581283017287449277389162056290714176164680299906116833200510117952858",
      "18794336794618132129607701188430371953320538976527988886453665523008714542779"
    ],
    [
      "19408271715954593722501381885401160867835377473312521553027032015227895029571",
      "13654747284005184272412579731446984220568337794941823533879059135026064413631",
      "14094055032353750931629930778481002727722804310855727808905931659115939920989"
    ],
    [
      "13241818625838429282823260827177433104574315653706102174619924764342778921524",
      "25709259239494174564705048436260891089407557689981668111890003079561388887725",
      "26866626910239634723971078462134580196819809568632305020800296809092442642381"
    ],
    [
      "23886826350713085163238005260075062110062681905356997481925492650252417143049",
      "16853602711255261520713463306790360324679500458440235992292027384928526778856",
      "18444710386168488194610417945072711530390091945738595259171890487504771614189"
    ],
    [
      "16896789009769903615328691751424474161656500693270070895928499575572871141439",
      "23842266984616972287898037872537536999393060934879414668030219493005225085992",
      "24369698563802298585444760814856330583118549706483939267059237951238240608187"
    ],
    [
      "25360195173713628054110426524260405937218170863260484655473435413697869858790",
      "1486437708678506228822038923353468635394979165769861487132708983207562337116",
      "18653498960429911228442559598959970807723487073275324556015861725806677047150"
    ],
    [
      "18878179044241268037057256060083772636369783391816038647949347814518015576522",
      "178715779905629247116805974152863592571182389085419970371289655361443016848",
      "8381006794425876451998903949255801618132578446062133243427381291481465852184"
    ],
    [
      "4176946262813877719206528849579392120806054050640974718891398605746592169324",
      "16376345520728802444699629729684297833862527190772376028981704525651968727081",
      "8399065769082251057361366626601550736334213197703006866551331927128775757919"
    ],
    [
      "15435308585611812393531506745122614542196708285088622615406141986333182280857",
      "4082259282787276939431186930090898350392871145699460879678141552997816391817",
      "26348742719959309014730178326877937464605873211235784184917342950648457078699"
    ],
    [
      "9707631711734344681918469569872517425107158187591261754498805460753455298868",
      "27910768846011709391567916011595957279088224137468948238696800459136335473132",
      "20407239095656434708569263842372155762970847207558227886302782130015730063802"
    ],
    [
      "22726225412881182965250630589245572283256255052470345984553083359461473893802",
      "12443967854426795490638709950679156338200426963050610832781263082981525248175",
      "27102543658848146076219989119639465430524061997280788166887046421706499775415"
    ],
    [
      "14427224233985680214097547669945064793149553513421479297921556194475574770861",
      "22917454832925781549840198815703114840452733537799472739275668965081704937832",
      "3455076056123630366063931123762198941796412458154689469887583689725886013901"
    ],
    [
      "4513100023937785913596662867311227004762025658663076805918211014066645403017",
      "18187619530784075723418065322038024507729605774832001333883311123910954334059",
      "9447065431426150382325592560406989926365684509675374414068135115024495130938"
    ],
    [
      "3227816098015819796753427754968234889554095489076864339942014527747604603014",
      "14798316759185072116520458171957899889489461918408669809912344751222514418582",
      "23013904852315603905843158448056763116188801262838729536210355401378476650033"
    ],
    [
      "20979191509934291452182967564058656088941447895799901211038858159903580333267",
      "20772973010251235271448378823573767262405703078344288856168565499702414379868",
      "10105446427739226002497411811738001382334316505480517822035303561899927603685"
    ],
    [
      "11079074761356717003579108002319997196881121172538617046865136940931215263187",
      "4693927775411489288330326150094711670434597808961717172753867514688725690438",
      "18581720304902876944842830383273503265470859268712618325357902881821721540119"
    ],
    [
      "3065369948183164725765083504606321683481629263177690053939474679689088169185",
      "18515622379147081456114962668688706121098539582467584736624699157043365677487",
      "17563088600719312877716085528177751048248154461245613291986010180187238198006"
    ],
    [
      "26199746176994924146211004840756471702409132230831594954444947705902602287290",
      "7576136600627345523051497639367002272003104458453478964661395239732811642605",
      "20058687874612168338994287374025378897088936171250328231848098497610185784281"
    ],
    [
      "16894722532414195606958290526999761110785277556463400588047573469106594850228",
      "13961730805696859614283621225672002906734926278118993580398533742874863598733",
      "25256842011135514243352951950573936602906198374305137963222382546140030647211"
    ],
    [
      "18530360047537856737482157200091774590035773602620205695980247565433703032532",
      "23014819965938599260086897799541446473887833964178378497976832161473586995397",
      "27911426213258307990762460361663504655967992659180759140364181941291843542489"
    ],
    [
      "1067338118323302017358103178057182291035336430305886255160210378977812067042",
      "17219092885519007424608854460610388434712113621163885775309496940189894433620",
      "16432921127615937542183846559291144733339643093361323334499888895135356545408"
    ],
    [
      "28608851042959977114787048070153637607786033079364369200270218128830983558707",
      "10121629780013165888398831090128011045011860641816380162950736555305748332191",
      "2348036340843128746981122630521268144839343500596932561106759754644596320722"
    ],
    [
      "16619881370356823200358060093334065394764987467483650323706184068451904156452",
      "2302436627861989749837563733434625231689351276818486757748445924305258835336",
      "27514536540953539473280001431110316405453388911725550380123851609652679788049"
    ],
    [
      "9459277727420672604737117687200019308525004979918488827092207438664125039815",
      "23425670740358068509956137586663046763224562225383386726193078231034380596217",
      "7641885067011661443791509688937280323563328029517832788240965464798835873658"
    ],
    [
      "9579420382351699601929202663836555665702024548386778299996961509578687980280",
      "18513671386572584282611234979588379470994484682444053600751415262497237017703",
      "24923151431234706142737221165378041700050312199585085101919834422744926421604"
    ],
    [
      "21131320841803068139502705966375283830095161079635803028011171241658723560073",
      "19208476595309656066589572658712717685014329237892885950958199953675225096566",
      "24023185216737416080949689106968568821656545490748664446389634158498624398204"
    ],
    [
      "7510552996848634969347937904645640209946785877619890235458182993413526028718",
      "3694415017252995094553868781762548289196990492336482360084813900937464847638",
      "9219021070107873028263141554048987416559034633883158827414043929220388719352"
    ],
    [
      "5058327241234443421111591959922712922949620710493120384930391763032694640881",
      "13148252221647574076185511663661016015859769210867362839817254885265598775418",
      "15186790492457240277904880519227706403545816456632095870015828239411033220638"
    ],
    [
      "2775942914650502409705888572245750999561427024488403026572311267798009048466",
      "6277965230841030155341171319927732572492215818164736949144854827643964384893",
      "24144742149845235561087977558785057713814731737434473021812189457617252043745"
    ],
    [
      "25789129719327437503403457598813971826156253950521984610569937361506914183550",
      "21500534320778995945845999974779950304491968082325255355181901574840373597824",
      "17185359848218837018503091932245529880546896465437232425673134558221638601375"
    ],
    [
      "12253896579078110143384981818031883112606762215016553811786428215758384195713",
      "12956658260778456372481429232709881794962204180363200699121804724437678625542",
      "3023603786717368708677300377055384474816569333060487675635618249403832078921"
    ],
    [
      "4186492855716808019562789862833898284927736051002588766326482010810259565130",
      "4263939782228419774639068267872291539552889472311225829898746091327730032923",
      "24068843626280451423530509388397151179174104901782990365720205643492047328816"
    ],
    [
      "14564937827374621319716285527475223392664010281568256859627186463065876537730",
      "28367596550218705971881480694115935470211319172596432472834880507822452927283",
      "28712267437482356021504544448225827500268648754270274754623969882031853409874"
    ],
    [
      "4542596163006916397403529184431773692747461300288194722982487051249951403191",
      "2530461821259252672899452671728393208543894014761816288817584587718369998371",
      "12886393063011539390567049190923398676964700147222878509238966758839020897414"
    ],
    [
      "21593897590707514492037699253654745501762191795293908682495110982956631870528",
      "13233005790593128135480716846773978578237145313006994631606474472023504621256",
      "21621863098292803642478350494794106282518362577273973885587684567452726939909"
    ],
    [
      "26068620073001644720969640099644251616742620988609091568084348314770436291745",
      "18248589586787935500122854210401321966459127818593446990365211078521058875685",
      "21247134484403265289037859533347798468858819117600251067578809852124865474448"
    ],
    [
      "7947383127165915366383984718363902897504221803836013123394785749404572432524",
      "22173041014621867335598230447618036223462011647696367239478182269973488867154",
      "16773227734018849308448505860847939069870370055633571816925675705713088305139"
    ],
    [
      "10708707957340055662073314227607620808612686977606082605219160019699644826999",
      "21249897193797038261479589555720746994050836195265348846222835266344091683000",
      "12581195059139097540117398803363514148192715293133623516709277290477633379593"
    ],
    [
      "19779599816866992123290302397082614570282926215253589712189610064229996603178",
      "21749216503901548676985371189807470207364320167486559936962401093285243029177",
      "17600045923623503357380202389718735904174992978547372448837488832457719009224"
    ],
    [
      "2732872979548118117758016335601225525660858727422778256671975055129965858636",
      "13703031005128062046175331918702218558750713240446179585947851411173844703597",
      "28447710105386636841938034820015573492556750872924193415447818187228356409281"
    ],
    [
      "28539960355005748517007309210788803416171161412204526246799800716567376494244",
      "21329318452221893900731030722137844458345358926323127858742388587761302609863",
      "28135302149599894709369178097439582767613940517471323224020113411362601191873"
    ],
    [
      "24980774120400248734054527936006392540889095705961960837980443629260392758683",
      "20339911045808632098936066397942175169549806052128535543540543556255197716643",
      "7929293103930252545581851978492699598413941396422930641071359388697302362494"
    ],
    [
      "8911092207145893152276662096451247820054843777071569723455408545101628926203",
      "19648860643145256523615441075182036100116634560394529500146405733687718224516",
      "14635387208623683806428528837466762532853903031263830054986064902455379735903"
    ],
    [
      "11555212214346132926966321609673228184079851030522218543981385635403167028692",
      "20896918157639814425520058178561910811657326967880217845710779511927814874973",
      "4650158165912007049140499755153804318686705949436165235742106170124284287326"
    ],
    [
      "13880660273492757167295696447853232191657893303250187467329180558670697369810",
      "8043529172463774320604378774840863923445982272478964686447801046272917236836",
      "2134399296482715903442913099374581981696436050603410080564843555725771329441"
    ],
    [
      "27320952903412641133501507962185246982787769547770982814240701526492601978122",
      "23417491374379751329394424924400186404791519133465537872457405970098902747611",
      "17612427354278346772575179176139417348059847375297761006336024476146551185903"
    ],
    [
      "10710998507064742997612080847223278109404482930427999113323732519626499166548",
      "14958094513415797513745395709487730603918953350067504982704138489305723550923",
      "24096319595904213497633343966229498735553590589105811393277073274927955202995"
    ],
    [
      "17983724131200292654039765185049138356840415443160477259330748730019147254309",
      "17598096800487588874709548646068838880468456205252324677357706597166777506441",
      "27420647821110229619898200875848631488422182349567475956209153112306555222281"
    ],
    [
      "448538544835457571662601142415301047108854812427100562339376187510452313026",
      "23494184556634922103535803143214434479598067155171780264810485708203176455201",
      "22626342941879801989161990529511235538216563009907378573817996229389756621777"
    ],
    [
      "26128268137723417163973860961686381960826033145738852158792607959175787222856",
      "20225791828042873305317281581105429726352058325970107209484198122707862156597",
      "7538871133759632802857159609785118198934349221046986784429069814655215585732"
    ],
    [
      "26184554861259642274153262777073624024579929401668865520166966302070394487366",
      "28755259264665180745537307265993667261709206143628938749669440804401623257679",
      "11896066093033549470312328497237649508068258723531931099214795928200015717321"
    ],
    [
      "21657721599978732693249012287058163532690942515202465984736373311077240614059",
      "9214914097169852704753116653702415951907628005986883140609006971322091003693",
      "18710111680849814325169297240208687402588261569152088592693815711857504371037"
    ],
    [
      "6813635166770764528979084175325709935892248249948967889926276426090222296643",
      "20546585456429436268067726231902751119458200511988152296570567167520382569278",
      "20087466019194902429054761607398988292568594301671509779549344754172952693871"
    ],
    [
      "28185105286740691904534067831357491310995891986363455251895371651360605333143",
      "10108348212894231193041286244259038275269464277821588425688314560368589986063",
      "11433633215392393209829215018579238412423821563056156785641278458497271271546"
    ],
    [
      "27870881917195016999862550657996865268956893566432995492427618003637597051321",
      "102309803677783876701097881491240456320211833502658383473112057006867019389",
      "22844040227595875612525628393174357057929113317578127744718774517498324646590"
    ],
    [
      "18364790233947478619325319418813215212267974311771564959136180502266118026133",
      "2480624341921718230432383518425561514824501138863702825916674641657321180841",
      "16778939567530361665956758171503829349658551798564323167725356065198936433124"
    ],
    [
      "11947564511486966895926950599696532964589539443187518177489990556481125699966",
      "3133187646540385483015602955087323554103587039123577645562801570574691666057",
      "27704797101265438206569218421707753788081674727344603874614391656565567951541"
    ],
    [
      "13001484695584753475562184349533365512515447041450030471627087395341039487710",
      "477322000667279478600757543806155989948171541982639893984064422067850617496",
      "13913755821658634147813329813115566967428755223601185963529801459396673113438"
    ],
    [
      "16621869429023470107454028095846067937827722393398508604914831452950874033411",
      "21755744236927410239079501831014076529931327263341620300431356747367343619046",
      "26538666591151124505694487799121414506088199961481579132019627484065014831180"
    ],
    [
      "3066480818457008068617042549071052338581291837882909165666223566402713429090",
      "16182268213934119294035309949459684472027705439038023775276926916166831108357",
      "28907604876608422892474268478706783033050951245339691569015166507728369585190"
    ],
    [
      "27973960109508292680965426133498827831691369851701664449575719912259359998113",
      "1456924360278399121996742356757866616312146358469991014696110099534285524446",
      "8234248752911525485438611255163504976087091103090603316695312869292347668495"
    ],
    [
      "8716078950082339630026654067608811496722305720644485560320987802533380421009",
      "19016744645809919602099479306503354923553336014593353020688463619133130053825",
      "24379650661051444982012238084495990858827340608012118841005379796362233056432"
    ],
    [
      "2245379544097631382062919677963998259142792890502492881341386639439507471783",
      "28788137434161061988371619554419440748189388934884757179010092973102292086583",
      "7187000185648741287953633167647835668543536354944774631102766873251849991238"
    ],
    [
      "18319349500538500800225762827448369057030532278398270164660609327776487168142",
      "2622932985948021877314529887962683530522545893985767148345336304947201715671",
      "13805188629797792210337544360632964855143280581052079479249966961215582531026"
    ],
    [
      "27457600993464082637917106210690168172469473943609357897393615707457194410878",
      "15448646156961779103834447043970817898237835202826003934642165760908058355399",
      "9396792545729486882231669677795667529746274932273033601723318032992363022062"
    ],
    [
      "9927877141952679457141759789181418464292082444806533413864151258248124544859",
      "23827901395971835838179844085051957393677906360196119690926757794561937573142",
      "3273544693673216914876067527455588276979859627093391584406340272737391174619"
    ],
    [
      "19571510438350300564152393820251652609646082150148656806391655428002614034315",
      "4458840243585913642400750597703353770666314833058197517675446022682775625834",
      "6452218213610300363069953741424106105609715382419342511693148495219793324457"
    ],
    [
      "14558167930891460678441266912176752652821641543245953113671886345167213541771",
      "10650967986920075561478528461783351160938460620955779955379459848889204404950",
      "19990009778942542934049216419052172134625404062770188357110708518621145688588"
    ],
    [
      "26855242974447190235826233682457047761532515293146087151296725996543442567035",
      "22785340043356532865086769889360674409753343398766563441587096485751538658065",
      "28603049427449348335651629195385434188071937908693764500052489540779792538285"
    ],
    [
      "20545812864989828913452616721240947168977365844984763819184465128164378967167",
      "23234068381345797209897730226956922073109641728569353961504167817770340037954",
      "26031714567641615877877111172701145299483019910006153132858512509897185854695"
    ],
    [
      "9512221744061419790435674197238913998387834650389922233458121639503195504983",
      "12587458000103271975978240683793268604398305885278203470492658961734100340536",
      "9670291694005369437277651504604785512303147991710650505302465204429311229197"
    ],
    [
      "26995526763045548800439747262386290359229145489609341602564040676717570935439",
      "23742712112104280264401317024221734961713400615669958343926511931219510484675",
      "27931469778579449247589315744656633392873808631802461175539563849884447358271"
    ],
    [
      "20669006894143187877081688942720159738269397552445286314270368345994751825389",
      "26891772301075275370472640177651637211280740381619976926886106618375467277414",
      "28387986011980449959047232529988203397251084614417760995257355718700961696092"
    ],
    [
      "6579105010484741592730389416372694666279917604793318157514380025250233913402",
      "11007035767869292700964744408562802781669930023548892567535397874932420229930",
      "981148366863906885900456473323410468923514528856216824044152942069412627408"
    ],
    [
      "22213671088722307302576907504985884923571642958053627659840326928319445671280",
      "1318836216310789598614608105109389429335273432455224127576823891011367206122",
      "25586582796990779718352441955439394949194222626688223867952982491529809559257"
    ],
    [
      "4923739488579452777913681531125585976446366144127161879759262506690369040090",
      "23505612338866210737103599484620591026802005128655081877133994175016351514827",
      "323887003859465324514901860965142186539600668250760639664361851354147799637"
    ],
    [
      "10198923064967306784017949469108033682156920551672348936591491217255268794658",
      "9593680688139131432883442351722730169325112619984238956948153423155998917175",
      "27027988263960602112273050725720071355535922812577299127302015348825197871870"
    ],
    [
      "14419883951157390867695097127684346981136020111885301573583640959136319507752",
      "5104414988075833278683649298543440897371415916271358703850262680431809374355",
      "24739655595299332818980677669648719986462429574612913501586844601377825836782"
    ],
    [
      "28522818684103966731129743408029731246564480741348128436668680764518115102581",
      "21520350704208288978690888796633940487888044365108767319141211249242880355961",
      "17391005598311948834360476853940353239444383292422171321575043660157438608537"
    ],
    [
      "15367833944125677011173327826570204350687925236257190051755087781855930646142",
      "21715073802090413714601069529558707101797361591183718695054701329871284436172",
      "8994093285353831008525761670339342200997965950202092028313103110478252647618"
    ],
    [
      "8370824693889782161629525898408725452177580012023459750897244954935682978671",
      "16123253540853556024347150096993154278773652905830608614979368087152152043083",
      "3535380953353495025888433493640531836449699255364366295870140701379497967423"
    ],
    [
      "6954518484798178646508803478426114267143074508396663899281411171704702743829",
      "28903134801897070276701950388422104654018369750191967384271618837091859516942",
      "20872505363530172448468374920196608937030884647150175861507911076568784054834"
    ],
    [
      "6902861581703501105786795670676641959401710346423594578401934671029571262513",
      "10124161387604183369443890585742198433184078889862870469507328332805848271064",
      "10488004060799269337071647841224034919633445750252076195310163972966405029030"
    ],
    [
      "507704911991278613147490289466075160618843900088471236546244459176211783848",
      "7252739745607302667257774481690407709040936359589867974787811552896597703097",
      "23278073497974004442836030100920157527910770509761505828038443336325476654930"
    ],
    [
      "22766285055433137793164317120096790621982728188995759745859222009100808389090",
      "23129058299483468195787339200845749049960038336751758017949899311636830205152",
      "16665333681978951552434356320651834889869437822496200946959897681307959400425"
    ],
    [
      "12145699202182574939376505075528461451757079041659894988784442097333218352048",
      "26340666275844437932755852805027863696219004039301187587209926587657008948704",
      "19208771804191839410002226941825269105677187954811130189835856228258013753206"
    ],
    [
      "21957102494792377508237608216278079874536155315851198461024084071231867104453",
      "6933367436450995525851693784691226222726503560893470094614235356287049091852",
      "15707767379191450768747057313641112321773921923533732633534831270357733757271"
    ],
    [
      "27661963645951389261638591385668507557739541354225916772550248746235106571003",
      "19699458096897937575096494582288688995241392471402204995195057374756282223421",
      "902873385171181344315871113842580653512118892800584003934454469411716098791"
    ],
    [
      "17184835876565576154014372215369798779520343573944211203710896053325717110660",
      "664657295519303589036289440053175741110032988007278988577620229144220576240",
      "10803972669668998371638869508774217165881281885838503958226056357738500321396"
    ],
    [
      "2329846733754251453632375727999372856194157027336139087170310553870624325301",
      "14139944357035048486675740400655356660678187875721949218090128899571575479791",
      "18368148273419807418427674359327442879484531833435081951870369910704734685351"
    ],
    [
      "10480273665080572189328459165704340191901489646067580012574464138528963201459",
      "21773636700078124500346009061678153597323236568110076029811348966753228682835",
      "18184268307211429260956076021417309535471438696101133218049142374847151474905"
    ],
    [
      "25957533025669311312382992376854735734491934602484112256289764602447226406852",
      "22223261506176684934865714490719116745135417403915426392159449667435294570739",
      "22937309162832499167063076416585504361695925730111272512450449042837586253575"
    ],
    [
      "16956181785481598286719868503945127919581091625126206673934113115358441284347",
      "8497782777197814773596870810881707148695901557289856910220737358078100998191",
      "21135503731586600979470064722475007625236017670426339278983640892218291297054"
    ],
    [
      "17809297343844488723046665739910571149089769215421130894378638450427880983923",
      "72435395972188389387093550708873189001876361107443937983754878061522372356",
      "7511239878692099209014947248389283109997289411550315391143819429585903287870"
    ]
  ],
  "fullRounds": 63,
  "partialRounds": 0,
  "hasInitialRoundConstant": true,
  "stateSize": 3,
  "rate": 2,
  "power": 5
};
var mocks = { "dummyVerificationKeyHash": "0" };

// dist/node/lib/base58.js
var import_js_sha256 = require("js-sha256");
var alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".split("");
var inverseAlphabet = {};
alphabet.forEach((c, i2) => {
  inverseAlphabet[c] = i2;
});
function toBase58Check(input, versionByte) {
  let withVersion = [versionByte, ...input];
  let checksum = computeChecksum(withVersion);
  let withChecksum = withVersion.concat(checksum);
  return toBase58(withChecksum);
}
function fromBase58Check(base582, versionByte) {
  let bytes = fromBase58(base582);
  let checksum = bytes.slice(-4);
  let originalBytes = bytes.slice(0, -4);
  let actualChecksum = computeChecksum(originalBytes);
  if (!arrayEqual(checksum, actualChecksum))
    throw Error("fromBase58Check: invalid checksum");
  if (originalBytes[0] !== versionByte)
    throw Error(`fromBase58Check: input version byte ${versionByte} does not match encoded version byte ${originalBytes[0]}`);
  return originalBytes.slice(1);
}
function toBase58(bytes) {
  let z = 0;
  while (bytes[z] === 0)
    z++;
  let digits = [...bytes].map(BigInt).reverse();
  let base58Digits = changeBase(digits, 256n, 58n).reverse();
  base58Digits = Array(z).fill(0n).concat(base58Digits);
  return base58Digits.map((x) => alphabet[Number(x)]).join("");
}
function fromBase58(base582) {
  let base58Digits = [...base582].map((c) => {
    let digit = inverseAlphabet[c];
    if (digit === void 0)
      throw Error("fromBase58: invalid character");
    return BigInt(digit);
  });
  let z = 0;
  while (base58Digits[z] === 0n)
    z++;
  let digits = changeBase(base58Digits.reverse(), 58n, 256n).reverse();
  digits = Array(z).fill(0n).concat(digits);
  return digits.map(Number);
}
function computeChecksum(input) {
  let hash1 = import_js_sha256.sha256.create();
  hash1.update(input);
  let hash2 = import_js_sha256.sha256.create();
  hash2.update(hash1.array());
  return hash2.array().slice(0, 4);
}
function base58(binable, versionByte) {
  return {
    toBase58(t) {
      let bytes = binable.toBytes(t);
      return toBase58Check(bytes, versionByte);
    },
    fromBase58(base582) {
      let bytes = fromBase58Check(base582, versionByte);
      return binable.fromBytes(bytes);
    }
  };
}
function withBase58(binable, versionByte) {
  return { ...binable, ...base58(binable, versionByte) };
}
function customEncoding(Field5, versionByte, versionNumber) {
  let customField = versionNumber !== void 0 ? withVersionNumber(Field5, versionNumber) : Field5;
  return base58(customField, versionByte);
}
var RECEIPT_CHAIN_HASH_VERSION = 1;
var LEDGER_HASH_VERSION = 1;
var EPOCH_SEED_VERSION = 1;
var STATE_HASH_VERSION = 1;
function fieldEncodings(Field5) {
  const TokenId5 = customEncoding(Field5, versionBytes.tokenIdKey);
  const ReceiptChainHash4 = customEncoding(Field5, versionBytes.receiptChainHash, RECEIPT_CHAIN_HASH_VERSION);
  const LedgerHash2 = customEncoding(Field5, versionBytes.ledgerHash, LEDGER_HASH_VERSION);
  const EpochSeed2 = customEncoding(Field5, versionBytes.epochSeed, EPOCH_SEED_VERSION);
  const StateHash4 = customEncoding(Field5, versionBytes.stateHash, STATE_HASH_VERSION);
  return { TokenId: TokenId5, ReceiptChainHash: ReceiptChainHash4, LedgerHash: LedgerHash2, EpochSeed: EpochSeed2, StateHash: StateHash4 };
}
function arrayEqual(a2, b2) {
  if (a2.length !== b2.length)
    return false;
  for (let i2 = 0; i2 < a2.length; i2++) {
    if (a2[i2] !== b2[i2])
      return false;
  }
  return true;
}

// dist/node/provable/curve-bigint.js
var versionNumbers = {
  field: 1,
  scalar: 1,
  publicKey: 1,
  signature: 1
};
var Group = {
  toProjective({ x, y }) {
    return Pallas.fromAffine({ x, y, infinity: false });
  },
  /**
   * Convert a projective point to a non-zero affine point.
   * Throws an error if the point is zero / infinity, i.e. if z === 0
   */
  fromProjective(point) {
    let { x, y, infinity } = Pallas.toAffine(point);
    if (infinity)
      throw Error("Group.fromProjective: point is infinity");
    return { x, y };
  },
  get generatorMina() {
    return Group.fromProjective(Pallas.one);
  },
  scale(point, scalar) {
    return Group.fromProjective(Pallas.scale(Group.toProjective(point), scalar));
  },
  b: Pallas.b,
  toFields({ x, y }) {
    return [x, y];
  }
};
var FieldWithVersion = withVersionNumber(Field, versionNumbers.field);
var BinablePublicKey = withVersionNumber(withCheck(record({ x: FieldWithVersion, isOdd: Bool }, ["x", "isOdd"]), ({ x }) => {
  let { mul, add } = Field;
  let ySquared = add(mul(x, mul(x, x)), Pallas.b);
  if (!Field.isSquare(ySquared)) {
    throw Error("PublicKey: not a valid group element");
  }
}), versionNumbers.publicKey);
var PublicKey = {
  ...provable({ x: Field, isOdd: Bool }, { customObjectKeys: ["x", "isOdd"] }),
  ...withBase58(BinablePublicKey, versionBytes.publicKey),
  toJSON(publicKey) {
    return PublicKey.toBase58(publicKey);
  },
  fromJSON(json) {
    return PublicKey.fromBase58(json);
  },
  toGroup({ x, isOdd }) {
    let { mul, add } = Field;
    let ySquared = add(mul(x, mul(x, x)), Pallas.b);
    let y = Field.sqrt(ySquared);
    if (y === void 0) {
      throw Error("PublicKey.toGroup: not a valid group element");
    }
    if (isOdd !== (y & 1n))
      y = Field.negate(y);
    return { x, y };
  },
  fromGroup({ x, y }) {
    let isOdd = y & 1n;
    return { x, isOdd };
  },
  equal(pk1, pk2) {
    return pk1.x === pk2.x && pk1.isOdd === pk2.isOdd;
  },
  toInputLegacy({ x, isOdd }) {
    return { fields: [x], bits: [!!isOdd] };
  }
};
var checkScalar = checkRange(0n, Fq.modulus, "Scalar");
var Scalar = pseudoClass(function Scalar2(value) {
  return mod(BigInt(value), Fq.modulus);
}, {
  ...ProvableBigint(checkScalar),
  ...BinableBigint(Fq.sizeInBits, checkScalar),
  ...Fq
});
var BinablePrivateKey = withVersionNumber(Scalar, versionNumbers.scalar);
var Base58PrivateKey = base58(BinablePrivateKey, versionBytes.privateKey);
var PrivateKey = {
  ...Scalar,
  ...provable(Scalar),
  ...Base58PrivateKey,
  ...BinablePrivateKey,
  toPublicKey(key) {
    return PublicKey.fromGroup(Group.scale(Group.generatorMina, key));
  }
};

// dist/node/lib/scalar.js
var _Scalar_instances;
var _Scalar_assertConstant;
var ScalarConst = {
  fromBigint: constFromBigint2,
  toBigint: constToBigint2
};
var scalarShift = Scalar(1n + 2n ** 255n);
var oneHalf = Scalar.inverse(2n);
var Scalar3 = class {
  constructor(bits2, constantValue) {
    _Scalar_instances.add(this);
    this.value = bits2;
    constantValue ?? (constantValue = toConstantScalar(bits2));
    if (constantValue !== void 0) {
      this.constantValue = ScalarConst.fromBigint(constantValue);
    }
  }
  /**
   * Create a constant {@link Scalar} from a bigint, number, string or Scalar.
   *
   * If the input is too large, it is reduced modulo the scalar field size.
   */
  static from(x) {
    if (x instanceof Scalar3)
      return x;
    if (x instanceof Uint8Array)
      x = ScalarConst.toBigint(x);
    let scalar = Scalar(x);
    let bits2 = toBits(scalar);
    return new Scalar3(bits2, scalar);
  }
  /**
   * Check whether this {@link Scalar} is a hard-coded constant in the constraint system.
   * If a {@link Scalar} is constructed outside provable code, it is a constant.
   */
  isConstant() {
    return this.constantValue !== void 0;
  }
  /**
   * Convert this {@link Scalar} into a constant if it isn't already.
   *
   * If the scalar is a variable, this only works inside `asProver` or `witness` blocks.
   *
   * See {@link FieldVar} for an explanation of constants vs. variables.
   */
  toConstant() {
    if (this.constantValue !== void 0)
      return this;
    let [, ...bits2] = this.value;
    let constBits = bits2.map((b2) => FieldVar.constant(Snarky.field.readVar(b2)));
    return new Scalar3([0, ...constBits]);
  }
  /**
   * @deprecated use {@link Scalar.from}
   */
  static fromBigInt(x) {
    return Scalar3.from(x);
  }
  /**
   * Convert this {@link Scalar} into a bigint
   */
  toBigInt() {
    return (0, import_tslib3.__classPrivateFieldGet)(this, _Scalar_instances, "m", _Scalar_assertConstant).call(this, "toBigInt");
  }
  // TODO: fix this API. we should represent "shifted status" internally and use
  // and use shifted Group.scale only if the scalar bits representation is shifted
  /**
   * Creates a data structure from an array of serialized {@link Bool}.
   *
   * **Warning**: The bits are interpreted as the bits of 2s + 1 + 2^255, where s is the Scalar.
   */
  static fromBits(bits2) {
    return Scalar3.fromFields(bits2.map((b2) => b2.toField()));
  }
  /**
   * Returns a random {@link Scalar}.
   * Randomness can not be proven inside a circuit!
   */
  static random() {
    return Scalar3.from(Scalar.random());
  }
  /**
   * Negate a scalar field element.
   *
   * **Warning**: This method is not available for provable code.
   */
  neg() {
    let x = (0, import_tslib3.__classPrivateFieldGet)(this, _Scalar_instances, "m", _Scalar_assertConstant).call(this, "neg");
    let z = Scalar.negate(x);
    return Scalar3.from(z);
  }
  /**
   * Add scalar field elements.
   *
   * **Warning**: This method is not available for provable code.
   */
  add(y) {
    let x = (0, import_tslib3.__classPrivateFieldGet)(this, _Scalar_instances, "m", _Scalar_assertConstant).call(this, "add");
    let y0 = (0, import_tslib3.__classPrivateFieldGet)(y, _Scalar_instances, "m", _Scalar_assertConstant).call(y, "add");
    let z = Scalar.add(x, y0);
    return Scalar3.from(z);
  }
  /**
   * Subtract scalar field elements.
   *
   * **Warning**: This method is not available for provable code.
   */
  sub(y) {
    let x = (0, import_tslib3.__classPrivateFieldGet)(this, _Scalar_instances, "m", _Scalar_assertConstant).call(this, "sub");
    let y0 = (0, import_tslib3.__classPrivateFieldGet)(y, _Scalar_instances, "m", _Scalar_assertConstant).call(y, "sub");
    let z = Scalar.sub(x, y0);
    return Scalar3.from(z);
  }
  /**
   * Multiply scalar field elements.
   *
   * **Warning**: This method is not available for provable code.
   */
  mul(y) {
    let x = (0, import_tslib3.__classPrivateFieldGet)(this, _Scalar_instances, "m", _Scalar_assertConstant).call(this, "mul");
    let y0 = (0, import_tslib3.__classPrivateFieldGet)(y, _Scalar_instances, "m", _Scalar_assertConstant).call(y, "mul");
    let z = Scalar.mul(x, y0);
    return Scalar3.from(z);
  }
  /**
   * Divide scalar field elements.
   * Throws if the denominator is zero.
   *
   * **Warning**: This method is not available for provable code.
   */
  div(y) {
    let x = (0, import_tslib3.__classPrivateFieldGet)(this, _Scalar_instances, "m", _Scalar_assertConstant).call(this, "div");
    let y0 = (0, import_tslib3.__classPrivateFieldGet)(y, _Scalar_instances, "m", _Scalar_assertConstant).call(y, "div");
    let z = Scalar.div(x, y0);
    if (z === void 0)
      throw Error("Scalar.div(): Division by zero");
    return Scalar3.from(z);
  }
  // TODO don't leak 'shifting' to the user and remove these methods
  shift() {
    let x = (0, import_tslib3.__classPrivateFieldGet)(this, _Scalar_instances, "m", _Scalar_assertConstant).call(this, "shift");
    return Scalar3.from(shift(x));
  }
  unshift() {
    let x = (0, import_tslib3.__classPrivateFieldGet)(this, _Scalar_instances, "m", _Scalar_assertConstant).call(this, "unshift");
    return Scalar3.from(unshift(x));
  }
  /**
   * Serialize a Scalar into a Field element plus one bit, where the bit is represented as a Bool.
   *
   * **Warning**: This method is not available for provable code.
   *
   * Note: Since the Scalar field is slightly larger than the base Field, an additional high bit
   * is needed to represent all Scalars. However, for a random Scalar, the high bit will be `false` with overwhelming probability.
   */
  toFieldsCompressed() {
    let s = (0, import_tslib3.__classPrivateFieldGet)(this, _Scalar_instances, "m", _Scalar_assertConstant).call(this, "toFieldsCompressed");
    let lowBitSize = BigInt(Scalar.sizeInBits - 1);
    let lowBitMask = (1n << lowBitSize) - 1n;
    return {
      field: new Field3(s & lowBitMask),
      highBit: new Bool3(s >> lowBitSize === 1n)
    };
  }
  // internal stuff
  // Provable<Scalar>
  /**
   * Part of the {@link Provable} interface.
   *
   * Serialize a {@link Scalar} into an array of {@link Field} elements.
   *
   * **Warning**: This function is for internal usage. It returns 255 field elements
   * which represent the Scalar in a shifted, bitwise format.
   * The fields are not constrained to be boolean.
   */
  static toFields(x) {
    let [, ...bits2] = x.value;
    return bits2.map((b2) => new Field3(b2));
  }
  /**
   * Serialize this Scalar to Field elements.
   *
   * **Warning**: This function is for internal usage. It returns 255 field elements
   * which represent the Scalar in a shifted, bitwise format.
   * The fields are not constrained to be boolean.
   *
   * Check out {@link Scalar.toFieldsCompressed} for a user-friendly serialization
   * that can be used outside proofs.
   */
  toFields() {
    return Scalar3.toFields(this);
  }
  /**
   * Part of the {@link Provable} interface.
   *
   * Serialize a {@link Scalar} into its auxiliary data, which are empty.
   */
  static toAuxiliary() {
    return [];
  }
  /**
   * Part of the {@link Provable} interface.
   *
   * Creates a data structure from an array of serialized {@link Field} elements.
   */
  static fromFields(fields) {
    return new Scalar3([0, ...fields.map((x) => x.value)]);
  }
  /**
   * Part of the {@link Provable} interface.
   *
   * Returns the size of this type in {@link Field} elements.
   */
  static sizeInFields() {
    return Scalar.sizeInBits;
  }
  /**
   * Part of the {@link Provable} interface.
   *
   * Does nothing.
   */
  static check() {
  }
  // ProvableExtended<Scalar>
  /**
   * Serialize a {@link Scalar} to a JSON string.
   * This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the Scalar.
   */
  static toJSON(x) {
    let s = (0, import_tslib3.__classPrivateFieldGet)(x, _Scalar_instances, "m", _Scalar_assertConstant).call(x, "toJSON");
    return s.toString();
  }
  /**
   * Serializes this Scalar to a string
   */
  toJSON() {
    return Scalar3.toJSON(this);
  }
  /**
   * Deserialize a JSON structure into a {@link Scalar}.
   * This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the Scalar.
   */
  static fromJSON(x) {
    return Scalar3.from(Scalar.fromJSON(x));
  }
};
_Scalar_instances = /* @__PURE__ */ new WeakSet(), _Scalar_assertConstant = function _Scalar_assertConstant2(name) {
  return constantScalarToBigint(this, `Scalar.${name}`);
};
Scalar3.ORDER = Scalar.modulus;
function toConstantScalar([, ...bits2]) {
  if (bits2.length !== Scalar.sizeInBits)
    throw Error(`Scalar: expected bits array of length ${Scalar.sizeInBits}, got ${bits2.length}`);
  let constantBits = Array(bits2.length);
  for (let i2 = 0; i2 < bits2.length; i2++) {
    let bool = bits2[i2];
    if (!FieldVar.isConstant(bool))
      return void 0;
    constantBits[i2] = FieldConst.equal(bool[1], FieldConst[1]);
  }
  let sShifted = Scalar.fromBits(constantBits);
  return shift(sShifted);
}
function toBits(constantValue) {
  return [
    0,
    ...Scalar.toBits(unshift(constantValue)).map((b2) => FieldVar.constant(BigInt(b2)))
  ];
}
function shift(s) {
  return Scalar.add(Scalar.add(s, s), scalarShift);
}
function unshift(s) {
  return Scalar.mul(Scalar.sub(s, scalarShift), oneHalf);
}
function constToBigint2(x) {
  return Scalar.fromBytes([...x]);
}
function constFromBigint2(x) {
  return Uint8Array.from(Scalar.toBytes(x));
}
function constantScalarToBigint(s, name) {
  if (s.constantValue === void 0)
    throw Error(`${name}() is not available in provable code.
That means it can't be called in a @method or similar environment, and there's no alternative implemented to achieve that.`);
  return ScalarConst.toBigint(s.constantValue);
}

// dist/node/bindings/lib/provable-snarky.js
var complexTypes = /* @__PURE__ */ new Set(["object", "function"]);
var HashInput = {
  get empty() {
    return {};
  },
  append(input1, input2) {
    return {
      fields: (input1.fields ?? []).concat(input2.fields ?? []),
      packed: (input1.packed ?? []).concat(input2.packed ?? [])
    };
  }
};
function provable2(typeObj, options) {
  let objectKeys = typeof typeObj === "object" && typeObj !== null ? options?.customObjectKeys ?? Object.keys(typeObj).sort() : [];
  let nonCircuitPrimitives = /* @__PURE__ */ new Set([
    Number,
    String,
    Boolean,
    BigInt,
    null,
    void 0
  ]);
  if (!nonCircuitPrimitives.has(typeObj) && !complexTypes.has(typeof typeObj)) {
    throw Error(`provable: unsupported type "${typeObj}"`);
  }
  function sizeInFields(typeObj2) {
    if (nonCircuitPrimitives.has(typeObj2))
      return 0;
    if (Array.isArray(typeObj2))
      return typeObj2.map(sizeInFields).reduce((a2, b2) => a2 + b2, 0);
    if ("sizeInFields" in typeObj2)
      return typeObj2.sizeInFields();
    return Object.values(typeObj2).map(sizeInFields).reduce((a2, b2) => a2 + b2, 0);
  }
  function toFields(typeObj2, obj, isToplevel = false) {
    if (nonCircuitPrimitives.has(typeObj2))
      return [];
    if (!complexTypes.has(typeof typeObj2) || typeObj2 === null)
      return [];
    if (Array.isArray(typeObj2))
      return typeObj2.map((t, i2) => toFields(t, obj[i2])).flat();
    if ("toFields" in typeObj2)
      return typeObj2.toFields(obj);
    return (isToplevel ? objectKeys : Object.keys(typeObj2).sort()).map((k) => toFields(typeObj2[k], obj[k])).flat();
  }
  function toAuxiliary(typeObj2, obj, isToplevel = false) {
    if (typeObj2 === Number)
      return [obj ?? 0];
    if (typeObj2 === String)
      return [obj ?? ""];
    if (typeObj2 === Boolean)
      return [obj ?? false];
    if (typeObj2 === BigInt)
      return [obj ?? 0n];
    if (typeObj2 === void 0 || typeObj2 === null)
      return [];
    if (Array.isArray(typeObj2))
      return typeObj2.map((t, i2) => toAuxiliary(t, obj?.[i2]));
    if ("toAuxiliary" in typeObj2)
      return typeObj2.toAuxiliary(obj);
    return (isToplevel ? objectKeys : Object.keys(typeObj2).sort()).map((k) => toAuxiliary(typeObj2[k], obj?.[k]));
  }
  function toInput(typeObj2, obj, isToplevel = false) {
    if (nonCircuitPrimitives.has(typeObj2))
      return {};
    if (Array.isArray(typeObj2)) {
      return typeObj2.map((t, i2) => toInput(t, obj[i2])).reduce(HashInput.append, HashInput.empty);
    }
    if ("toInput" in typeObj2)
      return typeObj2.toInput(obj);
    if ("toFields" in typeObj2) {
      return { fields: typeObj2.toFields(obj) };
    }
    return (isToplevel ? objectKeys : Object.keys(typeObj2).sort()).map((k) => toInput(typeObj2[k], obj[k])).reduce(HashInput.append, HashInput.empty);
  }
  function toJSON(typeObj2, obj, isToplevel = false) {
    if (typeObj2 === BigInt)
      return obj.toString();
    if (typeObj2 === String || typeObj2 === Number || typeObj2 === Boolean)
      return obj;
    if (typeObj2 === void 0 || typeObj2 === null)
      return null;
    if (!complexTypes.has(typeof typeObj2) || typeObj2 === null)
      return obj ?? null;
    if (Array.isArray(typeObj2))
      return typeObj2.map((t, i2) => toJSON(t, obj[i2]));
    if ("toJSON" in typeObj2)
      return typeObj2.toJSON(obj);
    return Object.fromEntries((isToplevel ? objectKeys : Object.keys(typeObj2).sort()).map((k) => [
      k,
      toJSON(typeObj2[k], obj[k])
    ]));
  }
  function fromFields(typeObj2, fields, aux = [], isToplevel = false) {
    if (typeObj2 === Number || typeObj2 === String || typeObj2 === Boolean || typeObj2 === BigInt)
      return aux[0];
    if (typeObj2 === void 0 || typeObj2 === null)
      return typeObj2;
    if (!complexTypes.has(typeof typeObj2) || typeObj2 === null)
      return null;
    if (Array.isArray(typeObj2)) {
      let array = [];
      let i2 = 0;
      let offset = 0;
      for (let subObj of typeObj2) {
        let size = sizeInFields(subObj);
        array.push(fromFields(subObj, fields.slice(offset, offset + size), aux[i2]));
        offset += size;
        i2++;
      }
      return array;
    }
    if ("fromFields" in typeObj2)
      return typeObj2.fromFields(fields, aux);
    let keys = isToplevel ? objectKeys : Object.keys(typeObj2).sort();
    let values = fromFields(keys.map((k) => typeObj2[k]), fields, aux);
    return Object.fromEntries(keys.map((k, i2) => [k, values[i2]]));
  }
  function fromJSON(typeObj2, json, isToplevel = false) {
    if (typeObj2 === BigInt)
      return BigInt(json);
    if (typeObj2 === String || typeObj2 === Number || typeObj2 === Boolean)
      return json;
    if (typeObj2 === null)
      return void 0;
    if (!complexTypes.has(typeof typeObj2))
      return json ?? void 0;
    if (Array.isArray(typeObj2))
      return typeObj2.map((t, i2) => fromJSON(t, json[i2]));
    if ("fromJSON" in typeObj2)
      return typeObj2.fromJSON(json);
    let keys = isToplevel ? objectKeys : Object.keys(typeObj2).sort();
    let values = fromJSON(keys.map((k) => typeObj2[k]), keys.map((k) => json[k]));
    return Object.fromEntries(keys.map((k, i2) => [k, values[i2]]));
  }
  function check(typeObj2, obj, isToplevel = false) {
    if (nonCircuitPrimitives.has(typeObj2))
      return;
    if (Array.isArray(typeObj2))
      return typeObj2.forEach((t, i2) => check(t, obj[i2]));
    if ("check" in typeObj2)
      return typeObj2.check(obj);
    return (isToplevel ? objectKeys : Object.keys(typeObj2).sort()).forEach((k) => check(typeObj2[k], obj[k]));
  }
  if (options?.isPure === true) {
    return {
      sizeInFields: () => sizeInFields(typeObj),
      toFields: (obj) => toFields(typeObj, obj, true),
      toAuxiliary: () => [],
      fromFields: (fields) => fromFields(typeObj, fields, [], true),
      toInput: (obj) => toInput(typeObj, obj, true),
      toJSON: (obj) => toJSON(typeObj, obj, true),
      fromJSON: (json) => fromJSON(typeObj, json, true),
      check: (obj) => check(typeObj, obj, true)
    };
  }
  return {
    sizeInFields: () => sizeInFields(typeObj),
    toFields: (obj) => toFields(typeObj, obj, true),
    toAuxiliary: (obj) => toAuxiliary(typeObj, obj, true),
    fromFields: (fields, aux) => fromFields(typeObj, fields, aux, true),
    toInput: (obj) => toInput(typeObj, obj, true),
    toJSON: (obj) => toJSON(typeObj, obj, true),
    fromJSON: (json) => fromJSON(typeObj, json, true),
    check: (obj) => check(typeObj, obj, true)
  };
}
function provablePure(typeObj, options = {}) {
  return provable2(typeObj, { ...options, isPure: true });
}

// dist/node/lib/provable.js
var Provable = {
  /**
   * Create a new witness. A witness, or variable, is a value that is provided as input
   * by the prover. This provides a flexible way to introduce values from outside into the circuit.
   * However, note that nothing about how the value was created is part of the proof - `Provable.witness`
   * behaves exactly like user input. So, make sure that after receiving the witness you make any assertions
   * that you want to associate with it.
   * @example
   * Example for re-implementing `Field.inv` with the help of `witness`:
   * ```ts
   * let invX = Provable.witness(Field, () => {
   *   // compute the inverse of `x` outside the circuit, however you like!
   *   return Field.inv(x));
   * }
   * // prove that `invX` is really the inverse of `x`:
   * invX.mul(x).assertEquals(1);
   * ```
   */
  witness,
  /**
   * Proof-compatible if-statement.
   * This behaves like a ternary conditional statement in JS.
   *
   * **Warning**: Since `Provable.if()` is a normal JS function call, both the if and the else branch
   * are evaluated before calling it. Therefore, you can't use this function
   * to guard against execution of one of the branches. It only allows you to pick one of two values.
   *
   * @example
   * ```ts
   * const condition = Bool(true);
   * const result = Provable.if(condition, Field(1), Field(2)); // returns Field(1)
   * ```
   */
  if: if_,
  /**
   * Generalization of {@link Provable.if} for choosing between more than two different cases.
   * It takes a "mask", which is an array of `Bool`s that contains only one `true` element, a type/constructor, and an array of values of that type.
   * The result is that value which corresponds to the true element of the mask.
   * @example
   * ```ts
   * let x = Provable.switch([Bool(false), Bool(true)], Field, [Field(1), Field(2)]);
   * x.assertEquals(2);
   * ```
   */
  switch: switch_,
  /**
   * Asserts that two values are equal.
   * @example
   * ```ts
   * class MyStruct extends Struct({ a: Field, b: Bool }) {};
   * const a: MyStruct = { a: Field(0), b: Bool(false) };
   * const b: MyStruct = { a: Field(1), b: Bool(true) };
   * Provable.assertEqual(MyStruct, a, b);
   * ```
   */
  assertEqual,
  /**
   * Checks if two elements are equal.
   * @example
   * ```ts
   * class MyStruct extends Struct({ a: Field, b: Bool }) {};
   * const a: MyStruct = { a: Field(0), b: Bool(false) };
   * const b: MyStruct = { a: Field(1), b: Bool(true) };
   * const isEqual = Provable.equal(MyStruct, a, b);
   * ```
   */
  equal,
  /**
   * Creates a {@link Provable} for a generic array.
   * @example
   * ```ts
   * const ProvableArray = Provable.Array(Field, 5);
   * ```
   */
  Array: provableArray,
  /**
   * Interface to log elements within a circuit. Similar to `console.log()`.
   * @example
   * ```ts
   * const element = Field(42);
   * Provable.log(element);
   * ```
   */
  log,
  /**
   * Runs code as a prover.
   * @example
   * ```ts
   * Provable.asProver(() => {
   *   // Your prover code here
   * });
   * ```
   */
  asProver,
  /**
   * Runs provable code quickly, without creating a proof, but still checking whether constraints are satisfied.
   * @example
   * ```ts
   * Provable.runAndCheck(() => {
   *   // Your code to check here
   * });
   * ```
   */
  runAndCheck,
  /**
   * Runs provable code quickly, without creating a proof, and not checking whether constraints are satisfied.
   * @example
   * ```ts
   * Provable.runUnchecked(() => {
   *   // Your code to run here
   * });
   * ```
   */
  runUnchecked,
  /**
   * Returns information about the constraints created by the callback function.
   * @example
   * ```ts
   * const result = Provable.constraintSystem(circuit);
   * console.log(result);
   * ```
   */
  constraintSystem,
  /**
   * Checks if the code is run in prover mode.
   * @example
   * ```ts
   * if (Provable.inProver()) {
   *   // Prover-specific code
   * }
   * ```
   */
  inProver,
  /**
   * Checks if the code is run in checked computation mode.
   * @example
   * ```ts
   * if (Provable.inCheckedComputation()) {
   *   // Checked computation-specific code
   * }
   * ```
   */
  inCheckedComputation
};
function witness(type, compute) {
  let ctx = snarkContext.get();
  if (!inCheckedComputation() || ctx.inWitnessBlock) {
    return clone(type, compute());
  }
  let proverValue = void 0;
  let fields;
  let id = snarkContext.enter({ ...ctx, inWitnessBlock: true });
  try {
    let [, ...fieldVars] = Snarky.exists(type.sizeInFields(), () => {
      proverValue = compute();
      let fields2 = type.toFields(proverValue);
      let fieldConstants = fields2.map((x) => x.toConstant().value[1]);
      return [0, ...fieldConstants];
    });
    fields = fieldVars.map(Field4);
  } finally {
    snarkContext.leave(id);
  }
  let aux = type.toAuxiliary(proverValue);
  let value = type.fromFields(fields, aux);
  type.check(value);
  return value;
}
function assertEqual(typeOrX, xOrY, yOrUndefined) {
  if (yOrUndefined === void 0) {
    return assertEqualImplicit(typeOrX, xOrY);
  } else {
    return assertEqualExplicit(typeOrX, xOrY, yOrUndefined);
  }
}
function assertEqualImplicit(x, y) {
  let xs = x.toFields();
  let ys = y.toFields();
  let n = checkLength("Provable.assertEqual", xs, ys);
  for (let i2 = 0; i2 < n; i2++) {
    xs[i2].assertEquals(ys[i2]);
  }
}
function assertEqualExplicit(type, x, y) {
  let xs = type.toFields(x);
  let ys = type.toFields(y);
  for (let i2 = 0; i2 < xs.length; i2++) {
    xs[i2].assertEquals(ys[i2]);
  }
}
function equal(typeOrX, xOrY, yOrUndefined) {
  if (yOrUndefined === void 0) {
    return equalImplicit(typeOrX, xOrY);
  } else {
    return equalExplicit(typeOrX, xOrY, yOrUndefined);
  }
}
function equalImplicit(x, y) {
  let xs = x.toFields();
  let ys = y.toFields();
  checkLength("Provable.equal", xs, ys);
  return xs.map((x2, i2) => x2.equals(ys[i2])).reduce(Bool4.and);
}
function equalExplicit(type, x, y) {
  let xs = type.toFields(x);
  let ys = type.toFields(y);
  return xs.map((x2, i2) => x2.equals(ys[i2])).reduce(Bool4.and);
}
function if_(condition, typeOrX, xOrY, yOrUndefined) {
  if (yOrUndefined === void 0) {
    return ifImplicit(condition, typeOrX, xOrY);
  } else {
    return ifExplicit(condition, typeOrX, xOrY, yOrUndefined);
  }
}
function ifField(b2, x, y) {
  return b2.mul(x.sub(y)).add(y).seal();
}
function ifExplicit(condition, type, x, y) {
  let xs = type.toFields(x);
  let ys = type.toFields(y);
  let b2 = condition.toField();
  if (b2.isConstant()) {
    return clone(type, condition.toBoolean() ? x : y);
  }
  let fields = xs.map((xi, i2) => ifField(b2, xi, ys[i2]));
  let aux = auxiliary(type, () => condition.toBoolean() ? x : y);
  return type.fromFields(fields, aux);
}
function ifImplicit(condition, x, y) {
  let type = x.constructor;
  if (type === void 0)
    throw Error(`You called Provable.if(bool, x, y) with an argument x that has no constructor, which is not supported.
If x, y are Structs or other custom types, you can use the following:
Provable.if(bool, MyType, x, y)`);
  if (type !== y.constructor && !(isField(x) && isField(y)) && !(isBool(x) && isBool(y))) {
    throw Error(`Provable.if: Mismatched argument types. Try using an explicit type argument:
Provable.if(bool, MyType, x, y)`);
  }
  if (!("fromFields" in type && "toFields" in type)) {
    throw Error(`Provable.if: Invalid argument type. Try using an explicit type argument:
Provable.if(bool, MyType, x, y)`);
  }
  return ifExplicit(condition, type, x, y);
}
function switch_(mask, type, values) {
  let nValues = values.length;
  if (mask.length !== nValues)
    throw Error(`Provable.switch: \`values\` and \`mask\` have different lengths (${values.length} vs. ${mask.length}), which is not allowed.`);
  let checkMask = () => {
    let nTrue = mask.filter((b2) => b2.toBoolean()).length;
    if (nTrue > 1) {
      throw Error(`Provable.switch: \`mask\` must have 0 or 1 true element, found ${nTrue}.`);
    }
  };
  if (mask.every((b2) => b2.toField().isConstant()))
    checkMask();
  else
    Provable.asProver(checkMask);
  let size = type.sizeInFields();
  let fields = Array(size).fill(Field4(0));
  for (let i2 = 0; i2 < nValues; i2++) {
    let valueFields = type.toFields(values[i2]);
    let maskField = mask[i2].toField();
    for (let j = 0; j < size; j++) {
      let maybeField = valueFields[j].mul(maskField);
      fields[j] = fields[j].add(maybeField);
    }
  }
  let aux = auxiliary(type, () => {
    let i2 = mask.findIndex((b2) => b2.toBoolean());
    if (i2 === -1)
      return void 0;
    return values[i2];
  });
  return type.fromFields(fields, aux);
}
function log(...args) {
  asProver(() => {
    let prettyArgs = [];
    for (let arg of args) {
      if (arg?.toPretty !== void 0)
        prettyArgs.push(arg.toPretty());
      else {
        try {
          prettyArgs.push(JSON.parse(JSON.stringify(arg)));
        } catch {
          prettyArgs.push(arg);
        }
      }
    }
    console.log(...prettyArgs);
  });
}
function checkLength(name, xs, ys) {
  let n = xs.length;
  let m = ys.length;
  if (n !== m) {
    throw Error(`${name}: inputs must contain the same number of field elements, got ${n} !== ${m}`);
  }
  return n;
}
function clone(type, value) {
  let fields = type.toFields(value);
  let aux = type.toAuxiliary?.(value) ?? [];
  return type.fromFields(fields, aux);
}
function auxiliary(type, compute) {
  let aux;
  Provable.asProver(() => {
    let value = compute();
    if (value !== void 0) {
      aux = type.toAuxiliary?.(value);
    }
  });
  return aux ?? type.toAuxiliary?.() ?? [];
}
var memoizationContext = Context.create();
function memoizeWitness(type, compute) {
  return Provable.witness(type, () => {
    if (!memoizationContext.has())
      return compute();
    let context = memoizationContext.get();
    let { memoized, currentIndex } = context;
    let currentValue = memoized[currentIndex];
    if (currentValue === void 0) {
      let value = compute();
      let fields = type.toFields(value).map((x) => x.toConstant());
      let aux = type.toAuxiliary(value);
      currentValue = { fields, aux };
      memoized[currentIndex] = currentValue;
    }
    context.currentIndex += 1;
    return type.fromFields(currentValue.fields, currentValue.aux);
  });
}
function getBlindingValue() {
  if (!memoizationContext.has())
    return Field4.random();
  let context = memoizationContext.get();
  if (context.blindingValue === void 0) {
    context.blindingValue = Field4.random();
  }
  return context.blindingValue;
}
function provableArray(elementType, length) {
  let type = elementType;
  return {
    /**
     * Returns the size of this structure in {@link Field} elements.
     * @returns size of this structure
     */
    sizeInFields() {
      let elementLength = type.sizeInFields();
      return elementLength * length;
    },
    /**
     * Serializes this structure into {@link Field} elements.
     * @returns an array of {@link Field} elements
     */
    toFields(array) {
      return array.map((e) => type.toFields(e)).flat();
    },
    /**
     * Serializes this structure's auxiliary data.
     * @returns auxiliary data
     */
    toAuxiliary(array) {
      let array_ = array ?? Array(length).fill(void 0);
      return array_?.map((e) => type.toAuxiliary(e));
    },
    /**
     * Deserializes an array of {@link Field} elements into this structure.
     */
    fromFields(fields, aux) {
      let array = [];
      let size = type.sizeInFields();
      let n = length;
      for (let i2 = 0, offset = 0; i2 < n; i2++, offset += size) {
        array[i2] = type.fromFields(fields.slice(offset, offset + size), aux?.[i2]);
      }
      return array;
    },
    check(array) {
      for (let i2 = 0; i2 < length; i2++) {
        type.check(array[i2]);
      }
    },
    /**
     * Encodes this structure into a JSON-like object.
     */
    toJSON(array) {
      if (!("toJSON" in type)) {
        throw Error("circuitArray.toJSON: element type has no toJSON method");
      }
      return array.map((v) => type.toJSON(v));
    },
    /**
     * Decodes a JSON-like object into this structure.
     */
    fromJSON(json) {
      if (!("fromJSON" in type)) {
        throw Error("circuitArray.fromJSON: element type has no fromJSON method");
      }
      return json.map((a2) => type.fromJSON(a2));
    },
    toInput(array) {
      if (!("toInput" in type)) {
        throw Error("circuitArray.toInput: element type has no toInput method");
      }
      return array.reduce((curr, value) => HashInput.append(curr, type.toInput(value)), HashInput.empty);
    }
  };
}

// dist/node/lib/group.js
var _Group_instances;
var _a3;
var _Group_fromAffine;
var _Group_fromProjective;
var _Group_toTuple;
var _Group_isConstant;
var _Group_toProjective;
var Group2 = class {
  /**
   * The generator `g` of the Group.
   */
  static get generator() {
    return new Group2({ x: Pallas.one.x, y: Pallas.one.y });
  }
  /**
   * Unique representation of the `zero` element of the Group (the identity element of addition in this Group).
   *
   * **Note**: The `zero` element is represented as `(0, 0)`.
   *
   * ```typescript
   * // g + -g = 0
   * g.add(g.neg()).assertEquals(zero);
   * // g + 0 = g
   * g.add(zero).assertEquals(g);
   * ```
   */
  static get zero() {
    return new Group2({
      x: 0,
      y: 0
    });
  }
  /**
   * Coerces anything group-like to a {@link Group}.
   */
  constructor({ x, y }) {
    _Group_instances.add(this);
    this.x = isField(x) ? x : new Field3(x);
    this.y = isField(y) ? y : new Field3(y);
    if ((0, import_tslib4.__classPrivateFieldGet)(this, _Group_instances, "m", _Group_isConstant).call(this)) {
      if (this.x.equals(0).and(this.y.equals(0)).toBoolean())
        return;
      const { add, mul, square } = Field;
      let x_bigint = this.x.toBigInt();
      let y_bigint = this.y.toBigInt();
      let onCurve = add(mul(x_bigint, mul(x_bigint, x_bigint)), Pallas.b) === square(y_bigint);
      if (!onCurve) {
        throw Error(`(x: ${x_bigint}, y: ${y_bigint}) is not a valid group element`);
      }
    }
  }
  /**
   * Checks if this element is the `zero` element `{x: 0, y: 0}`.
   */
  isZero() {
    return this.x.equals(0);
  }
  /**
   * Adds this {@link Group} element to another {@link Group} element.
   *
   * ```ts
   * let g1 = Group({ x: -1, y: 2})
   * let g2 = g1.add(g1)
   * ```
   */
  add(g) {
    var _b, _c, _d;
    if ((0, import_tslib4.__classPrivateFieldGet)(this, _Group_instances, "m", _Group_isConstant).call(this) && (0, import_tslib4.__classPrivateFieldGet)(g, _Group_instances, "m", _Group_isConstant).call(g)) {
      if (this.isZero().toBoolean()) {
        return g;
      } else if (g.isZero().toBoolean()) {
        return this;
      } else {
        let g_proj = Pallas.add((0, import_tslib4.__classPrivateFieldGet)(this, _Group_instances, "m", _Group_toProjective).call(this), (0, import_tslib4.__classPrivateFieldGet)(g, _Group_instances, "m", _Group_toProjective).call(g));
        return (0, import_tslib4.__classPrivateFieldGet)(Group2, _a3, "m", _Group_fromProjective).call(Group2, g_proj);
      }
    } else {
      const { x: x1, y: y1 } = this;
      const { x: x2, y: y2 } = g;
      let zero = new Field3(0);
      let same_x = Provable.witness(Field3, () => x1.equals(x2).toField());
      let inf = Provable.witness(Bool3, () => x1.equals(x2).and(y1.equals(y2).not()));
      let inf_z = Provable.witness(Field3, () => {
        if (y1.equals(y2).toBoolean())
          return zero;
        else if (x1.equals(x2).toBoolean())
          return y2.sub(y1).inv();
        else
          return zero;
      });
      let x21_inv = Provable.witness(Field3, () => {
        if (x1.equals(x2).toBoolean())
          return zero;
        else
          return x2.sub(x1).inv();
      });
      let s = Provable.witness(Field3, () => {
        if (x1.equals(x2).toBoolean()) {
          let x1_squared = x1.square();
          return x1_squared.add(x1_squared).add(x1_squared).div(y1.add(y1));
        } else
          return y2.sub(y1).div(x2.sub(x1));
      });
      let x3 = Provable.witness(Field3, () => {
        return s.square().sub(x1.add(x2));
      });
      let y3 = Provable.witness(Field3, () => {
        return s.mul(x1.sub(x3)).sub(y1);
      });
      let [, x, y] = Snarky.group.ecadd((0, import_tslib4.__classPrivateFieldGet)(_b = Group2.from(x1.seal(), y1.seal()), _Group_instances, "m", _Group_toTuple).call(_b), (0, import_tslib4.__classPrivateFieldGet)(_c = Group2.from(x2.seal(), y2.seal()), _Group_instances, "m", _Group_toTuple).call(_c), (0, import_tslib4.__classPrivateFieldGet)(_d = Group2.from(x3, y3), _Group_instances, "m", _Group_toTuple).call(_d), inf.toField().value, same_x.value, s.value, inf_z.value, x21_inv.value);
      let gIsZero = g.isZero();
      let thisIsZero = this.isZero();
      let bothZero = gIsZero.and(thisIsZero);
      let onlyGisZero = gIsZero.and(thisIsZero.not());
      let onlyThisIsZero = thisIsZero.and(gIsZero.not());
      let isNegation = inf;
      let isNewElement = bothZero.not().and(isNegation.not()).and(onlyThisIsZero.not()).and(onlyGisZero.not());
      const zero_g = Group2.zero;
      return Provable.switch([bothZero, onlyGisZero, onlyThisIsZero, isNegation, isNewElement], Group2, [zero_g, this, g, zero_g, new Group2({ x, y })]);
    }
  }
  /**
   * Subtracts another {@link Group} element from this one.
   */
  sub(g) {
    return this.add(g.neg());
  }
  /**
   * Negates this {@link Group}. Under the hood, it simply negates the `y` coordinate and leaves the `x` coordinate as is.
   */
  neg() {
    let { x, y } = this;
    return new Group2({ x, y: y.neg() });
  }
  /**
   * Elliptic curve scalar multiplication. Scales the {@link Group} element `n`-times by itself, where `n` is the {@link Scalar}.
   *
   * ```typescript
   * let s = Scalar(5);
   * let 5g = g.scale(s);
   * ```
   */
  scale(s) {
    let scalar = Scalar3.from(s);
    if ((0, import_tslib4.__classPrivateFieldGet)(this, _Group_instances, "m", _Group_isConstant).call(this) && scalar.isConstant()) {
      let g_proj = Pallas.scale((0, import_tslib4.__classPrivateFieldGet)(this, _Group_instances, "m", _Group_toProjective).call(this), scalar.toBigInt());
      return (0, import_tslib4.__classPrivateFieldGet)(Group2, _a3, "m", _Group_fromProjective).call(Group2, g_proj);
    } else {
      let [, ...bits2] = scalar.value;
      bits2.reverse();
      let [, x, y] = Snarky.group.scale((0, import_tslib4.__classPrivateFieldGet)(this, _Group_instances, "m", _Group_toTuple).call(this), [0, ...bits2]);
      return new Group2({ x, y });
    }
  }
  /**
   * Assert that this {@link Group} element equals another {@link Group} element.
   * Throws an error if the assertion fails.
   *
   * ```ts
   * g1.assertEquals(g2);
   * ```
   */
  assertEquals(g, message) {
    let { x: x1, y: y1 } = this;
    let { x: x2, y: y2 } = g;
    x1.assertEquals(x2, message);
    y1.assertEquals(y2, message);
  }
  /**
   * Check if this {@link Group} element equals another {@link Group} element.
   * Returns a {@link Bool}.
   *
   * ```ts
   * g1.equals(g1); // Bool(true)
   * ```
   */
  equals(g) {
    let { x: x1, y: y1 } = this;
    let { x: x2, y: y2 } = g;
    return x1.equals(x2).and(y1.equals(y2));
  }
  /**
   * Serializes this {@link Group} element to a JSON object.
   *
   * This operation does NOT affect the circuit and can't be used to prove anything about the representation of the element.
   */
  toJSON() {
    return {
      x: this.x.toString(),
      y: this.y.toString()
    };
  }
  /**
   * Part of the {@link Provable} interface.
   *
   * Returns an array containing this {@link Group} element as an array of {@link Field} elements.
   */
  toFields() {
    return [this.x, this.y];
  }
  /**
   * Coerces two x and y coordinates into a {@link Group} element.
   */
  static from(x, y) {
    return new Group2({ x, y });
  }
  /**
   * @deprecated Please use the method `.add` on the instance instead
   *
   * Adds a {@link Group} element to another one.
   */
  static add(g1, g2) {
    return g1.add(g2);
  }
  /**
   * @deprecated Please use the method `.sub` on the instance instead
   *
   * Subtracts a {@link Group} element from another one.
   */
  static sub(g1, g2) {
    return g1.sub(g2);
  }
  /**
   * @deprecated Please use the method `.neg` on the instance instead
   *
   * Negates a {@link Group} element. Under the hood, it simply negates the `y` coordinate and leaves the `x` coordinate as is.
   *
   * ```typescript
   * let gNeg = Group.neg(g);
   * ```
   */
  static neg(g) {
    return g.neg();
  }
  /**
   * @deprecated Please use the method `.scale` on the instance instead
   *
   * Elliptic curve scalar multiplication. Scales a {@link Group} element `n`-times by itself, where `n` is the {@link Scalar}.
   *
   * ```typescript
   * let s = Scalar(5);
   * let 5g = Group.scale(g, s);
   * ```
   */
  static scale(g, s) {
    return g.scale(s);
  }
  /**
   * @deprecated Please use the method `.assertEqual` on the instance instead.
   *
   * Assert that two {@link Group} elements are equal to another.
   * Throws an error if the assertion fails.
   *
   * ```ts
   * Group.assertEquals(g1, g2);
   * ```
   */
  static assertEqual(g1, g2) {
    g1.assertEquals(g2);
  }
  /**
   * @deprecated Please use the method `.equals` on the instance instead.
   *
   * Checks if a {@link Group} element is equal to another {@link Group} element.
   * Returns a {@link Bool}.
   *
   * ```ts
   * Group.equal(g1, g2); // Bool(true)
   * ```
   */
  static equal(g1, g2) {
    return g1.equals(g2);
  }
  /**
   * Part of the {@link Provable} interface.
   *
   * Returns an array containing a {@link Group} element as an array of {@link Field} elements.
   */
  static toFields(g) {
    return g.toFields();
  }
  /**
   * Part of the {@link Provable} interface.
   *
   * Returns an empty array.
   */
  static toAuxiliary(g) {
    return [];
  }
  /**
   * Part of the {@link Provable} interface.
   *
   * Deserializes a {@link Group} element from a list of field elements.
   */
  static fromFields([x, y]) {
    return new Group2({ x, y });
  }
  /**
   * Part of the {@link Provable} interface.
   *
   * Returns 2.
   */
  static sizeInFields() {
    return 2;
  }
  /**
   * Serializes a {@link Group} element to a JSON object.
   *
   * This operation does NOT affect the circuit and can't be used to prove anything about the representation of the element.
   */
  static toJSON(g) {
    return g.toJSON();
  }
  /**
   * Deserializes a JSON-like structure to a {@link Group} element.
   *
   * This operation does NOT affect the circuit and can't be used to prove anything about the representation of the element.
   */
  static fromJSON({ x, y }) {
    return new Group2({ x, y });
  }
  /**
   * Checks that a {@link Group} element is constraint properly by checking that the element is on the curve.
   */
  static check(g) {
    try {
      const { x, y } = g;
      let x2 = x.square();
      let x3 = x2.mul(x);
      let ax = x.mul(Pallas.a);
      let isZero = x.equals(0).and(y.equals(0));
      isZero.or(x3.add(ax).add(Pallas.b).equals(y.square())).assertTrue();
    } catch (error) {
      if (!(error instanceof Error))
        return error;
      throw `${`Element (x: ${g.x}, y: ${g.y}) is not an element of the group.`}
${error.message}`;
    }
  }
};
_a3 = Group2, _Group_instances = /* @__PURE__ */ new WeakSet(), _Group_fromAffine = function _Group_fromAffine2({ x, y, infinity }) {
  return infinity ? Group2.zero : new Group2({ x, y });
}, _Group_fromProjective = function _Group_fromProjective2({ x, y, z }) {
  return (0, import_tslib4.__classPrivateFieldGet)(this, _a3, "m", _Group_fromAffine).call(this, Pallas.toAffine({ x, y, z }));
}, _Group_toTuple = function _Group_toTuple2() {
  return [0, this.x.value, this.y.value];
}, _Group_isConstant = function _Group_isConstant2() {
  return this.x.isConstant() && this.y.isConstant();
}, _Group_toProjective = function _Group_toProjective2() {
  return Pallas.fromAffine({
    x: this.x.toBigInt(),
    y: this.y.toBigInt(),
    infinity: false
  });
};

// dist/node/lib/core.js
var Field4 = toFunctionConstructor(Field3);
var Bool4 = toFunctionConstructor(Bool3);
var Group3 = toFunctionConstructor(Group2);
function toFunctionConstructor(Class) {
  function Constructor(...args) {
    return new Class(...args);
  }
  Object.defineProperties(Constructor, Object.getOwnPropertyDescriptors(Class));
  return Constructor;
}

// dist/node/lib/circuit_value.js
var import_reflect_metadata = require("reflect-metadata");
var CircuitValue = class {
  constructor(...props) {
    if (props.length === 0)
      return;
    let fields = this.constructor.prototype._fields;
    if (fields === void 0)
      return;
    if (props.length !== fields.length) {
      throw Error(`${this.constructor.name} constructor called with ${props.length} arguments, but expected ${fields.length}`);
    }
    for (let i2 = 0; i2 < fields.length; ++i2) {
      let [key] = fields[i2];
      this[key] = props[i2];
    }
  }
  static fromObject(value) {
    return Object.assign(Object.create(this.prototype), value);
  }
  static sizeInFields() {
    const fields = this.prototype._fields;
    return fields.reduce((acc, [_, typ]) => acc + typ.sizeInFields(), 0);
  }
  static toFields(v) {
    const res = [];
    const fields = this.prototype._fields;
    if (fields === void 0 || fields === null) {
      return res;
    }
    for (let i2 = 0, n = fields.length; i2 < n; ++i2) {
      const [key, propType] = fields[i2];
      const subElts = propType.toFields(v[key]);
      subElts.forEach((x) => res.push(x));
    }
    return res;
  }
  static toAuxiliary() {
    return [];
  }
  static toInput(v) {
    let input = { fields: [], packed: [] };
    let fields = this.prototype._fields;
    if (fields === void 0)
      return input;
    for (let i2 = 0, n = fields.length; i2 < n; ++i2) {
      let [key, type] = fields[i2];
      if ("toInput" in type) {
        input = HashInput.append(input, type.toInput(v[key]));
        continue;
      }
      let xs = type.toFields(v[key]);
      input.fields.push(...xs);
    }
    return input;
  }
  toFields() {
    return this.constructor.toFields(this);
  }
  toJSON() {
    return this.constructor.toJSON(this);
  }
  toConstant() {
    return this.constructor.toConstant(this);
  }
  equals(x) {
    return Provable.equal(this, x);
  }
  assertEquals(x) {
    Provable.assertEqual(this, x);
  }
  isConstant() {
    return this.toFields().every((x) => x.isConstant());
  }
  static fromFields(xs) {
    const fields = this.prototype._fields;
    if (xs.length < fields.length) {
      throw Error(`${this.name}.fromFields: Expected ${fields.length} field elements, got ${xs?.length}`);
    }
    let offset = 0;
    const props = {};
    for (let i2 = 0; i2 < fields.length; ++i2) {
      const [key, propType] = fields[i2];
      const propSize = propType.sizeInFields();
      const propVal = propType.fromFields(xs.slice(offset, offset + propSize), []);
      props[key] = propVal;
      offset += propSize;
    }
    return Object.assign(Object.create(this.prototype), props);
  }
  static check(v) {
    const fields = this.prototype._fields;
    if (fields === void 0 || fields === null) {
      return;
    }
    for (let i2 = 0; i2 < fields.length; ++i2) {
      const [key, propType] = fields[i2];
      const value = v[key];
      if (propType.check === void 0)
        throw Error("bug: CircuitValue without .check()");
      propType.check(value);
    }
  }
  static toConstant(t) {
    const xs = this.toFields(t);
    return this.fromFields(xs.map((x) => x.toConstant()));
  }
  static toJSON(v) {
    const res = {};
    if (this.prototype._fields !== void 0) {
      const fields = this.prototype._fields;
      fields.forEach(([key, propType]) => {
        res[key] = propType.toJSON(v[key]);
      });
    }
    return res;
  }
  static fromJSON(value) {
    let props = {};
    let fields = this.prototype._fields;
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw Error(`${this.name}.fromJSON(): invalid input ${value}`);
    }
    if (fields !== void 0) {
      for (let i2 = 0; i2 < fields.length; ++i2) {
        let [key, propType] = fields[i2];
        if (value[key] === void 0) {
          throw Error(`${this.name}.fromJSON(): invalid input ${value}`);
        } else {
          props[key] = propType.fromJSON(value[key]);
        }
      }
    }
    return Object.assign(Object.create(this.prototype), props);
  }
};
function prop(target, key) {
  const fieldType = Reflect.getMetadata("design:type", target, key);
  if (!target.hasOwnProperty("_fields")) {
    target._fields = [];
  }
  if (fieldType === void 0) {
  } else if (fieldType.toFields && fieldType.fromFields) {
    target._fields.push([key, fieldType]);
  } else {
    console.log(`warning: property ${key} missing field element conversion methods`);
  }
}
function arrayProp(elementType, length) {
  return function(target, key) {
    if (!target.hasOwnProperty("_fields")) {
      target._fields = [];
    }
    target._fields.push([key, Provable.Array(elementType, length)]);
  };
}
function matrixProp(elementType, nRows, nColumns) {
  return function(target, key) {
    if (!target.hasOwnProperty("_fields")) {
      target._fields = [];
    }
    target._fields.push([
      key,
      Provable.Array(Provable.Array(elementType, nColumns), nRows)
    ]);
  };
}
function Struct(type, options = {}) {
  class Struct_ {
    constructor(value) {
      Object.assign(this, value);
    }
    /**
     * This method is for internal use, you will probably not need it.
     * @returns the size of this struct in field elements
     */
    static sizeInFields() {
      return this.type.sizeInFields();
    }
    /**
     * This method is for internal use, you will probably not need it.
     * @param value
     * @returns the raw list of field elements that represent this struct inside the proof
     */
    static toFields(value) {
      return this.type.toFields(value);
    }
    /**
     * This method is for internal use, you will probably not need it.
     * @param value
     * @returns the raw non-field element data contained in the struct
     */
    static toAuxiliary(value) {
      return this.type.toAuxiliary(value);
    }
    /**
     * This method is for internal use, you will probably not need it.
     * @param value
     * @returns a representation of this struct as field elements, which can be hashed efficiently
     */
    static toInput(value) {
      return this.type.toInput(value);
    }
    /**
     * Convert this struct to a JSON object, consisting only of numbers, strings, booleans, arrays and plain objects.
     * @param value
     * @returns a JSON representation of this struct
     */
    static toJSON(value) {
      return this.type.toJSON(value);
    }
    /**
     * Convert from a JSON object to an instance of this struct.
     * @param json
     * @returns a JSON representation of this struct
     */
    static fromJSON(json) {
      let value = this.type.fromJSON(json);
      let struct = Object.create(this.prototype);
      return Object.assign(struct, value);
    }
    /**
     * This method is for internal use, you will probably not need it.
     * Method to make assertions which should be always made whenever a struct of this type is created in a proof.
     * @param value
     */
    static check(value) {
      return this.type.check(value);
    }
    /**
     * This method is for internal use, you will probably not need it.
     * Recover a struct from its raw field elements and auxiliary data.
     * @param fields the raw fields elements
     * @param aux the raw non-field element data
     */
    static fromFields(fields, aux) {
      let value = this.type.fromFields(fields, aux);
      let struct = Object.create(this.prototype);
      return Object.assign(struct, value);
    }
  }
  Struct_.type = provable2(type, options);
  return Struct_;
}
var primitives = /* @__PURE__ */ new Set([Field4, Bool4, Scalar3, Group3]);
function isPrimitive(obj) {
  for (let P of primitives) {
    if (obj instanceof P)
      return true;
  }
  return false;
}
function cloneCircuitValue(obj) {
  if (typeof obj !== "object" || obj === null)
    return obj;
  if (obj.constructor?.name.includes("GenericArgument") || obj.constructor?.name.includes("Callback")) {
    return obj;
  }
  if (obj.constructor?.name.includes("AccountUpdate")) {
    return obj.constructor.clone(obj);
  }
  if (Array.isArray(obj))
    return obj.map(cloneCircuitValue);
  if (obj instanceof Set)
    return new Set([...obj].map(cloneCircuitValue));
  if (obj instanceof Map)
    return new Map([...obj].map(([k, v]) => [k, cloneCircuitValue(v)]));
  if (ArrayBuffer.isView(obj))
    return new obj.constructor(obj);
  if (isPrimitive(obj)) {
    return obj;
  }
  let propertyDescriptors = {};
  for (let [key, value] of Object.entries(obj)) {
    propertyDescriptors[key] = {
      value: cloneCircuitValue(value),
      writable: true,
      enumerable: true,
      configurable: true
    };
  }
  return Object.create(Object.getPrototypeOf(obj), propertyDescriptors);
}
function circuitValueEquals(a2, b2) {
  if (typeof a2 !== "object" || a2 === null || typeof b2 !== "object" || b2 === null)
    return a2 === b2;
  if (Array.isArray(a2)) {
    return Array.isArray(b2) && a2.length === b2.length && a2.every((a_, i2) => circuitValueEquals(a_, b2[i2]));
  }
  if (a2 instanceof Set) {
    return b2 instanceof Set && a2.size === b2.size && [...a2].every((a_) => b2.has(a_));
  }
  if (a2 instanceof Map) {
    return b2 instanceof Map && a2.size === b2.size && [...a2].every(([k, v]) => circuitValueEquals(v, b2.get(k)));
  }
  if (ArrayBuffer.isView(a2) && !(a2 instanceof DataView)) {
    return ArrayBuffer.isView(b2) && !(b2 instanceof DataView) && circuitValueEquals([...a2], [...b2]);
  }
  if ("equals" in a2 && typeof a2.equals === "function") {
    let isEqual = a2.equals(b2).toBoolean();
    if (typeof isEqual === "boolean")
      return isEqual;
    if (isEqual instanceof Bool4)
      return isEqual.toBoolean();
  }
  if ("toFields" in a2 && typeof a2.toFields === "function" && "toFields" in b2 && typeof b2.toFields === "function") {
    let aFields = a2.toFields();
    let bFields = b2.toFields();
    return aFields.every((a3, i2) => a3.equals(bFields[i2]).toBoolean());
  }
  let aEntries = Object.entries(a2).filter(([, v]) => v !== void 0);
  let bEntries = Object.entries(b2).filter(([, v]) => v !== void 0);
  if (aEntries.length !== bEntries.length)
    return false;
  return aEntries.every(([key, value]) => key in b2 && circuitValueEquals(b2[key], value));
}
function toConstant(type, value) {
  return type.fromFields(type.toFields(value).map((x) => x.toConstant()), type.toAuxiliary(value));
}

// dist/node/lib/hash-generic.js
function createHashHelpers(Field5, Hash3) {
  function salt2(prefix) {
    return Hash3.update(Hash3.initialState(), [prefixToField(Field5, prefix)]);
  }
  function emptyHashWithPrefix2(prefix) {
    return salt2(prefix)[0];
  }
  function hashWithPrefix3(prefix, input) {
    let init = salt2(prefix);
    return Hash3.update(init, input)[0];
  }
  return { salt: salt2, emptyHashWithPrefix: emptyHashWithPrefix2, hashWithPrefix: hashWithPrefix3 };
}

// dist/node/lib/ml/base.js
var MlArray = {
  to(arr) {
    return [0, ...arr];
  },
  from([, ...arr]) {
    return arr;
  }
};
var MlTuple = Object.assign(function MlTuple2(x, y) {
  return [0, x, y];
}, {
  from([, x, y]) {
    return [x, y];
  },
  first(t) {
    return t[1];
  },
  second(t) {
    return t[2];
  }
});
var MlBool = Object.assign(function MlBool2(b2) {
  return b2 ? 1 : 0;
}, {
  from(b2) {
    return !!b2;
  }
});

// dist/node/lib/ml/fields.js
var MlFieldArray = {
  to(arr) {
    return MlArray.to(arr.map((x) => x.value));
  },
  from([, ...arr]) {
    return arr.map((x) => new Field3(x));
  }
};
var MlFieldConstArray = {
  to(arr) {
    return MlArray.to(arr.map((x) => x.toConstant().value[1]));
  },
  from([, ...arr]) {
    return arr.map((x) => new Field3(x));
  }
};

// dist/node/bindings/crypto/poseidon.js
function fieldToGroup(x) {
  const { potentialXs, tryDecode } = GroupMapPallas;
  const xs = potentialXs(x);
  return xs.map((x2) => tryDecode(x2)).find((x2) => x2);
}
function makeHashToGroup(hash2) {
  return (input) => {
    let digest = hash2(input);
    let g = fieldToGroup(digest);
    if (g === void 0)
      return void 0;
    let isEven = g.y % 2n === 0n;
    let gy_neg = Fp.negate(g.y);
    return {
      x: g.x,
      y: {
        x0: isEven ? g.y : gy_neg,
        x1: isEven ? gy_neg : g.y
      }
    };
  };
}
var PoseidonSpec = createPoseidon(Fp, poseidonParamsKimchiFp);
var Poseidon = {
  ...PoseidonSpec,
  hashToGroup: makeHashToGroup(PoseidonSpec.hash)
};
var PoseidonLegacy = createPoseidon(Fp, poseidonParamsLegacyFp);
function createPoseidon(Fp2, { fullRounds, partialRounds, hasInitialRoundConstant, stateSize, rate, power: power_, roundConstants: roundConstants_, mds: mds_ }) {
  if (partialRounds !== 0) {
    throw Error("we don't support partial rounds");
  }
  assertPositiveInteger(rate, "rate must be a positive integer");
  assertPositiveInteger(fullRounds, "fullRounds must be a positive integer");
  assertPositiveInteger(power_, "power must be a positive integer");
  let power2 = BigInt(power_);
  let roundConstants = roundConstants_.map((arr) => arr.map(BigInt));
  let mds = mds_.map((arr) => arr.map(BigInt));
  function initialState() {
    return Array(stateSize).fill(0n);
  }
  function hash2(input) {
    let state3 = update(initialState(), input);
    return state3[0];
  }
  function update([...state3], input) {
    if (input.length === 0) {
      permutation(state3);
      return state3;
    }
    let n = Math.ceil(input.length / rate) * rate;
    input = input.concat(Array(n - input.length).fill(0n));
    for (let blockIndex = 0; blockIndex < n; blockIndex += rate) {
      for (let i2 = 0; i2 < rate; i2++) {
        state3[i2] = Fp2.add(state3[i2], input[blockIndex + i2]);
      }
      permutation(state3);
    }
    return state3;
  }
  function permutation(state3) {
    let offset = 0;
    if (hasInitialRoundConstant) {
      for (let i2 = 0; i2 < stateSize; i2++) {
        state3[i2] = Fp2.add(state3[i2], roundConstants[0][i2]);
      }
      offset = 1;
    }
    for (let round = 0; round < fullRounds; round++) {
      for (let i2 = 0; i2 < stateSize; i2++) {
        state3[i2] = Fp2.power(state3[i2], power2);
      }
      let oldState = [...state3];
      for (let i2 = 0; i2 < stateSize; i2++) {
        state3[i2] = Fp2.dot(mds[i2], oldState);
        state3[i2] = Fp2.add(state3[i2], roundConstants[round + offset][i2]);
      }
    }
  }
  return { initialState, update, hash: hash2 };
}

// dist/node/lib/hash.js
var Sponge = class {
  constructor() {
    let isChecked = Provable.inCheckedComputation();
    this.sponge = Snarky.poseidon.sponge.create(isChecked);
  }
  absorb(x) {
    Snarky.poseidon.sponge.absorb(this.sponge, x.value);
  }
  squeeze() {
    return Field4(Snarky.poseidon.sponge.squeeze(this.sponge));
  }
};
var Poseidon2 = {
  hash(input) {
    if (isConstant3(input)) {
      return Field4(Poseidon.hash(toBigints(input)));
    }
    return Poseidon2.update(this.initialState(), input)[0];
  },
  update(state3, input) {
    if (isConstant3(state3) && isConstant3(input)) {
      let newState2 = Poseidon.update(toBigints(state3), toBigints(input));
      return newState2.map(Field4);
    }
    let newState = Snarky.poseidon.update(MlFieldArray.to(state3), MlFieldArray.to(input));
    return MlFieldArray.from(newState);
  },
  hashToGroup(input) {
    if (isConstant3(input)) {
      let result = Poseidon.hashToGroup(toBigints(input));
      assert(result !== void 0, "hashToGroup works on all inputs");
      let { x: x2, y: y2 } = result;
      return {
        x: Field4(x2),
        y: { x0: Field4(y2.x0), x1: Field4(y2.x1) }
      };
    }
    let [, xv, yv] = Snarky.poseidon.hashToGroup(MlFieldArray.to(input));
    let x = Field4(xv);
    let y = Field4(yv);
    let x0 = Provable.witness(Field4, () => {
      let isEven = y.toBigInt() % 2n === 0n;
      return isEven ? y : y.mul(-1);
    });
    let x1 = x0.mul(-1);
    y.equals(x0).or(y.equals(x1)).assertTrue();
    return { x, y: { x0, x1 } };
  },
  initialState() {
    return [Field4(0), Field4(0), Field4(0)];
  },
  Sponge
};
function hashConstant(input) {
  return Field4(Poseidon.hash(toBigints(input)));
}
var Hash = createHashHelpers(Field4, Poseidon2);
var { salt, emptyHashWithPrefix, hashWithPrefix } = Hash;
function prefixToField2(prefix) {
  if (prefix.length * 8 >= 255)
    throw Error("prefix too long");
  let bits2 = [...prefix].map((char) => {
    let bits3 = [];
    for (let j = 0, c = char.charCodeAt(0); j < 8; j++, c >>= 1) {
      bits3.push(!!(c & 1));
    }
    return bits3;
  }).flat();
  return Field4.fromBits(bits2);
}
function packToFields({ fields = [], packed = [] }) {
  if (packed.length === 0)
    return fields;
  let packedBits = [];
  let currentPackedField = Field4(0);
  let currentSize = 0;
  for (let [field, size] of packed) {
    currentSize += size;
    if (currentSize < 255) {
      currentPackedField = currentPackedField.mul(Field4(1n << BigInt(size))).add(field);
    } else {
      packedBits.push(currentPackedField);
      currentSize = size;
      currentPackedField = field;
    }
  }
  packedBits.push(currentPackedField);
  return fields.concat(packedBits);
}
var TokenSymbolPure = {
  toFields({ field }) {
    return [field];
  },
  toAuxiliary(value) {
    return [value?.symbol ?? ""];
  },
  fromFields([field], [symbol]) {
    return { symbol, field };
  },
  sizeInFields() {
    return 1;
  },
  check({ field }) {
    let actual = field.rangeCheckHelper(48);
    actual.assertEquals(field);
  },
  toJSON({ symbol }) {
    return symbol;
  },
  fromJSON(symbol) {
    let field = prefixToField2(symbol);
    return { symbol, field };
  },
  toInput({ field }) {
    return { packed: [[field, 48]] };
  }
};
var TokenSymbol = class extends Struct(TokenSymbolPure) {
  static get empty() {
    return { symbol: "", field: Field4(0) };
  }
  static from(symbol) {
    let bytesLength = new TextEncoder().encode(symbol).length;
    if (bytesLength > 6)
      throw Error(`Token symbol ${symbol} should be a maximum of 6 bytes, but is ${bytesLength}`);
    let field = prefixToField2(symbol);
    return { symbol, field };
  }
};
function emptyReceiptChainHash() {
  return emptyHashWithPrefix("CodaReceiptEmpty");
}
function isConstant3(fields) {
  return fields.every((x) => x.isConstant());
}
function toBigints(fields) {
  return fields.map((x) => x.toBigInt());
}

// dist/node/lib/signature.js
var import_tslib5 = require("tslib");

// dist/node/mina-signer/src/signature.js
var import_blakejs = require("blakejs");

// dist/node/provable/poseidon-bigint.js
var HashInput2 = createHashInput();
var Hash2 = createHashHelpers(Field, Poseidon);
var { hashWithPrefix: hashWithPrefix2 } = Hash2;
var HashLegacy = createHashHelpers(Field, PoseidonLegacy);
function packToFields2({ fields = [], packed = [] }) {
  if (packed.length === 0)
    return fields;
  let packedBits = [];
  let currentPackedField = 0n;
  let currentSize = 0;
  for (let [field, size] of packed) {
    currentSize += size;
    if (currentSize < 255) {
      currentPackedField = currentPackedField * (1n << BigInt(size)) + field;
    } else {
      packedBits.push(currentPackedField);
      currentSize = size;
      currentPackedField = field;
    }
  }
  packedBits.push(currentPackedField);
  return fields.concat(packedBits);
}
function packToFieldsLegacy({ fields, bits: bits2 }) {
  let packedFields = [];
  while (bits2.length > 0) {
    let fieldBits = bits2.splice(0, sizeInBits - 1);
    let field = Field.fromBits(fieldBits);
    packedFields.push(field);
  }
  return fields.concat(packedFields);
}
var HashInputLegacy = {
  empty() {
    return { fields: [], bits: [] };
  },
  bits(bits2) {
    return { fields: [], bits: bits2 };
  },
  append(input1, input2) {
    return {
      fields: (input1.fields ?? []).concat(input2.fields ?? []),
      bits: (input1.bits ?? []).concat(input2.bits ?? [])
    };
  }
};

// dist/node/mina-signer/src/signature.js
var networkIdMainnet = 0x01n;
var networkIdTestnet = 0x00n;
var BinableSignature = withVersionNumber(record({ r: Field, s: Scalar }, ["r", "s"]), versionNumbers.signature);
var Signature = {
  ...BinableSignature,
  ...base58(BinableSignature, versionBytes.signature),
  toJSON({ r, s }) {
    return {
      field: Field.toJSON(r),
      scalar: Scalar.toJSON(s)
    };
  },
  fromJSON({ field, scalar }) {
    let r = Field.fromJSON(field);
    let s = Scalar.fromJSON(scalar);
    return { r, s };
  },
  dummy() {
    return { r: Field(1), s: Scalar(1) };
  }
};
function signFieldElement(message, privateKey, networkId) {
  return sign({ fields: [message] }, privateKey, networkId);
}
function verifyFieldElement(signature, message, publicKey, networkId) {
  return verify(signature, { fields: [message] }, publicKey, networkId);
}
function sign(message, privateKey, networkId) {
  let publicKey = Group.scale(Group.generatorMina, privateKey);
  let kPrime = deriveNonce(message, publicKey, privateKey, networkId);
  if (Scalar.equal(kPrime, 0n))
    throw Error("sign: derived nonce is 0");
  let { x: rx, y: ry } = Group.scale(Group.generatorMina, kPrime);
  let k = Field.isEven(ry) ? kPrime : Scalar.negate(kPrime);
  let e = hashMessage(message, publicKey, rx, networkId);
  let s = Scalar.add(k, Scalar.mul(e, privateKey));
  return { r: rx, s };
}
function deriveNonce(message, publicKey, privateKey, networkId) {
  let { x, y } = publicKey;
  let d = Field(privateKey);
  let id = networkId === "mainnet" ? networkIdMainnet : networkIdTestnet;
  let input = HashInput2.append(message, {
    fields: [x, y, d],
    packed: [[id, 8]]
  });
  let packedInput = packToFields2(input);
  let inputBits = packedInput.map(Field.toBits).flat();
  let inputBytes = bitsToBytes(inputBits);
  let bytes = (0, import_blakejs.blake2b)(Uint8Array.from(inputBytes), void 0, 32);
  bytes[bytes.length - 1] &= 63;
  return Scalar.fromBytes([...bytes]);
}
function hashMessage(message, publicKey, r, networkId) {
  let { x, y } = publicKey;
  let input = HashInput2.append(message, { fields: [x, y, r] });
  let prefix = networkId === "mainnet" ? prefixes.signatureMainnet : prefixes.signatureTestnet;
  return hashWithPrefix2(prefix, packToFields2(input));
}
function verify(signature, message, publicKey, networkId) {
  let { r, s } = signature;
  let pk = PublicKey.toGroup(publicKey);
  let e = hashMessage(message, pk, r, networkId);
  let { scale, one, sub } = Pallas;
  let R = sub(scale(one, s), scale(Group.toProjective(pk), e));
  try {
    let { x: rx, y: ry } = Group.fromProjective(R);
    return Field.isEven(ry) && Field.equal(rx, r);
  } catch {
    return false;
  }
}

// dist/node/lib/signature.js
var PrivateKey2 = class extends CircuitValue {
  constructor(s) {
    super(s);
  }
  /**
   * You can use this method to generate a private key. You can then obtain
   * the associated public key via {@link toPublicKey}. And generate signatures
   * via {@link Signature.create}.
   *
   * @returns a new {@link PrivateKey}.
   */
  static random() {
    return new PrivateKey2(Scalar3.random());
  }
  /**
   * Deserializes a list of bits into a {@link PrivateKey}.
   *
   * @param bs a list of {@link Bool}.
   * @returns a {@link PrivateKey}.
   */
  static fromBits(bs) {
    return new PrivateKey2(Scalar3.fromBits(bs));
  }
  /**
   * Convert this {@link PrivateKey} to a bigint
   */
  toBigInt() {
    return constantScalarToBigint(this.s, "PrivateKey.toBigInt");
  }
  /**
   * Create a {@link PrivateKey} from a bigint
   *
   * **Warning**: Private keys should be sampled from secure randomness with sufficient entropy.
   * Be careful that you don't use this method to create private keys that were sampled insecurely.
   */
  static fromBigInt(sk) {
    return new PrivateKey2(Scalar3.from(sk));
  }
  /**
   * Derives the associated public key.
   *
   * @returns a {@link PublicKey}.
   */
  toPublicKey() {
    return PublicKey2.fromPrivateKey(this);
  }
  /**
   * Decodes a base58 string into a {@link PrivateKey}.
   *
   * @returns a {@link PrivateKey}.
   */
  static fromBase58(privateKeyBase58) {
    let scalar = PrivateKey.fromBase58(privateKeyBase58);
    return new PrivateKey2(Scalar3.from(scalar));
  }
  /**
   * Encodes a {@link PrivateKey} into a base58 string.
   * @returns a base58 encoded string
   */
  toBase58() {
    return PrivateKey2.toBase58(this);
  }
  // static version, to operate on non-class versions of this type
  /**
   * Static method to encode a {@link PrivateKey} into a base58 string.
   * @returns a base58 encoded string
   */
  static toBase58(privateKey) {
    return PrivateKey.toBase58(constantScalarToBigint(privateKey.s, "PrivateKey.toBase58"));
  }
};
(0, import_tslib5.__decorate)([
  prop,
  (0, import_tslib5.__metadata)("design:type", Scalar3)
], PrivateKey2.prototype, "s", void 0);
var PublicKey2 = class extends CircuitValue {
  /**
   * Returns the {@link Group} representation of this {@link PublicKey}.
   * @returns A {@link Group}
   */
  toGroup() {
    let { x, isOdd } = this;
    let ySquared = x.mul(x).mul(x).add(5);
    let someY = ySquared.sqrt();
    let isTheRightY = isOdd.equals(someY.toBits()[0]);
    let y = isTheRightY.toField().mul(someY).add(isTheRightY.not().toField().mul(someY.neg()));
    return new Group3({ x, y });
  }
  /**
   * Creates a {@link PublicKey} from a {@link Group} element.
   * @returns a {@link PublicKey}.
   */
  static fromGroup({ x, y }) {
    let isOdd = y.toBits()[0];
    return PublicKey2.fromObject({ x, isOdd });
  }
  /**
   * Derives a {@link PublicKey} from a {@link PrivateKey}.
   * @returns a {@link PublicKey}.
   */
  static fromPrivateKey({ s }) {
    return PublicKey2.fromGroup(Group3.generator.scale(s));
  }
  /**
   * Creates a {@link PublicKey} from a JSON structure element.
   * @returns a {@link PublicKey}.
   */
  static from(g) {
    return PublicKey2.fromObject(g);
  }
  /**
   * Creates an empty {@link PublicKey}.
   * @returns an empty {@link PublicKey}
   */
  static empty() {
    return PublicKey2.from({ x: Field4(0), isOdd: Bool4(false) });
  }
  /**
   * Checks if a {@link PublicKey} is empty.
   * @returns a {@link Bool}
   */
  isEmpty() {
    return this.x.isZero();
  }
  /**
   * Decodes a base58 encoded {@link PublicKey} into a {@link PublicKey}.
   * @returns a {@link PublicKey}
   */
  static fromBase58(publicKeyBase58) {
    let { x, isOdd } = PublicKey.fromBase58(publicKeyBase58);
    return PublicKey2.from({ x: Field4(x), isOdd: Bool4(!!isOdd) });
  }
  /**
   * Encodes a {@link PublicKey} in base58 format.
   * @returns a base58 encoded {@link PublicKey}
   */
  toBase58() {
    return PublicKey2.toBase58(this);
  }
  /**
   * Static method to encode a {@link PublicKey} into base58 format.
   * @returns a base58 encoded {@link PublicKey}
   */
  static toBase58({ x, isOdd }) {
    x = toConstantField(x, "toBase58", "pk", "public key");
    return PublicKey.toBase58({
      x: x.toBigInt(),
      isOdd: Bool(isOdd.toBoolean())
    });
  }
  /**
   * Serializes a {@link PublicKey} into its JSON representation.
   * @returns a JSON string
   */
  static toJSON(publicKey) {
    return publicKey.toBase58();
  }
  /**
   * Deserializes a JSON string into a {@link PublicKey}.
   * @returns a JSON string
   */
  static fromJSON(publicKey) {
    return PublicKey2.fromBase58(publicKey);
  }
};
(0, import_tslib5.__decorate)([
  prop,
  (0, import_tslib5.__metadata)("design:type", Field4)
], PublicKey2.prototype, "x", void 0);
(0, import_tslib5.__decorate)([
  prop,
  (0, import_tslib5.__metadata)("design:type", Bool4)
], PublicKey2.prototype, "isOdd", void 0);
var Signature2 = class extends CircuitValue {
  /**
   * Signs a message using a {@link PrivateKey}.
   * @returns a {@link Signature}
   */
  static create(privKey, msg) {
    const publicKey = PublicKey2.fromPrivateKey(privKey).toGroup();
    const d = privKey.s;
    const kPrime = Scalar3.fromBigInt(deriveNonce({ fields: msg.map((f) => f.toBigInt()) }, { x: publicKey.x.toBigInt(), y: publicKey.y.toBigInt() }, BigInt(d.toJSON()), "testnet"));
    let { x: r, y: ry } = Group3.generator.scale(kPrime);
    const k = ry.toBits()[0].toBoolean() ? kPrime.neg() : kPrime;
    let h = hashWithPrefix(prefixes.signatureTestnet, msg.concat([publicKey.x, publicKey.y, r]));
    let e = unshift2(Scalar3.fromBits(h.toBits()));
    const s = e.mul(d).add(k);
    return new Signature2(r, s);
  }
  /**
   * Verifies the {@link Signature} using a message and the corresponding {@link PublicKey}.
   * @returns a {@link Bool}
   */
  verify(publicKey, msg) {
    const point = publicKey.toGroup();
    let h = hashWithPrefix(prefixes.signatureTestnet, msg.concat([point.x, point.y, this.r]));
    let e = Scalar3.fromBits(h.toBits());
    let r = scaleShifted(point, e).neg().add(Group3.generator.scale(this.s));
    return Bool4.and(r.x.equals(this.r), r.y.toBits()[0].equals(false));
  }
  /**
   * Decodes a base58 encoded signature into a {@link Signature}.
   */
  static fromBase58(signatureBase58) {
    let { r, s } = Signature.fromBase58(signatureBase58);
    return Signature2.fromObject({
      r: Field4(r),
      s: Scalar3.fromJSON(s.toString())
    });
  }
  /**
   * Encodes a {@link Signature} in base58 format.
   */
  toBase58() {
    let r = this.r.toBigInt();
    let s = BigInt(this.s.toJSON());
    return Signature.toBase58({ r, s });
  }
};
(0, import_tslib5.__decorate)([
  prop,
  (0, import_tslib5.__metadata)("design:type", Field4)
], Signature2.prototype, "r", void 0);
(0, import_tslib5.__decorate)([
  prop,
  (0, import_tslib5.__metadata)("design:type", Scalar3)
], Signature2.prototype, "s", void 0);
function scaleShifted(point, shiftedScalar) {
  let oneHalfGroup = point.scale(Scalar3.fromBigInt(oneHalf2));
  let shiftGroup = oneHalfGroup.scale(Scalar3.fromBigInt(shift2));
  return oneHalfGroup.scale(shiftedScalar).sub(shiftGroup);
}
function unshift2(shiftedScalar) {
  return shiftedScalar.sub(Scalar3.fromBigInt(shift2)).mul(Scalar3.fromBigInt(oneHalf2));
}
var shift2 = Scalar(1n + 2n ** 255n);
var oneHalf2 = Scalar.inverse(2n);

// dist/node/lib/circuit.js
var Circuit = class {
  /**
   * Generates a proving key and a verification key for this circuit.
   * @example
   * ```ts
   * const keypair = await MyCircuit.generateKeypair();
   * ```
   */
  static generateKeypair() {
    let main = mainFromCircuitData(this._main);
    let publicInputSize = this._main.publicInputType.sizeInFields();
    return prettifyStacktracePromise(withThreadPool(async () => {
      let keypair = Snarky.circuit.compile(main, publicInputSize);
      return new Keypair(keypair);
    }));
  }
  /**
   * Proves a statement using the private input, public input, and the {@link Keypair} of the circuit.
   * @example
   * ```ts
   * const keypair = await MyCircuit.generateKeypair();
   * const proof = await MyCircuit.prove(privateInput, publicInput, keypair);
   * ```
   */
  static prove(privateInput, publicInput, keypair) {
    let main = mainFromCircuitData(this._main, privateInput);
    let publicInputSize = this._main.publicInputType.sizeInFields();
    let publicInputFields = this._main.publicInputType.toFields(publicInput);
    return prettifyStacktracePromise(withThreadPool(async () => {
      let proof = Snarky.circuit.prove(main, publicInputSize, MlFieldConstArray.to(publicInputFields), keypair.value);
      return new Proof(proof);
    }));
  }
  /**
   * Verifies a proof using the public input, the proof, and the initial {@link Keypair} of the circuit.
   * @example
   * ```ts
   * const keypair = await MyCircuit.generateKeypair();
   * const proof = await MyCircuit.prove(privateInput, publicInput, keypair);
   * const isValid = await MyCircuit.verify(publicInput, keypair.vk, proof);
   * ```
   */
  static verify(publicInput, verificationKey, proof) {
    let publicInputFields = this._main.publicInputType.toFields(publicInput);
    return prettifyStacktracePromise(withThreadPool(async () => Snarky.circuit.verify(MlFieldConstArray.to(publicInputFields), proof.value, verificationKey.value)));
  }
};
Circuit.witness = Provable.witness;
Circuit.asProver = Provable.asProver;
Circuit.runAndCheck = Provable.runAndCheck;
Circuit.runUnchecked = Provable.runUnchecked;
Circuit.constraintSystem = Provable.constraintSystem;
Circuit.array = Provable.Array;
Circuit.assertEqual = Provable.assertEqual;
Circuit.equal = Provable.equal;
Circuit.if = Provable.if;
Circuit.switch = Provable.switch;
Circuit.inProver = Provable.inProver;
Circuit.inCheckedComputation = Provable.inCheckedComputation;
Circuit.log = Provable.log;
var Keypair = class {
  constructor(value) {
    this.value = value;
  }
  verificationKey() {
    return new VerificationKey(Snarky.circuit.keypair.getVerificationKey(this.value));
  }
  /**
   * Returns a low-level JSON representation of the {@link Circuit} from its {@link Keypair}:
   * a list of gates, each of which represents a row in a table, with certain coefficients and wires to other (row, column) pairs
   * @example
   * ```ts
   * const keypair = await MyCircuit.generateKeypair();
   * const json = MyProvable.witnessFromKeypair(keypair);
   * ```
   */
  constraintSystem() {
    try {
      return gatesFromJson(Snarky.circuit.keypair.getConstraintSystemJSON(this.value)).gates;
    } catch (error) {
      throw prettifyStacktrace(error);
    }
  }
};
var Proof = class {
  constructor(value) {
    this.value = value;
  }
};
var VerificationKey = class {
  constructor(value) {
    this.value = value;
  }
};
function public_(target, _key, index) {
  if (target._public === void 0) {
    target._public = [];
  }
  target._public.push(index);
}
function mainFromCircuitData(data, privateInput) {
  return function main(publicInputFields) {
    let id = snarkContext.enter({ inCheckedComputation: true });
    try {
      let publicInput = data.publicInputType.fromFields(MlFieldArray.from(publicInputFields));
      let privateInput_ = Provable.witness(data.privateInputType, () => privateInput);
      data.main(publicInput, privateInput_);
    } finally {
      snarkContext.leave(id);
    }
  };
}
function circuitMain(target, propertyName, _descriptor) {
  const paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyName);
  const numArgs = paramTypes.length;
  const publicIndexSet = new Set(target._public);
  const witnessIndexSet = /* @__PURE__ */ new Set();
  for (let i2 = 0; i2 < numArgs; ++i2) {
    if (!publicIndexSet.has(i2))
      witnessIndexSet.add(i2);
  }
  target._main = {
    main(publicInput, privateInput) {
      let args = [];
      for (let i2 = 0; i2 < numArgs; ++i2) {
        let nextInput = publicIndexSet.has(i2) ? publicInput : privateInput;
        args.push(nextInput.shift());
      }
      return target[propertyName].apply(target, args);
    },
    publicInputType: provableFromTuple(Array.from(publicIndexSet).map((i2) => paramTypes[i2])),
    privateInputType: provableFromTuple(Array.from(witnessIndexSet).map((i2) => paramTypes[i2]))
  };
}
function provableFromTuple(typs) {
  return {
    sizeInFields: () => {
      return typs.reduce((acc, typ) => acc + typ.sizeInFields(), 0);
    },
    toFields: (t) => {
      if (t.length !== typs.length) {
        throw new Error(`typOfArray: Expected ${typs.length}, got ${t.length}`);
      }
      let res = [];
      for (let i2 = 0; i2 < t.length; ++i2) {
        res.push(...typs[i2].toFields(t[i2]));
      }
      return res;
    },
    toAuxiliary() {
      return [];
    },
    fromFields: (xs) => {
      let offset = 0;
      let res = [];
      typs.forEach((typ) => {
        const n = typ.sizeInFields();
        res.push(typ.fromFields(xs.slice(offset, offset + n)));
        offset += n;
      });
      return res;
    },
    check(xs) {
      typs.forEach((typ, i2) => typ.check(xs[i2]));
    }
  };
}

// dist/node/lib/int.js
var import_tslib6 = require("tslib");
var UInt642 = class extends CircuitValue {
  /**
   * Static method to create a {@link UInt64} with value `0`.
   */
  static get zero() {
    return new UInt642(Field4(0));
  }
  /**
   * Static method to create a {@link UInt64} with value `1`.
   */
  static get one() {
    return new UInt642(Field4(1));
  }
  /**
   * Turns the {@link UInt64} into a string.
   * @returns
   */
  toString() {
    return this.value.toString();
  }
  /**
   * Turns the {@link UInt64} into a {@link BigInt}.
   * @returns
   */
  toBigInt() {
    return this.value.toBigInt();
  }
  /**
   * Turns the {@link UInt64} into a {@link UInt32}, asserting that it fits in 32 bits.
   */
  toUInt32() {
    let uint322 = new UInt322(this.value);
    UInt322.check(uint322);
    return uint322;
  }
  /**
   * Turns the {@link UInt64} into a {@link UInt32}, clamping to the 32 bits range if it's too large.
   * ```ts
   * UInt64.from(4294967296).toUInt32Clamped().toString(); // "4294967295"
   * ```
   */
  toUInt32Clamped() {
    let max = (1n << 32n) - 1n;
    return Provable.if(this.greaterThan(UInt642.from(max)), UInt322.from(max), new UInt322(this.value));
  }
  static check(x) {
    let actual = x.value.rangeCheckHelper(64);
    actual.assertEquals(x.value);
  }
  static toInput(x) {
    return { packed: [[x.value, 64]] };
  }
  /**
   * Encodes this structure into a JSON-like object.
   */
  static toJSON(x) {
    return x.value.toString();
  }
  /**
   * Decodes a JSON-like object into this structure.
   */
  static fromJSON(x) {
    return this.from(x);
  }
  static checkConstant(x) {
    if (!x.isConstant())
      return x;
    let xBig = x.toBigInt();
    if (xBig < 0n || xBig >= 1n << BigInt(this.NUM_BITS)) {
      throw Error(`UInt64: Expected number between 0 and 2^64 - 1, got ${xBig}`);
    }
    return x;
  }
  // this checks the range if the argument is a constant
  /**
   * Creates a new {@link UInt64}.
   */
  static from(x) {
    if (x instanceof UInt642 || x instanceof UInt322)
      x = x.value;
    return new this(this.checkConstant(Field4(x)));
  }
  /**
   * Creates a {@link UInt64} with a value of 18,446,744,073,709,551,615.
   */
  static MAXINT() {
    return new UInt642(Field4((1n << 64n) - 1n));
  }
  /**
   * Integer division with remainder.
   *
   * `x.divMod(y)` returns the quotient and the remainder.
   */
  divMod(y) {
    let x = this.value;
    let y_ = UInt642.from(y).value;
    if (this.value.isConstant() && y_.isConstant()) {
      let xn = x.toBigInt();
      let yn = y_.toBigInt();
      let q4 = xn / yn;
      let r2 = xn - q4 * yn;
      return {
        quotient: new UInt642(Field4(q4)),
        rest: new UInt642(Field4(r2))
      };
    }
    y_ = y_.seal();
    let q3 = Provable.witness(Field4, () => new Field4(x.toBigInt() / y_.toBigInt()));
    q3.rangeCheckHelper(UInt642.NUM_BITS).assertEquals(q3);
    let r = x.sub(q3.mul(y_)).seal();
    r.rangeCheckHelper(UInt642.NUM_BITS).assertEquals(r);
    let r_ = new UInt642(r);
    let q_ = new UInt642(q3);
    r_.assertLessThan(new UInt642(y_));
    return { quotient: q_, rest: r_ };
  }
  /**
   * Integer division.
   *
   * `x.div(y)` returns the floor of `x / y`, that is, the greatest
   * `z` such that `z * y <= x`.
   *
   */
  div(y) {
    return this.divMod(y).quotient;
  }
  /**
   * Integer remainder.
   *
   * `x.mod(y)` returns the value `z` such that `0 <= z < y` and
   * `x - z` is divisble by `y`.
   */
  mod(y) {
    return this.divMod(y).rest;
  }
  /**
   * Multiplication with overflow checking.
   */
  mul(y) {
    let z = this.value.mul(UInt642.from(y).value);
    z.rangeCheckHelper(UInt642.NUM_BITS).assertEquals(z);
    return new UInt642(z);
  }
  /**
   * Addition with overflow checking.
   */
  add(y) {
    let z = this.value.add(UInt642.from(y).value);
    z.rangeCheckHelper(UInt642.NUM_BITS).assertEquals(z);
    return new UInt642(z);
  }
  /**
   * Subtraction with underflow checking.
   */
  sub(y) {
    let z = this.value.sub(UInt642.from(y).value);
    z.rangeCheckHelper(UInt642.NUM_BITS).assertEquals(z);
    return new UInt642(z);
  }
  /**
   * @deprecated Use {@link lessThanOrEqual} instead.
   *
   * Checks if a {@link UInt64} is less than or equal to another one.
   */
  lte(y) {
    if (this.value.isConstant() && y.value.isConstant()) {
      return Bool4(this.value.toBigInt() <= y.value.toBigInt());
    } else {
      let xMinusY = this.value.sub(y.value).seal();
      let yMinusX = xMinusY.neg();
      let xMinusYFits = xMinusY.rangeCheckHelper(UInt642.NUM_BITS).equals(xMinusY);
      let yMinusXFits = yMinusX.rangeCheckHelper(UInt642.NUM_BITS).equals(yMinusX);
      xMinusYFits.or(yMinusXFits).assertEquals(true);
      return yMinusXFits;
    }
  }
  /**
   * Checks if a {@link UInt64} is less than or equal to another one.
   */
  lessThanOrEqual(y) {
    if (this.value.isConstant() && y.value.isConstant()) {
      return Bool4(this.value.toBigInt() <= y.value.toBigInt());
    } else {
      let xMinusY = this.value.sub(y.value).seal();
      let yMinusX = xMinusY.neg();
      let xMinusYFits = xMinusY.rangeCheckHelper(UInt642.NUM_BITS).equals(xMinusY);
      let yMinusXFits = yMinusX.rangeCheckHelper(UInt642.NUM_BITS).equals(yMinusX);
      xMinusYFits.or(yMinusXFits).assertEquals(true);
      return yMinusXFits;
    }
  }
  /**
   * @deprecated Use {@link assertLessThanOrEqual} instead.
   *
   * Asserts that a {@link UInt64} is less than or equal to another one.
   */
  assertLte(y, message) {
    this.assertLessThanOrEqual(y, message);
  }
  /**
   * Asserts that a {@link UInt64} is less than or equal to another one.
   */
  assertLessThanOrEqual(y, message) {
    if (this.value.isConstant() && y.value.isConstant()) {
      let x0 = this.value.toBigInt();
      let y0 = y.value.toBigInt();
      if (x0 > y0) {
        if (message !== void 0)
          throw Error(message);
        throw Error(`UInt64.assertLessThanOrEqual: expected ${x0} <= ${y0}`);
      }
      return;
    }
    let yMinusX = y.value.sub(this.value).seal();
    yMinusX.rangeCheckHelper(UInt642.NUM_BITS).assertEquals(yMinusX, message);
  }
  /**
   * @deprecated Use {@link lessThan} instead.
   *
   * Checks if a {@link UInt64} is less than another one.
   */
  lt(y) {
    return this.lessThanOrEqual(y).and(this.value.equals(y.value).not());
  }
  /**
   *
   * Checks if a {@link UInt64} is less than another one.
   */
  lessThan(y) {
    return this.lessThanOrEqual(y).and(this.value.equals(y.value).not());
  }
  /**
   *
   * @deprecated Use {@link assertLessThan} instead.
   *
   * Asserts that a {@link UInt64} is less than another one.
   */
  assertLt(y, message) {
    this.lessThan(y).assertEquals(true, message);
  }
  /**
   * Asserts that a {@link UInt64} is less than another one.
   */
  assertLessThan(y, message) {
    this.lessThan(y).assertEquals(true, message);
  }
  /**
   * @deprecated Use {@link greaterThan} instead.
   *
   * Checks if a {@link UInt64} is greater than another one.
   */
  gt(y) {
    return y.lessThan(this);
  }
  /**
   * Checks if a {@link UInt64} is greater than another one.
   */
  greaterThan(y) {
    return y.lessThan(this);
  }
  /**
   * @deprecated Use {@link assertGreaterThan} instead.
   *
   * Asserts that a {@link UInt64} is greater than another one.
   */
  assertGt(y, message) {
    y.assertLessThan(this, message);
  }
  /**
   * Asserts that a {@link UInt64} is greater than another one.
   */
  assertGreaterThan(y, message) {
    y.assertLessThan(this, message);
  }
  /**
   * @deprecated Use {@link greaterThanOrEqual} instead.
   *
   * Checks if a {@link UInt64} is greater than or equal to another one.
   */
  gte(y) {
    return this.lessThan(y).not();
  }
  /**
   * Checks if a {@link UInt64} is greater than or equal to another one.
   */
  greaterThanOrEqual(y) {
    return this.lessThan(y).not();
  }
  /**
   * @deprecated Use {@link assertGreaterThanOrEqual} instead.
   *
   * Asserts that a {@link UInt64} is greater than or equal to another one.
   */
  assertGte(y, message) {
    y.assertLessThanOrEqual(this, message);
  }
  /**
   * Asserts that a {@link UInt64} is greater than or equal to another one.
   */
  assertGreaterThanOrEqual(y, message) {
    y.assertLessThanOrEqual(this, message);
  }
};
UInt642.NUM_BITS = 64;
(0, import_tslib6.__decorate)([
  prop,
  (0, import_tslib6.__metadata)("design:type", Field4)
], UInt642.prototype, "value", void 0);
var UInt322 = class extends CircuitValue {
  /**
   * Static method to create a {@link UInt32} with value `0`.
   */
  static get zero() {
    return new UInt322(Field4(0));
  }
  /**
   * Static method to create a {@link UInt32} with value `0`.
   */
  static get one() {
    return new UInt322(Field4(1));
  }
  /**
   * Turns the {@link UInt32} into a string.
   */
  toString() {
    return this.value.toString();
  }
  /**
   * Turns the {@link UInt32} into a {@link BigInt}.
   */
  toBigint() {
    return this.value.toBigInt();
  }
  /**
   * Turns the {@link UInt32} into a {@link UInt64}.
   */
  toUInt64() {
    return new UInt642(this.value);
  }
  static check(x) {
    let actual = x.value.rangeCheckHelper(32);
    actual.assertEquals(x.value);
  }
  static toInput(x) {
    return { packed: [[x.value, 32]] };
  }
  /**
   * Encodes this structure into a JSON-like object.
   */
  static toJSON(x) {
    return x.value.toString();
  }
  /**
   * Decodes a JSON-like object into this structure.
   */
  static fromJSON(x) {
    return this.from(x);
  }
  static checkConstant(x) {
    if (!x.isConstant())
      return x;
    let xBig = x.toBigInt();
    if (xBig < 0n || xBig >= 1n << BigInt(this.NUM_BITS)) {
      throw Error(`UInt32: Expected number between 0 and 2^32 - 1, got ${xBig}`);
    }
    return x;
  }
  // this checks the range if the argument is a constant
  /**
   * Creates a new {@link UInt32}.
   */
  static from(x) {
    if (x instanceof UInt322)
      x = x.value;
    return new this(this.checkConstant(Field4(x)));
  }
  /**
   * Creates a {@link UInt32} with a value of 4,294,967,295.
   */
  static MAXINT() {
    return new UInt322(Field4((1n << 32n) - 1n));
  }
  /**
   * Integer division with remainder.
   *
   * `x.divMod(y)` returns the quotient and the remainder.
   */
  divMod(y) {
    let x = this.value;
    let y_ = UInt322.from(y).value;
    if (x.isConstant() && y_.isConstant()) {
      let xn = x.toBigInt();
      let yn = y_.toBigInt();
      let q4 = xn / yn;
      let r2 = xn - q4 * yn;
      return {
        quotient: new UInt322(new Field4(q4.toString())),
        rest: new UInt322(new Field4(r2.toString()))
      };
    }
    y_ = y_.seal();
    let q3 = Provable.witness(Field4, () => new Field4(x.toBigInt() / y_.toBigInt()));
    q3.rangeCheckHelper(UInt322.NUM_BITS).assertEquals(q3);
    let r = x.sub(q3.mul(y_)).seal();
    r.rangeCheckHelper(UInt322.NUM_BITS).assertEquals(r);
    let r_ = new UInt322(r);
    let q_ = new UInt322(q3);
    r_.assertLessThan(new UInt322(y_));
    return { quotient: q_, rest: r_ };
  }
  /**
   * Integer division.
   *
   * `x.div(y)` returns the floor of `x / y`, that is, the greatest
   * `z` such that `x * y <= x`.
   *
   */
  div(y) {
    return this.divMod(y).quotient;
  }
  /**
   * Integer remainder.
   *
   * `x.mod(y)` returns the value `z` such that `0 <= z < y` and
   * `x - z` is divisble by `y`.
   */
  mod(y) {
    return this.divMod(y).rest;
  }
  /**
   * Multiplication with overflow checking.
   */
  mul(y) {
    let z = this.value.mul(UInt322.from(y).value);
    z.rangeCheckHelper(UInt322.NUM_BITS).assertEquals(z);
    return new UInt322(z);
  }
  /**
   * Addition with overflow checking.
   */
  add(y) {
    let z = this.value.add(UInt322.from(y).value);
    z.rangeCheckHelper(UInt322.NUM_BITS).assertEquals(z);
    return new UInt322(z);
  }
  /**
   * Subtraction with underflow checking.
   */
  sub(y) {
    let z = this.value.sub(UInt322.from(y).value);
    z.rangeCheckHelper(UInt322.NUM_BITS).assertEquals(z);
    return new UInt322(z);
  }
  /**
   * @deprecated Use {@link lessThanOrEqual} instead.
   *
   * Checks if a {@link UInt32} is less than or equal to another one.
   */
  lte(y) {
    if (this.value.isConstant() && y.value.isConstant()) {
      return Bool4(this.value.toBigInt() <= y.value.toBigInt());
    } else {
      let xMinusY = this.value.sub(y.value).seal();
      let yMinusX = xMinusY.neg();
      let xMinusYFits = xMinusY.rangeCheckHelper(UInt322.NUM_BITS).equals(xMinusY);
      let yMinusXFits = yMinusX.rangeCheckHelper(UInt322.NUM_BITS).equals(yMinusX);
      xMinusYFits.or(yMinusXFits).assertEquals(true);
      return yMinusXFits;
    }
  }
  /**
   * Checks if a {@link UInt32} is less than or equal to another one.
   */
  lessThanOrEqual(y) {
    if (this.value.isConstant() && y.value.isConstant()) {
      return Bool4(this.value.toBigInt() <= y.value.toBigInt());
    } else {
      let xMinusY = this.value.sub(y.value).seal();
      let yMinusX = xMinusY.neg();
      let xMinusYFits = xMinusY.rangeCheckHelper(UInt322.NUM_BITS).equals(xMinusY);
      let yMinusXFits = yMinusX.rangeCheckHelper(UInt322.NUM_BITS).equals(yMinusX);
      xMinusYFits.or(yMinusXFits).assertEquals(true);
      return yMinusXFits;
    }
  }
  /**
   * @deprecated Use {@link assertLessThanOrEqual} instead.
   *
   * Asserts that a {@link UInt32} is less than or equal to another one.
   */
  assertLte(y, message) {
    this.assertLessThanOrEqual(y, message);
  }
  /**
   * Asserts that a {@link UInt32} is less than or equal to another one.
   */
  assertLessThanOrEqual(y, message) {
    if (this.value.isConstant() && y.value.isConstant()) {
      let x0 = this.value.toBigInt();
      let y0 = y.value.toBigInt();
      if (x0 > y0) {
        if (message !== void 0)
          throw Error(message);
        throw Error(`UInt32.assertLessThanOrEqual: expected ${x0} <= ${y0}`);
      }
      return;
    }
    let yMinusX = y.value.sub(this.value).seal();
    yMinusX.rangeCheckHelper(UInt322.NUM_BITS).assertEquals(yMinusX, message);
  }
  /**
   * @deprecated Use {@link lessThan} instead.
   *
   * Checks if a {@link UInt32} is less than another one.
   */
  lt(y) {
    return this.lessThanOrEqual(y).and(this.value.equals(y.value).not());
  }
  /**
   * Checks if a {@link UInt32} is less than another one.
   */
  lessThan(y) {
    return this.lessThanOrEqual(y).and(this.value.equals(y.value).not());
  }
  /**
   * @deprecated Use {@link assertLessThan} instead.
   *
   * Asserts that a {@link UInt32} is less than another one.
   */
  assertLt(y, message) {
    this.lessThan(y).assertEquals(true, message);
  }
  /**
   * Asserts that a {@link UInt32} is less than another one.
   */
  assertLessThan(y, message) {
    this.lessThan(y).assertEquals(true, message);
  }
  /**
   * @deprecated Use {@link greaterThan} instead.
   *
   * Checks if a {@link UInt32} is greater than another one.
   */
  gt(y) {
    return y.lessThan(this);
  }
  /**
   * Checks if a {@link UInt32} is greater than another one.
   */
  greaterThan(y) {
    return y.lessThan(this);
  }
  /**
   * @deprecated Use {@link assertGreaterThan} instead.
   *
   * Asserts that a {@link UInt32} is greater than another one.
   */
  assertGt(y, message) {
    y.assertLessThan(this, message);
  }
  /**
   * Asserts that a {@link UInt32} is greater than another one.
   */
  assertGreaterThan(y, message) {
    y.assertLessThan(this, message);
  }
  /**
   * @deprecated Use {@link greaterThanOrEqual} instead.
   *
   * Checks if a {@link UInt32} is greater than or equal to another one.
   */
  gte(y) {
    return this.lessThan(y).not();
  }
  /**
   * Checks if a {@link UInt32} is greater than or equal to another one.
   */
  greaterThanOrEqual(y) {
    return this.lessThan(y).not();
  }
  /**
     * @deprecated Use {@link assertGreaterThanOrEqual} instead.
  
     *
     * Asserts that a {@link UInt32} is greater than or equal to another one.
     */
  assertGte(y, message) {
    y.assertLessThanOrEqual(this, message);
  }
  /**
   * Asserts that a {@link UInt32} is greater than or equal to another one.
   */
  assertGreaterThanOrEqual(y, message) {
    y.assertLessThanOrEqual(this, message);
  }
};
UInt322.NUM_BITS = 32;
(0, import_tslib6.__decorate)([
  prop,
  (0, import_tslib6.__metadata)("design:type", Field4)
], UInt322.prototype, "value", void 0);
var Sign3 = class extends CircuitValue {
  static get one() {
    return new Sign3(Field4(1));
  }
  static get minusOne() {
    return new Sign3(Field4(-1));
  }
  static check(x) {
    x.value.square().assertEquals(Field4(1));
  }
  static emptyValue() {
    return Sign3.one;
  }
  static toInput(x) {
    return { packed: [[x.isPositive().toField(), 1]] };
  }
  static toJSON(x) {
    if (x.toString() === "1")
      return "Positive";
    if (x.neg().toString() === "1")
      return "Negative";
    throw Error(`Invalid Sign: ${x}`);
  }
  static fromJSON(x) {
    return x === "Positive" ? new Sign3(Field4(1)) : new Sign3(Field4(-1));
  }
  neg() {
    return new Sign3(this.value.neg());
  }
  mul(y) {
    return new Sign3(this.value.mul(y.value));
  }
  isPositive() {
    return this.value.equals(Field4(1));
  }
  toString() {
    return this.value.toString();
  }
};
(0, import_tslib6.__decorate)([
  prop,
  (0, import_tslib6.__metadata)("design:type", Field4)
], Sign3.prototype, "value", void 0);
var Int64 = class extends CircuitValue {
  // Some thoughts regarding the representation as field elements:
  // toFields returns the in-circuit representation, so the main objective is to minimize the number of constraints
  // that result from this representation. Therefore, I think the only candidate for an efficient 1-field representation
  // is the one where the Int64 is the field: toFields = Int64 => [Int64.magnitude.mul(Int64.sign)]. Anything else involving
  // bit packing would just lead to very inefficient circuit operations.
  //
  // So, is magnitude * sign ("1-field") a more efficient representation than (magnitude, sign) ("2-field")?
  // Several common operations like add, mul, etc, operate on 1-field so in 2-field they result in one additional multiplication
  // constraint per operand. However, the check operation (constraining to 64 bits + a sign) which is called at the introduction
  // of every witness, and also at the end of add, mul, etc, operates on 2-field. So here, the 1-field representation needs
  // to add an additional magnitude * sign = Int64 multiplication constraint, which will typically cancel out most of the gains
  // achieved by 1-field elsewhere.
  // There are some notable operations for which 2-field is definitely better:
  //
  // * div and mod (which do integer division with rounding on the magnitude)
  // * converting the Int64 to a Currency.Amount.Signed (for the zkapp balance), which has the exact same (magnitude, sign) representation we use here.
  //
  // The second point is one of the main things an Int64 is used for, and was the original motivation to use 2 fields.
  // Overall, I think the existing implementation is the optimal one.
  constructor(magnitude, sgn = Sign3.one) {
    super(magnitude, sgn);
  }
  /**
   * Creates a new {@link Int64} from a {@link Field}.
   *
   * Does check if the {@link Field} is within range.
   */
  static fromFieldUnchecked(x) {
    let TWO64 = 1n << 64n;
    let xBigInt = x.toBigInt();
    let isValidPositive = xBigInt < TWO64;
    let isValidNegative = Field4.ORDER - xBigInt < TWO64;
    if (!isValidPositive && !isValidNegative)
      throw Error(`Int64: Expected a value between (-2^64, 2^64), got ${x}`);
    let magnitude = Field4(isValidPositive ? x.toString() : x.neg().toString());
    let sign2 = isValidPositive ? Sign3.one : Sign3.minusOne;
    return new Int64(new UInt642(magnitude), sign2);
  }
  // this doesn't check ranges because we assume they're already checked on UInts
  /**
   * Creates a new {@link Int64} from a {@link Field}.
   *
   * **Does not** check if the {@link Field} is within range.
   */
  static fromUnsigned(x) {
    return new Int64(x instanceof UInt322 ? x.toUInt64() : x);
  }
  // this checks the range if the argument is a constant
  /**
   * Creates a new {@link Int64}.
   *
   * Check the range if the argument is a constant.
   */
  static from(x) {
    if (x instanceof Int64)
      return x;
    if (x instanceof UInt642 || x instanceof UInt322) {
      return Int64.fromUnsigned(x);
    }
    return Int64.fromFieldUnchecked(Field4(x));
  }
  /**
   * Turns the {@link Int64} into a string.
   */
  toString() {
    let abs = this.magnitude.toString();
    let sgn = this.isPositive().toBoolean() || abs === "0" ? "" : "-";
    return sgn + abs;
  }
  isConstant() {
    return this.magnitude.value.isConstant() && this.sgn.isConstant();
  }
  // --- circuit-compatible operations below ---
  // the assumption here is that all Int64 values that appear in a circuit are already checked as valid
  // this is because Provable.witness calls .check, which calls .check on each prop, i.e. UInt64 and Sign
  // so we only have to do additional checks if an operation on valid inputs can have an invalid outcome (example: overflow)
  /**
   * Static method to create a {@link Int64} with value `0`.
   */
  static get zero() {
    return new Int64(UInt642.zero);
  }
  /**
   * Static method to create a {@link Int64} with value `1`.
   */
  static get one() {
    return new Int64(UInt642.one);
  }
  /**
   * Static method to create a {@link Int64} with value `-1`.
   */
  static get minusOne() {
    return new Int64(UInt642.one).neg();
  }
  /**
   * Returns the {@link Field} value.
   */
  toField() {
    return this.magnitude.value.mul(this.sgn.value);
  }
  /**
   * Static method to create a {@link Int64} from a {@link Field}.
   */
  static fromField(x) {
    if (x.isConstant())
      return Int64.fromFieldUnchecked(x);
    let xInt = Provable.witness(Int64, () => Int64.fromFieldUnchecked(x));
    xInt.toField().assertEquals(x);
    return xInt;
  }
  /**
   * Negates the value.
   *
   * `Int64.from(5).neg()` will turn into `Int64.from(-5)`
   */
  neg() {
    return new Int64(this.magnitude, this.sgn.neg());
  }
  /**
   * Addition with overflow checking.
   */
  add(y) {
    let y_ = Int64.from(y);
    return Int64.fromField(this.toField().add(y_.toField()));
  }
  /**
   * Subtraction with underflow checking.
   */
  sub(y) {
    let y_ = Int64.from(y);
    return Int64.fromField(this.toField().sub(y_.toField()));
  }
  /**
   * Multiplication with overflow checking.
   */
  mul(y) {
    let y_ = Int64.from(y);
    return Int64.fromField(this.toField().mul(y_.toField()));
  }
  /**
   * Integer division.
   *
   * `x.div(y)` returns the floor of `x / y`, that is, the greatest
   * `z` such that `z * y <= x`.
   *
   */
  div(y) {
    let y_ = Int64.from(y);
    let { quotient } = this.magnitude.divMod(y_.magnitude);
    let sign2 = this.sgn.mul(y_.sgn);
    return new Int64(quotient, sign2);
  }
  /**
   * Integer remainder.
   *
   * `x.mod(y)` returns the value `z` such that `0 <= z < y` and
   * `x - z` is divisble by `y`.
   */
  mod(y) {
    let y_ = UInt642.from(y);
    let rest = this.magnitude.divMod(y_).rest.value;
    rest = Provable.if(this.isPositive(), rest, y_.value.sub(rest));
    return new Int64(new UInt642(rest));
  }
  /**
   * Checks if two values are equal.
   */
  equals(y) {
    let y_ = Int64.from(y);
    return this.toField().equals(y_.toField());
  }
  /**
   * Asserts that two values are equal.
   */
  assertEquals(y, message) {
    let y_ = Int64.from(y);
    this.toField().assertEquals(y_.toField(), message);
  }
  /**
   * Checks if the value is postive.
   */
  isPositive() {
    return this.sgn.isPositive();
  }
};
(0, import_tslib6.__decorate)([
  prop,
  (0, import_tslib6.__metadata)("design:type", UInt642)
], Int64.prototype, "magnitude", void 0);
(0, import_tslib6.__decorate)([
  prop,
  (0, import_tslib6.__metadata)("design:type", Sign3)
], Int64.prototype, "sgn", void 0);

// dist/node/bindings/mina-transaction/gen/transaction.js
var transaction_exports = {};
__export(transaction_exports, {
  Account: () => Account,
  AccountUpdate: () => AccountUpdate,
  ActionState: () => ActionState,
  Actions: () => Actions,
  AuthRequired: () => AuthRequired,
  Bool: () => Bool4,
  Events: () => Events,
  Field: () => Field4,
  Json: () => transaction_json_exports,
  PublicKey: () => PublicKey2,
  ReceiptChainHash: () => ReceiptChainHash,
  Sign: () => Sign3,
  StateHash: () => StateHash,
  TokenId: () => TokenId,
  TokenSymbol: () => TokenSymbol2,
  TypeMap: () => TypeMap,
  UInt32: () => UInt322,
  UInt64: () => UInt642,
  VerificationKeyHash: () => VerificationKeyHash,
  ZkappCommand: () => ZkappCommand,
  ZkappUri: () => ZkappUri,
  customTypes: () => customTypes,
  emptyValue: () => emptyValue,
  provableFromLayout: () => provableFromLayout,
  toJSONEssential: () => toJSONEssential
});

// dist/node/lib/events.js
function createEvents({ Field: Field5, Poseidon: Poseidon3 }) {
  function initialState() {
    return [Field5(0), Field5(0), Field5(0)];
  }
  function salt2(prefix) {
    return Poseidon3.update(initialState(), [prefixToField(Field5, prefix)]);
  }
  function hashWithPrefix3(prefix, input) {
    let init = salt2(prefix);
    return Poseidon3.update(init, input)[0];
  }
  function emptyHashWithPrefix2(prefix) {
    return salt2(prefix)[0];
  }
  const Events3 = {
    empty() {
      let hash2 = emptyHashWithPrefix2("MinaZkappEventsEmpty");
      return { hash: hash2, data: [] };
    },
    pushEvent(events, event) {
      let eventHash = hashWithPrefix3(prefixes.event, event);
      let hash2 = hashWithPrefix3(prefixes.events, [events.hash, eventHash]);
      return { hash: hash2, data: [event, ...events.data] };
    },
    fromList(events) {
      return [...events].reverse().reduce(Events3.pushEvent, Events3.empty());
    },
    hash(events) {
      return Events3.fromList(events).hash;
    }
  };
  const EventsProvable = {
    ...Events3,
    ...dataAsHash({
      emptyValue: Events3.empty,
      toJSON(data) {
        return data.map((row) => row.map((e) => Field5.toJSON(e)));
      },
      fromJSON(json) {
        let data = json.map((row) => row.map((e) => Field5.fromJSON(e)));
        let hash2 = Events3.hash(data);
        return { data, hash: hash2 };
      }
    })
  };
  const Actions3 = {
    // same as events but w/ different hash prefixes
    empty() {
      let hash2 = emptyHashWithPrefix2("MinaZkappActionsEmpty");
      return { hash: hash2, data: [] };
    },
    pushEvent(actions, event) {
      let eventHash = hashWithPrefix3(prefixes.event, event);
      let hash2 = hashWithPrefix3(prefixes.sequenceEvents, [
        actions.hash,
        eventHash
      ]);
      return { hash: hash2, data: [event, ...actions.data] };
    },
    fromList(events) {
      return [...events].reverse().reduce(Actions3.pushEvent, Actions3.empty());
    },
    hash(events) {
      return this.fromList(events).hash;
    },
    // different than events
    emptyActionState() {
      return emptyHashWithPrefix2("MinaZkappActionStateEmptyElt");
    },
    updateSequenceState(state3, sequenceEventsHash) {
      return hashWithPrefix3(prefixes.sequenceEvents, [
        state3,
        sequenceEventsHash
      ]);
    }
  };
  const SequenceEventsProvable = {
    ...Actions3,
    ...dataAsHash({
      emptyValue: Actions3.empty,
      toJSON(data) {
        return data.map((row) => row.map((e) => Field5.toJSON(e)));
      },
      fromJSON(json) {
        let data = json.map((row) => row.map((e) => Field5.fromJSON(e)));
        let hash2 = Actions3.hash(data);
        return { data, hash: hash2 };
      }
    })
  };
  return { Events: EventsProvable, Actions: SequenceEventsProvable };
}
function dataAsHash({ emptyValue: emptyValue4, toJSON, fromJSON }) {
  return {
    emptyValue: emptyValue4,
    sizeInFields() {
      return 1;
    },
    toFields({ hash: hash2 }) {
      return [hash2];
    },
    toAuxiliary(value) {
      return [value?.data ?? emptyValue4().data];
    },
    fromFields([hash2], [data]) {
      return { data, hash: hash2 };
    },
    toJSON({ data }) {
      return toJSON(data);
    },
    fromJSON(json) {
      return fromJSON(json);
    },
    check() {
    },
    toInput({ hash: hash2 }) {
      return { fields: [hash2] };
    }
  };
}

// dist/node/bindings/mina-transaction/derived-leaves.js
var tokenSymbolLength = 6;
function derivedLeafTypes({ Field: Field5, Bool: Bool5, Hash: Hash3, packToFields: packToFields3 }) {
  let provable3 = createProvable();
  const Encoding = fieldEncodings(Field5);
  const defaultTokenId = 1;
  const TokenId5 = {
    ...provable3(Field5),
    emptyValue() {
      return Field5(defaultTokenId);
    },
    toJSON(x) {
      return Encoding.TokenId.toBase58(x);
    },
    fromJSON(x) {
      return Encoding.TokenId.fromBase58(x);
    }
  };
  const StateHash4 = {
    ...provable3(Field5),
    toJSON(x) {
      return Encoding.StateHash.toBase58(x);
    },
    fromJSON(x) {
      return Encoding.StateHash.fromBase58(x);
    }
  };
  const TokenSymbol4 = {
    ...provable3({ field: Field5, symbol: String }),
    toInput({ field }) {
      return { packed: [[field, 48]] };
    },
    toJSON({ symbol }) {
      return symbol;
    },
    fromJSON(symbol) {
      let bytesLength = stringLengthInBytes(symbol);
      if (bytesLength > tokenSymbolLength)
        throw Error(`Token symbol ${symbol} should be a maximum of 6 bytes, but is ${bytesLength}`);
      return { symbol, field: prefixToField(Field5, symbol) };
    }
  };
  const AuthRequired3 = {
    ...provable3({ constant: Bool5, signatureNecessary: Bool5, signatureSufficient: Bool5 }, {
      customObjectKeys: [
        "constant",
        "signatureNecessary",
        "signatureSufficient"
      ]
    }),
    emptyValue() {
      return {
        constant: Bool5(true),
        signatureNecessary: Bool5(false),
        signatureSufficient: Bool5(true)
      };
    },
    toJSON(x) {
      let c = Number(Bool5.toJSON(x.constant));
      let n = Number(Bool5.toJSON(x.signatureNecessary));
      let s = Number(Bool5.toJSON(x.signatureSufficient));
      switch (`${c}${n}${s}`) {
        case "110":
          return "Impossible";
        case "101":
          return "None";
        case "000":
          return "Proof";
        case "011":
          return "Signature";
        case "001":
          return "Either";
        default:
          throw Error("Unexpected permission");
      }
    },
    fromJSON(json) {
      let map = {
        Impossible: "110",
        None: "101",
        Proof: "000",
        Signature: "011",
        Either: "001"
      };
      let code = map[json];
      if (code === void 0)
        throw Error("Unexpected permission");
      let [constant, signatureNecessary, signatureSufficient] = code.split("").map((s) => Bool5(!!Number(s)));
      return { constant, signatureNecessary, signatureSufficient };
    }
  };
  function hashZkappUri(uri) {
    let bits2 = bytesToBits(stringToBytes(uri));
    bits2.push(true);
    let input = { packed: bits2.map((b2) => [Field5(Number(b2)), 1]) };
    let packed = packToFields3(input);
    return Hash3.hashWithPrefix(prefixes.zkappUri, packed);
  }
  const ZkappUri3 = dataAsHash({
    emptyValue() {
      let hash2 = Hash3.hashWithPrefix(prefixes.zkappUri, [Field5(0), Field5(0)]);
      return { data: "", hash: hash2 };
    },
    toJSON(data) {
      return data;
    },
    fromJSON(json) {
      return { data: json, hash: hashZkappUri(json) };
    }
  });
  return { TokenId: TokenId5, StateHash: StateHash4, TokenSymbol: TokenSymbol4, AuthRequired: AuthRequired3, ZkappUri: ZkappUri3 };
}

// dist/node/bindings/mina-transaction/transaction-leaves.js
var { TokenId, StateHash, TokenSymbol: TokenSymbol2, AuthRequired, ZkappUri } = derivedLeafTypes({ Field: Field4, Bool: Bool4, Hash, packToFields });
var { Events, Actions } = createEvents({ Field: Field4, Poseidon: Poseidon2 });
var ActionState = {
  ...provable2(Field4),
  emptyValue: Actions.emptyActionState
};
var VerificationKeyHash = {
  ...provable2(Field4),
  emptyValue: () => Field4(mocks.dummyVerificationKeyHash)
};
var ReceiptChainHash = {
  ...provable2(Field4),
  emptyValue: () => emptyHashWithPrefix("CodaReceiptEmpty")
};

// dist/node/bindings/lib/generic.js
var emptyType = {
  sizeInFields: () => 0,
  toFields: () => [],
  toAuxiliary: () => [],
  fromFields: () => null,
  check: () => {
  },
  toInput: () => ({}),
  toJSON: () => null,
  fromJSON: () => null
};
var undefinedType = {
  ...emptyType,
  fromFields: () => void 0,
  toJSON: () => null,
  fromJSON: () => void 0
};
var primitiveTypes = /* @__PURE__ */ new Set(["number", "string", "null"]);
function EmptyNull() {
  return emptyType;
}
function EmptyUndefined() {
  return undefinedType;
}
function EmptyVoid() {
  return undefinedType;
}
function primitiveTypeMap() {
  return primitiveTypeMap_;
}
var primitiveTypeMap_ = {
  number: {
    ...emptyType,
    toAuxiliary: (value = 0) => [value],
    toJSON: (value) => value,
    fromJSON: (value) => value,
    fromFields: (_, [value]) => value
  },
  string: {
    ...emptyType,
    toAuxiliary: (value = "") => [value],
    toJSON: (value) => value,
    fromJSON: (value) => value,
    fromFields: (_, [value]) => value
  },
  null: emptyType
};

// dist/node/bindings/lib/from-layout.js
function ProvableFromLayout(TypeMap3, customTypes3) {
  const Field5 = TypeMap3.Field;
  const PrimitiveMap = primitiveTypeMap();
  function layoutFold(spec, typeData, value) {
    return genericLayoutFold(TypeMap3, customTypes3, spec, typeData, value);
  }
  function provableFromLayout3(typeData) {
    return {
      sizeInFields() {
        return sizeInFields(typeData);
      },
      toFields(value) {
        return toFields(typeData, value);
      },
      toAuxiliary(value) {
        return toAuxiliary(typeData, value);
      },
      fromFields(fields, aux) {
        return fromFields(typeData, fields, aux);
      },
      toJSON(value) {
        return toJSON(typeData, value);
      },
      fromJSON(json) {
        return fromJSON(typeData, json);
      },
      check(value) {
        check(typeData, value);
      },
      toInput(value) {
        return toInput(typeData, value);
      },
      emptyValue() {
        return emptyValue4(typeData);
      }
    };
  }
  function toJSON(typeData, value) {
    return layoutFold({
      map(type, value2) {
        return type.toJSON(value2);
      },
      reduceArray(array) {
        return array;
      },
      reduceObject(_, object) {
        return object;
      },
      reduceFlaggedOption({ isSome, value: value2 }) {
        return isSome ? value2 : null;
      },
      reduceOrUndefined(value2) {
        return value2 ?? null;
      }
    }, typeData, value);
  }
  function fromJSON(typeData, json) {
    let { checkedTypeName } = typeData;
    if (checkedTypeName) {
      return customTypes3[checkedTypeName].fromJSON(json);
    }
    if (typeData.type === "array") {
      let arrayTypeData = typeData;
      return json.map((json2) => fromJSON(arrayTypeData.inner, json2));
    }
    if (typeData.type === "option") {
      let optionTypeData = typeData;
      switch (optionTypeData.optionType) {
        case "closedInterval":
        case "flaggedOption": {
          let isSome = TypeMap3.Bool.fromJSON(json !== null);
          let value;
          if (json !== null) {
            value = fromJSON(optionTypeData.inner, json);
          } else {
            value = emptyValue4(optionTypeData.inner);
            if (optionTypeData.optionType === "closedInterval") {
              let innerInner = optionTypeData.inner.entries.lower;
              let innerType = TypeMap3[innerInner.type];
              value.lower = innerType.fromJSON(optionTypeData.rangeMin);
              value.upper = innerType.fromJSON(optionTypeData.rangeMax);
            }
          }
          return { isSome, value };
        }
        case "orUndefined": {
          return json === null ? void 0 : fromJSON(optionTypeData.inner, json);
        }
        default:
          throw Error("bug");
      }
    }
    if (typeData.type === "object") {
      let { keys, entries } = typeData;
      let values = {};
      for (let i2 = 0; i2 < keys.length; i2++) {
        let typeEntry = entries[keys[i2]];
        values[keys[i2]] = fromJSON(typeEntry, json[keys[i2]]);
      }
      return values;
    }
    if (primitiveTypes.has(typeData.type)) {
      return PrimitiveMap[typeData.type].fromJSON(json);
    }
    return TypeMap3[typeData.type].fromJSON(json);
  }
  function toFields(typeData, value) {
    return layoutFold({
      map(type, value2) {
        return type.toFields(value2);
      },
      reduceArray(array) {
        return array.flat();
      },
      reduceObject(keys, object) {
        return keys.map((key) => object[key]).flat();
      },
      reduceFlaggedOption({ isSome, value: value2 }) {
        return [isSome, value2].flat();
      },
      reduceOrUndefined(_) {
        return [];
      }
    }, typeData, value);
  }
  function toAuxiliary(typeData, value) {
    return layoutFold({
      map(type, value2) {
        return type.toAuxiliary(value2);
      },
      reduceArray(array) {
        return array;
      },
      reduceObject(keys, object) {
        return keys.map((key) => object[key]);
      },
      reduceFlaggedOption({ value: value2 }) {
        return value2;
      },
      reduceOrUndefined(value2) {
        return value2 === void 0 ? [false] : [true, value2];
      }
    }, typeData, value);
  }
  function sizeInFields(typeData) {
    let spec = {
      map(type) {
        return type.sizeInFields();
      },
      reduceArray(_, { inner, staticLength }) {
        let length = staticLength ?? NaN;
        return length * layoutFold(spec, inner);
      },
      reduceObject(keys, object) {
        return keys.map((key) => object[key]).reduce((x, y) => x + y);
      },
      reduceFlaggedOption({ isSome, value }) {
        return isSome + value;
      },
      reduceOrUndefined(_) {
        return 0;
      }
    };
    return layoutFold(spec, typeData);
  }
  function fromFields(typeData, fields, aux) {
    let { checkedTypeName } = typeData;
    if (checkedTypeName) {
      return customTypes3[checkedTypeName].fromFields(fields, aux);
    }
    if (typeData.type === "array") {
      let arrayTypeData = typeData;
      let size = sizeInFields(arrayTypeData.inner);
      let length = aux.length;
      let value = [];
      for (let i2 = 0, offset = 0; i2 < length; i2++, offset += size) {
        value[i2] = fromFields(arrayTypeData.inner, fields.slice(offset, offset + size), aux[i2]);
      }
      return value;
    }
    if (typeData.type === "option") {
      let { optionType, inner } = typeData;
      switch (optionType) {
        case "closedInterval":
        case "flaggedOption": {
          let [first, ...rest] = fields;
          let isSome = TypeMap3.Bool.fromFields([first], []);
          let value = fromFields(inner, rest, aux);
          return { isSome, value };
        }
        case "orUndefined": {
          let [isDefined, value] = aux;
          return isDefined ? fromFields(inner, fields, value) : void 0;
        }
        default:
          throw Error("bug");
      }
    }
    if (typeData.type === "object") {
      let { keys, entries } = typeData;
      let values = {};
      let offset = 0;
      for (let i2 = 0; i2 < keys.length; i2++) {
        let typeEntry = entries[keys[i2]];
        let size = sizeInFields(typeEntry);
        values[keys[i2]] = fromFields(typeEntry, fields.slice(offset, offset + size), aux[i2]);
        offset += size;
      }
      return values;
    }
    if (primitiveTypes.has(typeData.type)) {
      return PrimitiveMap[typeData.type].fromFields(fields, aux);
    }
    return TypeMap3[typeData.type].fromFields(fields, aux);
  }
  function emptyValue4(typeData) {
    let zero = TypeMap3.Field.fromJSON("0");
    return layoutFold({
      map(type) {
        if (type.emptyValue)
          return type.emptyValue();
        return type.fromFields(Array(type.sizeInFields()).fill(zero), type.toAuxiliary());
      },
      reduceArray(array) {
        return array;
      },
      reduceObject(_, object) {
        return object;
      },
      reduceFlaggedOption({ isSome, value }, typeData2) {
        if (typeData2.optionType === "closedInterval") {
          let innerInner = typeData2.inner.entries.lower;
          let innerType = TypeMap3[innerInner.type];
          value.lower = innerType.fromJSON(typeData2.rangeMin);
          value.upper = innerType.fromJSON(typeData2.rangeMax);
        }
        return { isSome, value };
      },
      reduceOrUndefined() {
        return void 0;
      }
    }, typeData, void 0);
  }
  function check(typeData, value) {
    return layoutFold({
      map(type, value2) {
        return type.check(value2);
      },
      reduceArray() {
      },
      reduceObject() {
      },
      reduceFlaggedOption() {
      },
      reduceOrUndefined() {
      }
    }, typeData, value);
  }
  function toInput(typeData, value) {
    return layoutFold({
      map(type, value2) {
        return type.toInput(value2);
      },
      reduceArray(array) {
        let acc = { fields: [], packed: [] };
        for (let { fields, packed } of array) {
          if (fields)
            acc.fields.push(...fields);
          if (packed)
            acc.packed.push(...packed);
        }
        return acc;
      },
      reduceObject(keys, object) {
        let acc = { fields: [], packed: [] };
        for (let key of keys) {
          let { fields, packed } = object[key];
          if (fields)
            acc.fields.push(...fields);
          if (packed)
            acc.packed.push(...packed);
        }
        return acc;
      },
      reduceFlaggedOption({ isSome, value: value2 }) {
        return {
          fields: value2.fields,
          packed: isSome.packed.concat(value2.packed ?? [])
        };
      },
      reduceOrUndefined(_) {
        return {};
      }
    }, typeData, value);
  }
  function toJSONEssential3(typeData, value) {
    return layoutFold({
      map(type, value2) {
        return type.toJSON(value2);
      },
      reduceArray(array) {
        if (array.length === 0 || array.every((x) => x === null))
          return null;
        return array;
      },
      reduceObject(_, object) {
        for (let key in object) {
          if (object[key] === null) {
            delete object[key];
          }
        }
        if (Object.keys(object).length === 0)
          return null;
        return object;
      },
      reduceFlaggedOption({ isSome, value: value2 }) {
        return isSome ? value2 : null;
      },
      reduceOrUndefined(value2) {
        return value2 ?? null;
      }
    }, typeData, value);
  }
  return { provableFromLayout: provableFromLayout3, toJSONEssential: toJSONEssential3, emptyValue: emptyValue4 };
}
function genericLayoutFold(TypeMap3, customTypes3, spec, typeData, value) {
  let PrimitiveMap = primitiveTypeMap();
  let { checkedTypeName } = typeData;
  if (checkedTypeName) {
    return spec.map(customTypes3[checkedTypeName], value, checkedTypeName);
  }
  if (typeData.type === "array") {
    let arrayTypeData = typeData;
    let v = value;
    if (arrayTypeData.staticLength !== null && v === void 0) {
      v = Array(arrayTypeData.staticLength).fill(void 0);
    }
    let array = v?.map((x) => genericLayoutFold(TypeMap3, customTypes3, spec, arrayTypeData.inner, x)) ?? [];
    return spec.reduceArray(array, arrayTypeData);
  }
  if (typeData.type === "option") {
    let { optionType, inner } = typeData;
    switch (optionType) {
      case "closedInterval":
      case "flaggedOption":
        let v = value;
        return spec.reduceFlaggedOption({
          isSome: spec.map(TypeMap3.Bool, v?.isSome, "Bool"),
          value: genericLayoutFold(TypeMap3, customTypes3, spec, inner, v?.value)
        }, typeData);
      case "orUndefined":
        let mapped = value === void 0 ? void 0 : genericLayoutFold(TypeMap3, customTypes3, spec, inner, value);
        return spec.reduceOrUndefined(mapped, inner);
      default:
        throw Error("bug");
    }
  }
  if (typeData.type === "object") {
    let { keys, entries } = typeData;
    let v = value;
    let object = {};
    keys.forEach((key) => {
      object[key] = genericLayoutFold(TypeMap3, customTypes3, spec, entries[key], v?.[key]);
    });
    return spec.reduceObject(keys, object);
  }
  if (primitiveTypes.has(typeData.type)) {
    return spec.map(PrimitiveMap[typeData.type], value, typeData.type);
  }
  return spec.map(TypeMap3[typeData.type], value, typeData.type);
}

// dist/node/bindings/mina-transaction/gen/transaction-json.js
var transaction_json_exports = {};

// dist/node/bindings/mina-transaction/gen/js-layout.js
var jsLayout = {
  ZkappCommand: {
    type: "object",
    name: "ZkappCommand",
    docs: null,
    keys: ["feePayer", "accountUpdates", "memo"],
    entries: {
      feePayer: {
        type: "object",
        name: "ZkappFeePayer",
        docs: null,
        keys: ["body", "authorization"],
        entries: {
          body: {
            type: "object",
            name: "FeePayerBody",
            docs: null,
            keys: ["publicKey", "fee", "validUntil", "nonce"],
            entries: {
              publicKey: { type: "PublicKey" },
              fee: { type: "UInt64" },
              validUntil: {
                type: "option",
                optionType: "orUndefined",
                inner: { type: "UInt32" }
              },
              nonce: { type: "UInt32" }
            },
            docEntries: {
              publicKey: null,
              fee: null,
              validUntil: null,
              nonce: null
            }
          },
          authorization: { type: "string" }
        },
        docEntries: { body: null, authorization: null }
      },
      accountUpdates: {
        type: "array",
        inner: {
          type: "object",
          name: "ZkappAccountUpdate",
          docs: "An account update in a zkApp transaction",
          keys: ["body", "authorization"],
          entries: {
            body: {
              type: "object",
              name: "AccountUpdateBody",
              docs: null,
              keys: [
                "publicKey",
                "tokenId",
                "update",
                "balanceChange",
                "incrementNonce",
                "events",
                "actions",
                "callData",
                "callDepth",
                "preconditions",
                "useFullCommitment",
                "implicitAccountCreationFee",
                "mayUseToken",
                "authorizationKind"
              ],
              entries: {
                publicKey: { type: "PublicKey" },
                tokenId: { type: "TokenId" },
                update: {
                  type: "object",
                  name: "AccountUpdateModification",
                  docs: null,
                  keys: [
                    "appState",
                    "delegate",
                    "verificationKey",
                    "permissions",
                    "zkappUri",
                    "tokenSymbol",
                    "timing",
                    "votingFor"
                  ],
                  entries: {
                    appState: {
                      type: "array",
                      inner: {
                        type: "option",
                        optionType: "flaggedOption",
                        inner: { type: "Field" }
                      },
                      staticLength: 8
                    },
                    delegate: {
                      type: "option",
                      optionType: "flaggedOption",
                      inner: { type: "PublicKey" }
                    },
                    verificationKey: {
                      type: "option",
                      optionType: "flaggedOption",
                      inner: {
                        type: "object",
                        name: "VerificationKeyWithHash",
                        docs: null,
                        keys: ["data", "hash"],
                        entries: {
                          data: { type: "string" },
                          hash: { type: "Field" }
                        },
                        docEntries: { data: null, hash: null }
                      }
                    },
                    permissions: {
                      type: "option",
                      optionType: "flaggedOption",
                      inner: {
                        type: "object",
                        name: "Permissions",
                        docs: null,
                        keys: [
                          "editState",
                          "access",
                          "send",
                          "receive",
                          "setDelegate",
                          "setPermissions",
                          "setVerificationKey",
                          "setZkappUri",
                          "editActionState",
                          "setTokenSymbol",
                          "incrementNonce",
                          "setVotingFor",
                          "setTiming"
                        ],
                        entries: {
                          editState: { type: "AuthRequired" },
                          access: { type: "AuthRequired" },
                          send: { type: "AuthRequired" },
                          receive: { type: "AuthRequired" },
                          setDelegate: { type: "AuthRequired" },
                          setPermissions: { type: "AuthRequired" },
                          setVerificationKey: { type: "AuthRequired" },
                          setZkappUri: { type: "AuthRequired" },
                          editActionState: { type: "AuthRequired" },
                          setTokenSymbol: { type: "AuthRequired" },
                          incrementNonce: { type: "AuthRequired" },
                          setVotingFor: { type: "AuthRequired" },
                          setTiming: { type: "AuthRequired" }
                        },
                        docEntries: {
                          editState: null,
                          access: null,
                          send: null,
                          receive: null,
                          setDelegate: null,
                          setPermissions: null,
                          setVerificationKey: null,
                          setZkappUri: null,
                          editActionState: null,
                          setTokenSymbol: null,
                          incrementNonce: null,
                          setVotingFor: null,
                          setTiming: null
                        }
                      }
                    },
                    zkappUri: {
                      type: "option",
                      optionType: "flaggedOption",
                      inner: {
                        type: "string",
                        checkedType: {
                          type: "object",
                          name: "Events",
                          docs: null,
                          keys: ["data", "hash"],
                          entries: {
                            data: { type: "string" },
                            hash: { type: "Field" }
                          },
                          docEntries: { data: null, hash: null }
                        },
                        checkedTypeName: "ZkappUri"
                      }
                    },
                    tokenSymbol: {
                      type: "option",
                      optionType: "flaggedOption",
                      inner: {
                        type: "string",
                        checkedType: {
                          type: "object",
                          name: "Anonymous",
                          docs: null,
                          keys: ["symbol", "field"],
                          entries: {
                            symbol: { type: "string" },
                            field: { type: "Field" }
                          },
                          docEntries: { symbol: "", field: "" }
                        },
                        checkedTypeName: "TokenSymbol"
                      }
                    },
                    timing: {
                      type: "option",
                      optionType: "flaggedOption",
                      inner: {
                        type: "object",
                        name: "Timing",
                        docs: null,
                        keys: [
                          "initialMinimumBalance",
                          "cliffTime",
                          "cliffAmount",
                          "vestingPeriod",
                          "vestingIncrement"
                        ],
                        entries: {
                          initialMinimumBalance: { type: "UInt64" },
                          cliffTime: { type: "UInt32" },
                          cliffAmount: { type: "UInt64" },
                          vestingPeriod: { type: "UInt32" },
                          vestingIncrement: { type: "UInt64" }
                        },
                        docEntries: {
                          initialMinimumBalance: null,
                          cliffTime: null,
                          cliffAmount: null,
                          vestingPeriod: null,
                          vestingIncrement: null
                        }
                      }
                    },
                    votingFor: {
                      type: "option",
                      optionType: "flaggedOption",
                      inner: {
                        type: "Field",
                        checkedType: { type: "Field" },
                        checkedTypeName: "StateHash"
                      }
                    }
                  },
                  docEntries: {
                    appState: null,
                    delegate: null,
                    verificationKey: null,
                    permissions: null,
                    zkappUri: null,
                    tokenSymbol: null,
                    timing: null,
                    votingFor: null
                  }
                },
                balanceChange: {
                  type: "object",
                  name: "BalanceChange",
                  docs: null,
                  keys: ["magnitude", "sgn"],
                  entries: {
                    magnitude: { type: "UInt64" },
                    sgn: { type: "Sign" }
                  },
                  docEntries: { magnitude: null, sgn: null }
                },
                incrementNonce: { type: "Bool" },
                events: {
                  type: "array",
                  inner: {
                    type: "array",
                    inner: { type: "Field" },
                    staticLength: null
                  },
                  staticLength: null,
                  checkedType: {
                    type: "object",
                    name: "Events",
                    docs: null,
                    keys: ["data", "hash"],
                    entries: {
                      data: {
                        type: "array",
                        inner: {
                          type: "array",
                          inner: { type: "Field" },
                          staticLength: null
                        },
                        staticLength: null
                      },
                      hash: { type: "Field" }
                    },
                    docEntries: { data: null, hash: null }
                  },
                  checkedTypeName: "Events"
                },
                actions: {
                  type: "array",
                  inner: {
                    type: "array",
                    inner: { type: "Field" },
                    staticLength: null
                  },
                  staticLength: null,
                  checkedType: {
                    type: "object",
                    name: "Events",
                    docs: null,
                    keys: ["data", "hash"],
                    entries: {
                      data: {
                        type: "array",
                        inner: {
                          type: "array",
                          inner: { type: "Field" },
                          staticLength: null
                        },
                        staticLength: null
                      },
                      hash: { type: "Field" }
                    },
                    docEntries: { data: null, hash: null }
                  },
                  checkedTypeName: "Actions"
                },
                callData: { type: "Field" },
                callDepth: { type: "number" },
                preconditions: {
                  type: "object",
                  name: "Preconditions",
                  docs: null,
                  keys: ["network", "account", "validWhile"],
                  entries: {
                    network: {
                      type: "object",
                      name: "NetworkPrecondition",
                      docs: null,
                      keys: [
                        "snarkedLedgerHash",
                        "blockchainLength",
                        "minWindowDensity",
                        "totalCurrency",
                        "globalSlotSinceGenesis",
                        "stakingEpochData",
                        "nextEpochData"
                      ],
                      entries: {
                        snarkedLedgerHash: {
                          type: "option",
                          optionType: "flaggedOption",
                          inner: { type: "Field" }
                        },
                        blockchainLength: {
                          type: "option",
                          optionType: "closedInterval",
                          rangeMin: "0",
                          rangeMax: "4294967295",
                          inner: {
                            type: "object",
                            name: "LengthInterval",
                            docs: null,
                            keys: ["lower", "upper"],
                            entries: {
                              lower: { type: "UInt32" },
                              upper: { type: "UInt32" }
                            },
                            docEntries: { lower: null, upper: null }
                          }
                        },
                        minWindowDensity: {
                          type: "option",
                          optionType: "closedInterval",
                          rangeMin: "0",
                          rangeMax: "4294967295",
                          inner: {
                            type: "object",
                            name: "LengthInterval",
                            docs: null,
                            keys: ["lower", "upper"],
                            entries: {
                              lower: { type: "UInt32" },
                              upper: { type: "UInt32" }
                            },
                            docEntries: { lower: null, upper: null }
                          }
                        },
                        totalCurrency: {
                          type: "option",
                          optionType: "closedInterval",
                          rangeMin: "0",
                          rangeMax: "18446744073709551615",
                          inner: {
                            type: "object",
                            name: "CurrencyAmountInterval",
                            docs: null,
                            keys: ["lower", "upper"],
                            entries: {
                              lower: { type: "UInt64" },
                              upper: { type: "UInt64" }
                            },
                            docEntries: { lower: null, upper: null }
                          }
                        },
                        globalSlotSinceGenesis: {
                          type: "option",
                          optionType: "closedInterval",
                          rangeMin: "0",
                          rangeMax: "4294967295",
                          inner: {
                            type: "object",
                            name: "GlobalSlotSinceGenesisInterval",
                            docs: null,
                            keys: ["lower", "upper"],
                            entries: {
                              lower: { type: "UInt32" },
                              upper: { type: "UInt32" }
                            },
                            docEntries: { lower: null, upper: null }
                          }
                        },
                        stakingEpochData: {
                          type: "object",
                          name: "EpochDataPrecondition",
                          docs: null,
                          keys: [
                            "ledger",
                            "seed",
                            "startCheckpoint",
                            "lockCheckpoint",
                            "epochLength"
                          ],
                          entries: {
                            ledger: {
                              type: "object",
                              name: "EpochLedgerPrecondition",
                              docs: null,
                              keys: ["hash", "totalCurrency"],
                              entries: {
                                hash: {
                                  type: "option",
                                  optionType: "flaggedOption",
                                  inner: { type: "Field" }
                                },
                                totalCurrency: {
                                  type: "option",
                                  optionType: "closedInterval",
                                  rangeMin: "0",
                                  rangeMax: "18446744073709551615",
                                  inner: {
                                    type: "object",
                                    name: "CurrencyAmountInterval",
                                    docs: null,
                                    keys: ["lower", "upper"],
                                    entries: {
                                      lower: { type: "UInt64" },
                                      upper: { type: "UInt64" }
                                    },
                                    docEntries: { lower: null, upper: null }
                                  }
                                }
                              },
                              docEntries: { hash: null, totalCurrency: null }
                            },
                            seed: {
                              type: "option",
                              optionType: "flaggedOption",
                              inner: { type: "Field" }
                            },
                            startCheckpoint: {
                              type: "option",
                              optionType: "flaggedOption",
                              inner: { type: "Field" }
                            },
                            lockCheckpoint: {
                              type: "option",
                              optionType: "flaggedOption",
                              inner: { type: "Field" }
                            },
                            epochLength: {
                              type: "option",
                              optionType: "closedInterval",
                              rangeMin: "0",
                              rangeMax: "4294967295",
                              inner: {
                                type: "object",
                                name: "LengthInterval",
                                docs: null,
                                keys: ["lower", "upper"],
                                entries: {
                                  lower: { type: "UInt32" },
                                  upper: { type: "UInt32" }
                                },
                                docEntries: { lower: null, upper: null }
                              }
                            }
                          },
                          docEntries: {
                            ledger: null,
                            seed: null,
                            startCheckpoint: null,
                            lockCheckpoint: null,
                            epochLength: null
                          }
                        },
                        nextEpochData: {
                          type: "object",
                          name: "EpochDataPrecondition",
                          docs: null,
                          keys: [
                            "ledger",
                            "seed",
                            "startCheckpoint",
                            "lockCheckpoint",
                            "epochLength"
                          ],
                          entries: {
                            ledger: {
                              type: "object",
                              name: "EpochLedgerPrecondition",
                              docs: null,
                              keys: ["hash", "totalCurrency"],
                              entries: {
                                hash: {
                                  type: "option",
                                  optionType: "flaggedOption",
                                  inner: { type: "Field" }
                                },
                                totalCurrency: {
                                  type: "option",
                                  optionType: "closedInterval",
                                  rangeMin: "0",
                                  rangeMax: "18446744073709551615",
                                  inner: {
                                    type: "object",
                                    name: "CurrencyAmountInterval",
                                    docs: null,
                                    keys: ["lower", "upper"],
                                    entries: {
                                      lower: { type: "UInt64" },
                                      upper: { type: "UInt64" }
                                    },
                                    docEntries: { lower: null, upper: null }
                                  }
                                }
                              },
                              docEntries: { hash: null, totalCurrency: null }
                            },
                            seed: {
                              type: "option",
                              optionType: "flaggedOption",
                              inner: { type: "Field" }
                            },
                            startCheckpoint: {
                              type: "option",
                              optionType: "flaggedOption",
                              inner: { type: "Field" }
                            },
                            lockCheckpoint: {
                              type: "option",
                              optionType: "flaggedOption",
                              inner: { type: "Field" }
                            },
                            epochLength: {
                              type: "option",
                              optionType: "closedInterval",
                              rangeMin: "0",
                              rangeMax: "4294967295",
                              inner: {
                                type: "object",
                                name: "LengthInterval",
                                docs: null,
                                keys: ["lower", "upper"],
                                entries: {
                                  lower: { type: "UInt32" },
                                  upper: { type: "UInt32" }
                                },
                                docEntries: { lower: null, upper: null }
                              }
                            }
                          },
                          docEntries: {
                            ledger: null,
                            seed: null,
                            startCheckpoint: null,
                            lockCheckpoint: null,
                            epochLength: null
                          }
                        }
                      },
                      docEntries: {
                        snarkedLedgerHash: null,
                        blockchainLength: null,
                        minWindowDensity: null,
                        totalCurrency: null,
                        globalSlotSinceGenesis: null,
                        stakingEpochData: null,
                        nextEpochData: null
                      }
                    },
                    account: {
                      type: "object",
                      name: "AccountPrecondition",
                      docs: null,
                      keys: [
                        "balance",
                        "nonce",
                        "receiptChainHash",
                        "delegate",
                        "state",
                        "actionState",
                        "provedState",
                        "isNew"
                      ],
                      entries: {
                        balance: {
                          type: "option",
                          optionType: "closedInterval",
                          rangeMin: "0",
                          rangeMax: "18446744073709551615",
                          inner: {
                            type: "object",
                            name: "BalanceInterval",
                            docs: null,
                            keys: ["lower", "upper"],
                            entries: {
                              lower: { type: "UInt64" },
                              upper: { type: "UInt64" }
                            },
                            docEntries: { lower: null, upper: null }
                          }
                        },
                        nonce: {
                          type: "option",
                          optionType: "closedInterval",
                          rangeMin: "0",
                          rangeMax: "4294967295",
                          inner: {
                            type: "object",
                            name: "NonceInterval",
                            docs: null,
                            keys: ["lower", "upper"],
                            entries: {
                              lower: { type: "UInt32" },
                              upper: { type: "UInt32" }
                            },
                            docEntries: { lower: null, upper: null }
                          }
                        },
                        receiptChainHash: {
                          type: "option",
                          optionType: "flaggedOption",
                          inner: { type: "Field" }
                        },
                        delegate: {
                          type: "option",
                          optionType: "flaggedOption",
                          inner: { type: "PublicKey" }
                        },
                        state: {
                          type: "array",
                          inner: {
                            type: "option",
                            optionType: "flaggedOption",
                            inner: { type: "Field" }
                          },
                          staticLength: 8
                        },
                        actionState: {
                          type: "option",
                          optionType: "flaggedOption",
                          inner: {
                            type: "Field",
                            checkedType: { type: "Field" },
                            checkedTypeName: "ActionState"
                          }
                        },
                        provedState: {
                          type: "option",
                          optionType: "flaggedOption",
                          inner: { type: "Bool" }
                        },
                        isNew: {
                          type: "option",
                          optionType: "flaggedOption",
                          inner: { type: "Bool" }
                        }
                      },
                      docEntries: {
                        balance: null,
                        nonce: null,
                        receiptChainHash: null,
                        delegate: null,
                        state: null,
                        actionState: null,
                        provedState: null,
                        isNew: null
                      }
                    },
                    validWhile: {
                      type: "option",
                      optionType: "closedInterval",
                      rangeMin: "0",
                      rangeMax: "4294967295",
                      inner: {
                        type: "object",
                        name: "GlobalSlotSinceGenesisInterval",
                        docs: null,
                        keys: ["lower", "upper"],
                        entries: {
                          lower: { type: "UInt32" },
                          upper: { type: "UInt32" }
                        },
                        docEntries: { lower: null, upper: null }
                      }
                    }
                  },
                  docEntries: {
                    network: null,
                    account: null,
                    validWhile: null
                  }
                },
                useFullCommitment: { type: "Bool" },
                implicitAccountCreationFee: { type: "Bool" },
                mayUseToken: {
                  type: "object",
                  name: "MayUseToken",
                  docs: null,
                  keys: ["parentsOwnToken", "inheritFromParent"],
                  entries: {
                    parentsOwnToken: { type: "Bool" },
                    inheritFromParent: { type: "Bool" }
                  },
                  docEntries: {
                    parentsOwnToken: null,
                    inheritFromParent: null
                  }
                },
                authorizationKind: {
                  type: "object",
                  name: "AuthorizationKindStructured",
                  docs: null,
                  keys: ["isSigned", "isProved", "verificationKeyHash"],
                  entries: {
                    isSigned: { type: "Bool" },
                    isProved: { type: "Bool" },
                    verificationKeyHash: {
                      type: "Field",
                      checkedType: { type: "Field" },
                      checkedTypeName: "VerificationKeyHash"
                    }
                  },
                  docEntries: {
                    isSigned: null,
                    isProved: null,
                    verificationKeyHash: null
                  }
                }
              },
              docEntries: {
                publicKey: null,
                tokenId: null,
                update: null,
                balanceChange: null,
                incrementNonce: null,
                events: null,
                actions: null,
                callData: null,
                callDepth: null,
                preconditions: null,
                useFullCommitment: null,
                implicitAccountCreationFee: null,
                mayUseToken: null,
                authorizationKind: null
              }
            },
            authorization: {
              type: "object",
              name: "Control",
              docs: null,
              keys: ["proof", "signature"],
              entries: {
                proof: {
                  type: "option",
                  optionType: "orUndefined",
                  inner: { type: "string" }
                },
                signature: {
                  type: "option",
                  optionType: "orUndefined",
                  inner: { type: "string" }
                }
              },
              docEntries: { proof: null, signature: null }
            }
          },
          docEntries: { body: null, authorization: null }
        },
        staticLength: null
      },
      memo: { type: "string" }
    },
    docEntries: { feePayer: null, accountUpdates: null, memo: null }
  },
  AccountUpdate: {
    type: "object",
    name: "ZkappAccountUpdate",
    docs: "An account update in a zkApp transaction",
    keys: ["body", "authorization"],
    entries: {
      body: {
        type: "object",
        name: "AccountUpdateBody",
        docs: null,
        keys: [
          "publicKey",
          "tokenId",
          "update",
          "balanceChange",
          "incrementNonce",
          "events",
          "actions",
          "callData",
          "callDepth",
          "preconditions",
          "useFullCommitment",
          "implicitAccountCreationFee",
          "mayUseToken",
          "authorizationKind"
        ],
        entries: {
          publicKey: { type: "PublicKey" },
          tokenId: { type: "TokenId" },
          update: {
            type: "object",
            name: "AccountUpdateModification",
            docs: null,
            keys: [
              "appState",
              "delegate",
              "verificationKey",
              "permissions",
              "zkappUri",
              "tokenSymbol",
              "timing",
              "votingFor"
            ],
            entries: {
              appState: {
                type: "array",
                inner: {
                  type: "option",
                  optionType: "flaggedOption",
                  inner: { type: "Field" }
                },
                staticLength: 8
              },
              delegate: {
                type: "option",
                optionType: "flaggedOption",
                inner: { type: "PublicKey" }
              },
              verificationKey: {
                type: "option",
                optionType: "flaggedOption",
                inner: {
                  type: "object",
                  name: "VerificationKeyWithHash",
                  docs: null,
                  keys: ["data", "hash"],
                  entries: {
                    data: { type: "string" },
                    hash: { type: "Field" }
                  },
                  docEntries: { data: null, hash: null }
                }
              },
              permissions: {
                type: "option",
                optionType: "flaggedOption",
                inner: {
                  type: "object",
                  name: "Permissions",
                  docs: null,
                  keys: [
                    "editState",
                    "access",
                    "send",
                    "receive",
                    "setDelegate",
                    "setPermissions",
                    "setVerificationKey",
                    "setZkappUri",
                    "editActionState",
                    "setTokenSymbol",
                    "incrementNonce",
                    "setVotingFor",
                    "setTiming"
                  ],
                  entries: {
                    editState: { type: "AuthRequired" },
                    access: { type: "AuthRequired" },
                    send: { type: "AuthRequired" },
                    receive: { type: "AuthRequired" },
                    setDelegate: { type: "AuthRequired" },
                    setPermissions: { type: "AuthRequired" },
                    setVerificationKey: { type: "AuthRequired" },
                    setZkappUri: { type: "AuthRequired" },
                    editActionState: { type: "AuthRequired" },
                    setTokenSymbol: { type: "AuthRequired" },
                    incrementNonce: { type: "AuthRequired" },
                    setVotingFor: { type: "AuthRequired" },
                    setTiming: { type: "AuthRequired" }
                  },
                  docEntries: {
                    editState: null,
                    access: null,
                    send: null,
                    receive: null,
                    setDelegate: null,
                    setPermissions: null,
                    setVerificationKey: null,
                    setZkappUri: null,
                    editActionState: null,
                    setTokenSymbol: null,
                    incrementNonce: null,
                    setVotingFor: null,
                    setTiming: null
                  }
                }
              },
              zkappUri: {
                type: "option",
                optionType: "flaggedOption",
                inner: {
                  type: "string",
                  checkedType: {
                    type: "object",
                    name: "Events",
                    docs: null,
                    keys: ["data", "hash"],
                    entries: {
                      data: { type: "string" },
                      hash: { type: "Field" }
                    },
                    docEntries: { data: null, hash: null }
                  },
                  checkedTypeName: "ZkappUri"
                }
              },
              tokenSymbol: {
                type: "option",
                optionType: "flaggedOption",
                inner: {
                  type: "string",
                  checkedType: {
                    type: "object",
                    name: "Anonymous",
                    docs: null,
                    keys: ["symbol", "field"],
                    entries: {
                      symbol: { type: "string" },
                      field: { type: "Field" }
                    },
                    docEntries: { symbol: "", field: "" }
                  },
                  checkedTypeName: "TokenSymbol"
                }
              },
              timing: {
                type: "option",
                optionType: "flaggedOption",
                inner: {
                  type: "object",
                  name: "Timing",
                  docs: null,
                  keys: [
                    "initialMinimumBalance",
                    "cliffTime",
                    "cliffAmount",
                    "vestingPeriod",
                    "vestingIncrement"
                  ],
                  entries: {
                    initialMinimumBalance: { type: "UInt64" },
                    cliffTime: { type: "UInt32" },
                    cliffAmount: { type: "UInt64" },
                    vestingPeriod: { type: "UInt32" },
                    vestingIncrement: { type: "UInt64" }
                  },
                  docEntries: {
                    initialMinimumBalance: null,
                    cliffTime: null,
                    cliffAmount: null,
                    vestingPeriod: null,
                    vestingIncrement: null
                  }
                }
              },
              votingFor: {
                type: "option",
                optionType: "flaggedOption",
                inner: {
                  type: "Field",
                  checkedType: { type: "Field" },
                  checkedTypeName: "StateHash"
                }
              }
            },
            docEntries: {
              appState: null,
              delegate: null,
              verificationKey: null,
              permissions: null,
              zkappUri: null,
              tokenSymbol: null,
              timing: null,
              votingFor: null
            }
          },
          balanceChange: {
            type: "object",
            name: "BalanceChange",
            docs: null,
            keys: ["magnitude", "sgn"],
            entries: { magnitude: { type: "UInt64" }, sgn: { type: "Sign" } },
            docEntries: { magnitude: null, sgn: null }
          },
          incrementNonce: { type: "Bool" },
          events: {
            type: "array",
            inner: {
              type: "array",
              inner: { type: "Field" },
              staticLength: null
            },
            staticLength: null,
            checkedType: {
              type: "object",
              name: "Events",
              docs: null,
              keys: ["data", "hash"],
              entries: {
                data: {
                  type: "array",
                  inner: {
                    type: "array",
                    inner: { type: "Field" },
                    staticLength: null
                  },
                  staticLength: null
                },
                hash: { type: "Field" }
              },
              docEntries: { data: null, hash: null }
            },
            checkedTypeName: "Events"
          },
          actions: {
            type: "array",
            inner: {
              type: "array",
              inner: { type: "Field" },
              staticLength: null
            },
            staticLength: null,
            checkedType: {
              type: "object",
              name: "Events",
              docs: null,
              keys: ["data", "hash"],
              entries: {
                data: {
                  type: "array",
                  inner: {
                    type: "array",
                    inner: { type: "Field" },
                    staticLength: null
                  },
                  staticLength: null
                },
                hash: { type: "Field" }
              },
              docEntries: { data: null, hash: null }
            },
            checkedTypeName: "Actions"
          },
          callData: { type: "Field" },
          callDepth: { type: "number" },
          preconditions: {
            type: "object",
            name: "Preconditions",
            docs: null,
            keys: ["network", "account", "validWhile"],
            entries: {
              network: {
                type: "object",
                name: "NetworkPrecondition",
                docs: null,
                keys: [
                  "snarkedLedgerHash",
                  "blockchainLength",
                  "minWindowDensity",
                  "totalCurrency",
                  "globalSlotSinceGenesis",
                  "stakingEpochData",
                  "nextEpochData"
                ],
                entries: {
                  snarkedLedgerHash: {
                    type: "option",
                    optionType: "flaggedOption",
                    inner: { type: "Field" }
                  },
                  blockchainLength: {
                    type: "option",
                    optionType: "closedInterval",
                    rangeMin: "0",
                    rangeMax: "4294967295",
                    inner: {
                      type: "object",
                      name: "LengthInterval",
                      docs: null,
                      keys: ["lower", "upper"],
                      entries: {
                        lower: { type: "UInt32" },
                        upper: { type: "UInt32" }
                      },
                      docEntries: { lower: null, upper: null }
                    }
                  },
                  minWindowDensity: {
                    type: "option",
                    optionType: "closedInterval",
                    rangeMin: "0",
                    rangeMax: "4294967295",
                    inner: {
                      type: "object",
                      name: "LengthInterval",
                      docs: null,
                      keys: ["lower", "upper"],
                      entries: {
                        lower: { type: "UInt32" },
                        upper: { type: "UInt32" }
                      },
                      docEntries: { lower: null, upper: null }
                    }
                  },
                  totalCurrency: {
                    type: "option",
                    optionType: "closedInterval",
                    rangeMin: "0",
                    rangeMax: "18446744073709551615",
                    inner: {
                      type: "object",
                      name: "CurrencyAmountInterval",
                      docs: null,
                      keys: ["lower", "upper"],
                      entries: {
                        lower: { type: "UInt64" },
                        upper: { type: "UInt64" }
                      },
                      docEntries: { lower: null, upper: null }
                    }
                  },
                  globalSlotSinceGenesis: {
                    type: "option",
                    optionType: "closedInterval",
                    rangeMin: "0",
                    rangeMax: "4294967295",
                    inner: {
                      type: "object",
                      name: "GlobalSlotSinceGenesisInterval",
                      docs: null,
                      keys: ["lower", "upper"],
                      entries: {
                        lower: { type: "UInt32" },
                        upper: { type: "UInt32" }
                      },
                      docEntries: { lower: null, upper: null }
                    }
                  },
                  stakingEpochData: {
                    type: "object",
                    name: "EpochDataPrecondition",
                    docs: null,
                    keys: [
                      "ledger",
                      "seed",
                      "startCheckpoint",
                      "lockCheckpoint",
                      "epochLength"
                    ],
                    entries: {
                      ledger: {
                        type: "object",
                        name: "EpochLedgerPrecondition",
                        docs: null,
                        keys: ["hash", "totalCurrency"],
                        entries: {
                          hash: {
                            type: "option",
                            optionType: "flaggedOption",
                            inner: { type: "Field" }
                          },
                          totalCurrency: {
                            type: "option",
                            optionType: "closedInterval",
                            rangeMin: "0",
                            rangeMax: "18446744073709551615",
                            inner: {
                              type: "object",
                              name: "CurrencyAmountInterval",
                              docs: null,
                              keys: ["lower", "upper"],
                              entries: {
                                lower: { type: "UInt64" },
                                upper: { type: "UInt64" }
                              },
                              docEntries: { lower: null, upper: null }
                            }
                          }
                        },
                        docEntries: { hash: null, totalCurrency: null }
                      },
                      seed: {
                        type: "option",
                        optionType: "flaggedOption",
                        inner: { type: "Field" }
                      },
                      startCheckpoint: {
                        type: "option",
                        optionType: "flaggedOption",
                        inner: { type: "Field" }
                      },
                      lockCheckpoint: {
                        type: "option",
                        optionType: "flaggedOption",
                        inner: { type: "Field" }
                      },
                      epochLength: {
                        type: "option",
                        optionType: "closedInterval",
                        rangeMin: "0",
                        rangeMax: "4294967295",
                        inner: {
                          type: "object",
                          name: "LengthInterval",
                          docs: null,
                          keys: ["lower", "upper"],
                          entries: {
                            lower: { type: "UInt32" },
                            upper: { type: "UInt32" }
                          },
                          docEntries: { lower: null, upper: null }
                        }
                      }
                    },
                    docEntries: {
                      ledger: null,
                      seed: null,
                      startCheckpoint: null,
                      lockCheckpoint: null,
                      epochLength: null
                    }
                  },
                  nextEpochData: {
                    type: "object",
                    name: "EpochDataPrecondition",
                    docs: null,
                    keys: [
                      "ledger",
                      "seed",
                      "startCheckpoint",
                      "lockCheckpoint",
                      "epochLength"
                    ],
                    entries: {
                      ledger: {
                        type: "object",
                        name: "EpochLedgerPrecondition",
                        docs: null,
                        keys: ["hash", "totalCurrency"],
                        entries: {
                          hash: {
                            type: "option",
                            optionType: "flaggedOption",
                            inner: { type: "Field" }
                          },
                          totalCurrency: {
                            type: "option",
                            optionType: "closedInterval",
                            rangeMin: "0",
                            rangeMax: "18446744073709551615",
                            inner: {
                              type: "object",
                              name: "CurrencyAmountInterval",
                              docs: null,
                              keys: ["lower", "upper"],
                              entries: {
                                lower: { type: "UInt64" },
                                upper: { type: "UInt64" }
                              },
                              docEntries: { lower: null, upper: null }
                            }
                          }
                        },
                        docEntries: { hash: null, totalCurrency: null }
                      },
                      seed: {
                        type: "option",
                        optionType: "flaggedOption",
                        inner: { type: "Field" }
                      },
                      startCheckpoint: {
                        type: "option",
                        optionType: "flaggedOption",
                        inner: { type: "Field" }
                      },
                      lockCheckpoint: {
                        type: "option",
                        optionType: "flaggedOption",
                        inner: { type: "Field" }
                      },
                      epochLength: {
                        type: "option",
                        optionType: "closedInterval",
                        rangeMin: "0",
                        rangeMax: "4294967295",
                        inner: {
                          type: "object",
                          name: "LengthInterval",
                          docs: null,
                          keys: ["lower", "upper"],
                          entries: {
                            lower: { type: "UInt32" },
                            upper: { type: "UInt32" }
                          },
                          docEntries: { lower: null, upper: null }
                        }
                      }
                    },
                    docEntries: {
                      ledger: null,
                      seed: null,
                      startCheckpoint: null,
                      lockCheckpoint: null,
                      epochLength: null
                    }
                  }
                },
                docEntries: {
                  snarkedLedgerHash: null,
                  blockchainLength: null,
                  minWindowDensity: null,
                  totalCurrency: null,
                  globalSlotSinceGenesis: null,
                  stakingEpochData: null,
                  nextEpochData: null
                }
              },
              account: {
                type: "object",
                name: "AccountPrecondition",
                docs: null,
                keys: [
                  "balance",
                  "nonce",
                  "receiptChainHash",
                  "delegate",
                  "state",
                  "actionState",
                  "provedState",
                  "isNew"
                ],
                entries: {
                  balance: {
                    type: "option",
                    optionType: "closedInterval",
                    rangeMin: "0",
                    rangeMax: "18446744073709551615",
                    inner: {
                      type: "object",
                      name: "BalanceInterval",
                      docs: null,
                      keys: ["lower", "upper"],
                      entries: {
                        lower: { type: "UInt64" },
                        upper: { type: "UInt64" }
                      },
                      docEntries: { lower: null, upper: null }
                    }
                  },
                  nonce: {
                    type: "option",
                    optionType: "closedInterval",
                    rangeMin: "0",
                    rangeMax: "4294967295",
                    inner: {
                      type: "object",
                      name: "NonceInterval",
                      docs: null,
                      keys: ["lower", "upper"],
                      entries: {
                        lower: { type: "UInt32" },
                        upper: { type: "UInt32" }
                      },
                      docEntries: { lower: null, upper: null }
                    }
                  },
                  receiptChainHash: {
                    type: "option",
                    optionType: "flaggedOption",
                    inner: { type: "Field" }
                  },
                  delegate: {
                    type: "option",
                    optionType: "flaggedOption",
                    inner: { type: "PublicKey" }
                  },
                  state: {
                    type: "array",
                    inner: {
                      type: "option",
                      optionType: "flaggedOption",
                      inner: { type: "Field" }
                    },
                    staticLength: 8
                  },
                  actionState: {
                    type: "option",
                    optionType: "flaggedOption",
                    inner: {
                      type: "Field",
                      checkedType: { type: "Field" },
                      checkedTypeName: "ActionState"
                    }
                  },
                  provedState: {
                    type: "option",
                    optionType: "flaggedOption",
                    inner: { type: "Bool" }
                  },
                  isNew: {
                    type: "option",
                    optionType: "flaggedOption",
                    inner: { type: "Bool" }
                  }
                },
                docEntries: {
                  balance: null,
                  nonce: null,
                  receiptChainHash: null,
                  delegate: null,
                  state: null,
                  actionState: null,
                  provedState: null,
                  isNew: null
                }
              },
              validWhile: {
                type: "option",
                optionType: "closedInterval",
                rangeMin: "0",
                rangeMax: "4294967295",
                inner: {
                  type: "object",
                  name: "GlobalSlotSinceGenesisInterval",
                  docs: null,
                  keys: ["lower", "upper"],
                  entries: {
                    lower: { type: "UInt32" },
                    upper: { type: "UInt32" }
                  },
                  docEntries: { lower: null, upper: null }
                }
              }
            },
            docEntries: { network: null, account: null, validWhile: null }
          },
          useFullCommitment: { type: "Bool" },
          implicitAccountCreationFee: { type: "Bool" },
          mayUseToken: {
            type: "object",
            name: "MayUseToken",
            docs: null,
            keys: ["parentsOwnToken", "inheritFromParent"],
            entries: {
              parentsOwnToken: { type: "Bool" },
              inheritFromParent: { type: "Bool" }
            },
            docEntries: { parentsOwnToken: null, inheritFromParent: null }
          },
          authorizationKind: {
            type: "object",
            name: "AuthorizationKindStructured",
            docs: null,
            keys: ["isSigned", "isProved", "verificationKeyHash"],
            entries: {
              isSigned: { type: "Bool" },
              isProved: { type: "Bool" },
              verificationKeyHash: {
                type: "Field",
                checkedType: { type: "Field" },
                checkedTypeName: "VerificationKeyHash"
              }
            },
            docEntries: {
              isSigned: null,
              isProved: null,
              verificationKeyHash: null
            }
          }
        },
        docEntries: {
          publicKey: null,
          tokenId: null,
          update: null,
          balanceChange: null,
          incrementNonce: null,
          events: null,
          actions: null,
          callData: null,
          callDepth: null,
          preconditions: null,
          useFullCommitment: null,
          implicitAccountCreationFee: null,
          mayUseToken: null,
          authorizationKind: null
        }
      },
      authorization: {
        type: "object",
        name: "Control",
        docs: null,
        keys: ["proof", "signature"],
        entries: {
          proof: {
            type: "option",
            optionType: "orUndefined",
            inner: { type: "string" }
          },
          signature: {
            type: "option",
            optionType: "orUndefined",
            inner: { type: "string" }
          }
        },
        docEntries: { proof: null, signature: null }
      }
    },
    docEntries: { body: null, authorization: null }
  },
  Account: {
    type: "object",
    name: "Account",
    docs: null,
    keys: [
      "publicKey",
      "tokenId",
      "tokenSymbol",
      "balance",
      "nonce",
      "receiptChainHash",
      "delegate",
      "votingFor",
      "timing",
      "permissions",
      "zkapp"
    ],
    entries: {
      publicKey: { type: "PublicKey" },
      tokenId: { type: "TokenId" },
      tokenSymbol: { type: "string" },
      balance: { type: "UInt64" },
      nonce: { type: "UInt32" },
      receiptChainHash: {
        type: "Field",
        checkedType: { type: "Field" },
        checkedTypeName: "ReceiptChainHash"
      },
      delegate: {
        type: "option",
        optionType: "orUndefined",
        inner: { type: "PublicKey" }
      },
      votingFor: { type: "Field" },
      timing: {
        type: "object",
        name: "AccountTiming",
        docs: null,
        keys: [
          "isTimed",
          "initialMinimumBalance",
          "cliffTime",
          "cliffAmount",
          "vestingPeriod",
          "vestingIncrement"
        ],
        entries: {
          isTimed: { type: "Bool" },
          initialMinimumBalance: { type: "UInt64" },
          cliffTime: { type: "UInt32" },
          cliffAmount: { type: "UInt64" },
          vestingPeriod: { type: "UInt32" },
          vestingIncrement: { type: "UInt64" }
        },
        docEntries: {
          isTimed: null,
          initialMinimumBalance: null,
          cliffTime: null,
          cliffAmount: null,
          vestingPeriod: null,
          vestingIncrement: null
        }
      },
      permissions: {
        type: "object",
        name: "Permissions",
        docs: null,
        keys: [
          "editState",
          "access",
          "send",
          "receive",
          "setDelegate",
          "setPermissions",
          "setVerificationKey",
          "setZkappUri",
          "editActionState",
          "setTokenSymbol",
          "incrementNonce",
          "setVotingFor",
          "setTiming"
        ],
        entries: {
          editState: { type: "AuthRequired" },
          access: { type: "AuthRequired" },
          send: { type: "AuthRequired" },
          receive: { type: "AuthRequired" },
          setDelegate: { type: "AuthRequired" },
          setPermissions: { type: "AuthRequired" },
          setVerificationKey: { type: "AuthRequired" },
          setZkappUri: { type: "AuthRequired" },
          editActionState: { type: "AuthRequired" },
          setTokenSymbol: { type: "AuthRequired" },
          incrementNonce: { type: "AuthRequired" },
          setVotingFor: { type: "AuthRequired" },
          setTiming: { type: "AuthRequired" }
        },
        docEntries: {
          editState: null,
          access: null,
          send: null,
          receive: null,
          setDelegate: null,
          setPermissions: null,
          setVerificationKey: null,
          setZkappUri: null,
          editActionState: null,
          setTokenSymbol: null,
          incrementNonce: null,
          setVotingFor: null,
          setTiming: null
        }
      },
      zkapp: {
        type: "option",
        optionType: "orUndefined",
        inner: {
          type: "object",
          name: "ZkappAccount",
          docs: null,
          keys: [
            "appState",
            "verificationKey",
            "zkappVersion",
            "actionState",
            "lastActionSlot",
            "provedState",
            "zkappUri"
          ],
          entries: {
            appState: {
              type: "array",
              inner: { type: "Field" },
              staticLength: 8
            },
            verificationKey: {
              type: "option",
              optionType: "orUndefined",
              inner: {
                type: "object",
                name: "VerificationKeyWithHash",
                docs: null,
                keys: ["data", "hash"],
                entries: { data: { type: "string" }, hash: { type: "Field" } },
                docEntries: { data: null, hash: null }
              }
            },
            zkappVersion: { type: "UInt32" },
            actionState: {
              type: "array",
              inner: { type: "Field" },
              staticLength: 5
            },
            lastActionSlot: { type: "UInt32" },
            provedState: { type: "Bool" },
            zkappUri: { type: "string" }
          },
          docEntries: {
            appState: null,
            verificationKey: null,
            zkappVersion: null,
            actionState: null,
            lastActionSlot: null,
            provedState: null,
            zkappUri: null
          }
        }
      }
    },
    docEntries: {
      publicKey: null,
      tokenId: null,
      tokenSymbol: null,
      balance: null,
      nonce: null,
      receiptChainHash: null,
      delegate: null,
      votingFor: null,
      timing: null,
      permissions: null,
      zkapp: null
    }
  }
};

// dist/node/bindings/mina-transaction/gen/transaction.js
var TypeMap = {
  PublicKey: PublicKey2,
  UInt64: UInt642,
  UInt32: UInt322,
  TokenId,
  Field: Field4,
  Bool: Bool4,
  AuthRequired,
  Sign: Sign3
};
var customTypes = {
  ZkappUri,
  TokenSymbol: TokenSymbol2,
  StateHash,
  Events,
  Actions,
  ActionState,
  VerificationKeyHash,
  ReceiptChainHash
};
var { provableFromLayout, toJSONEssential, emptyValue } = ProvableFromLayout(TypeMap, customTypes);
var ZkappCommand = provableFromLayout(jsLayout.ZkappCommand);
var AccountUpdate = provableFromLayout(jsLayout.AccountUpdate);
var Account = provableFromLayout(jsLayout.Account);

// dist/node/bindings/mina-transaction/gen/transaction-bigint.js
var transaction_bigint_exports = {};
__export(transaction_bigint_exports, {
  Account: () => Account2,
  AccountUpdate: () => AccountUpdate2,
  ActionState: () => ActionState2,
  Actions: () => Actions2,
  AuthRequired: () => AuthRequired2,
  Bool: () => Bool,
  Events: () => Events2,
  Field: () => Field,
  Json: () => transaction_json_exports,
  PublicKey: () => PublicKey,
  ReceiptChainHash: () => ReceiptChainHash2,
  Sign: () => Sign,
  StateHash: () => StateHash2,
  TokenId: () => TokenId2,
  TokenSymbol: () => TokenSymbol3,
  TypeMap: () => TypeMap2,
  UInt32: () => UInt32,
  UInt64: () => UInt64,
  VerificationKeyHash: () => VerificationKeyHash2,
  ZkappCommand: () => ZkappCommand2,
  ZkappUri: () => ZkappUri2,
  customTypes: () => customTypes2,
  emptyValue: () => emptyValue2,
  provableFromLayout: () => provableFromLayout2,
  toJSONEssential: () => toJSONEssential2
});

// dist/node/bindings/mina-transaction/transaction-leaves-bigint.js
var { TokenId: TokenId2, StateHash: StateHash2, TokenSymbol: TokenSymbol3, AuthRequired: AuthRequired2, ZkappUri: ZkappUri2 } = derivedLeafTypes({ Field, Bool, Hash: Hash2, packToFields: packToFields2 });
var { Events: Events2, Actions: Actions2 } = createEvents({ Field, Poseidon });
var ActionState2 = {
  ...Field,
  emptyValue: Actions2.emptyActionState
};
var VerificationKeyHash2 = {
  ...Field,
  emptyValue: () => Field(mocks.dummyVerificationKeyHash)
};
var ReceiptChainHash2 = {
  ...Field,
  emptyValue: () => Hash2.emptyHashWithPrefix("CodaReceiptEmpty")
};

// dist/node/bindings/mina-transaction/gen/transaction-bigint.js
var TypeMap2 = {
  PublicKey,
  UInt64,
  UInt32,
  TokenId: TokenId2,
  Field,
  Bool,
  AuthRequired: AuthRequired2,
  Sign
};
var customTypes2 = {
  ZkappUri: ZkappUri2,
  TokenSymbol: TokenSymbol3,
  StateHash: StateHash2,
  Events: Events2,
  Actions: Actions2,
  ActionState: ActionState2,
  VerificationKeyHash: VerificationKeyHash2,
  ReceiptChainHash: ReceiptChainHash2
};
var { provableFromLayout: provableFromLayout2, toJSONEssential: toJSONEssential2, emptyValue: emptyValue2 } = ProvableFromLayout(TypeMap2, customTypes2);
var ZkappCommand2 = provableFromLayout2(jsLayout.ZkappCommand);
var AccountUpdate2 = provableFromLayout2(jsLayout.AccountUpdate);
var Account2 = provableFromLayout2(jsLayout.Account);

// dist/node/lib/mina.js
var mina_exports = {};
__export(mina_exports, {
  BerkeleyQANet: () => BerkeleyQANet,
  LocalBlockchain: () => LocalBlockchain,
  Network: () => Network2,
  Transaction: () => Transaction,
  accountCreationFee: () => accountCreationFee,
  activeInstance: () => activeInstance,
  createTransaction: () => createTransaction,
  currentSlot: () => currentSlot,
  currentTransaction: () => currentTransaction,
  faucet: () => faucet,
  fetchActions: () => fetchActions2,
  fetchEvents: () => fetchEvents2,
  filterGroups: () => filterGroups,
  getAccount: () => getAccount,
  getActions: () => getActions,
  getBalance: () => getBalance,
  getNetworkState: () => getNetworkState,
  getProofsEnabled: () => getProofsEnabled,
  hasAccount: () => hasAccount,
  sendTransaction: () => sendTransaction,
  sender: () => sender,
  setActiveInstance: () => setActiveInstance,
  transaction: () => transaction,
  waitForFunding: () => waitForFunding
});

// dist/node/lib/zkapp.js
var import_tslib7 = require("tslib");

// dist/node/bindings/lib/encoding.js
var encoding_exports = {};
__export(encoding_exports, {
  Bijective: () => Bijective,
  bytesFromFields: () => bytesFromFields,
  bytesToFields: () => bytesToFields,
  stringFromFields: () => stringFromFields,
  stringToFields: () => stringToFields
});
function stringToFields(message) {
  let bytes = new TextEncoder().encode(message);
  return bytesToFields(bytes);
}
function stringFromFields(fields) {
  let bytes = bytesFromFields(fields);
  return new TextDecoder().decode(bytes);
}
var STOP = 1;
function bytesToFields(bytes) {
  let fields = [];
  let currentBigInt = 0n;
  let bitPosition = 0n;
  for (let byte of bytes) {
    currentBigInt += BigInt(byte) << bitPosition;
    bitPosition += 8n;
    if (bitPosition === 248n) {
      fields.push(Field4(currentBigInt.toString()));
      currentBigInt = 0n;
      bitPosition = 0n;
    }
  }
  currentBigInt += BigInt(STOP) << bitPosition;
  fields.push(Field4(currentBigInt.toString()));
  return fields;
}
function bytesFromFields(fields) {
  let lastChunk = fields.pop();
  if (lastChunk === void 0)
    return new Uint8Array();
  let lastChunkBytes = bytesOfConstantField(lastChunk);
  let i2 = lastChunkBytes.lastIndexOf(STOP, 30);
  if (i2 === -1)
    throw Error("Error (bytesFromFields): Invalid encoding.");
  let bytes = new Uint8Array(fields.length * 31 + i2);
  bytes.set(lastChunkBytes.subarray(0, i2), fields.length * 31);
  i2 = 0;
  for (let field of fields) {
    bytes.set(bytesOfConstantField(field).subarray(0, 31), i2);
    i2 += 31;
  }
  fields.push(lastChunk);
  return bytes;
}
var p2 = 0x40000000000000000000000000000000224698fc094cf91b992d30ed00000001n;
var q2 = 0x40000000000000000000000000000000224698fc0994a8dd8c46eb2100000001n;
var bytesPerBigInt = 32;
var bytesBase = 256n ** BigInt(bytesPerBigInt);
var Bijective = {
  Fp: {
    toBytes: (fields) => toBytesBijective(fields, p2),
    fromBytes: (bytes) => toFieldsBijective(bytes, p2),
    toString(fields) {
      return new TextDecoder().decode(toBytesBijective(fields, p2));
    },
    fromString(message) {
      let bytes = new TextEncoder().encode(message);
      return toFieldsBijective(bytes, p2);
    }
  },
  Fq: {
    toBytes: (fields) => toBytesBijective(fields, q2),
    fromBytes: (bytes) => toFieldsBijective(bytes, q2),
    toString(fields) {
      return new TextDecoder().decode(toBytesBijective(fields, q2));
    },
    fromString(message) {
      let bytes = new TextEncoder().encode(message);
      return toFieldsBijective(bytes, q2);
    }
  }
};
function toBytesBijective(fields, p3) {
  let fieldsBigInts = fields.map(fieldToBigInt);
  let bytesBig = changeBase(fieldsBigInts, p3, bytesBase);
  let bytes = bigIntArrayToBytes(bytesBig, bytesPerBigInt);
  return bytes;
}
function toFieldsBijective(bytes, p3) {
  let bytesBig = bytesToBigIntArray(bytes, bytesPerBigInt);
  let fieldsBigInts = changeBase(bytesBig, bytesBase, p3);
  let fields = fieldsBigInts.map(bigIntToField);
  return fields;
}
function bytesOfConstantField(field) {
  let value = field.value;
  if (value[0] !== 0)
    throw Error("Field is not constant");
  return value[1];
}
function fieldToBigInt(field) {
  let bytes = bytesOfConstantField(field);
  return bytesToBigInt(bytes);
}
function bigIntToField(x) {
  let field = Field4(1);
  field.value = [0, bigIntToBytes2(x, 32)];
  return field;
}
function bigIntToBytes2(x, length) {
  let bytes = [];
  for (; x > 0; x >>= 8n) {
    bytes.push(Number(x & 0xffn));
  }
  let array = new Uint8Array(bytes);
  if (length === void 0)
    return array;
  if (array.length > length)
    throw Error(`bigint doesn't fit into ${length} bytes.`);
  let sizedArray = new Uint8Array(length);
  sizedArray.set(array);
  return sizedArray;
}
function bytesToBigIntArray(bytes, bytesPerBigInt2) {
  let bigints = [];
  for (let i2 = 0; i2 < bytes.byteLength; i2 += bytesPerBigInt2) {
    bigints.push(bytesToBigInt(bytes.subarray(i2, i2 + bytesPerBigInt2)));
  }
  return bigints;
}
function bigIntArrayToBytes(bigints, bytesPerBigInt2) {
  let bytes = new Uint8Array(bigints.length * bytesPerBigInt2);
  let offset = 0;
  for (let b2 of bigints) {
    bytes.set(bigIntToBytes2(b2, bytesPerBigInt2), offset);
    offset += bytesPerBigInt2;
  }
  let i2 = bytes.byteLength - 1;
  for (; i2 >= 0; i2--) {
    if (bytes[i2] !== 0)
      break;
  }
  return bytes.slice(0, i2 + 1);
}

// dist/node/lib/precondition.js
function preconditions(accountUpdate, isSelf) {
  initializePreconditions(accountUpdate, isSelf);
  return {
    account: Account3(accountUpdate),
    network: Network(accountUpdate),
    currentSlot: CurrentSlot(accountUpdate)
  };
}
function Network(accountUpdate) {
  let layout = jsLayout.AccountUpdate.entries.body.entries.preconditions.entries.network;
  let context = getPreconditionContextExn(accountUpdate);
  let network = preconditionClass(layout, "network", accountUpdate, context);
  let timestamp = {
    get() {
      let slot = network.globalSlotSinceGenesis.get();
      return globalSlotToTimestamp(slot);
    },
    getAndAssertEquals() {
      let slot = network.globalSlotSinceGenesis.getAndAssertEquals();
      return globalSlotToTimestamp(slot);
    },
    assertEquals(value) {
      let { genesisTimestamp, slotTime } = activeInstance.getNetworkConstants();
      let slot = timestampToGlobalSlot(value, `Timestamp precondition unsatisfied: the timestamp can only equal numbers of the form ${genesisTimestamp} + k*${slotTime},
i.e., the genesis timestamp plus an integer number of slots.`);
      return network.globalSlotSinceGenesis.assertEquals(slot);
    },
    assertBetween(lower, upper) {
      let [slotLower, slotUpper] = timestampToGlobalSlotRange(lower, upper);
      return network.globalSlotSinceGenesis.assertBetween(slotLower, slotUpper);
    },
    assertNothing() {
      return network.globalSlotSinceGenesis.assertNothing();
    }
  };
  return { ...network, timestamp };
}
function Account3(accountUpdate) {
  let layout = jsLayout.AccountUpdate.entries.body.entries.preconditions.entries.account;
  let context = getPreconditionContextExn(accountUpdate);
  let identity = (x) => x;
  let update = {
    delegate: {
      ...preconditionSubclass(accountUpdate, "account.delegate", PublicKey2, context),
      ...updateSubclass(accountUpdate, "delegate", identity)
    },
    verificationKey: updateSubclass(accountUpdate, "verificationKey", identity),
    permissions: updateSubclass(accountUpdate, "permissions", identity),
    zkappUri: updateSubclass(accountUpdate, "zkappUri", ZkappUri.fromJSON),
    tokenSymbol: updateSubclass(accountUpdate, "tokenSymbol", TokenSymbol.from),
    timing: updateSubclass(accountUpdate, "timing", identity),
    votingFor: updateSubclass(accountUpdate, "votingFor", identity)
  };
  return {
    ...preconditionClass(layout, "account", accountUpdate, context),
    ...update
  };
}
function updateSubclass(accountUpdate, key, transform) {
  return {
    set(value) {
      accountUpdate.body.update[key].isSome = Bool4(true);
      accountUpdate.body.update[key].value = transform(value);
    }
  };
}
function CurrentSlot(accountUpdate) {
  let context = getPreconditionContextExn(accountUpdate);
  return {
    assertBetween(lower, upper) {
      context.constrained.add("validWhile");
      let property = accountUpdate.body.preconditions.validWhile;
      property.isSome = Bool4(true);
      property.value.lower = lower;
      property.value.upper = upper;
    }
  };
}
var unimplementedPreconditions = [
  // unimplemented because its not checked in the protocol
  "network.stakingEpochData.seed",
  "network.nextEpochData.seed"
];
var baseMap = { UInt64: UInt642, UInt32: UInt322, Field: Field4, Bool: Bool4, PublicKey: PublicKey2 };
function preconditionClass(layout, baseKey, accountUpdate, context) {
  if (layout.type === "option") {
    if (layout.optionType === "closedInterval") {
      let lower = layout.inner.entries.lower.type;
      let baseType = baseMap[lower];
      return preconditionSubClassWithRange(accountUpdate, baseKey, baseType, context);
    } else if (layout.optionType === "flaggedOption") {
      let baseType = baseMap[layout.inner.type];
      return preconditionSubclass(accountUpdate, baseKey, baseType, context);
    }
  } else if (layout.type === "array") {
    return {};
  } else if (layout.type === "object") {
    return Object.fromEntries(layout.keys.map((key) => {
      let value = layout.entries[key];
      return [
        key,
        preconditionClass(value, `${baseKey}.${key}`, accountUpdate, context)
      ];
    }));
  } else
    throw Error("bug");
}
function preconditionSubClassWithRange(accountUpdate, longKey, fieldType, context) {
  return {
    ...preconditionSubclass(accountUpdate, longKey, fieldType, context),
    assertBetween(lower, upper) {
      context.constrained.add(longKey);
      let property = getPath(accountUpdate.body.preconditions, longKey);
      property.isSome = Bool4(true);
      property.value.lower = lower;
      property.value.upper = upper;
    }
  };
}
function preconditionSubclass(accountUpdate, longKey, fieldType, context) {
  if (fieldType === void 0) {
    throw Error(`this.${longKey}: fieldType undefined`);
  }
  let obj = {
    get() {
      if (unimplementedPreconditions.includes(longKey)) {
        let self = context.isSelf ? "this" : "accountUpdate";
        throw Error(`${self}.${longKey}.get() is not implemented yet.`);
      }
      let { read, vars } = context;
      read.add(longKey);
      return vars[longKey] ?? (vars[longKey] = getVariable(accountUpdate, longKey, fieldType));
    },
    getAndAssertEquals() {
      let value = obj.get();
      obj.assertEquals(value);
      return value;
    },
    assertEquals(value) {
      context.constrained.add(longKey);
      let property = getPath(accountUpdate.body.preconditions, longKey);
      if ("isSome" in property) {
        property.isSome = Bool4(true);
        if ("lower" in property.value && "upper" in property.value) {
          property.value.lower = value;
          property.value.upper = value;
        } else {
          property.value = value;
        }
      } else {
        setPath(accountUpdate.body.preconditions, longKey, value);
      }
    },
    assertNothing() {
      context.constrained.add(longKey);
    }
  };
  return obj;
}
function getVariable(accountUpdate, longKey, fieldType) {
  return Provable.witness(fieldType, () => {
    let [accountOrNetwork, ...rest] = longKey.split(".");
    let key = rest.join(".");
    let value;
    if (accountOrNetwork === "account") {
      let account = getAccountPreconditions(accountUpdate.body);
      value = account[key];
    } else if (accountOrNetwork === "network") {
      let networkState = getNetworkState();
      value = getPath(networkState, key);
    } else if (accountOrNetwork === "validWhile") {
      let networkState = getNetworkState();
      value = networkState.globalSlotSinceGenesis;
    } else {
      throw Error("impossible");
    }
    return value;
  });
}
function globalSlotToTimestamp(slot) {
  let { genesisTimestamp, slotTime } = activeInstance.getNetworkConstants();
  return UInt642.from(slot).mul(slotTime).add(genesisTimestamp);
}
function timestampToGlobalSlot(timestamp, message) {
  let { genesisTimestamp, slotTime } = activeInstance.getNetworkConstants();
  let { quotient: slot, rest } = timestamp.sub(genesisTimestamp).divMod(slotTime);
  rest.value.assertEquals(Field4(0), message);
  return slot.toUInt32();
}
function timestampToGlobalSlotRange(tsLower, tsUpper) {
  let { genesisTimestamp, slotTime } = activeInstance.getNetworkConstants();
  let tsLowerInt = Int64.from(tsLower).sub(genesisTimestamp).add(slotTime).sub(1);
  let lowerCapped = Provable.if(tsLowerInt.isPositive(), UInt642, tsLowerInt.magnitude, UInt642.from(0));
  let slotLower = lowerCapped.div(slotTime).toUInt32Clamped();
  let slotUpper = tsUpper.sub(genesisTimestamp).div(slotTime).toUInt32Clamped();
  return [slotLower, slotUpper];
}
function getAccountPreconditions(body) {
  let { publicKey, tokenId } = body;
  let hasAccount2 = hasAccount(publicKey, tokenId);
  if (!hasAccount2) {
    return {
      balance: UInt642.zero,
      nonce: UInt322.zero,
      receiptChainHash: emptyReceiptChainHash(),
      actionState: Actions.emptyActionState(),
      delegate: publicKey,
      provedState: Bool4(false),
      isNew: Bool4(true)
    };
  }
  let account = getAccount(publicKey, tokenId);
  return {
    balance: account.balance,
    nonce: account.nonce,
    receiptChainHash: account.receiptChainHash,
    actionState: account.zkapp?.actionState?.[0] ?? Actions.emptyActionState(),
    delegate: account.delegate ?? account.publicKey,
    provedState: account.zkapp?.provedState ?? Bool4(false),
    isNew: Bool4(false)
  };
}
function initializePreconditions(accountUpdate, isSelf) {
  preconditionContexts.set(accountUpdate, {
    read: /* @__PURE__ */ new Set(),
    constrained: /* @__PURE__ */ new Set(),
    vars: {},
    isSelf
  });
}
function cleanPreconditionsCache(accountUpdate) {
  let context = preconditionContexts.get(accountUpdate);
  if (context !== void 0)
    context.vars = {};
}
function assertPreconditionInvariants(accountUpdate) {
  let context = getPreconditionContextExn(accountUpdate);
  let self = context.isSelf ? "this" : "accountUpdate";
  let dummyPreconditions = Preconditions.ignoreAll();
  for (let preconditionPath of context.read) {
    if (context.constrained.has(preconditionPath))
      continue;
    let precondition = getPath(accountUpdate.body.preconditions, preconditionPath);
    let dummy = getPath(dummyPreconditions, preconditionPath);
    if (!circuitValueEquals(precondition, dummy))
      continue;
    let hasAssertBetween = isRangeCondition(precondition);
    let shortPath = preconditionPath.split(".").pop();
    let errorMessage = `You used \`${self}.${preconditionPath}.get()\` without adding a precondition that links it to the actual ${shortPath}.
Consider adding this line to your code:
${self}.${preconditionPath}.assertEquals(${self}.${preconditionPath}.get());${hasAssertBetween ? `
You can also add more flexible preconditions with \`${self}.${preconditionPath}.assertBetween(...)\`.` : ""}`;
    throw Error(errorMessage);
  }
}
function getPreconditionContextExn(accountUpdate) {
  let c = preconditionContexts.get(accountUpdate);
  if (c === void 0)
    throw Error("bug: precondition context not found");
  return c;
}
var preconditionContexts = /* @__PURE__ */ new WeakMap();
function isRangeCondition(condition) {
  return "isSome" in condition && "lower" in condition.value;
}
function getPath(obj, path) {
  let pathArray = path.split(".").reverse();
  while (pathArray.length > 0) {
    let key = pathArray.pop();
    obj = obj[key];
  }
  return obj;
}
function setPath(obj, path, value) {
  let pathArray = path.split(".");
  let key = pathArray.pop();
  getPath(obj, pathArray.join("."))[key] = value;
}

// dist/node/lib/proof_system.js
var Undefined = EmptyUndefined();
var Empty = Undefined;
var Void = EmptyVoid();
var Proof2 = class {
  verify() {
    this.shouldVerify = Bool4(true);
  }
  verifyIf(condition) {
    this.shouldVerify = condition;
  }
  toJSON() {
    let type = getStatementType(this.constructor);
    return {
      publicInput: type.input.toFields(this.publicInput).map(String),
      publicOutput: type.output.toFields(this.publicOutput).map(String),
      maxProofsVerified: this.maxProofsVerified,
      proof: Pickles.proofToBase64([this.maxProofsVerified, this.proof])
    };
  }
  static fromJSON({ maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson }) {
    let [, proof] = Pickles.proofOfBase64(proofString, maxProofsVerified);
    let type = getStatementType(this);
    let publicInput = type.input.fromFields(publicInputJson.map(Field4));
    let publicOutput = type.output.fromFields(publicOutputJson.map(Field4));
    return new this({
      publicInput,
      publicOutput,
      proof,
      maxProofsVerified
    });
  }
  constructor({ proof, publicInput, publicOutput, maxProofsVerified }) {
    this.shouldVerify = Bool4(false);
    this.publicInput = publicInput;
    this.publicOutput = publicOutput;
    this.proof = proof;
    this.maxProofsVerified = maxProofsVerified;
  }
};
Proof2.publicInputType = void 0;
Proof2.publicOutputType = void 0;
Proof2.tag = () => {
  throw Error(`You cannot use the \`Proof\` class directly. Instead, define a subclass:
class MyProof extends Proof<PublicInput, PublicOutput> { ... }`);
};
async function verify2(proof, verificationKey) {
  let picklesProof;
  let statement;
  if (typeof proof.proof === "string") {
    [, picklesProof] = Pickles.proofOfBase64(proof.proof, proof.maxProofsVerified);
    let input = MlFieldConstArray.to(proof.publicInput.map(Field4));
    let output = MlFieldConstArray.to(proof.publicOutput.map(Field4));
    statement = MlTuple(input, output);
  } else {
    picklesProof = proof.proof;
    let type = getStatementType(proof.constructor);
    let input = toFieldConsts(type.input, proof.publicInput);
    let output = toFieldConsts(type.output, proof.publicOutput);
    statement = MlTuple(input, output);
  }
  return prettifyStacktracePromise(withThreadPool(() => Pickles.verify(statement, picklesProof, verificationKey)));
}
var compiledTags = /* @__PURE__ */ new WeakMap();
var CompiledTag = {
  get(tag) {
    return compiledTags.get(tag);
  },
  store(tag, compiledTag) {
    compiledTags.set(tag, compiledTag);
  }
};
function ZkProgram(config) {
  let methods = config.methods;
  let publicInputType = config.publicInput ?? Undefined;
  let publicOutputType = config.publicOutput ?? Void;
  let selfTag = { name: `Program${i++}` };
  class SelfProof2 extends Proof2 {
  }
  SelfProof2.publicInputType = publicInputType;
  SelfProof2.publicOutputType = publicOutputType;
  SelfProof2.tag = () => selfTag;
  let keys = Object.keys(methods).sort();
  let methodIntfs = keys.map((key) => sortMethodArguments("program", key, methods[key].privateInputs, SelfProof2));
  let methodFunctions = keys.map((key) => methods[key].method);
  let maxProofsVerified = methodIntfs.reduce((acc, { proofArgs }) => Math.max(acc, proofArgs.length), 0);
  let compileOutput;
  async function compile() {
    let { provers: provers2, verify: verify4, verificationKey } = await compileProgram(publicInputType, publicOutputType, methodIntfs, methodFunctions, selfTag);
    compileOutput = { provers: provers2, verify: verify4 };
    return { verificationKey: verificationKey.data };
  }
  function toProver(key, i2) {
    async function prove_(publicInput, ...args) {
      let picklesProver = compileOutput?.provers?.[i2];
      if (picklesProver === void 0) {
        throw Error(`Cannot prove execution of program.${key}(), no prover found. Try calling \`await program.compile()\` first, this will cache provers in the background.`);
      }
      let publicInputFields = toFieldConsts(publicInputType, publicInput);
      let previousProofs = MlArray.to(getPreviousProofsForProver(args, methodIntfs[i2]));
      let id = snarkContext.enter({ witnesses: args, inProver: true });
      let result;
      try {
        result = await picklesProver(publicInputFields, previousProofs);
      } finally {
        snarkContext.leave(id);
      }
      let [publicOutputFields, proof] = MlTuple.from(result);
      let publicOutput = fromFieldConsts(publicOutputType, publicOutputFields);
      class ProgramProof extends Proof2 {
      }
      ProgramProof.publicInputType = publicInputType;
      ProgramProof.publicOutputType = publicOutputType;
      ProgramProof.tag = () => selfTag;
      return new ProgramProof({
        publicInput,
        publicOutput,
        proof,
        maxProofsVerified
      });
    }
    let prove;
    if (publicInputType === Undefined || publicInputType === Void) {
      prove = (...args) => prove_(void 0, ...args);
    } else {
      prove = prove_;
    }
    return [key, prove];
  }
  let provers = Object.fromEntries(keys.map(toProver));
  function verify3(proof) {
    if (compileOutput?.verify === void 0) {
      throw Error(`Cannot verify proof, verification key not found. Try calling \`await program.compile()\` first.`);
    }
    let statement = MlTuple(toFieldConsts(publicInputType, proof.publicInput), toFieldConsts(publicOutputType, proof.publicOutput));
    return compileOutput.verify(statement, proof.proof);
  }
  function digest() {
    let methodData = methodIntfs.map((methodEntry, i2) => analyzeMethod(publicInputType, methodEntry, methodFunctions[i2]));
    let hash2 = hashConstant(Object.values(methodData).map((d) => Field4(BigInt("0x" + d.digest))));
    return hash2.toBigInt().toString(16);
  }
  function analyzeMethods() {
    return methodIntfs.map((methodEntry, i2) => analyzeMethod(publicInputType, methodEntry, methodFunctions[i2]));
  }
  return Object.assign(selfTag, {
    compile,
    verify: verify3,
    digest,
    publicInputType,
    publicOutputType,
    analyzeMethods
  }, provers);
}
var i = 0;
var SelfProof = class extends Proof2 {
};
function sortMethodArguments(programName, methodName, privateInputs, selfProof) {
  let witnessArgs = [];
  let proofArgs = [];
  let allArgs = [];
  let genericArgs = [];
  for (let i2 = 0; i2 < privateInputs.length; i2++) {
    let privateInput = privateInputs[i2];
    if (isProof(privateInput)) {
      if (privateInput === Proof2) {
        throw Error(`You cannot use the \`Proof\` class directly. Instead, define a subclass:
class MyProof extends Proof<PublicInput, PublicOutput> { ... }`);
      }
      allArgs.push({ type: "proof", index: proofArgs.length });
      if (privateInput === SelfProof) {
        proofArgs.push(selfProof);
      } else {
        proofArgs.push(privateInput);
      }
    } else if (isAsFields(privateInput)) {
      allArgs.push({ type: "witness", index: witnessArgs.length });
      witnessArgs.push(privateInput);
    } else if (isGeneric(privateInput)) {
      allArgs.push({ type: "generic", index: genericArgs.length });
      genericArgs.push(privateInput);
    } else {
      throw Error(`Argument ${i2 + 1} of method ${methodName} is not a provable type: ${privateInput}`);
    }
  }
  if (proofArgs.length > 2) {
    throw Error(`${programName}.${methodName}() has more than two proof arguments, which is not supported.
Suggestion: You can merge more than two proofs by merging two at a time in a binary tree.`);
  }
  return {
    methodName,
    witnessArgs,
    proofArgs,
    allArgs,
    genericArgs
  };
}
function isAsFields(type) {
  return (typeof type === "function" || typeof type === "object") && type !== null && ["toFields", "fromFields", "sizeInFields", "toAuxiliary"].every((s) => s in type);
}
function isProof(type) {
  return type === Proof2 || typeof type === "function" && type.prototype instanceof Proof2;
}
var GenericArgument = class {
  constructor(isEmpty = false) {
    this.isEmpty = isEmpty;
  }
};
var emptyGeneric = () => new GenericArgument(true);
function isGeneric(type) {
  return type === GenericArgument || typeof type === "function" && type.prototype instanceof GenericArgument;
}
function getPreviousProofsForProver(methodArgs, { allArgs }) {
  let previousProofs = [];
  for (let i2 = 0; i2 < allArgs.length; i2++) {
    let arg = allArgs[i2];
    if (arg.type === "proof") {
      previousProofs[arg.index] = methodArgs[i2].proof;
    }
  }
  return previousProofs;
}
async function compileProgram(publicInputType, publicOutputType, methodIntfs, methods, proofSystemTag) {
  let rules = methodIntfs.map((methodEntry, i2) => picklesRuleFromFunction(publicInputType, publicOutputType, methods[i2], proofSystemTag, methodEntry));
  let { verificationKey, provers, verify: verify3, tag } = await prettifyStacktracePromise(withThreadPool(async () => {
    let result;
    let id = snarkContext.enter({ inCompile: true });
    try {
      result = Pickles.compile(MlArray.to(rules), {
        publicInputSize: publicInputType.sizeInFields(),
        publicOutputSize: publicOutputType.sizeInFields()
      });
    } finally {
      snarkContext.leave(id);
    }
    let { getVerificationKey, provers: provers2, verify: verify4, tag: tag2 } = result;
    CompiledTag.store(proofSystemTag, tag2);
    let [, data, hash2] = getVerificationKey();
    let verificationKey2 = { data, hash: Field4(hash2) };
    return { verificationKey: verificationKey2, provers: MlArray.from(provers2), verify: verify4, tag: tag2 };
  }));
  let wrappedProvers = provers.map((prover) => async function picklesProver(publicInput, previousProofs) {
    return prettifyStacktracePromise(withThreadPool(() => prover(publicInput, previousProofs)));
  });
  let wrappedVerify = async function picklesVerify(statement, proof) {
    return prettifyStacktracePromise(withThreadPool(() => verify3(statement, proof)));
  };
  return {
    verificationKey,
    provers: wrappedProvers,
    verify: wrappedVerify,
    tag
  };
}
function analyzeMethod(publicInputType, methodIntf, method2) {
  return Provable.constraintSystem(() => {
    let args = synthesizeMethodArguments(methodIntf, true);
    let publicInput = emptyWitness(publicInputType);
    if (publicInputType === Undefined || publicInputType === Void)
      return method2(...args);
    return method2(publicInput, ...args);
  });
}
function picklesRuleFromFunction(publicInputType, publicOutputType, func, proofSystemTag, { methodName, witnessArgs, proofArgs, allArgs }) {
  function main(publicInput) {
    let { witnesses: argsWithoutPublicInput, inProver: inProver2 } = snarkContext.get();
    assert(!(inProver2 && argsWithoutPublicInput === void 0));
    let finalArgs = [];
    let proofs = [];
    let previousStatements = [];
    for (let i2 = 0; i2 < allArgs.length; i2++) {
      let arg = allArgs[i2];
      if (arg.type === "witness") {
        let type = witnessArgs[arg.index];
        finalArgs[i2] = Provable.witness(type, () => {
          return argsWithoutPublicInput?.[i2] ?? emptyValue3(type);
        });
      } else if (arg.type === "proof") {
        let Proof3 = proofArgs[arg.index];
        let type = getStatementType(Proof3);
        let proof_ = argsWithoutPublicInput?.[i2] ?? {
          proof: void 0,
          publicInput: emptyValue3(type.input),
          publicOutput: emptyValue3(type.output)
        };
        let { proof, publicInput: publicInput2, publicOutput: publicOutput2 } = proof_;
        publicInput2 = Provable.witness(type.input, () => publicInput2);
        publicOutput2 = Provable.witness(type.output, () => publicOutput2);
        let proofInstance = new Proof3({ publicInput: publicInput2, publicOutput: publicOutput2, proof });
        finalArgs[i2] = proofInstance;
        proofs.push(proofInstance);
        let input = toFieldVars(type.input, publicInput2);
        let output = toFieldVars(type.output, publicOutput2);
        previousStatements.push(MlTuple(input, output));
      } else if (arg.type === "generic") {
        finalArgs[i2] = argsWithoutPublicInput?.[i2] ?? emptyGeneric();
      }
    }
    let result;
    if (publicInputType === Undefined || publicInputType === Void) {
      result = func(...finalArgs);
    } else {
      let input = fromFieldVars(publicInputType, publicInput);
      result = func(input, ...finalArgs);
    }
    let hasPublicOutput = publicOutputType.sizeInFields() !== 0;
    let publicOutput = hasPublicOutput ? publicOutputType.toFields(result) : [];
    return {
      publicOutput: MlFieldArray.to(publicOutput),
      previousStatements: MlArray.to(previousStatements),
      shouldVerify: MlArray.to(proofs.map((proof) => proof.shouldVerify.toField().value))
    };
  }
  if (proofArgs.length > 2) {
    throw Error(`${proofSystemTag.name}.${methodName}() has more than two proof arguments, which is not supported.
Suggestion: You can merge more than two proofs by merging two at a time in a binary tree.`);
  }
  let proofsToVerify = proofArgs.map((Proof3) => {
    let tag = Proof3.tag();
    if (tag === proofSystemTag)
      return { isSelf: true };
    else {
      let compiledTag = CompiledTag.get(tag);
      if (compiledTag === void 0) {
        throw Error(`${proofSystemTag.name}.compile() depends on ${tag.name}, but we cannot find compilation output for ${tag.name}.
Try to run ${tag.name}.compile() first.`);
      }
      return { isSelf: false, tag: compiledTag };
    }
  });
  return {
    identifier: methodName,
    main,
    proofsToVerify: MlArray.to(proofsToVerify)
  };
}
function synthesizeMethodArguments({ allArgs, proofArgs, witnessArgs }, asVariables = false) {
  let args = [];
  let empty = asVariables ? emptyWitness : emptyValue3;
  for (let arg of allArgs) {
    if (arg.type === "witness") {
      args.push(empty(witnessArgs[arg.index]));
    } else if (arg.type === "proof") {
      let Proof3 = proofArgs[arg.index];
      let type = getStatementType(Proof3);
      let publicInput = empty(type.input);
      let publicOutput = empty(type.output);
      args.push(new Proof3({ publicInput, publicOutput, proof: void 0 }));
    } else if (arg.type === "generic") {
      args.push(emptyGeneric());
    }
  }
  return args;
}
function methodArgumentsToConstant({ allArgs, proofArgs, witnessArgs }, args) {
  let constArgs = [];
  for (let i2 = 0; i2 < allArgs.length; i2++) {
    let arg = args[i2];
    let { type, index } = allArgs[i2];
    if (type === "witness") {
      constArgs.push(toConstant(witnessArgs[index], arg));
    } else if (type === "proof") {
      let Proof3 = proofArgs[index];
      let type2 = getStatementType(Proof3);
      let publicInput = toConstant(type2.input, arg.publicInput);
      let publicOutput = toConstant(type2.output, arg.publicOutput);
      constArgs.push(new Proof3({ publicInput, publicOutput, proof: arg.proof }));
    } else if (type === "generic") {
      constArgs.push(arg);
    }
  }
  return constArgs;
}
var Generic = EmptyNull();
function methodArgumentTypesAndValues({ allArgs, proofArgs, witnessArgs }, args) {
  let typesAndValues = [];
  for (let i2 = 0; i2 < allArgs.length; i2++) {
    let arg = args[i2];
    let { type, index } = allArgs[i2];
    if (type === "witness") {
      typesAndValues.push({ type: witnessArgs[index], value: arg });
    } else if (type === "proof") {
      let Proof3 = proofArgs[index];
      let proof = arg;
      let types = getStatementType(Proof3);
      let type2 = provablePure({ input: types.input, output: types.output });
      let value = { input: proof.publicInput, output: proof.publicOutput };
      typesAndValues.push({ type: type2, value });
    } else if (type === "generic") {
      typesAndValues.push({ type: Generic, value: arg });
    }
  }
  return typesAndValues;
}
function emptyValue3(type) {
  return type.fromFields(Array(type.sizeInFields()).fill(Field4(0)), type.toAuxiliary());
}
function emptyWitness(type) {
  return Provable.witness(type, () => emptyValue3(type));
}
function getStatementType(Proof3) {
  if (Proof3.publicInputType === void 0 || Proof3.publicOutputType === void 0) {
    throw Error(`You cannot use the \`Proof\` class directly. Instead, define a subclass:
class MyProof extends Proof<PublicInput, PublicOutput> { ... }`);
  }
  return {
    input: Proof3.publicInputType,
    output: Proof3.publicOutputType
  };
}
function fromFieldVars(type, fields) {
  return type.fromFields(MlFieldArray.from(fields));
}
function toFieldVars(type, value) {
  return MlFieldArray.to(type.toFields(value));
}
function fromFieldConsts(type, fields) {
  return type.fromFields(MlFieldConstArray.from(fields));
}
function toFieldConsts(type, value) {
  return MlFieldConstArray.to(type.toFields(value));
}
ZkProgram.Proof = function(program) {
  var _a4;
  return _a4 = class ZkProgramProof extends Proof2 {
  }, _a4.publicInputType = program.publicInputType, _a4.publicOutputType = program.publicOutputType, _a4.tag = () => program, _a4;
};
function dummyBase64Proof() {
  return withThreadPool(async () => Pickles.dummyBase64Proof());
}
function Prover() {
  return {
    async run(witnesses, proverData, callback) {
      let id = snarkContext.enter({ witnesses, proverData, inProver: true });
      try {
        return await callback();
      } finally {
        snarkContext.leave(id);
      }
    },
    getData() {
      return snarkContext.get().proverData;
    }
  };
}

// dist/node/lib/fetch.js
var import_isomorphic_fetch = require("isomorphic-fetch");

// dist/node/lib/base58-encodings.js
var { TokenId: TokenId3, ReceiptChainHash: ReceiptChainHash3, EpochSeed, LedgerHash, StateHash: StateHash3 } = fieldEncodings(Field4);

// dist/node/lib/mina/account.js
var Account4 = transaction_exports.Account;
var accountQuery = (publicKey, tokenId) => `{
  account(publicKey: "${publicKey}", token: "${tokenId}") {
    publicKey
    token
    nonce
    balance { total }
    tokenSymbol
    receiptChainHash
    timing {
      initialMinimumBalance
      cliffTime
      cliffAmount
      vestingPeriod
      vestingIncrement
    }
    permissions {
      editState
      access
      send
      receive
      setDelegate
      setPermissions
      setVerificationKey
      setZkappUri
      editActionState
      setTokenSymbol
      incrementNonce
      setVotingFor
      setTiming
    }
    delegateAccount { publicKey }
    votingFor
    zkappState
    verificationKey {
      verificationKey
      hash
    }
    actionState
    provedState
    zkappUri
  }
}
`;
function parseFetchedAccount({ publicKey, nonce, zkappState, balance, permissions, timing: { cliffAmount, cliffTime, initialMinimumBalance, vestingIncrement, vestingPeriod }, delegateAccount, receiptChainHash, actionState, token, tokenSymbol, verificationKey, provedState, zkappUri }) {
  let hasZkapp = zkappState !== null || verificationKey !== null || actionState !== null || zkappUri !== null || provedState;
  let partialAccount = {
    publicKey: PublicKey2.fromBase58(publicKey),
    tokenId: TokenId3.fromBase58(token),
    tokenSymbol: tokenSymbol ?? void 0,
    balance: balance && UInt642.from(balance.total),
    nonce: UInt322.from(nonce),
    receiptChainHash: receiptChainHash && ReceiptChainHash3.fromBase58(receiptChainHash) || void 0,
    delegate: (delegateAccount && PublicKey2.fromBase58(delegateAccount.publicKey)) ?? void 0,
    votingFor: void 0,
    timing: cliffAmount && cliffTime && initialMinimumBalance && vestingIncrement && vestingPeriod && {
      isTimed: Bool4(true),
      cliffAmount: UInt642.from(cliffAmount),
      cliffTime: UInt322.from(cliffTime),
      initialMinimumBalance: UInt642.from(initialMinimumBalance),
      vestingIncrement: UInt642.from(vestingIncrement),
      vestingPeriod: UInt322.from(vestingPeriod)
    } || void 0,
    permissions: (permissions && Permissions.fromJSON(permissions)) ?? Permissions.initial(),
    zkapp: hasZkapp ? {
      appState: (zkappState && zkappState.map(Field4)) ?? void 0,
      verificationKey: (verificationKey && {
        data: verificationKey.verificationKey,
        hash: Field4(verificationKey.hash)
      }) ?? void 0,
      zkappVersion: void 0,
      actionState: (actionState && actionState.map(Field4)) ?? void 0,
      lastActionSlot: void 0,
      provedState: provedState !== null ? Bool4(provedState) : void 0,
      zkappUri: zkappUri !== null ? zkappUri : void 0
    } : void 0
  };
  return fillPartialAccount(partialAccount);
}
function fillPartialAccount(account) {
  return genericLayoutFold(TypeMap, customTypes, {
    map(type, value) {
      if (value !== void 0)
        return value;
      if (type.emptyValue)
        return type.emptyValue();
      return type.fromFields(Array(type.sizeInFields()).fill(Field4(0)), type.toAuxiliary());
    },
    reduceArray(array) {
      return array;
    },
    reduceObject(_, record2) {
      return record2;
    },
    reduceFlaggedOption() {
      throw Error("not relevant");
    },
    reduceOrUndefined(value) {
      return value;
    }
  }, jsLayout.Account, account);
}

// dist/node/lib/fetch.js
var networkConfig = {
  minaEndpoint: "",
  minaFallbackEndpoints: [],
  archiveEndpoint: "",
  archiveFallbackEndpoints: []
};
function checkForValidUrl(url2) {
  try {
    new URL(url2);
    return true;
  } catch (e) {
    return false;
  }
}
function setGraphqlEndpoints([graphqlEndpoint, ...fallbackEndpoints]) {
  setGraphqlEndpoint(graphqlEndpoint);
  setMinaGraphqlFallbackEndpoints(fallbackEndpoints);
}
function setGraphqlEndpoint(graphqlEndpoint) {
  if (!checkForValidUrl(graphqlEndpoint)) {
    throw new Error(`Invalid GraphQL endpoint: ${graphqlEndpoint}. Please specify a valid URL.`);
  }
  networkConfig.minaEndpoint = graphqlEndpoint;
}
function setMinaGraphqlFallbackEndpoints(graphqlEndpoints) {
  if (graphqlEndpoints.some((endpoint) => !checkForValidUrl(endpoint))) {
    throw new Error(`Invalid GraphQL endpoint: ${graphqlEndpoints}. Please specify a valid URL.`);
  }
  networkConfig.minaFallbackEndpoints = graphqlEndpoints;
}
function setArchiveGraphqlEndpoint(graphqlEndpoint) {
  if (!checkForValidUrl(graphqlEndpoint)) {
    throw new Error(`Invalid GraphQL endpoint: ${graphqlEndpoint}. Please specify a valid URL.`);
  }
  networkConfig.archiveEndpoint = graphqlEndpoint;
}
function setArchiveGraphqlFallbackEndpoints(graphqlEndpoints) {
  if (graphqlEndpoints.some((endpoint) => !checkForValidUrl(endpoint))) {
    throw new Error(`Invalid GraphQL endpoint: ${graphqlEndpoints}. Please specify a valid URL.`);
  }
  networkConfig.archiveFallbackEndpoints = graphqlEndpoints;
}
async function fetchAccount(accountInfo, graphqlEndpoint = networkConfig.minaEndpoint, { timeout = defaultTimeout } = {}) {
  let publicKeyBase58 = accountInfo.publicKey instanceof PublicKey2 ? accountInfo.publicKey.toBase58() : accountInfo.publicKey;
  let tokenIdBase58 = typeof accountInfo.tokenId === "string" || !accountInfo.tokenId ? accountInfo.tokenId : TokenId4.toBase58(accountInfo.tokenId);
  return await fetchAccountInternal({ publicKey: publicKeyBase58, tokenId: tokenIdBase58 }, graphqlEndpoint, {
    timeout
  });
}
async function fetchAccountInternal(accountInfo, graphqlEndpoint = networkConfig.minaEndpoint, config) {
  const { publicKey, tokenId } = accountInfo;
  let [response, error] = await makeGraphqlRequest(accountQuery(publicKey, tokenId ?? TokenId4.toBase58(TokenId4.default)), graphqlEndpoint, networkConfig.minaFallbackEndpoints, config);
  if (error !== void 0)
    return { account: void 0, error };
  let fetchedAccount = response.data.account;
  if (fetchedAccount === null) {
    return {
      account: void 0,
      error: {
        statusCode: 404,
        statusText: `fetchAccount: Account with public key ${publicKey} does not exist.`
      }
    };
  }
  let account = parseFetchedAccount(fetchedAccount);
  addCachedAccountInternal(account, graphqlEndpoint);
  return {
    account,
    error: void 0
  };
}
var defaultTimeout = 5 * 60 * 1e3;
var accountCache = {};
var networkCache = {};
var actionsCache = {};
var accountsToFetch = {};
var networksToFetch = {};
var actionsToFetch = {};
function markAccountToBeFetched(publicKey, tokenId, graphqlEndpoint) {
  let publicKeyBase58 = publicKey.toBase58();
  let tokenBase58 = TokenId4.toBase58(tokenId);
  accountsToFetch[`${publicKeyBase58};${tokenBase58};${graphqlEndpoint}`] = {
    publicKey: publicKeyBase58,
    tokenId: tokenBase58,
    graphqlEndpoint
  };
}
function markNetworkToBeFetched(graphqlEndpoint) {
  networksToFetch[graphqlEndpoint] = { graphqlEndpoint };
}
function markActionsToBeFetched(publicKey, tokenId, graphqlEndpoint, actionStates = {}) {
  let publicKeyBase58 = publicKey.toBase58();
  let tokenBase58 = TokenId4.toBase58(tokenId);
  let { fromActionState, endActionState } = actionStates;
  let fromActionStateBase58 = fromActionState ? fromActionState.toString() : void 0;
  let endActionStateBase58 = endActionState ? endActionState.toString() : void 0;
  actionsToFetch[`${publicKeyBase58};${tokenBase58};${graphqlEndpoint}`] = {
    publicKey: publicKeyBase58,
    tokenId: tokenBase58,
    actionStates: {
      fromActionState: fromActionStateBase58,
      endActionState: endActionStateBase58
    },
    graphqlEndpoint
  };
}
async function fetchMissingData(graphqlEndpoint, archiveEndpoint) {
  let promises = Object.entries(accountsToFetch).map(async ([key, { publicKey, tokenId }]) => {
    let response = await fetchAccountInternal({ publicKey, tokenId }, graphqlEndpoint);
    if (response.error === void 0)
      delete accountsToFetch[key];
  });
  let actionPromises = Object.entries(actionsToFetch).map(async ([key, { publicKey, actionStates, tokenId }]) => {
    let response = await fetchActions({ publicKey, actionStates, tokenId }, archiveEndpoint);
    if (!("error" in response) || response.error === void 0)
      delete actionsToFetch[key];
  });
  promises.push(...actionPromises);
  let network = Object.entries(networksToFetch).find(([, network2]) => {
    return network2.graphqlEndpoint === graphqlEndpoint;
  });
  if (network !== void 0) {
    promises.push((async () => {
      try {
        await fetchLastBlock(graphqlEndpoint);
        delete networksToFetch[network[0]];
      } catch {
      }
    })());
  }
  await Promise.all(promises);
}
function getCachedAccount(publicKey, tokenId, graphqlEndpoint = networkConfig.minaEndpoint) {
  return accountCache[accountCacheKey(publicKey, tokenId, graphqlEndpoint)]?.account;
}
function getCachedNetwork(graphqlEndpoint = networkConfig.minaEndpoint) {
  return networkCache[graphqlEndpoint]?.network;
}
function getCachedActions(publicKey, tokenId, graphqlEndpoint = networkConfig.archiveEndpoint) {
  return actionsCache[accountCacheKey(publicKey, tokenId, graphqlEndpoint)]?.actions;
}
function addCachedAccount(partialAccount, graphqlEndpoint = networkConfig.minaEndpoint) {
  let account = fillPartialAccount(partialAccount);
  addCachedAccountInternal(account, graphqlEndpoint);
}
function addCachedAccountInternal(account, graphqlEndpoint) {
  accountCache[accountCacheKey(account.publicKey, account.tokenId, graphqlEndpoint)] = {
    account,
    graphqlEndpoint,
    timestamp: Date.now()
  };
}
function addCachedActions({ publicKey, tokenId }, actions, graphqlEndpoint) {
  actionsCache[`${publicKey};${tokenId};${graphqlEndpoint}`] = {
    actions,
    graphqlEndpoint,
    timestamp: Date.now()
  };
}
function accountCacheKey(publicKey, tokenId, graphqlEndpoint) {
  return `${publicKey.toBase58()};${TokenId4.toBase58(tokenId)};${graphqlEndpoint}`;
}
async function fetchLastBlock(graphqlEndpoint = networkConfig.minaEndpoint) {
  let [resp, error] = await makeGraphqlRequest(lastBlockQuery, graphqlEndpoint, networkConfig.minaFallbackEndpoints);
  if (error)
    throw Error(error.statusText);
  let lastBlock = resp?.data?.bestChain?.[0];
  if (lastBlock === void 0) {
    throw Error("Failed to fetch latest network state.");
  }
  let network = parseFetchedBlock(lastBlock);
  networkCache[graphqlEndpoint] = {
    network,
    graphqlEndpoint,
    timestamp: Date.now()
  };
  return network;
}
var lastBlockQuery = `{
  bestChain(maxLength: 1) {
    protocolState {
      blockchainState {
        snarkedLedgerHash
        stagedLedgerHash
        date
        utcDate
        stagedLedgerProofEmitted
      }
      previousStateHash
      consensusState {
        blockHeight
        slotSinceGenesis
        slot
        nextEpochData {
          ledger {hash totalCurrency}
          seed
          startCheckpoint
          lockCheckpoint
          epochLength
        }
        stakingEpochData {
          ledger {hash totalCurrency}
          seed
          startCheckpoint
          lockCheckpoint
          epochLength
        }
        epochCount
        minWindowDensity
        totalCurrency
        epoch
      }
    }
  }
}`;
var lastBlockQueryFailureCheck = `{
  bestChain(maxLength: 1) {
    transactions {
      zkappCommands {
        hash
        failureReason {
          failures
          index
        }
      }
    }
  }
}`;
async function fetchLatestBlockZkappStatus(graphqlEndpoint = networkConfig.minaEndpoint) {
  let [resp, error] = await makeGraphqlRequest(lastBlockQueryFailureCheck, graphqlEndpoint, networkConfig.minaFallbackEndpoints);
  if (error)
    throw Error(`Error making GraphQL request: ${error.statusText}`);
  let bestChain = resp?.data;
  if (bestChain === void 0) {
    throw Error("Failed to fetch the latest zkApp transaction status. The response data is undefined.");
  }
  return bestChain;
}
async function checkZkappTransaction(txnId) {
  let bestChainBlocks = await fetchLatestBlockZkappStatus();
  for (let block of bestChainBlocks.bestChain) {
    for (let zkappCommand of block.transactions.zkappCommands) {
      if (zkappCommand.hash === txnId) {
        if (zkappCommand.failureReason !== null) {
          let failureReason = zkappCommand.failureReason.reverse().map((failure) => {
            return ` AccountUpdate #${failure.index} failed. Reason: "${failure.failures.join(", ")}"`;
          });
          return {
            success: false,
            failureReason
          };
        } else {
          return {
            success: true,
            failureReason: null
          };
        }
      }
    }
  }
  return {
    success: false,
    failureReason: null
  };
}
function parseFetchedBlock({ protocolState: { blockchainState: { snarkedLedgerHash, utcDate }, consensusState: { blockHeight, minWindowDensity, totalCurrency, slot, slotSinceGenesis, nextEpochData, stakingEpochData } } }) {
  return {
    snarkedLedgerHash: LedgerHash.fromBase58(snarkedLedgerHash),
    // TODO: use date or utcDate?
    blockchainLength: UInt322.from(blockHeight),
    minWindowDensity: UInt322.from(minWindowDensity),
    totalCurrency: UInt642.from(totalCurrency),
    globalSlotSinceGenesis: UInt322.from(slotSinceGenesis),
    nextEpochData: parseEpochData(nextEpochData),
    stakingEpochData: parseEpochData(stakingEpochData)
  };
}
function parseEpochData({ ledger: { hash: hash2, totalCurrency }, seed, startCheckpoint, lockCheckpoint, epochLength }) {
  return {
    ledger: {
      hash: LedgerHash.fromBase58(hash2),
      totalCurrency: UInt642.from(totalCurrency)
    },
    seed: EpochSeed.fromBase58(seed),
    startCheckpoint: StateHash3.fromBase58(startCheckpoint),
    lockCheckpoint: StateHash3.fromBase58(lockCheckpoint),
    epochLength: UInt322.from(epochLength)
  };
}
var transactionStatusQuery = (txId) => `query {
  transactionStatus(zkappTransaction:"${txId}")
}`;
async function fetchTransactionStatus(txId, graphqlEndpoint = networkConfig.minaEndpoint) {
  let [resp, error] = await makeGraphqlRequest(transactionStatusQuery(txId), graphqlEndpoint, networkConfig.minaFallbackEndpoints);
  if (error)
    throw Error(error.statusText);
  let txStatus = resp?.data?.transactionStatus;
  if (txStatus === void 0 || txStatus === null) {
    throw Error(`Failed to fetch transaction status. TransactionId: ${txId}`);
  }
  return txStatus;
}
function sendZkapp(json, graphqlEndpoint = networkConfig.minaEndpoint, { timeout = defaultTimeout } = {}) {
  return makeGraphqlRequest(sendZkappQuery(json), graphqlEndpoint, networkConfig.minaFallbackEndpoints, {
    timeout
  });
}
function sendZkappQuery(json) {
  return `mutation {
  sendZkapp(input: {
    zkappCommand: ${removeJsonQuotes(json)}
  }) {
    zkapp {
      hash
      id
      failureReason {
        failures
        index
      }
      zkappCommand {
        memo
        feePayer {
          body {
            publicKey
          }
        }
        accountUpdates {
          body {
            publicKey
            useFullCommitment
            incrementNonce
          }
        }
      }
    }
  }
}
`;
}
var getEventsQuery = (publicKey, tokenId, filterOptions) => {
  const { to, from } = filterOptions ?? {};
  let input = `address: "${publicKey}", tokenId: "${tokenId}"`;
  if (to !== void 0) {
    input += `, to: ${to}`;
  }
  if (from !== void 0) {
    input += `, from: ${from}`;
  }
  return `{
  events(input: { ${input} }) {
    blockInfo {
      distanceFromMaxBlockHeight
      height
      globalSlotSinceGenesis
      stateHash
      parentHash
      chainStatus
    }
    eventData {
      transactionInfo {
        hash
        memo
        status
      }
      data
    }
  }
}`;
};
var getActionsQuery = (publicKey, actionStates, tokenId, _filterOptions) => {
  const { fromActionState, endActionState } = actionStates ?? {};
  let input = `address: "${publicKey}", tokenId: "${tokenId}"`;
  if (fromActionState !== void 0) {
    input += `, fromActionState: "${fromActionState}"`;
  }
  if (endActionState !== void 0) {
    input += `, endActionState: "${endActionState}"`;
  }
  return `{
  actions(input: { ${input} }) {
    blockInfo {
      distanceFromMaxBlockHeight
    }
    actionState {
      actionStateOne
      actionStateTwo
    }
    actionData {
      accountUpdateId
      data
    }
  }
}`;
};
async function fetchEvents(accountInfo, graphqlEndpoint = networkConfig.archiveEndpoint, filterOptions = {}) {
  if (!graphqlEndpoint)
    throw new Error("fetchEvents: Specified GraphQL endpoint is undefined. Please specify a valid endpoint.");
  const { publicKey, tokenId } = accountInfo;
  let [response, error] = await makeGraphqlRequest(getEventsQuery(publicKey, tokenId ?? TokenId4.toBase58(TokenId4.default), filterOptions), graphqlEndpoint, networkConfig.archiveFallbackEndpoints);
  if (error)
    throw Error(error.statusText);
  let fetchedEvents = response?.data.events;
  if (fetchedEvents === void 0) {
    throw Error(`Failed to fetch events data. Account: ${publicKey} Token: ${tokenId}`);
  }
  let numberOfBestTipBlocks = 0;
  for (let i2 = 0; i2 < fetchedEvents.length; i2++) {
    if (fetchedEvents[i2].blockInfo.distanceFromMaxBlockHeight === 0) {
      numberOfBestTipBlocks++;
    }
    if (numberOfBestTipBlocks > 1) {
      fetchedEvents = fetchedEvents.filter((event) => {
        return event.blockInfo.distanceFromMaxBlockHeight !== 0;
      });
      break;
    }
  }
  return fetchedEvents.map((event) => {
    let events = event.eventData.map(({ data, transactionInfo }) => {
      return {
        data,
        transactionInfo
      };
    });
    return {
      events,
      blockHeight: UInt322.from(event.blockInfo.height),
      blockHash: event.blockInfo.stateHash,
      parentBlockHash: event.blockInfo.parentHash,
      globalSlot: UInt322.from(event.blockInfo.globalSlotSinceGenesis),
      chainStatus: event.blockInfo.chainStatus
    };
  });
}
async function fetchActions(accountInfo, graphqlEndpoint = networkConfig.archiveEndpoint) {
  if (!graphqlEndpoint)
    throw new Error("fetchActions: Specified GraphQL endpoint is undefined. Please specify a valid endpoint.");
  const { publicKey, actionStates, tokenId = TokenId4.toBase58(TokenId4.default) } = accountInfo;
  let [response, error] = await makeGraphqlRequest(getActionsQuery(publicKey, actionStates, tokenId), graphqlEndpoint, networkConfig.archiveFallbackEndpoints);
  if (error)
    throw Error(error.statusText);
  let fetchedActions = response?.data.actions;
  if (fetchedActions === void 0) {
    return {
      error: {
        statusCode: 404,
        statusText: `fetchActions: Account with public key ${publicKey} with tokenId ${tokenId} does not exist.`
      }
    };
  }
  let numberOfBestTipBlocks = 0;
  for (let i2 = 0; i2 < fetchedActions.length; i2++) {
    if (fetchedActions[i2].blockInfo.distanceFromMaxBlockHeight === 0) {
      numberOfBestTipBlocks++;
    }
    if (numberOfBestTipBlocks > 1) {
      fetchedActions = fetchedActions.filter((action) => {
        return action.blockInfo.distanceFromMaxBlockHeight !== 0;
      });
      break;
    }
  }
  fetchedActions.reverse();
  let actionsList = [];
  if (fetchedActions.length !== 0 && fetchedActions[0].actionState.actionStateOne === actionStates.fromActionState) {
    fetchedActions = fetchedActions.slice(1);
  }
  fetchedActions.forEach((actionBlock) => {
    let { actionData } = actionBlock;
    let latestActionState = Field4(actionBlock.actionState.actionStateTwo);
    let actionState = actionBlock.actionState.actionStateOne;
    if (actionData.length === 0)
      throw Error(`No action data was found for the account ${publicKey} with the latest action state ${actionState}`);
    let actionsByAccountUpdate = [];
    let currentAccountUpdateId = "none";
    let currentActions;
    actionData.forEach(({ accountUpdateId, data }) => {
      if (accountUpdateId === currentAccountUpdateId) {
        currentActions.push(data);
      } else {
        currentAccountUpdateId = accountUpdateId;
        currentActions = [data];
        actionsByAccountUpdate.push(currentActions);
      }
    });
    for (let actions of actionsByAccountUpdate) {
      latestActionState = updateActionState(actions, latestActionState);
      actionsList.push({ actions, hash: latestActionState.toString() });
    }
    const finalActionState = latestActionState.toString();
    const expectedActionState = actionState;
    if (finalActionState !== expectedActionState) {
      throw new Error(`Failed to derive correct actions hash for ${publicKey}.
        Derived hash: ${finalActionState}, expected hash: ${expectedActionState}).
        All action hashes derived: ${JSON.stringify(actionsList, null, 2)}
        Please try a different Archive Node API endpoint.
        `);
    }
  });
  addCachedActions({ publicKey, tokenId }, actionsList, graphqlEndpoint);
  return actionsList;
}
function updateActionState(actions, actionState) {
  let actionHash = Actions.fromJSON(actions).hash;
  return Actions.updateSequenceState(actionState, actionHash);
}
function removeJsonQuotes(json) {
  let cleaned = JSON.stringify(JSON.parse(json), null, 2);
  return cleaned.replace(/\"(\S+)\"\s*:/gm, "$1:");
}
async function makeGraphqlRequest(query, graphqlEndpoint = networkConfig.minaEndpoint, fallbackEndpoints, { timeout = defaultTimeout } = {}) {
  if (graphqlEndpoint === "none")
    throw Error("Should have made a graphql request, but don't know to which endpoint. Try calling `setGraphqlEndpoint` first.");
  let timeouts = [];
  const clearTimeouts = () => {
    timeouts.forEach((t) => clearTimeout(t));
    timeouts = [];
  };
  const makeRequest = async (url2) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    timeouts.push(timer);
    let body = JSON.stringify({ operationName: null, query, variables: {} });
    try {
      let response = await fetch(url2, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal
      });
      return checkResponseStatus(response);
    } finally {
      clearTimeouts();
    }
  };
  let timeoutErrors = [];
  let urls = [graphqlEndpoint, ...fallbackEndpoints];
  for (let i2 = 0; i2 < urls.length; i2 += 2) {
    let url1 = urls[i2];
    let url2 = urls[i2 + 1];
    if (url2 === void 0) {
      try {
        return await makeRequest(url1);
      } catch (error) {
        return [void 0, inferError(error)];
      }
    }
    try {
      return await Promise.race([makeRequest(url1), makeRequest(url2)]);
    } catch (unknownError) {
      let error = inferError(unknownError);
      if (error.statusCode === 408) {
        timeoutErrors.push({ url1, url2, error });
      } else {
        return [void 0, error];
      }
    }
  }
  const statusText = timeoutErrors.map(({ url1, url2, error }) => `Request to ${url1} and ${url2} timed out. Error: ${error}`).join("\n");
  return [void 0, { statusCode: 408, statusText }];
}
async function checkResponseStatus(response) {
  if (response.ok) {
    let jsonResponse = await response.json();
    if (jsonResponse.errors && jsonResponse.errors.length > 0) {
      return [
        void 0,
        {
          statusCode: response.status,
          statusText: jsonResponse.errors.map((error) => error.message).join("\n")
        }
      ];
    } else if (jsonResponse.data === void 0) {
      return [
        void 0,
        {
          statusCode: response.status,
          statusText: `GraphQL response data is undefined`
        }
      ];
    }
    return [jsonResponse, void 0];
  } else {
    return [
      void 0,
      {
        statusCode: response.status,
        statusText: response.statusText
      }
    ];
  }
}
function inferError(error) {
  let errorMessage = JSON.stringify(error);
  if (error instanceof AbortSignal) {
    return { statusCode: 408, statusText: `Request Timeout: ${errorMessage}` };
  } else {
    return {
      statusCode: 500,
      statusText: `Unknown Error: ${errorMessage}`
    };
  }
}

// dist/node/lib/state.js
function State() {
  return createState();
}
function state2(stateType) {
  return function(target, key, _descriptor) {
    const ZkappClass = target.constructor;
    if (reservedPropNames.has(key)) {
      throw Error(`Property name ${key} is reserved.`);
    }
    let sc = smartContracts.get(ZkappClass);
    if (sc === void 0) {
      sc = { states: [], layout: void 0 };
      smartContracts.set(ZkappClass, sc);
    }
    sc.states.push([key, stateType]);
    Object.defineProperty(target, key, {
      get() {
        return this._?.[key];
      },
      set(v) {
        if (v._contract !== void 0)
          throw Error("A State should only be assigned once to a SmartContract");
        if (this._?.[key])
          throw Error("A @state should only be assigned once");
        v._contract = {
          key,
          stateType,
          instance: this,
          class: ZkappClass,
          wasConstrained: false,
          wasRead: false,
          cachedVariable: void 0
        };
        (this._ ?? (this._ = {}))[key] = v;
      }
    });
  };
}
function declareState(SmartContract2, states) {
  for (let key in states) {
    let CircuitValue2 = states[key];
    state2(CircuitValue2)(SmartContract2.prototype, key);
  }
}
function createState() {
  return {
    _contract: void 0,
    set(state3) {
      if (this._contract === void 0)
        throw Error("set can only be called when the State is assigned to a SmartContract @state.");
      let layout = getLayoutPosition(this._contract);
      let stateAsFields = this._contract.stateType.toFields(state3);
      let accountUpdate = this._contract.instance.self;
      stateAsFields.forEach((x, i2) => {
        AccountUpdate3.setValue(accountUpdate.body.update.appState[layout.offset + i2], x);
      });
    },
    assertEquals(state3) {
      if (this._contract === void 0)
        throw Error("assertEquals can only be called when the State is assigned to a SmartContract @state.");
      let layout = getLayoutPosition(this._contract);
      let stateAsFields = this._contract.stateType.toFields(state3);
      let accountUpdate = this._contract.instance.self;
      stateAsFields.forEach((x, i2) => {
        AccountUpdate3.assertEquals(accountUpdate.body.preconditions.account.state[layout.offset + i2], x);
      });
      this._contract.wasConstrained = true;
    },
    assertNothing() {
      if (this._contract === void 0)
        throw Error("assertNothing can only be called when the State is assigned to a SmartContract @state.");
      this._contract.wasConstrained = true;
    },
    get() {
      if (this._contract === void 0)
        throw Error("get can only be called when the State is assigned to a SmartContract @state.");
      if (this._contract.cachedVariable !== void 0 && // `inCheckedComputation() === true` here always implies being inside a wrapped smart contract method,
      // which will ensure that the cache is cleaned up before & after each method run.
      Provable.inCheckedComputation()) {
        this._contract.wasRead = true;
        return this._contract.cachedVariable;
      }
      let layout = getLayoutPosition(this._contract);
      let contract = this._contract;
      let inProver_ = Provable.inProver();
      let stateFieldsType = Provable.Array(Field4, layout.length);
      let stateAsFields = Provable.witness(stateFieldsType, () => {
        let account;
        try {
          account = getAccount(contract.instance.address, contract.instance.self.body.tokenId);
        } catch (err) {
          if (inProver_) {
            throw err;
          }
          throw Error(`${contract.key}.get() failed, either:
1. We can't find this zkapp account in the ledger
2. Because the zkapp account was not found in the cache. Try calling \`await fetchAccount(zkappAddress)\` first.
If none of these are the case, then please reach out on Discord at #zkapp-developers and/or open an issue to tell us!`);
        }
        if (account.zkapp?.appState === void 0) {
          return Array(layout.length).fill(Field4(0));
        } else {
          let stateAsFields2 = [];
          for (let i2 = 0; i2 < layout.length; ++i2) {
            stateAsFields2.push(account.zkapp.appState[layout.offset + i2]);
          }
          return stateAsFields2;
        }
      });
      let state3 = this._contract.stateType.fromFields(stateAsFields);
      if (Provable.inCheckedComputation())
        this._contract.stateType.check?.(state3);
      this._contract.wasRead = true;
      this._contract.cachedVariable = state3;
      return state3;
    },
    getAndAssertEquals() {
      let state3 = this.get();
      this.assertEquals(state3);
      return state3;
    },
    async fetch() {
      if (this._contract === void 0)
        throw Error("fetch can only be called when the State is assigned to a SmartContract @state.");
      if (currentTransaction.has())
        throw Error("fetch is not intended to be called inside a transaction block.");
      let layout = getLayoutPosition(this._contract);
      let address = this._contract.instance.address;
      let { account } = await fetchAccount({
        publicKey: address,
        tokenId: TokenId4.toBase58(TokenId4.default)
      });
      if (account === void 0)
        return void 0;
      let stateAsFields;
      if (account.zkapp?.appState === void 0) {
        stateAsFields = Array(layout.length).fill(Field4(0));
      } else {
        stateAsFields = [];
        for (let i2 = 0; i2 < layout.length; i2++) {
          stateAsFields.push(account.zkapp.appState[layout.offset + i2]);
        }
      }
      return this._contract.stateType.fromFields(stateAsFields);
    },
    fromAppState(appState) {
      if (this._contract === void 0)
        throw Error("fromAppState() can only be called when the State is assigned to a SmartContract @state.");
      let layout = getLayoutPosition(this._contract);
      let stateAsFields = [];
      for (let i2 = 0; i2 < layout.length; ++i2) {
        stateAsFields.push(appState[layout.offset + i2]);
      }
      return this._contract.stateType.fromFields(stateAsFields);
    }
  };
}
function getLayoutPosition({ key, class: contractClass }) {
  let layout = getLayout(contractClass);
  let stateLayout = layout.get(key);
  if (stateLayout === void 0) {
    throw new Error(`state ${key} not found`);
  }
  return stateLayout;
}
function getLayout(scClass) {
  let sc = smartContracts.get(scClass);
  if (sc === void 0)
    throw Error("bug");
  if (sc.layout === void 0) {
    let layout = /* @__PURE__ */ new Map();
    sc.layout = layout;
    let offset = 0;
    sc.states.forEach(([key, stateType]) => {
      let length = stateType.sizeInFields();
      layout.set(key, { offset, length });
      offset += length;
    });
  }
  return sc.layout;
}
var smartContracts = /* @__PURE__ */ new WeakMap();
var reservedPropNames = /* @__PURE__ */ new Set(["_methods", "_"]);
function assertStatePrecondition(sc) {
  try {
    for (let [key, context] of getStateContexts(sc)) {
      if (!context?.wasRead || context.wasConstrained)
        continue;
      let errorMessage = `You used \`this.${key}.get()\` without adding a precondition that links it to the actual on-chain state.
Consider adding this line to your code:
this.${key}.assertEquals(this.${key}.get());`;
      throw Error(errorMessage);
    }
  } finally {
    cleanStatePrecondition(sc);
  }
}
function cleanStatePrecondition(sc) {
  for (let [, context] of getStateContexts(sc)) {
    if (context === void 0)
      continue;
    context.wasRead = false;
    context.wasConstrained = false;
    context.cachedVariable = void 0;
  }
}
function getStateContexts(sc) {
  let scClass = sc.constructor;
  let scInfo = smartContracts.get(scClass);
  if (scInfo === void 0)
    return [];
  return scInfo.states.map(([key]) => [key, sc[key]?._contract]);
}

// dist/node/lib/zkapp.js
var _SmartContract_executionState;
var _SmartContract__senderState;
var reservedPropNames2 = /* @__PURE__ */ new Set(["_methods", "_"]);
function method(target, methodName, descriptor) {
  const ZkappClass = target.constructor;
  if (reservedPropNames2.has(methodName)) {
    throw Error(`Property name ${methodName} is reserved.`);
  }
  if (typeof target[methodName] !== "function") {
    throw Error(`@method decorator was applied to \`${methodName}\`, which is not a function.`);
  }
  let paramTypes = Reflect.getMetadata("design:paramtypes", target, methodName);
  let returnType = Reflect.getMetadata("design:returntype", target, methodName);
  class SelfProof2 extends Proof2 {
  }
  SelfProof2.publicInputType = ZkappPublicInput;
  SelfProof2.publicOutputType = Empty;
  SelfProof2.tag = () => ZkappClass;
  let internalMethodEntry = sortMethodArguments(ZkappClass.name, methodName, paramTypes, SelfProof2);
  let methodEntry = sortMethodArguments(ZkappClass.name, methodName, [PublicKey2, Field4, ...paramTypes], SelfProof2);
  if (isAsFields(returnType)) {
    internalMethodEntry.returnType = returnType;
    methodEntry.returnType = returnType;
  }
  ZkappClass._methods ?? (ZkappClass._methods = []);
  ZkappClass._methods.push(methodEntry);
  ZkappClass._maxProofsVerified ?? (ZkappClass._maxProofsVerified = 0);
  ZkappClass._maxProofsVerified = Math.max(ZkappClass._maxProofsVerified, methodEntry.proofArgs.length);
  let func = descriptor.value;
  descriptor.value = wrapMethod(func, ZkappClass, internalMethodEntry);
}
function wrapMethod(method2, ZkappClass, methodIntf) {
  let methodName = methodIntf.methodName;
  return function wrappedMethod(...actualArgs) {
    cleanStatePrecondition(this);
    actualArgs.forEach((arg) => {
      if (arg instanceof AccountUpdate3) {
        AccountUpdate3.unlink(arg);
      }
    });
    let insideContract = smartContractContext.get();
    if (!insideContract) {
      const context = {
        this: this,
        methodCallDepth: 0,
        selfUpdate: selfAccountUpdate(this, methodName)
      };
      let id2 = smartContractContext.enter(context);
      try {
        if (inCompile() || inProver() || inAnalyze()) {
          let proverData = inProver() ? zkAppProver.getData() : void 0;
          let txId = currentTransaction.enter({
            sender: proverData?.transaction.feePayer.body.publicKey,
            accountUpdates: [],
            fetchMode: inProver() ? "cached" : "test",
            isFinalRunOutsideCircuit: false,
            numberOfRuns: void 0
          });
          try {
            let publicInput = actualArgs.shift();
            let accountUpdate = this.self;
            let blindingValue = Provable.witness(Field4, getBlindingValue);
            let context2 = memoizationContext() ?? {
              memoized: [],
              currentIndex: 0
            };
            let id3 = memoizationContext.enter({ ...context2, blindingValue });
            let result;
            try {
              result = method2.apply(this, actualArgs.map(cloneCircuitValue));
            } finally {
              memoizationContext.leave(id3);
            }
            let callDataFields = computeCallData(methodIntf, actualArgs, result, blindingValue);
            accountUpdate.body.callData = Poseidon2.hash(callDataFields);
            Authorization.setProofAuthorizationKind(accountUpdate);
            if (DEBUG_PUBLIC_INPUT_CHECK) {
              Provable.asProver(() => {
                function diff(prover, input) {
                  delete prover.id;
                  delete prover.callDepth;
                  delete input.id;
                  delete input.callDepth;
                  if (JSON.stringify(prover) !== JSON.stringify(input)) {
                    console.log("transaction:", ZkappCommand3.toPretty(transaction2));
                    console.log("index", index);
                    console.log("inconsistent account updates:");
                    console.log("update created by the prover:");
                    console.log(prover);
                    console.log("update created in transaction block:");
                    console.log(input);
                  }
                }
                function diffRecursive(prover, input) {
                  diff(prover.toPretty(), input.toPretty());
                  let nChildren = input.children.accountUpdates.length;
                  for (let i2 = 0; i2 < nChildren; i2++) {
                    let inputChild = input.children.accountUpdates[i2];
                    let child = prover.children.accountUpdates[i2];
                    if (!inputChild || !child)
                      return;
                    diffRecursive(child, inputChild);
                  }
                }
                let { accountUpdate: inputUpdate, transaction: transaction2, index } = zkAppProver.getData();
                diffRecursive(accountUpdate, inputUpdate);
              });
            }
            checkPublicInput(publicInput, accountUpdate);
            assertPreconditionInvariants(accountUpdate);
            cleanPreconditionsCache(accountUpdate);
            assertStatePrecondition(this);
            return result;
          } finally {
            currentTransaction.leave(txId);
          }
        } else if (!currentTransaction.has()) {
          let result = method2.apply(this, actualArgs);
          assertPreconditionInvariants(this.self);
          cleanPreconditionsCache(this.self);
          assertStatePrecondition(this);
          return result;
        } else {
          let accountUpdate = context.selfUpdate;
          currentTransaction()?.accountUpdates.push(accountUpdate);
          let clonedArgs = cloneCircuitValue(actualArgs);
          let blindingValue = getBlindingValue();
          let memoContext = { memoized: [], currentIndex: 0, blindingValue };
          let memoId = memoizationContext.enter(memoContext);
          let result;
          try {
            result = method2.apply(this, actualArgs.map((a2, i2) => {
              let arg = methodIntf.allArgs[i2];
              if (arg.type === "witness") {
                let type = methodIntf.witnessArgs[arg.index];
                return Provable.witness(type, () => a2);
              }
              return a2;
            }));
          } finally {
            memoizationContext.leave(memoId);
          }
          let { memoized } = memoContext;
          assertStatePrecondition(this);
          let callDataFields = computeCallData(methodIntf, clonedArgs, result, blindingValue);
          accountUpdate.body.callData = Poseidon2.hash(callDataFields);
          if (!Authorization.hasAny(accountUpdate)) {
            Authorization.setLazyProof(accountUpdate, {
              methodName: methodIntf.methodName,
              args: clonedArgs,
              // proofs actually don't have to be cloned
              previousProofs: getPreviousProofsForProver(actualArgs, methodIntf),
              ZkappClass,
              memoized,
              blindingValue
            }, currentTransaction().accountUpdates);
          }
          return result;
        }
      } finally {
        smartContractContext.leave(id2);
      }
    }
    let parentAccountUpdate = insideContract.this.self;
    let methodCallDepth = insideContract.methodCallDepth;
    let innerContext = {
      this: this,
      methodCallDepth: methodCallDepth + 1,
      selfUpdate: selfAccountUpdate(this, methodName)
    };
    let id = smartContractContext.enter(innerContext);
    try {
      let { returnType } = methodIntf;
      let noReturnTypeError = `To return a result from ${methodIntf.methodName}() inside another zkApp, you need to declare the return type.
This can be done by annotating the type at the end of the function signature. For example:

@method ${methodIntf.methodName}(): Field {
  // ...
}

Note: Only types built out of \`Field\` are valid return types. This includes snarkyjs primitive types and custom CircuitValues.`;
      if (ZkappClass._methodMetadata?.[methodIntf.methodName]?.hasReturn && returnType === void 0) {
        throw Error(noReturnTypeError);
      }
      let blindingValue = getBlindingValue();
      let runCalledContract = () => {
        let constantArgs = methodArgumentsToConstant(methodIntf, actualArgs);
        let constantBlindingValue = blindingValue.toConstant();
        let accountUpdate2 = this.self;
        accountUpdate2.body.callDepth = parentAccountUpdate.body.callDepth + 1;
        accountUpdate2.parent = parentAccountUpdate;
        let memoContext = {
          memoized: [],
          currentIndex: 0,
          blindingValue: constantBlindingValue
        };
        let memoId = memoizationContext.enter(memoContext);
        let result2;
        try {
          result2 = method2.apply(this, constantArgs.map(cloneCircuitValue));
        } finally {
          memoizationContext.leave(memoId);
        }
        let { memoized } = memoContext;
        assertStatePrecondition(this);
        if (result2 !== void 0) {
          if (returnType === void 0) {
            throw Error(noReturnTypeError);
          } else {
            result2 = toConstant(returnType, result2);
          }
        }
        let callDataFields2 = computeCallData(methodIntf, constantArgs, result2, constantBlindingValue);
        accountUpdate2.body.callData = hashConstant(callDataFields2);
        if (!Authorization.hasAny(accountUpdate2)) {
          Authorization.setLazyProof(accountUpdate2, {
            methodName: methodIntf.methodName,
            args: constantArgs,
            previousProofs: getPreviousProofsForProver(constantArgs, methodIntf),
            ZkappClass,
            memoized,
            blindingValue: constantBlindingValue
          }, currentTransaction().accountUpdates);
        }
        return { accountUpdate: accountUpdate2, result: result2 ?? null };
      };
      let { accountUpdate, result } = methodCallDepth === 0 ? AccountUpdate3.witness(returnType ?? provable2(null), runCalledContract, { skipCheck: true }) : runCalledContract();
      innerContext.selfUpdate = accountUpdate;
      accountUpdate.body.callDepth = parentAccountUpdate.body.callDepth + 1;
      accountUpdate.parent = parentAccountUpdate;
      accountUpdate.children.callsType = { type: "Witness" };
      parentAccountUpdate.children.accountUpdates.push(accountUpdate);
      accountUpdate.body.publicKey.assertEquals(this.address);
      accountUpdate.body.tokenId.assertEquals(this.self.body.tokenId);
      let callDataFields = computeCallData(methodIntf, actualArgs, result, blindingValue);
      let callData = Poseidon2.hash(callDataFields);
      accountUpdate.body.callData.assertEquals(callData);
      return result;
    } finally {
      smartContractContext.leave(id);
    }
  };
}
function checkPublicInput({ accountUpdate, calls }, self) {
  let otherInput = self.toPublicInput();
  accountUpdate.assertEquals(otherInput.accountUpdate);
  calls.assertEquals(otherInput.calls);
}
function computeCallData(methodIntf, argumentValues, returnValue, blindingValue) {
  let { returnType, methodName } = methodIntf;
  let args = methodArgumentTypesAndValues(methodIntf, argumentValues);
  let argSizesAndFields = args.map(({ type, value }) => [
    Field4(type.sizeInFields()),
    ...type.toFields(value)
  ]);
  let totalArgSize = Field4(args.map(({ type }) => type.sizeInFields()).reduce((s, t) => s + t, 0));
  let totalArgFields = argSizesAndFields.flat();
  let returnSize = Field4(returnType?.sizeInFields() ?? 0);
  let returnFields = returnType?.toFields(returnValue) ?? [];
  let methodNameFields = stringToFields(methodName);
  return [
    // we have to encode the sizes of arguments / return value, so that fields can't accidentally shift
    // from one argument to another, or from arguments to the return value, or from the return value to the method name
    totalArgSize,
    ...totalArgFields,
    returnSize,
    ...returnFields,
    // we don't have to encode the method name size because the blinding value is fixed to one field element,
    // so method name fields can't accidentally become the blinding value and vice versa
    ...methodNameFields,
    blindingValue
  ];
}
var Callback = class extends GenericArgument {
  static create(instance, methodName, args) {
    let ZkappClass = instance.constructor;
    let methodIntf_ = (ZkappClass._methods ?? []).find((i2) => i2.methodName === methodName);
    if (methodIntf_ === void 0)
      throw Error(`Callback: could not find method ${ZkappClass.name}.${String(methodName)}`);
    let methodIntf = {
      ...methodIntf_,
      returnType: methodIntf_.returnType ?? provable2(null)
    };
    let result = instance[methodName](...args);
    let accountUpdate = instance.self;
    let callback = new Callback({
      instance,
      methodIntf,
      args,
      result,
      accountUpdate,
      isEmpty: false
    });
    return callback;
  }
  constructor(self) {
    super();
    Object.assign(this, self);
  }
};
var SmartContract = class {
  /**
   * Returns a Proof type that belongs to this {@link SmartContract}.
   */
  static Proof() {
    var _a4;
    let Contract = this;
    return _a4 = class extends Proof2 {
    }, _a4.publicInputType = ZkappPublicInput, _a4.publicOutputType = Empty, _a4.tag = () => Contract, _a4;
  }
  constructor(address, tokenId) {
    _SmartContract_executionState.set(this, void 0);
    _SmartContract__senderState.set(this, void 0);
    this.events = {};
    this.address = address;
    this.tokenId = tokenId ?? TokenId4.default;
    Object.defineProperty(this, "reducer", {
      set(reducer) {
        var _a4;
        ((_a4 = this)._ ?? (_a4._ = {})).reducer = reducer;
      },
      get() {
        return getReducer(this);
      }
    });
  }
  /**
   * Compile your smart contract.
   *
   * This generates both the prover functions, needed to create proofs for running `@method`s,
   * and the verification key, needed to deploy your zkApp.
   *
   * Although provers and verification key are returned by this method, they are also cached internally and used when needed,
   * so you don't actually have to use the return value of this function.
   *
   * Under the hood, "compiling" means calling into the lower-level [Pickles and Kimchi libraries](https://o1-labs.github.io/proof-systems/kimchi/overview.html) to
   * create multiple prover & verifier indices (one for each smart contract method as part of a "step circuit" and one for the "wrap circuit" which recursively wraps
   * it so that proofs end up in the original finite field). These are fairly expensive operations, so **expect compiling to take at least 20 seconds**,
   * up to several minutes if your circuit is large or your hardware is not optimal for these operations.
   */
  static async compile() {
    let methodIntfs = this._methods ?? [];
    let methods = methodIntfs.map(({ methodName }) => {
      return (publicInput, publicKey, tokenId, ...args) => {
        let instance = new this(publicKey, tokenId);
        instance[methodName](publicInput, ...args);
      };
    });
    this.analyzeMethods();
    let { verificationKey: verificationKey_, provers, verify: verify3 } = await compileProgram(ZkappPublicInput, Empty, methodIntfs, methods, this);
    let verificationKey = {
      data: verificationKey_.data,
      hash: Field4(verificationKey_.hash)
    };
    this._provers = provers;
    this._verificationKey = verificationKey;
    return { verificationKey, provers, verify: verify3 };
  }
  /**
   * Computes a hash of your smart contract, which will reliably change _whenever one of your method circuits changes_.
   * This digest is quick to compute. it is designed to help with deciding whether a contract should be re-compiled or
   * a cached verification key can be used.
   * @returns the digest, as a hex string
   */
  static digest() {
    let methodData = this.analyzeMethods();
    let hash2 = hashConstant(Object.values(methodData).map((d) => Field4(BigInt("0x" + d.digest))));
    return hash2.toBigInt().toString(16);
  }
  /**
   * Deploys a {@link SmartContract}.
   *
   * ```ts
   * let tx = await Mina.transaction(sender, () => {
   *   AccountUpdate.fundNewAccount(sender);
   *   zkapp.deploy();
   * });
   * tx.sign([senderKey, zkAppKey]);
   * ```
   */
  deploy({ verificationKey, zkappKey } = {}) {
    let accountUpdate = this.newSelf();
    verificationKey ?? (verificationKey = this.constructor._verificationKey);
    if (verificationKey === void 0) {
      if (!getProofsEnabled()) {
        let [, data2, hash3] = Pickles.dummyVerificationKey();
        verificationKey = { data: data2, hash: Field4(hash3) };
      } else {
        throw Error(`\`${this.constructor.name}.deploy()\` was called but no verification key was found.
Try calling \`await ${this.constructor.name}.compile()\` first, this will cache the verification key in the background.`);
      }
    }
    let { hash: hash_, data } = verificationKey;
    let hash2 = Field4.from(hash_);
    accountUpdate.account.verificationKey.set({ hash: hash2, data });
    accountUpdate.account.permissions.set(Permissions.default());
    accountUpdate.sign(zkappKey);
    AccountUpdate3.attachToTransaction(accountUpdate);
    let shouldInit = !hasAccount(this.address) || getAccount(this.address).zkapp?.verificationKey === void 0;
    if (!shouldInit)
      return;
    else
      this.init();
    let initUpdate = this.self;
    (0, import_tslib7.__classPrivateFieldSet)(this, _SmartContract_executionState, {
      transactionId: (0, import_tslib7.__classPrivateFieldGet)(this, _SmartContract_executionState, "f").transactionId,
      accountUpdate
    }, "f");
    let isFirstRun = currentTransaction()?.numberOfRuns === 0;
    if (!isFirstRun)
      return;
    Provable.asProver(() => {
      if (initUpdate.update.appState.some(({ isSome }) => !isSome.toBoolean())) {
        console.warn(`WARNING: the \`init()\` method was called without overwriting the entire state. This means that your zkApp will lack
the \`provedState === true\` status which certifies that the current state was verifiably produced by proofs (and not arbitrarily set by the zkApp developer).
To make sure the entire state is reset, consider adding this line to the beginning of your \`init()\` method:
super.init();
`);
      }
    });
  }
  // TODO make this a @method and create a proof during `zk deploy` (+ add mechanism to skip this)
  /**
   * `SmartContract.init()` will be called only when a {@link SmartContract} will be first deployed, not for redeployment.
   * This method can be overridden as follows
   * ```
   * class MyContract extends SmartContract {
   *  init() {
   *    super.init();
   *    this.account.permissions.set(...);
   *    this.x.set(Field(1));
   *  }
   * }
   * ```
   */
  init() {
    this.account.provedState.assertEquals(Bool4(false));
    let accountUpdate = this.self;
    for (let i2 = 0; i2 < ZkappStateLength; i2++) {
      AccountUpdate3.setValue(accountUpdate.body.update.appState[i2], Field4(0));
    }
    AccountUpdate3.attachToTransaction(accountUpdate);
  }
  /**
   * Use this command if the account update created by this SmartContract should be signed by the account owner,
   * instead of authorized with a proof.
   *
   * Note that the smart contract's {@link Permissions} determine which updates have to be (can be) authorized by a signature.
   *
   * If you only want to avoid creating proofs for quicker testing, we advise you to
   * use `LocalBlockchain({ proofsEnabled: false })` instead of `requireSignature()`. Setting
   * `proofsEnabled` to `false` allows you to test your transactions with the same authorization flow as in production,
   * with the only difference being that quick mock proofs are filled in instead of real proofs.
   */
  requireSignature() {
    this.self.requireSignature();
  }
  /**
   * @deprecated `this.sign()` is deprecated in favor of `this.requireSignature()`
   */
  sign(zkappKey) {
    this.self.sign(zkappKey);
  }
  /**
   * Use this command if the account update created by this SmartContract should have no authorization on it,
   * instead of being authorized with a proof.
   *
   * WARNING: This is a method that should rarely be useful. If you want to disable proofs for quicker testing, take a look
   * at `LocalBlockchain({ proofsEnabled: false })`, which causes mock proofs to be created and doesn't require changing the
   * authorization flow.
   */
  skipAuthorization() {
    Authorization.setLazyNone(this.self);
  }
  /**
   * Returns the current {@link AccountUpdate} associated to this {@link SmartContract}.
   */
  get self() {
    let inTransaction = currentTransaction.has();
    let inSmartContract = smartContractContext.get();
    if (!inTransaction && !inSmartContract) {
      return selfAccountUpdate(this);
    }
    let transactionId = inTransaction ? currentTransaction.id() : NaN;
    if (inSmartContract && inSmartContract.this === this) {
      let accountUpdate2 = inSmartContract.selfUpdate;
      (0, import_tslib7.__classPrivateFieldSet)(this, _SmartContract_executionState, { accountUpdate: accountUpdate2, transactionId }, "f");
      return accountUpdate2;
    }
    let executionState = (0, import_tslib7.__classPrivateFieldGet)(this, _SmartContract_executionState, "f");
    if (executionState !== void 0 && executionState.transactionId === transactionId) {
      return executionState.accountUpdate;
    }
    let accountUpdate = selfAccountUpdate(this);
    (0, import_tslib7.__classPrivateFieldSet)(this, _SmartContract_executionState, { transactionId, accountUpdate }, "f");
    return accountUpdate;
  }
  // same as this.self, but explicitly creates a _new_ account update
  /**
   * Same as `SmartContract.self` but explicitly creates a new {@link AccountUpdate}.
   */
  newSelf() {
    let inTransaction = currentTransaction.has();
    let transactionId = inTransaction ? currentTransaction.id() : NaN;
    let accountUpdate = selfAccountUpdate(this);
    (0, import_tslib7.__classPrivateFieldSet)(this, _SmartContract_executionState, { transactionId, accountUpdate }, "f");
    return accountUpdate;
  }
  /**
   * The public key of the current transaction's sender account.
   *
   * Throws an error if not inside a transaction, or the sender wasn't passed in.
   *
   * **Warning**: The fact that this public key equals the current sender is not part of the proof.
   * A malicious prover could use any other public key without affecting the validity of the proof.
   */
  get sender() {
    if (!currentTransaction.has()) {
      throw Error(`this.sender is not available outside a transaction. Make sure you only use it within \`Mina.transaction\` blocks or smart contract methods.`);
    }
    let transactionId = currentTransaction.id();
    if ((0, import_tslib7.__classPrivateFieldGet)(this, _SmartContract__senderState, "f")?.transactionId === transactionId) {
      return (0, import_tslib7.__classPrivateFieldGet)(this, _SmartContract__senderState, "f").sender;
    } else {
      let sender2 = Provable.witness(PublicKey2, () => sender());
      (0, import_tslib7.__classPrivateFieldSet)(this, _SmartContract__senderState, { transactionId, sender: sender2 }, "f");
      return sender2;
    }
  }
  /**
   * Current account of the {@link SmartContract}.
   */
  get account() {
    return this.self.account;
  }
  /**
   * Current network state of the {@link SmartContract}.
   */
  get network() {
    return this.self.network;
  }
  /**
   * Current global slot on the network. This is the slot at which this transaction is included in a block. Since we cannot know this value
   * at the time of transaction construction, this only has the `assertBetween()` method but no `get()` (impossible to implement)
   * or `assertEquals()` (confusing, because the developer can't know the exact slot at which this will be included either)
   */
  get currentSlot() {
    return this.self.currentSlot;
  }
  /**
   * Token of the {@link SmartContract}.
   */
  get token() {
    return this.self.token();
  }
  /**
   * Approve an account update or callback. This will include the account update in the zkApp's public input,
   * which means it allows you to read and use its content in a proof, make assertions about it, and modify it.
   *
   * If this is called with a callback as the first parameter, it will first extract the account update produced by that callback.
   * The extracted account update is returned.
   *
   * ```ts
   * \@method myApprovingMethod(callback: Callback) {
   *   let approvedUpdate = this.approve(callback);
   * }
   * ```
   *
   * Under the hood, "approving" just means that the account update is made a child of the zkApp in the
   * tree of account updates that forms the transaction.
   * The second parameter `layout` allows you to also make assertions about the approved update's _own_ children,
   * by specifying a certain expected layout of children. See {@link AccountUpdate.Layout}.
   *
   * @param updateOrCallback
   * @param layout
   * @returns The account update that was approved (needed when passing in a Callback)
   */
  approve(updateOrCallback, layout) {
    let accountUpdate = updateOrCallback instanceof AccountUpdate3 ? updateOrCallback : Provable.witness(AccountUpdate3, () => updateOrCallback.accountUpdate);
    this.self.approve(accountUpdate, layout);
    return accountUpdate;
  }
  send(args) {
    return this.self.send(args);
  }
  /**
   * @deprecated use `this.account.tokenSymbol`
   */
  get tokenSymbol() {
    return this.self.tokenSymbol;
  }
  /**
   * Balance of this {@link SmartContract}.
   */
  get balance() {
    return this.self.balance;
  }
  // TODO: not able to type event such that it is inferred correctly so far
  /**
   * Emits an event. Events will be emitted as a part of the transaction and can be collected by archive nodes.
   */
  emitEvent(type, event) {
    let accountUpdate = this.self;
    let eventTypes = Object.keys(this.events);
    if (eventTypes.length === 0)
      throw Error(`emitEvent: You are trying to emit an event without having declared the types of your events.
Make sure to add a property \`events\` on ${this.constructor.name}, for example: 
class ${this.constructor.name} extends SmartContract {
  events = { 'my-event': Field }
}`);
    let eventNumber = eventTypes.sort().indexOf(type);
    if (eventNumber === -1)
      throw Error(`emitEvent: Unknown event type "${type}". The declared event types are: ${eventTypes.join(", ")}.`);
    let eventType = this.events[type];
    let eventFields;
    if (eventTypes.length === 1) {
      eventFields = eventType.toFields(event);
    } else {
      eventFields = [Field4(eventNumber), ...eventType.toFields(event)];
    }
    accountUpdate.body.events = Events.pushEvent(accountUpdate.body.events, eventFields);
  }
  /**
   * Asynchronously fetches events emitted by this {@link SmartContract} and returns an array of events with their corresponding types.
   * @async
   * @param [start=UInt32.from(0)] - The start height of the events to fetch.
   * @param end - The end height of the events to fetch. If not provided, fetches events up to the latest height.
   * @returns A promise that resolves to an array of objects, each containing the event type and event data for the specified range.
   * @throws If there is an error fetching events from the Mina network.
   * @example
   * const startHeight = UInt32.from(1000);
   * const endHeight = UInt32.from(2000);
   * const events = await myZkapp.fetchEvents(startHeight, endHeight);
   * console.log(events);
   */
  async fetchEvents(start = UInt322.from(0), end) {
    let events = (await fetchEvents2(this.address, this.self.body.tokenId, {
      from: start,
      to: end
    })).filter((eventData) => {
      let height = UInt322.from(eventData.blockHeight);
      return end === void 0 ? start.lessThanOrEqual(height).toBoolean() : start.lessThanOrEqual(height).toBoolean() && height.lessThanOrEqual(end).toBoolean();
    }).map((event) => {
      return event.events.map((eventData) => {
        let { events: events2, ...rest } = event;
        return {
          ...rest,
          event: eventData
        };
      });
    }).flat();
    let sortedEventTypes = Object.keys(this.events).sort();
    return events.map((eventData) => {
      if (sortedEventTypes.length === 1) {
        let type = sortedEventTypes[0];
        let event = this.events[type].fromFields(eventData.event.data.map((f) => Field4(f)));
        return {
          ...eventData,
          type,
          event: {
            data: event,
            transactionInfo: {
              transactionHash: eventData.event.transactionInfo.hash,
              transactionStatus: eventData.event.transactionInfo.status,
              transactionMemo: eventData.event.transactionInfo.memo
            }
          }
        };
      } else {
        let eventObjectIndex = Number(eventData.event.data[0]);
        let type = sortedEventTypes[eventObjectIndex];
        let eventProps = eventData.event.data.slice(1);
        let event = this.events[type].fromFields(eventProps.map((f) => Field4(f)));
        return {
          ...eventData,
          type,
          event: {
            data: event,
            transactionInfo: {
              transactionHash: eventData.event.transactionInfo.hash,
              transactionStatus: eventData.event.transactionInfo.status,
              transactionMemo: eventData.event.transactionInfo.memo
            }
          }
        };
      }
    });
  }
  static runOutsideCircuit(run) {
    if (currentTransaction()?.isFinalRunOutsideCircuit || inProver())
      Provable.asProver(run);
  }
  // TODO: this could also be used to quickly perform any invariant checks on account updates construction
  /**
   * This function is run internally before compiling a smart contract, to collect metadata about what each of your
   * smart contract methods does.
   *
   * For external usage, this function can be handy because calling it involves running all methods in the same "mode" as `compile()` does,
   * so it serves as a quick-to-run check for whether your contract can be compiled without errors, which can greatly speed up iterating.
   *
   * `analyzeMethods()` will also return the number of `rows` of each of your method circuits (i.e., the number of constraints in the underlying proof system),
   * which is a good indicator for circuit size and the time it will take to create proofs.
   * To inspect the created circuit in detail, you can look at the returned `gates`.
   *
   * Note: If this function was already called before, it will short-circuit and just return the metadata collected the first time.
   *
   * @returns an object, keyed by method name, each entry containing:
   *  - `rows` the size of the constraint system created by this method
   *  - `digest` a digest of the method circuit
   *  - `hasReturn` a boolean indicating whether the method returns a value
   *  - `actions` the number of actions the method dispatches
   *  - `gates` the constraint system, represented as an array of gates
   */
  static analyzeMethods() {
    let ZkappClass = this;
    let methodMetadata = ZkappClass._methodMetadata ?? (ZkappClass._methodMetadata = {});
    let methodIntfs = ZkappClass._methods ?? [];
    if (!methodIntfs.every((m) => m.methodName in methodMetadata) && !inAnalyze()) {
      if (snarkContext.get().inRunAndCheck) {
        let err = new Error("Can not analyze methods inside Provable.runAndCheck, because this creates a circuit nested in another circuit");
        err.bootstrap = () => ZkappClass.analyzeMethods();
        throw err;
      }
      let id;
      let insideSmartContract = !!smartContractContext.get();
      if (insideSmartContract)
        id = smartContractContext.enter(null);
      try {
        for (let methodIntf of methodIntfs) {
          let accountUpdate;
          let { rows, digest, result, gates } = analyzeMethod(ZkappPublicInput, methodIntf, (publicInput, publicKey, tokenId, ...args) => {
            let instance = new ZkappClass(publicKey, tokenId);
            let result2 = instance[methodIntf.methodName](publicInput, ...args);
            accountUpdate = (0, import_tslib7.__classPrivateFieldGet)(instance, _SmartContract_executionState, "f").accountUpdate;
            return result2;
          });
          methodMetadata[methodIntf.methodName] = {
            actions: accountUpdate.body.actions.data.length,
            rows,
            digest,
            hasReturn: result !== void 0,
            gates
          };
        }
      } finally {
        if (insideSmartContract)
          smartContractContext.leave(id);
      }
    }
    return methodMetadata;
  }
  /**
   * @deprecated use `this.account.<field>.set()`
   */
  setValue(maybeValue, value) {
    AccountUpdate3.setValue(maybeValue, value);
  }
  /**
   * @deprecated use `this.account.permissions.set()`
   */
  setPermissions(permissions) {
    this.self.account.permissions.set(permissions);
  }
};
_SmartContract_executionState = /* @__PURE__ */ new WeakMap(), _SmartContract__senderState = /* @__PURE__ */ new WeakMap();
function getReducer(contract) {
  var _a4;
  let reducer = ((_a4 = contract)._ ?? (_a4._ = {})).reducer;
  if (reducer === void 0)
    throw Error(`You are trying to use a reducer without having declared its type.
Make sure to add a property \`reducer\` on ${contract.constructor.name}, for example:
class ${contract.constructor.name} extends SmartContract {
  reducer = { actionType: Field };
}`);
  return {
    dispatch(action) {
      let accountUpdate = contract.self;
      let eventFields = reducer.actionType.toFields(action);
      accountUpdate.body.actions = Actions.pushEvent(accountUpdate.body.actions, eventFields);
    },
    reduce(actionLists, stateType, reduce, { state: state3, actionState }, { maxTransactionsWithActions = 32, skipActionStatePrecondition = false } = {}) {
      if (actionLists.length > maxTransactionsWithActions) {
        throw Error(`reducer.reduce: Exceeded the maximum number of lists of actions, ${maxTransactionsWithActions}.
Use the optional \`maxTransactionsWithActions\` argument to increase this number.`);
      }
      let methodData = contract.constructor.analyzeMethods();
      let possibleActionsPerTransaction = [
        ...new Set(Object.values(methodData).map((o) => o.actions)).add(0)
      ].sort((x, y) => x - y);
      let possibleActionTypes = possibleActionsPerTransaction.map((n) => Provable.Array(reducer.actionType, n));
      for (let i2 = 0; i2 < maxTransactionsWithActions; i2++) {
        let actions = i2 < actionLists.length ? actionLists[i2] : [];
        let length = actions.length;
        let lengths = possibleActionsPerTransaction.map((n) => Provable.witness(Bool4, () => Bool4(length === n)));
        let actionss = possibleActionsPerTransaction.map((n, i3) => {
          let type = possibleActionTypes[i3];
          return Provable.witness(type, () => length === n ? actions : emptyValue3(type));
        });
        let eventsHashes = actionss.map((actions2) => {
          let events = actions2.map((a2) => reducer.actionType.toFields(a2));
          return Actions.hash(events);
        });
        let eventsHash = Provable.switch(lengths, Field4, eventsHashes);
        let newActionsHash = Actions.updateSequenceState(actionState, eventsHash);
        let isEmpty = lengths[0];
        actionState = Provable.if(isEmpty, actionState, newActionsHash);
        let newStates = actionss.map((actions2) => {
          let newState = Provable.witness(stateType, () => state3);
          Provable.assertEqual(stateType, newState, state3);
          [...actions2].reverse().forEach((action) => {
            newState = reduce(newState, action);
          });
          return newState;
        });
        state3 = Provable.switch(lengths, stateType, newStates);
      }
      if (!skipActionStatePrecondition) {
        contract.account.actionState.assertEquals(actionState);
      }
      return { state: state3, actionState };
    },
    forEach(actionLists, callback, fromActionState, config) {
      const stateType = provable2(void 0);
      let { actionState } = this.reduce(actionLists, stateType, (_, action) => {
        callback(action);
        return void 0;
      }, { state: void 0, actionState: fromActionState }, config);
      return actionState;
    },
    getActions(config) {
      let actionsForAccount = [];
      Provable.asProver(() => {
        let actions = getActions(contract.address, config, contract.self.tokenId);
        actionsForAccount = actions.map((event) => // putting our string-Fields back into the original action type
        event.actions.map((action) => reducer.actionType.fromFields(action.map(Field4))));
      });
      return actionsForAccount;
    },
    async fetchActions(config) {
      let result = await fetchActions2(contract.address, config, contract.self.tokenId);
      if ("error" in result) {
        throw Error(JSON.stringify(result));
      }
      return result.map((event) => // putting our string-Fields back into the original action type
      event.actions.map((action) => reducer.actionType.fromFields(action.map(Field4))));
    }
  };
}
var VerificationKey2 = class extends Struct({
  ...provable2({ data: String, hash: Field4 }),
  toJSON({ data }) {
    return data;
  }
}) {
};
function selfAccountUpdate(zkapp, methodName) {
  let body = Body.keepAll(zkapp.address, zkapp.tokenId);
  let update = new AccountUpdate3(body, {}, true);
  update.label = methodName ? `${zkapp.constructor.name}.${methodName}()` : `${zkapp.constructor.name}, no method`;
  return update;
}
function Account5(address, tokenId) {
  if (smartContractContext.get()) {
    return AccountUpdate3.create(address, tokenId).account;
  } else {
    return AccountUpdate3.defaultAccountUpdate(address, tokenId).account;
  }
}
function declareMethods(SmartContract2, methodArguments) {
  for (let key in methodArguments) {
    let argumentTypes = methodArguments[key];
    let target = SmartContract2.prototype;
    Reflect.metadata("design:paramtypes", argumentTypes)(target, key);
    let descriptor = Object.getOwnPropertyDescriptor(target, key);
    method(SmartContract2.prototype, key, descriptor);
    Object.defineProperty(target, key, descriptor);
  }
}
var Reducer = Object.defineProperty(function(reducer) {
  return reducer;
}, "initialActionState", { get: Actions.emptyActionState });
var DEBUG_PUBLIC_INPUT_CHECK = false;

// dist/node/mina-signer/src/memo.js
function fromString(memo) {
  let length = stringLengthInBytes(memo);
  if (length > 32)
    throw Error("Memo.fromString: string too long");
  return `${String.fromCharCode(length)}${memo}` + "\0".repeat(32 - length);
}
function toString(memo) {
  let totalLength = stringLengthInBytes(memo);
  if (totalLength !== 34) {
    throw Error(`Memo.toString: length ${totalLength} does not equal 34`);
  }
  if (memo[0] !== "") {
    throw Error("Memo.toString: expected memo to start with 0x01 byte");
  }
  let length = memo.charCodeAt(1);
  if (length > 32)
    throw Error("Memo.toString: invalid length encoding");
  let bytes = stringToBytes(memo).slice(2, 2 + length);
  return stringFromBytes(bytes);
}
function hash(memo) {
  let bits2 = Memo.toBits(memo);
  let fields = packToFieldsLegacy(HashInputLegacy.bits(bits2));
  return hashWithPrefix2(prefixes.zkappMemo, fields);
}
var SIZE = 34;
var Binable = defineBinable({
  toBytes(memo) {
    return stringToBytes(memo);
  },
  readBytes(bytes, start) {
    let end = start + SIZE;
    let memo = stringFromBytes(bytes.slice(start, end));
    return [memo, end];
  }
});
var Memo = {
  fromString,
  toString,
  hash,
  ...withBits(Binable, SIZE * 8),
  ...base58(Binable, versionBytes.userCommandMemo),
  sizeInBytes() {
    return SIZE;
  },
  emptyValue() {
    return Memo.fromString("");
  },
  toValidString(memo = "") {
    if (stringLengthInBytes(memo) > 32)
      throw Error("Memo: string too long");
    return memo;
  }
};

// dist/node/mina-signer/src/sign-zkapp-command.js
function verifyAccountUpdateSignature(update, transactionCommitments2, networkId) {
  if (update.authorization.signature === void 0)
    return false;
  let { publicKey, useFullCommitment } = update.body;
  let { commitment, fullCommitment } = transactionCommitments2;
  let usedCommitment = useFullCommitment === 1n ? fullCommitment : commitment;
  let signature = Signature.fromBase58(update.authorization.signature);
  return verifyFieldElement(signature, usedCommitment, publicKey, networkId);
}
function transactionCommitments(zkappCommand) {
  if (!isCallDepthValid(zkappCommand)) {
    throw Error("zkapp command: invalid call depth");
  }
  let callForest = accountUpdatesToCallForest(zkappCommand.accountUpdates);
  let commitment = callForestHash(callForest);
  let memoHash = Memo.hash(Memo.fromBase58(zkappCommand.memo));
  let feePayerDigest = feePayerHash(zkappCommand.feePayer);
  let fullCommitment = hashWithPrefix2(prefixes.accountUpdateCons, [
    memoHash,
    feePayerDigest,
    commitment
  ]);
  return { commitment, fullCommitment };
}
function accountUpdatesToCallForest(updates, callDepth = 0) {
  let remainingUpdates = callDepth > 0 ? updates : [...updates];
  let forest = [];
  while (remainingUpdates.length > 0) {
    let accountUpdate = remainingUpdates[0];
    if (accountUpdate.body.callDepth < callDepth)
      return forest;
    remainingUpdates.shift();
    let children = accountUpdatesToCallForest(remainingUpdates, callDepth + 1);
    forest.push({ accountUpdate, children });
  }
  return forest;
}
function accountUpdateHash(update) {
  assertAuthorizationKindValid(update);
  let input = AccountUpdate2.toInput(update);
  let fields = packToFields2(input);
  return hashWithPrefix2(prefixes.body, fields);
}
function callForestHash(forest) {
  let stackHash = 0n;
  for (let callTree of [...forest].reverse()) {
    let calls = callForestHash(callTree.children);
    let treeHash = accountUpdateHash(callTree.accountUpdate);
    let nodeHash = hashWithPrefix2(prefixes.accountUpdateNode, [
      treeHash,
      calls
    ]);
    stackHash = hashWithPrefix2(prefixes.accountUpdateCons, [
      nodeHash,
      stackHash
    ]);
  }
  return stackHash;
}
function feePayerHash(feePayer) {
  let accountUpdate = accountUpdateFromFeePayer(feePayer);
  return accountUpdateHash(accountUpdate);
}
function accountUpdateFromFeePayer({ body: { fee, nonce, publicKey, validUntil }, authorization: signature }) {
  let { body } = AccountUpdate2.emptyValue();
  body.publicKey = publicKey;
  body.balanceChange = { magnitude: fee, sgn: Sign(-1) };
  body.incrementNonce = Bool(true);
  body.preconditions.network.globalSlotSinceGenesis = {
    isSome: Bool(true),
    value: { lower: UInt32(0), upper: validUntil ?? UInt32.maxValue }
  };
  body.preconditions.account.nonce = {
    isSome: Bool(true),
    value: { lower: nonce, upper: nonce }
  };
  body.useFullCommitment = Bool(true);
  body.implicitAccountCreationFee = Bool(true);
  body.authorizationKind = {
    isProved: Bool(false),
    isSigned: Bool(true),
    verificationKeyHash: Field(mocks.dummyVerificationKeyHash)
  };
  return { body, authorization: { signature } };
}
function isCallDepthValid(zkappCommand) {
  let callDepths = zkappCommand.accountUpdates.map((a2) => a2.body.callDepth);
  let current = callDepths.shift() ?? 0;
  if (current !== 0)
    return false;
  for (let callDepth of callDepths) {
    if (callDepth < 0)
      return false;
    if (callDepth - current > 1)
      return false;
    current = callDepth;
  }
  return true;
}
function assertAuthorizationKindValid(accountUpdate) {
  let { isSigned, isProved, verificationKeyHash } = accountUpdate.body.authorizationKind;
  if (isProved && isSigned)
    throw Error("Invalid authorization kind: Only one of `isProved` and `isSigned` may be true.");
  if (!isProved && verificationKeyHash !== Field(mocks.dummyVerificationKeyHash))
    throw Error(`Invalid authorization kind: If \`isProved\` is false, verification key hash must be ${mocks.dummyVerificationKeyHash}, got ${verificationKeyHash}`);
}

// dist/node/lib/account_update.js
var ZkappStateLength = 8;
var smartContractContext = Context.create({
  default: null
});
var zkAppProver = Prover();
var True = () => Bool4(true);
var False = () => Bool4(false);
var Permission = {
  /**
   * Modification is impossible.
   */
  impossible: () => ({
    constant: True(),
    signatureNecessary: True(),
    signatureSufficient: False()
  }),
  /**
   * Modification is always permitted
   */
  none: () => ({
    constant: True(),
    signatureNecessary: False(),
    signatureSufficient: True()
  }),
  /**
   * Modification is permitted by zkapp proofs only
   */
  proof: () => ({
    constant: False(),
    signatureNecessary: False(),
    signatureSufficient: False()
  }),
  /**
   * Modification is permitted by signatures only, using the private key of the zkapp account
   */
  signature: () => ({
    constant: False(),
    signatureNecessary: True(),
    signatureSufficient: True()
  }),
  /**
   * Modification is permitted by zkapp proofs or signatures
   */
  proofOrSignature: () => ({
    constant: False(),
    signatureNecessary: False(),
    signatureSufficient: True()
  })
};
var Permissions = {
  ...Permission,
  /**
   * Default permissions are:
   *
   *   {@link Permissions.editState} = {@link Permission.proof}
   *
   *   {@link Permissions.send} = {@link Permission.signature}
   *
   *   {@link Permissions.receive} = {@link Permission.none}
   *
   *   {@link Permissions.setDelegate} = {@link Permission.signature}
   *
   *   {@link Permissions.setPermissions} = {@link Permission.signature}
   *
   *   {@link Permissions.setVerificationKey} = {@link Permission.signature}
   *
   *   {@link Permissions.setZkappUri} = {@link Permission.signature}
   *
   *   {@link Permissions.editActionState} = {@link Permission.proof}
   *
   *   {@link Permissions.setTokenSymbol} = {@link Permission.signature}
   *
   */
  default: () => ({
    editState: Permission.proof(),
    send: Permission.proof(),
    receive: Permission.none(),
    setDelegate: Permission.signature(),
    setPermissions: Permission.signature(),
    setVerificationKey: Permission.signature(),
    setZkappUri: Permission.signature(),
    editActionState: Permission.proof(),
    setTokenSymbol: Permission.signature(),
    incrementNonce: Permission.signature(),
    setVotingFor: Permission.signature(),
    setTiming: Permission.signature(),
    access: Permission.none()
  }),
  initial: () => ({
    editState: Permission.signature(),
    send: Permission.signature(),
    receive: Permission.none(),
    setDelegate: Permission.signature(),
    setPermissions: Permission.signature(),
    setVerificationKey: Permission.signature(),
    setZkappUri: Permission.signature(),
    editActionState: Permission.signature(),
    setTokenSymbol: Permission.signature(),
    incrementNonce: Permission.signature(),
    setVotingFor: Permission.signature(),
    setTiming: Permission.signature(),
    access: Permission.none()
  }),
  dummy: () => ({
    editState: Permission.none(),
    send: Permission.none(),
    receive: Permission.none(),
    access: Permission.none(),
    setDelegate: Permission.none(),
    setPermissions: Permission.none(),
    setVerificationKey: Permission.none(),
    setZkappUri: Permission.none(),
    editActionState: Permission.none(),
    setTokenSymbol: Permission.none(),
    incrementNonce: Permission.none(),
    setVotingFor: Permission.none(),
    setTiming: Permission.none()
  }),
  allImpossible: () => ({
    editState: Permission.impossible(),
    send: Permission.impossible(),
    receive: Permission.impossible(),
    access: Permission.impossible(),
    setDelegate: Permission.impossible(),
    setPermissions: Permission.impossible(),
    setVerificationKey: Permission.impossible(),
    setZkappUri: Permission.impossible(),
    editActionState: Permission.impossible(),
    setTokenSymbol: Permission.impossible(),
    incrementNonce: Permission.impossible(),
    setVotingFor: Permission.impossible(),
    setTiming: Permission.impossible()
  }),
  fromString: (permission) => {
    switch (permission) {
      case "None":
        return Permission.none();
      case "Either":
        return Permission.proofOrSignature();
      case "Proof":
        return Permission.proof();
      case "Signature":
        return Permission.signature();
      case "Impossible":
        return Permission.impossible();
      default:
        throw Error(`Cannot parse invalid permission. ${permission} does not exist.`);
    }
  },
  fromJSON: (permissions) => {
    return Object.fromEntries(Object.entries(permissions).map(([k, v]) => [
      k,
      Permissions.fromString(v)
    ]));
  }
};
var Body = {
  /**
   * A body that doesn't change the underlying account record
   */
  keepAll(publicKey, tokenId, mayUseToken) {
    let { body } = transaction_exports.AccountUpdate.emptyValue();
    body.publicKey = publicKey;
    if (tokenId) {
      body.tokenId = tokenId;
      body.mayUseToken = Provable.if(tokenId.equals(TokenId4.default), AccountUpdate3.MayUseToken.type, AccountUpdate3.MayUseToken.No, AccountUpdate3.MayUseToken.ParentsOwnToken);
    }
    if (mayUseToken) {
      body.mayUseToken = mayUseToken;
    }
    return body;
  },
  dummy() {
    return transaction_exports.AccountUpdate.emptyValue().body;
  }
};
var FeePayerBody = {
  keepAll(publicKey, nonce) {
    return {
      publicKey,
      nonce,
      fee: UInt642.zero,
      validUntil: void 0
    };
  }
};
var NetworkPrecondition = {
  ignoreAll() {
    let stakingEpochData = {
      ledger: { hash: ignore(Field4(0)), totalCurrency: ignore(uint64()) },
      seed: ignore(Field4(0)),
      startCheckpoint: ignore(Field4(0)),
      lockCheckpoint: ignore(Field4(0)),
      epochLength: ignore(uint32())
    };
    let nextEpochData = cloneCircuitValue(stakingEpochData);
    return {
      snarkedLedgerHash: ignore(Field4(0)),
      blockchainLength: ignore(uint32()),
      minWindowDensity: ignore(uint32()),
      totalCurrency: ignore(uint64()),
      globalSlotSinceGenesis: ignore(uint32()),
      stakingEpochData,
      nextEpochData
    };
  }
};
function ignore(dummy) {
  return { isSome: Bool4(false), value: dummy };
}
var uint32 = () => ({ lower: UInt322.from(0), upper: UInt322.MAXINT() });
var uint64 = () => ({ lower: UInt642.from(0), upper: UInt642.MAXINT() });
var AccountPrecondition = {
  ignoreAll() {
    let appState = [];
    for (let i2 = 0; i2 < ZkappStateLength; ++i2) {
      appState.push(ignore(Field4(0)));
    }
    return {
      balance: ignore(uint64()),
      nonce: ignore(uint32()),
      receiptChainHash: ignore(Field4(0)),
      delegate: ignore(PublicKey2.empty()),
      state: appState,
      actionState: ignore(Actions.emptyActionState()),
      provedState: ignore(Bool4(false)),
      isNew: ignore(Bool4(false))
    };
  },
  nonce(nonce) {
    let p3 = AccountPrecondition.ignoreAll();
    AccountUpdate3.assertEquals(p3.nonce, nonce);
    return p3;
  }
};
var GlobalSlotPrecondition = {
  ignoreAll() {
    return ignore(uint32());
  }
};
var Preconditions = {
  ignoreAll() {
    return {
      account: AccountPrecondition.ignoreAll(),
      network: NetworkPrecondition.ignoreAll(),
      validWhile: GlobalSlotPrecondition.ignoreAll()
    };
  }
};
var AccountId = provable2({ tokenOwner: PublicKey2, parentTokenId: Field4 }, { customObjectKeys: ["tokenOwner", "parentTokenId"] });
var TokenId4 = {
  ...transaction_exports.TokenId,
  ...TokenId3,
  get default() {
    return Field4(1);
  },
  derive(tokenOwner, parentTokenId = Field4(1)) {
    let input = AccountId.toInput({ tokenOwner, parentTokenId });
    return hashWithPrefix(prefixes.deriveTokenId, packToFields(input));
  }
};
var Token = class {
  static getId(tokenOwner, parentTokenId = TokenId4.default) {
    return TokenId4.derive(tokenOwner, parentTokenId);
  }
  constructor({ tokenOwner, parentTokenId = TokenId4.default }) {
    this.parentTokenId = parentTokenId;
    this.tokenOwner = tokenOwner;
    try {
      this.id = TokenId4.derive(tokenOwner, parentTokenId);
    } catch (e) {
      throw new Error(`Could not create a custom token id:
Error: ${e.message}`);
    }
  }
};
Token.Id = TokenId4;
var AccountUpdate3 = class {
  constructor(body, authorization = {}, isSelf = false) {
    this.label = "";
    this.lazyAuthorization = void 0;
    this.children = {
      callsType: { type: "None" },
      accountUpdates: []
    };
    this.parent = void 0;
    this.id = Math.random();
    this.body = body;
    this.authorization = authorization;
    let { account, network, currentSlot: currentSlot2 } = preconditions(this, isSelf);
    this.account = account;
    this.network = network;
    this.currentSlot = currentSlot2;
    this.isSelf = isSelf;
  }
  /**
   * Clones the {@link AccountUpdate}.
   */
  static clone(accountUpdate) {
    let body = cloneCircuitValue(accountUpdate.body);
    let authorization = cloneCircuitValue(accountUpdate.authorization);
    let cloned = new AccountUpdate3(body, authorization, accountUpdate.isSelf);
    cloned.lazyAuthorization = accountUpdate.lazyAuthorization;
    cloned.children.callsType = accountUpdate.children.callsType;
    cloned.children.accountUpdates = accountUpdate.children.accountUpdates.map(AccountUpdate3.clone);
    cloned.id = accountUpdate.id;
    cloned.label = accountUpdate.label;
    cloned.parent = accountUpdate.parent;
    return cloned;
  }
  token() {
    let thisAccountUpdate = this;
    let tokenOwner = this.publicKey;
    let parentTokenId = this.tokenId;
    let id = TokenId4.derive(tokenOwner, parentTokenId);
    function getApprovedAccountUpdate(accountLike, label) {
      if (accountLike instanceof SmartContract) {
        accountLike = accountLike.self;
      }
      if (accountLike instanceof AccountUpdate3) {
        accountLike.tokenId.assertEquals(id);
        thisAccountUpdate.approve(accountLike);
      }
      if (accountLike instanceof PublicKey2) {
        accountLike = AccountUpdate3.defaultAccountUpdate(accountLike, id);
        makeChildAccountUpdate(thisAccountUpdate, accountLike);
      }
      if (!accountLike.label)
        accountLike.label = `${thisAccountUpdate.label ?? "Unlabeled"}.${label}`;
      return accountLike;
    }
    return {
      id,
      parentTokenId,
      tokenOwner,
      /**
       * Mints token balance to `address`. Returns the mint account update.
       */
      mint({ address, amount }) {
        let receiver = getApprovedAccountUpdate(address, "token.mint()");
        receiver.balance.addInPlace(amount);
        return receiver;
      },
      /**
       * Burn token balance on `address`. Returns the burn account update.
       */
      burn({ address, amount }) {
        let sender2 = getApprovedAccountUpdate(address, "token.burn()");
        sender2.balance.subInPlace(amount);
        sender2.body.useFullCommitment = Bool4(true);
        Authorization.setLazySignature(sender2);
        return sender2;
      },
      /**
       * Move token balance from `from` to `to`. Returns the `to` account update.
       */
      send({ from, to, amount }) {
        let sender2 = getApprovedAccountUpdate(from, "token.send() (sender)");
        sender2.balance.subInPlace(amount);
        sender2.body.useFullCommitment = Bool4(true);
        Authorization.setLazySignature(sender2);
        let receiver = getApprovedAccountUpdate(to, "token.send() (receiver)");
        receiver.balance.addInPlace(amount);
        return receiver;
      }
    };
  }
  get tokenId() {
    return this.body.tokenId;
  }
  /**
   * @deprecated use `this.account.tokenSymbol`
   */
  get tokenSymbol() {
    let accountUpdate = this;
    return {
      set(tokenSymbol) {
        accountUpdate.account.tokenSymbol.set(tokenSymbol);
      }
    };
  }
  send({ to, amount }) {
    let receiver;
    if (to instanceof AccountUpdate3) {
      receiver = to;
      receiver.body.tokenId.assertEquals(this.body.tokenId);
    } else if (to instanceof SmartContract) {
      receiver = to.self;
      receiver.body.tokenId.assertEquals(this.body.tokenId);
    } else {
      receiver = AccountUpdate3.defaultAccountUpdate(to, this.body.tokenId);
      receiver.label = `${this.label ?? "Unlabeled"}.send()`;
      this.approve(receiver);
    }
    this.body.balanceChange = Int64.fromObject(this.body.balanceChange).sub(amount);
    receiver.body.balanceChange = Int64.fromObject(receiver.body.balanceChange).add(amount);
    return receiver;
  }
  /**
   * Makes an {@link AccountUpdate} a child-{@link AccountUpdate} of this and
   * approves it.
   */
  approve(childUpdate, layout = AccountUpdate3.Layout.NoChildren) {
    makeChildAccountUpdate(this, childUpdate);
    AccountUpdate3.witnessChildren(childUpdate, layout, { skipCheck: true });
  }
  get balance() {
    let accountUpdate = this;
    return {
      addInPlace(x) {
        let { magnitude, sgn } = accountUpdate.body.balanceChange;
        accountUpdate.body.balanceChange = new Int64(magnitude, sgn).add(x);
      },
      subInPlace(x) {
        let { magnitude, sgn } = accountUpdate.body.balanceChange;
        accountUpdate.body.balanceChange = new Int64(magnitude, sgn).sub(x);
      }
    };
  }
  get update() {
    return this.body.update;
  }
  static setValue(maybeValue, value) {
    maybeValue.isSome = Bool4(true);
    maybeValue.value = value;
  }
  /**
   * Constrain a property to lie between lower and upper bounds.
   *
   * @param property The property to constrain
   * @param lower The lower bound
   * @param upper The upper bound
   *
   * Example: To constrain the account balance of a SmartContract to lie between
   * 0 and 20 MINA, you can use
   *
   * ```ts
   * \@method onlyRunsWhenBalanceIsLow() {
   *   let lower = UInt64.zero;
   *   let upper = UInt64.from(20e9);
   *   AccountUpdate.assertBetween(this.self.body.preconditions.account.balance, lower, upper);
   *   // ...
   * }
   * ```
   */
  static assertBetween(property, lower, upper) {
    property.isSome = Bool4(true);
    property.value.lower = lower;
    property.value.upper = upper;
  }
  // TODO: assertGreaterThan, assertLowerThan?
  /**
   * Fix a property to a certain value.
   *
   * @param property The property to constrain
   * @param value The value it is fixed to
   *
   * Example: To fix the account nonce of a SmartContract to 0, you can use
   *
   * ```ts
   * \@method onlyRunsWhenNonceIsZero() {
   *   AccountUpdate.assertEquals(this.self.body.preconditions.account.nonce, UInt32.zero);
   *   // ...
   * }
   * ```
   */
  static assertEquals(property, value) {
    property.isSome = Bool4(true);
    if ("lower" in property.value && "upper" in property.value) {
      property.value.lower = value;
      property.value.upper = value;
    } else {
      property.value = value;
    }
  }
  get publicKey() {
    return this.body.publicKey;
  }
  /**
   * Use this command if this account update should be signed by the account
   * owner, instead of not having any authorization.
   *
   * If you use this and are not relying on a wallet to sign your transaction,
   * then you should use the following code before sending your transaction:
   *
   * ```ts
   * let tx = Mina.transaction(...); // create transaction as usual, using `requireSignature()` somewhere
   * tx.sign([privateKey]); // pass the private key of this account to `sign()`!
   * ```
   *
   * Note that an account's {@link Permissions} determine which updates have to
   * be (can be) authorized by a signature.
   */
  requireSignature() {
    this.sign();
  }
  /**
   * @deprecated `.sign()` is deprecated in favor of `.requireSignature()`
   */
  sign(privateKey) {
    let { nonce, isSameAsFeePayer } = AccountUpdate3.getSigningInfo(this);
    this.body.useFullCommitment = isSameAsFeePayer;
    this.body.implicitAccountCreationFee = Bool4(false);
    let doIncrementNonce = isSameAsFeePayer.not();
    this.body.incrementNonce = doIncrementNonce;
    let lower = Provable.if(doIncrementNonce, UInt322, nonce, UInt322.zero);
    let upper = Provable.if(doIncrementNonce, UInt322, nonce, UInt322.MAXINT());
    this.body.preconditions.account.nonce.isSome = doIncrementNonce;
    this.body.preconditions.account.nonce.value.lower = lower;
    this.body.preconditions.account.nonce.value.upper = upper;
    Authorization.setLazySignature(this, { privateKey });
  }
  static signFeePayerInPlace(feePayer, privateKey) {
    feePayer.body.nonce = this.getNonce(feePayer);
    feePayer.authorization = dummySignature();
    feePayer.lazyAuthorization = { kind: "lazy-signature", privateKey };
  }
  static getNonce(accountUpdate) {
    return AccountUpdate3.getSigningInfo(accountUpdate).nonce;
  }
  static getSigningInfo(accountUpdate) {
    return memoizeWitness(AccountUpdate3.signingInfo, () => AccountUpdate3.getSigningInfoUnchecked(accountUpdate));
  }
  static getSigningInfoUnchecked(update) {
    let publicKey = update.body.publicKey;
    let tokenId = update instanceof AccountUpdate3 ? update.body.tokenId : TokenId4.default;
    let nonce = Number(getAccountPreconditions(update.body).nonce.toString());
    let isFeePayer = currentTransaction()?.sender?.equals(publicKey);
    let isSameAsFeePayer = !!isFeePayer?.and(tokenId.equals(TokenId4.default)).toBoolean();
    if (isSameAsFeePayer)
      nonce++;
    CallForest.forEachPredecessor(currentTransaction.get().accountUpdates, update, (otherUpdate) => {
      let shouldIncreaseNonce = otherUpdate.publicKey.equals(publicKey).and(otherUpdate.tokenId.equals(tokenId)).and(otherUpdate.body.incrementNonce);
      if (shouldIncreaseNonce.toBoolean())
        nonce++;
    });
    return {
      nonce: UInt322.from(nonce),
      isSameAsFeePayer: Bool4(isSameAsFeePayer)
    };
  }
  toJSON() {
    return transaction_exports.AccountUpdate.toJSON(this);
  }
  static toJSON(a2) {
    return transaction_exports.AccountUpdate.toJSON(a2);
  }
  static fromJSON(json) {
    let accountUpdate = transaction_exports.AccountUpdate.fromJSON(json);
    return new AccountUpdate3(accountUpdate.body, accountUpdate.authorization);
  }
  hash() {
    if (Provable.inCheckedComputation()) {
      let input = transaction_exports.AccountUpdate.toInput(this);
      return hashWithPrefix(prefixes.body, packToFields(input));
    } else {
      let json = transaction_exports.AccountUpdate.toJSON(this);
      return Field4(Test.hashFromJson.accountUpdate(JSON.stringify(json)));
    }
  }
  toPublicInput() {
    let accountUpdate = this.hash();
    let calls = CallForest.hashChildren(this);
    return { accountUpdate, calls };
  }
  static defaultAccountUpdate(address, tokenId) {
    return new AccountUpdate3(Body.keepAll(address, tokenId));
  }
  static dummy() {
    return new AccountUpdate3(Body.dummy());
  }
  isDummy() {
    return this.body.publicKey.isEmpty();
  }
  static defaultFeePayer(address, nonce) {
    let body = FeePayerBody.keepAll(address, nonce);
    return {
      body,
      authorization: dummySignature(),
      lazyAuthorization: { kind: "lazy-signature" }
    };
  }
  static dummyFeePayer() {
    let body = FeePayerBody.keepAll(PublicKey2.empty(), UInt322.zero);
    return { body, authorization: dummySignature() };
  }
  /**
   * Creates an account update. If this is inside a transaction, the account
   * update becomes part of the transaction. If this is inside a smart contract
   * method, the account update will not only become part of the transaction,
   * but also becomes available for the smart contract to modify, in a way that
   * becomes part of the proof.
   */
  static create(publicKey, tokenId) {
    let accountUpdate = AccountUpdate3.defaultAccountUpdate(publicKey, tokenId);
    let insideContract = smartContractContext.get();
    if (insideContract) {
      let self = insideContract.this.self;
      self.approve(accountUpdate);
      accountUpdate.label = `${self.label || "Unlabeled"} > AccountUpdate.create()`;
    } else {
      currentTransaction()?.accountUpdates.push(accountUpdate);
      accountUpdate.label = `Mina.transaction > AccountUpdate.create()`;
    }
    return accountUpdate;
  }
  /**
   * Attach account update to the current transaction
   * -- if in a smart contract, to its children
   */
  static attachToTransaction(accountUpdate) {
    let insideContract = smartContractContext.get();
    if (insideContract) {
      let selfUpdate = insideContract.this.self;
      if (selfUpdate === accountUpdate)
        return;
      insideContract.this.self.approve(accountUpdate);
    } else {
      if (!currentTransaction.has())
        return;
      let updates = currentTransaction.get().accountUpdates;
      if (!updates.find((update) => update.id === accountUpdate.id)) {
        updates.push(accountUpdate);
      }
    }
  }
  /**
   * Disattach an account update from where it's currently located in the transaction
   */
  static unlink(accountUpdate) {
    let siblings = accountUpdate.parent?.children.accountUpdates ?? currentTransaction()?.accountUpdates;
    if (siblings === void 0)
      return;
    let i2 = siblings?.findIndex((update) => update.id === accountUpdate.id);
    if (i2 !== void 0 && i2 !== -1) {
      siblings.splice(i2, 1);
    }
    accountUpdate.parent === void 0;
  }
  static createSigned(signer, tokenId) {
    let publicKey = signer instanceof PrivateKey2 ? signer.toPublicKey() : signer;
    let accountUpdate = AccountUpdate3.create(publicKey, tokenId);
    accountUpdate.label = accountUpdate.label.replace(".create()", ".createSigned()");
    if (signer instanceof PrivateKey2) {
      accountUpdate.sign(signer);
    } else {
      accountUpdate.requireSignature();
    }
    return accountUpdate;
  }
  static fundNewAccount(feePayer, numberOfAccounts) {
    let accountUpdate = AccountUpdate3.createSigned(feePayer);
    accountUpdate.label = "AccountUpdate.fundNewAccount()";
    let fee = accountCreationFee();
    numberOfAccounts ?? (numberOfAccounts = 1);
    if (typeof numberOfAccounts === "number")
      fee = fee.mul(numberOfAccounts);
    else
      fee = fee.add(UInt642.from(numberOfAccounts.initialBalance ?? 0));
    accountUpdate.balance.subInPlace(fee);
    return accountUpdate;
  }
  static toAuxiliary(a2) {
    let aux = transaction_exports.AccountUpdate.toAuxiliary(a2);
    let children = {
      callsType: { type: "None" },
      accountUpdates: []
    };
    let lazyAuthorization = a2 && a2.lazyAuthorization;
    if (a2) {
      children.callsType = a2.children.callsType;
      children.accountUpdates = a2.children.accountUpdates.map(AccountUpdate3.clone);
    }
    let parent = a2?.parent;
    let id = a2?.id ?? Math.random();
    let label = a2?.label ?? "";
    return [{ lazyAuthorization, children, parent, id, label }, aux];
  }
  static fromFields(fields, [other, aux]) {
    let accountUpdate = transaction_exports.AccountUpdate.fromFields(fields, aux);
    return Object.assign(new AccountUpdate3(accountUpdate.body, accountUpdate.authorization), other);
  }
  static witness(type, compute, { skipCheck = false } = {}) {
    let accountUpdateType = skipCheck ? { ...provable2(AccountUpdate3), check() {
    } } : AccountUpdate3;
    let combinedType = provable2({
      accountUpdate: accountUpdateType,
      result: type
    });
    return Provable.witness(combinedType, compute);
  }
  static witnessChildren(accountUpdate, childLayout, options) {
    if (childLayout === AccountUpdate3.Layout.AnyChildren) {
      accountUpdate.children.callsType = { type: "Witness" };
      return;
    }
    if (childLayout === AccountUpdate3.Layout.NoDelegation) {
      accountUpdate.children.callsType = { type: "Witness" };
      accountUpdate.body.mayUseToken.parentsOwnToken.assertFalse();
      accountUpdate.body.mayUseToken.inheritFromParent.assertFalse();
      return;
    }
    let childArray = typeof childLayout === "number" ? Array(childLayout).fill(AccountUpdate3.Layout.NoChildren) : childLayout;
    let n = childArray.length;
    for (let i2 = 0; i2 < n; i2++) {
      accountUpdate.children.accountUpdates[i2] = AccountUpdate3.witnessTree(provable2(null), childArray[i2], () => ({
        accountUpdate: accountUpdate.children.accountUpdates[i2] ?? AccountUpdate3.dummy(),
        result: null
      }), options).accountUpdate;
    }
    if (n === 0) {
      accountUpdate.children.callsType = {
        type: "Equals",
        value: CallForest.emptyHash()
      };
    }
  }
  /**
   * Like AccountUpdate.witness, but lets you specify a layout for the
   * accountUpdate's children, which also get witnessed
   */
  static witnessTree(resultType, childLayout, compute, options) {
    let { accountUpdate, result } = AccountUpdate3.witness(resultType, compute, options);
    AccountUpdate3.witnessChildren(accountUpdate, childLayout, options);
    return { accountUpdate, result };
  }
  static get MayUseToken() {
    return {
      type: provablePure({ parentsOwnToken: Bool4, inheritFromParent: Bool4 }, { customObjectKeys: ["parentsOwnToken", "inheritFromParent"] }),
      No: { parentsOwnToken: Bool4(false), inheritFromParent: Bool4(false) },
      ParentsOwnToken: {
        parentsOwnToken: Bool4(true),
        inheritFromParent: Bool4(false)
      },
      InheritFromParent: {
        parentsOwnToken: Bool4(false),
        inheritFromParent: Bool4(true)
      },
      isNo({ body: { mayUseToken: { parentsOwnToken, inheritFromParent } } }) {
        return parentsOwnToken.or(inheritFromParent).not();
      },
      isParentsOwnToken(a2) {
        return a2.body.mayUseToken.parentsOwnToken;
      },
      isInheritFromParent(a2) {
        return a2.body.mayUseToken.inheritFromParent;
      }
    };
  }
  /**
   * Returns a JSON representation of only the fields that differ from the
   * default {@link AccountUpdate}.
   */
  toPretty() {
    function short(s) {
      return ".." + s.slice(-4);
    }
    let jsonUpdate = toJSONEssential(jsLayout.AccountUpdate, this);
    let body = jsonUpdate.body;
    delete body.callData;
    body.publicKey = short(body.publicKey);
    if (body.balanceChange?.magnitude === "0")
      delete body.balanceChange;
    if (body.tokenId === TokenId4.toBase58(TokenId4.default)) {
      delete body.tokenId;
    } else {
      body.tokenId = short(body.tokenId);
    }
    if (body.callDepth === 0)
      delete body.callDepth;
    if (body.incrementNonce === false)
      delete body.incrementNonce;
    if (body.useFullCommitment === false)
      delete body.useFullCommitment;
    if (body.implicitAccountCreationFee === false)
      delete body.implicitAccountCreationFee;
    if (body.events?.length === 0)
      delete body.events;
    if (body.actions?.length === 0)
      delete body.actions;
    if (body.preconditions?.account) {
      body.preconditions.account = JSON.stringify(body.preconditions.account);
    }
    if (body.preconditions?.network) {
      body.preconditions.network = JSON.stringify(body.preconditions.network);
    }
    if (body.preconditions?.validWhile) {
      body.preconditions.validWhile = JSON.stringify(body.preconditions.validWhile);
    }
    if (jsonUpdate.authorization?.proof) {
      jsonUpdate.authorization.proof = short(jsonUpdate.authorization.proof);
    }
    if (jsonUpdate.authorization?.signature) {
      jsonUpdate.authorization.signature = short(jsonUpdate.authorization.signature);
    }
    if (body.update?.verificationKey) {
      body.update.verificationKey = JSON.stringify({
        data: short(body.update.verificationKey.data),
        hash: short(body.update.verificationKey.hash)
      });
    }
    for (let key of ["permissions", "appState", "timing"]) {
      if (body.update?.[key]) {
        body.update[key] = JSON.stringify(body.update[key]);
      }
    }
    for (let key of ["events", "actions"]) {
      if (body[key]) {
        body[key] = JSON.stringify(body[key]);
      }
    }
    if (jsonUpdate.authorization !== void 0 || body.authorizationKind?.isProved === true || body.authorizationKind?.isSigned === true) {
      body.authorization = jsonUpdate.authorization;
    }
    body.mayUseToken = {
      parentsOwnToken: this.body.mayUseToken.parentsOwnToken.toBoolean(),
      inheritFromParent: this.body.mayUseToken.inheritFromParent.toBoolean()
    };
    let pretty = { ...body };
    let withId = false;
    if (withId)
      pretty = { id: Math.floor(this.id * 1e3), ...pretty };
    if (this.label)
      pretty = { label: this.label, ...pretty };
    return pretty;
  }
};
AccountUpdate3.Actions = Actions;
AccountUpdate3.signingInfo = provable2({
  nonce: UInt322,
  isSameAsFeePayer: Bool4
});
AccountUpdate3.sizeInFields = transaction_exports.AccountUpdate.sizeInFields;
AccountUpdate3.toFields = transaction_exports.AccountUpdate.toFields;
AccountUpdate3.toInput = transaction_exports.AccountUpdate.toInput;
AccountUpdate3.check = transaction_exports.AccountUpdate.check;
AccountUpdate3.Layout = {
  StaticChildren: (...args) => {
    if (args.length === 1 && typeof args[0] === "number")
      return args[0];
    if (args.length === 0)
      return 0;
    return args;
  },
  NoChildren: 0,
  AnyChildren: "AnyChildren",
  NoDelegation: "NoDelegation"
};
var CallForest = {
  // similar to Mina_base.ZkappCommand.Call_forest.to_account_updates_list
  // takes a list of accountUpdates, which each can have children, so they form a "forest" (list of trees)
  // returns a flattened list, with `accountUpdate.body.callDepth` specifying positions in the forest
  // also removes any "dummy" accountUpdates
  toFlatList(forest, mutate = true, depth = 0) {
    let accountUpdates = [];
    for (let accountUpdate of forest) {
      if (accountUpdate.isDummy().toBoolean())
        continue;
      if (mutate)
        accountUpdate.body.callDepth = depth;
      let children = accountUpdate.children.accountUpdates;
      accountUpdates.push(accountUpdate, ...CallForest.toFlatList(children, mutate, depth + 1));
    }
    return accountUpdates;
  },
  // Mina_base.Zkapp_command.Digest.Forest.empty
  emptyHash() {
    return Field4(0);
  },
  // similar to Mina_base.Zkapp_command.Call_forest.accumulate_hashes
  // hashes a accountUpdate's children (and their children, and ...) to compute
  // the `calls` field of ZkappPublicInput
  hashChildren(update) {
    let { callsType } = update.children;
    if (callsType.type === "Witness") {
      return Provable.witness(Field4, () => CallForest.hashChildrenBase(update));
    }
    let calls = CallForest.hashChildrenBase(update);
    if (callsType.type === "Equals" && Provable.inCheckedComputation()) {
      calls.assertEquals(callsType.value);
    }
    return calls;
  },
  hashChildrenBase({ children }) {
    let stackHash = CallForest.emptyHash();
    for (let accountUpdate of [...children.accountUpdates].reverse()) {
      let calls = CallForest.hashChildren(accountUpdate);
      let nodeHash = hashWithPrefix(prefixes.accountUpdateNode, [
        accountUpdate.hash(),
        calls
      ]);
      let newHash = hashWithPrefix(prefixes.accountUpdateCons, [
        nodeHash,
        stackHash
      ]);
      stackHash = Provable.if(accountUpdate.isDummy(), stackHash, newHash);
    }
    return stackHash;
  },
  // Mina_base.Zkapp_command.Call_forest.add_callers
  // TODO: currently unused, but could come back when we add caller to the
  // public input
  addCallers(updates, context = {
    self: TokenId4.default,
    caller: TokenId4.default
  }) {
    let withCallers = [];
    for (let update of updates) {
      let { mayUseToken } = update.body;
      let caller = Provable.if(mayUseToken.parentsOwnToken, context.self, Provable.if(mayUseToken.inheritFromParent, context.caller, TokenId4.default));
      let self = TokenId4.derive(update.body.publicKey, update.body.tokenId);
      let childContext = { caller, self };
      withCallers.push({
        accountUpdate: update,
        caller,
        children: CallForest.addCallers(update.children.accountUpdates, childContext)
      });
    }
    return withCallers;
  },
  /**
   * Used in the prover to witness the context from which to compute its caller
   *
   * TODO: currently unused, but could come back when we add caller to the
   * public input
   */
  computeCallerContext(update) {
    let current = update;
    let ancestors = [];
    while (true) {
      let parent = current.parent;
      if (parent === void 0)
        break;
      ancestors.unshift(parent);
      current = parent;
    }
    let context = { self: TokenId4.default, caller: TokenId4.default };
    for (let update2 of ancestors) {
      if (update2.body.mayUseToken.parentsOwnToken.toBoolean()) {
        context.caller = context.self;
      } else if (!update2.body.mayUseToken.inheritFromParent.toBoolean()) {
        context.caller = TokenId4.default;
      }
      context.self = TokenId4.derive(update2.body.publicKey, update2.body.tokenId);
    }
    return context;
  },
  callerContextType: provablePure({ self: Field4, caller: Field4 }),
  computeCallDepth(update) {
    for (let callDepth = 0; ; callDepth++) {
      if (update.parent === void 0)
        return callDepth;
      update = update.parent;
    }
  },
  map(updates, map) {
    let newUpdates = [];
    for (let update of updates) {
      let newUpdate = map(update);
      newUpdate.children.accountUpdates = CallForest.map(update.children.accountUpdates, map);
      newUpdates.push(newUpdate);
    }
    return newUpdates;
  },
  forEach(updates, callback) {
    for (let update of updates) {
      callback(update);
      CallForest.forEach(update.children.accountUpdates, callback);
    }
  },
  forEachPredecessor(updates, update, callback) {
    let isPredecessor = true;
    CallForest.forEach(updates, (otherUpdate) => {
      if (otherUpdate.id === update.id)
        isPredecessor = false;
      if (isPredecessor)
        callback(otherUpdate);
    });
  }
};
function createChildAccountUpdate(parent, childAddress, tokenId) {
  let child = AccountUpdate3.defaultAccountUpdate(childAddress, tokenId);
  makeChildAccountUpdate(parent, child);
  return child;
}
function makeChildAccountUpdate(parent, child) {
  child.body.callDepth = parent.body.callDepth + 1;
  let wasChildAlready = parent.children.accountUpdates.find((update) => update.id === child.id);
  if (!wasChildAlready) {
    parent.children.accountUpdates.push(child);
    AccountUpdate3.unlink(child);
  }
  child.parent = parent;
}
var ZkappCommand3 = {
  toPretty(transaction2) {
    let feePayer = ZkappCommand3.toJSON(transaction2).feePayer;
    feePayer.body.publicKey = ".." + feePayer.body.publicKey.slice(-4);
    feePayer.body.authorization = ".." + feePayer.authorization.slice(-4);
    if (feePayer.body.validUntil === null)
      delete feePayer.body.validUntil;
    return [
      { label: "feePayer", ...feePayer.body },
      ...transaction2.accountUpdates.map((a2) => a2.toPretty())
    ];
  },
  fromJSON(json) {
    let { feePayer } = transaction_exports.ZkappCommand.fromJSON({
      feePayer: json.feePayer,
      accountUpdates: [],
      memo: json.memo
    });
    let memo = Memo.toString(Memo.fromBase58(json.memo));
    let accountUpdates = json.accountUpdates.map(AccountUpdate3.fromJSON);
    return { feePayer, accountUpdates, memo };
  },
  toJSON({ feePayer, accountUpdates, memo }) {
    memo = Memo.toBase58(Memo.fromString(memo));
    return transaction_exports.ZkappCommand.toJSON({ feePayer, accountUpdates, memo });
  }
};
var Authorization = {
  hasLazyProof(accountUpdate) {
    return accountUpdate.lazyAuthorization?.kind === "lazy-proof";
  },
  hasAny(accountUpdate) {
    let { authorization: auth, lazyAuthorization: lazyAuth } = accountUpdate;
    return !!(lazyAuth || "proof" in auth || "signature" in auth);
  },
  setSignature(accountUpdate, signature) {
    accountUpdate.authorization = { signature };
    accountUpdate.lazyAuthorization = void 0;
  },
  setProof(accountUpdate, proof) {
    accountUpdate.authorization = { proof };
    accountUpdate.lazyAuthorization = void 0;
    return accountUpdate;
  },
  setLazySignature(accountUpdate, signature) {
    signature ?? (signature = {});
    accountUpdate.body.authorizationKind.isSigned = Bool4(true);
    accountUpdate.body.authorizationKind.isProved = Bool4(false);
    accountUpdate.body.authorizationKind.verificationKeyHash = Field4(mocks.dummyVerificationKeyHash);
    accountUpdate.authorization = {};
    accountUpdate.lazyAuthorization = { ...signature, kind: "lazy-signature" };
  },
  setProofAuthorizationKind({ body, id }, priorAccountUpdates) {
    body.authorizationKind.isSigned = Bool4(false);
    body.authorizationKind.isProved = Bool4(true);
    let hash2 = Provable.witness(Field4, () => {
      let proverData = zkAppProver.getData();
      let isProver = proverData !== void 0;
      assert(isProver || priorAccountUpdates !== void 0, "Called `setProofAuthorizationKind()` outside the prover without passing in `priorAccountUpdates`.");
      let myAccountUpdateId = isProver ? proverData.accountUpdate.id : id;
      priorAccountUpdates ?? (priorAccountUpdates = proverData.transaction.accountUpdates);
      priorAccountUpdates = priorAccountUpdates.filter((a2) => a2.id !== myAccountUpdateId);
      let priorAccountUpdatesFlat = CallForest.toFlatList(priorAccountUpdates, false);
      let accountUpdate = [...priorAccountUpdatesFlat].reverse().find((body_) => body_.update.verificationKey.isSome.and(body_.tokenId.equals(body.tokenId)).and(body_.publicKey.equals(body.publicKey)).toBoolean());
      if (accountUpdate !== void 0) {
        return accountUpdate.body.update.verificationKey.value.hash;
      }
      try {
        let account = getAccount(body.publicKey, body.tokenId);
        return account.zkapp?.verificationKey?.hash ?? Field4(0);
      } catch {
        return Field4(0);
      }
    });
    body.authorizationKind.verificationKeyHash = hash2;
  },
  setLazyProof(accountUpdate, proof, priorAccountUpdates) {
    Authorization.setProofAuthorizationKind(accountUpdate, priorAccountUpdates);
    accountUpdate.authorization = {};
    accountUpdate.lazyAuthorization = { ...proof, kind: "lazy-proof" };
  },
  setLazyNone(accountUpdate) {
    accountUpdate.body.authorizationKind.isSigned = Bool4(false);
    accountUpdate.body.authorizationKind.isProved = Bool4(false);
    accountUpdate.body.authorizationKind.verificationKeyHash = Field4(mocks.dummyVerificationKeyHash);
    accountUpdate.authorization = {};
    accountUpdate.lazyAuthorization = { kind: "lazy-none" };
  }
};
function addMissingSignatures(zkappCommand, additionalKeys = []) {
  let additionalPublicKeys = additionalKeys.map((sk) => sk.toPublicKey());
  let { commitment, fullCommitment } = transactionCommitments(transaction_bigint_exports.ZkappCommand.fromJSON(ZkappCommand3.toJSON(zkappCommand)));
  function addFeePayerSignature(accountUpdate) {
    let { body, authorization, lazyAuthorization } = cloneCircuitValue(accountUpdate);
    if (lazyAuthorization === void 0)
      return { body, authorization };
    let { privateKey } = lazyAuthorization;
    if (privateKey === void 0) {
      let i2 = additionalPublicKeys.findIndex((pk) => pk.equals(accountUpdate.body.publicKey).toBoolean());
      if (i2 === -1) {
        return { body, authorization: dummySignature() };
      }
      privateKey = additionalKeys[i2];
    }
    let signature = signFieldElement(fullCommitment, privateKey.toBigInt(), "testnet");
    return { body, authorization: Signature.toBase58(signature) };
  }
  function addSignature(accountUpdate) {
    accountUpdate = AccountUpdate3.clone(accountUpdate);
    if (accountUpdate.lazyAuthorization?.kind !== "lazy-signature") {
      return accountUpdate;
    }
    let { privateKey } = accountUpdate.lazyAuthorization;
    if (privateKey === void 0) {
      let i2 = additionalPublicKeys.findIndex((pk) => pk.equals(accountUpdate.body.publicKey).toBoolean());
      if (i2 === -1) {
        Authorization.setSignature(accountUpdate, dummySignature());
        return accountUpdate;
      }
      privateKey = additionalKeys[i2];
    }
    let transactionCommitment = accountUpdate.body.useFullCommitment.toBoolean() ? fullCommitment : commitment;
    let signature = signFieldElement(transactionCommitment, privateKey.toBigInt(), "testnet");
    Authorization.setSignature(accountUpdate, Signature.toBase58(signature));
    return accountUpdate;
  }
  let { feePayer, accountUpdates, memo } = zkappCommand;
  return {
    feePayer: addFeePayerSignature(feePayer),
    accountUpdates: accountUpdates.map(addSignature),
    memo
  };
}
function dummySignature() {
  return Signature.toBase58(Signature.dummy());
}
var ZkappPublicInput = provablePure({ accountUpdate: Field4, calls: Field4 }, { customObjectKeys: ["accountUpdate", "calls"] });
async function addMissingProofs(zkappCommand, { proofsEnabled = true }) {
  let { feePayer, accountUpdates, memo } = zkappCommand;
  let accountUpdatesProved = [];
  let proofs = [];
  for (let i2 = 0; i2 < accountUpdates.length; i2++) {
    let { accountUpdateProved, proof } = await addProof(zkappCommand, i2, proofsEnabled);
    accountUpdatesProved.push(accountUpdateProved);
    proofs.push(proof);
  }
  return {
    zkappCommand: { feePayer, accountUpdates: accountUpdatesProved, memo },
    proofs
  };
}
async function addProof(transaction2, index, proofsEnabled) {
  let accountUpdate = transaction2.accountUpdates[index];
  accountUpdate = AccountUpdate3.clone(accountUpdate);
  if (accountUpdate.lazyAuthorization?.kind !== "lazy-proof") {
    return {
      accountUpdateProved: accountUpdate,
      proof: void 0
    };
  }
  if (!proofsEnabled) {
    Authorization.setProof(accountUpdate, await dummyBase64Proof());
    return {
      accountUpdateProved: accountUpdate,
      proof: void 0
    };
  }
  let lazyProof = accountUpdate.lazyAuthorization;
  let prover = getZkappProver(lazyProof);
  let proverData = { transaction: transaction2, accountUpdate, index };
  let proof = await createZkappProof(prover, lazyProof, proverData);
  let accountUpdateProved = Authorization.setProof(accountUpdate, Pickles.proofToBase64Transaction(proof.proof));
  return { accountUpdateProved, proof };
}
async function createZkappProof(prover, { methodName, args, previousProofs, ZkappClass, memoized, blindingValue }, { transaction: transaction2, accountUpdate, index }) {
  let publicInput = accountUpdate.toPublicInput();
  let publicInputFields = MlFieldConstArray.to(ZkappPublicInput.toFields(publicInput));
  let [, , proof] = await zkAppProver.run([accountUpdate.publicKey, accountUpdate.tokenId, ...args], { transaction: transaction2, accountUpdate, index }, async () => {
    let id = memoizationContext.enter({
      memoized,
      currentIndex: 0,
      blindingValue
    });
    try {
      return await prover(publicInputFields, MlArray.to(previousProofs));
    } catch (err) {
      console.error(`Error when proving ${ZkappClass.name}.${methodName}()`);
      throw err;
    } finally {
      memoizationContext.leave(id);
    }
  });
  let maxProofsVerified = ZkappClass._maxProofsVerified;
  const Proof3 = ZkappClass.Proof();
  return new Proof3({
    publicInput,
    publicOutput: void 0,
    proof,
    maxProofsVerified
  });
}
function getZkappProver({ methodName, ZkappClass }) {
  if (ZkappClass._provers === void 0)
    throw Error(`Cannot prove execution of ${methodName}(), no prover found. Try calling \`await ${ZkappClass.name}.compile()\` first, this will cache provers in the background.`);
  let provers = ZkappClass._provers;
  let methodError2 = `Error when computing proofs: Method ${methodName} not found. Make sure your environment supports decorators, and annotate with \`@method ${methodName}\`.`;
  if (ZkappClass._methods === void 0)
    throw Error(methodError2);
  let i2 = ZkappClass._methods.findIndex((m) => m.methodName === methodName);
  if (i2 === -1)
    throw Error(methodError2);
  return provers[i2];
}

// dist/node/lib/mina/errors.js
var ErrorHandlers = {
  Invalid_fee_excess({ transaction: { accountUpdates }, isFeePayer, accountCreationFee: accountCreationFee2 }) {
    if (isFeePayer)
      return;
    let balances = accountUpdates.map(({ body }) => {
      if (body.tokenId.equals(TokenId4.default).toBoolean()) {
        return Number(Int64.fromObject(body.balanceChange).toString()) * 1e-9;
      }
    });
    let sum = balances.reduce((a2 = 0, b2 = 0) => a2 + b2) ?? 0;
    return `Invalid fee excess.
This means that balance changes in your transaction do not sum up to the amount of fees needed.
Here's the list of balance changes:

${balances.map((balance, i2) => {
      return `Account update #${i2 + 1}) ${balance === void 0 ? "not a MINA account" : `${balance.toFixed(2)} MINA`}`;
    }).join(`
`)}

Total change: ${sum.toFixed(2)} MINA

If there are no new accounts created in your transaction, then this sum should be equal to 0.00 MINA.
If you are creating new accounts -- by updating accounts that didn't exist yet --
then keep in mind the ${(Number(accountCreationFee2) * 1e-9).toFixed(2)} MINA account creation fee, and make sure that the sum equals
${(-Number(accountCreationFee2) * 1e-9).toFixed(2)} times the number of newly created accounts.`;
  }
};
function invalidTransactionError(transaction2, errors, additionalContext) {
  let errorMessages = [];
  let rawErrors = JSON.stringify(errors);
  let errorsForFeePayer = errors[0];
  for (let [error] of errorsForFeePayer) {
    let message = ErrorHandlers[error]?.({
      transaction: transaction2,
      accountUpdateIndex: NaN,
      isFeePayer: true,
      ...additionalContext
    });
    if (message)
      errorMessages.push(message);
  }
  let n = transaction2.accountUpdates.length;
  for (let i2 = 0; i2 < n; i2++) {
    let errorsForUpdate = errors[i2 + 1];
    for (let [error] of errorsForUpdate) {
      let message = ErrorHandlers[error]?.({
        transaction: transaction2,
        accountUpdateIndex: i2,
        isFeePayer: false,
        ...additionalContext
      });
      if (message)
        errorMessages.push(message);
    }
  }
  if (errorMessages.length > 1) {
    return [
      "There were multiple errors when applying your transaction:",
      ...errorMessages.map((msg, i2) => `${i2 + 1}.) ${msg}`),
      `Raw list of errors: ${rawErrors}`
    ].join("\n\n");
  }
  if (errorMessages.length === 1) {
    return `${errorMessages[0]}

Raw list of errors: ${rawErrors}`;
  }
  return rawErrors;
}

// dist/node/lib/mina/constants.js
var TransactionCost;
(function(TransactionCost2) {
  TransactionCost2.PROOF_COST = 10.26;
  TransactionCost2.SIGNED_PAIR_COST = 10.08;
  TransactionCost2.SIGNED_SINGLE_COST = 9.14;
  TransactionCost2.COST_LIMIT = 69.45;
})(TransactionCost || (TransactionCost = {}));
var TransactionLimits;
(function(TransactionLimits2) {
  TransactionLimits2.MAX_ACTION_ELEMENTS = 100;
  TransactionLimits2.MAX_EVENT_ELEMENTS = 100;
})(TransactionLimits || (TransactionLimits = {}));

// dist/node/lib/ml/conversion.js
var Ml = {
  constFromField,
  constToField,
  varFromField,
  varToField,
  fromScalar,
  toScalar,
  fromPrivateKey,
  toPrivateKey,
  fromPublicKey,
  toPublicKey,
  fromPublicKeyVar,
  toPublicKeyVar
};
function constFromField(x) {
  return x.toConstant().value[1];
}
function constToField(x) {
  return Field4(x);
}
function varFromField(x) {
  return x.value;
}
function varToField(x) {
  return Field4(x);
}
function fromScalar(s) {
  return s.toConstant().constantValue;
}
function toScalar(s) {
  return Scalar3.from(s);
}
function fromPrivateKey(sk) {
  return fromScalar(sk.s);
}
function toPrivateKey(sk) {
  return new PrivateKey2(Scalar3.from(sk));
}
function fromPublicKey(pk) {
  return MlTuple(pk.x.toConstant().value[1], MlBool(pk.isOdd.toBoolean()));
}
function toPublicKey([, x, isOdd]) {
  return PublicKey2.from({
    x: Field4(x),
    isOdd: Bool4(MlBool.from(isOdd))
  });
}
function fromPublicKeyVar(pk) {
  return MlTuple(pk.x.value, pk.isOdd.toField().value);
}
function toPublicKeyVar([, x, isOdd]) {
  return PublicKey2.from({
    x: Field4(x),
    // TODO
    isOdd: Bool4.Unsafe.ofField(Field4(isOdd))
  });
}

// dist/node/lib/mina.js
var Transaction = {
  fromJSON(json) {
    let transaction2 = ZkappCommand3.fromJSON(json);
    return newTransaction(transaction2, activeInstance.proofsEnabled);
  }
};
var currentTransaction = Context.create();
function reportGetAccountError(publicKey, tokenId) {
  if (tokenId === TokenId4.toBase58(TokenId4.default)) {
    return `getAccount: Could not find account for public key ${publicKey}`;
  } else {
    return `getAccount: Could not find account for public key ${publicKey} with the tokenId ${tokenId}`;
  }
}
function createTransaction(feePayer, f, numberOfRuns, { fetchMode = "cached", isFinalRunOutsideCircuit = true, proofsEnabled = true } = {}) {
  if (currentTransaction.has()) {
    throw new Error("Cannot start new transaction within another transaction");
  }
  let feePayerSpec;
  if (feePayer === void 0) {
    feePayerSpec = {};
  } else if (feePayer instanceof PrivateKey2) {
    feePayerSpec = { feePayerKey: feePayer, sender: feePayer.toPublicKey() };
  } else if (feePayer instanceof PublicKey2) {
    feePayerSpec = { sender: feePayer };
  } else {
    feePayerSpec = feePayer;
    if (feePayerSpec.sender === void 0)
      feePayerSpec.sender = feePayerSpec.feePayerKey?.toPublicKey();
  }
  let { feePayerKey, sender: sender2, fee, memo = "", nonce } = feePayerSpec;
  let transactionId = currentTransaction.enter({
    sender: sender2,
    accountUpdates: [],
    fetchMode,
    isFinalRunOutsideCircuit,
    numberOfRuns
  });
  try {
    let err;
    while (true) {
      if (err !== void 0)
        err.bootstrap();
      try {
        if (fetchMode === "test") {
          Provable.runUnchecked(() => {
            f();
            Provable.asProver(() => {
              let tx = currentTransaction.get();
              tx.accountUpdates = CallForest.map(tx.accountUpdates, (a2) => toConstant(AccountUpdate3, a2));
            });
          });
        } else {
          f();
        }
        break;
      } catch (err_) {
        if (err_?.bootstrap)
          err = err_;
        else
          throw err_;
      }
    }
  } catch (err) {
    currentTransaction.leave(transactionId);
    throw err;
  }
  let accountUpdates = currentTransaction.get().accountUpdates;
  accountUpdates = CallForest.toFlatList(accountUpdates);
  try {
    for (let accountUpdate of accountUpdates) {
      assertPreconditionInvariants(accountUpdate);
    }
  } catch (err) {
    currentTransaction.leave(transactionId);
    throw err;
  }
  let feePayerAccountUpdate;
  if (sender2 !== void 0) {
    let nonce_;
    let senderAccount = getAccount(sender2, TokenId4.default);
    if (nonce === void 0) {
      nonce_ = senderAccount.nonce;
    } else {
      nonce_ = UInt322.from(nonce);
      senderAccount.nonce = nonce_;
      addCachedAccount(senderAccount);
    }
    feePayerAccountUpdate = AccountUpdate3.defaultFeePayer(sender2, nonce_);
    if (feePayerKey !== void 0)
      feePayerAccountUpdate.lazyAuthorization.privateKey = feePayerKey;
    if (fee !== void 0) {
      feePayerAccountUpdate.body.fee = fee instanceof UInt642 ? fee : UInt642.from(String(fee));
    }
  } else {
    feePayerAccountUpdate = AccountUpdate3.dummyFeePayer();
  }
  let transaction2 = {
    accountUpdates,
    feePayer: feePayerAccountUpdate,
    memo
  };
  currentTransaction.leave(transactionId);
  return newTransaction(transaction2, proofsEnabled);
}
function newTransaction(transaction2, proofsEnabled) {
  let self = {
    transaction: transaction2,
    sign(additionalKeys) {
      self.transaction = addMissingSignatures(self.transaction, additionalKeys);
      return self;
    },
    async prove() {
      let { zkappCommand, proofs } = await addMissingProofs(self.transaction, {
        proofsEnabled
      });
      self.transaction = zkappCommand;
      return proofs;
    },
    toJSON() {
      let json = ZkappCommand3.toJSON(self.transaction);
      return JSON.stringify(json);
    },
    toPretty() {
      return ZkappCommand3.toPretty(self.transaction);
    },
    toGraphqlQuery() {
      return sendZkappQuery(self.toJSON());
    },
    async send() {
      try {
        return await sendTransaction(self);
      } catch (error) {
        throw prettifyStacktrace(error);
      }
    }
  };
  return self;
}
var defaultAccountCreationFee = 1e9;
function LocalBlockchain({ accountCreationFee: accountCreationFee2 = defaultAccountCreationFee, proofsEnabled = true, enforceTransactionLimits = true } = {}) {
  const slotTime = 3 * 60 * 1e3;
  const startTime = Date.now();
  const genesisTimestamp = UInt642.from(startTime);
  const ledger = Ledger.create();
  let networkState = defaultNetworkState();
  function addAccount(publicKey, balance) {
    ledger.addAccount(Ml.fromPublicKey(publicKey), balance);
  }
  let testAccounts = [];
  for (let i2 = 0; i2 < 10; ++i2) {
    let MINA = 10n ** 9n;
    const largeValue = 1000n * MINA;
    const k = PrivateKey2.random();
    const pk = k.toPublicKey();
    addAccount(pk, largeValue.toString());
    testAccounts.push({ privateKey: k, publicKey: pk });
  }
  const events = {};
  const actions = {};
  return {
    proofsEnabled,
    accountCreationFee: () => UInt642.from(accountCreationFee2),
    getNetworkConstants() {
      return {
        genesisTimestamp,
        accountCreationFee: UInt642.from(accountCreationFee2),
        slotTime: UInt642.from(slotTime)
      };
    },
    currentSlot() {
      return UInt322.from(Math.ceil((new Date().valueOf() - startTime) / slotTime));
    },
    hasAccount(publicKey, tokenId = TokenId4.default) {
      return !!ledger.getAccount(Ml.fromPublicKey(publicKey), Ml.constFromField(tokenId));
    },
    getAccount(publicKey, tokenId = TokenId4.default) {
      let accountJson = ledger.getAccount(Ml.fromPublicKey(publicKey), Ml.constFromField(tokenId));
      if (accountJson === void 0) {
        throw new Error(reportGetAccountError(publicKey.toBase58(), TokenId4.toBase58(tokenId)));
      }
      return transaction_exports.Account.fromJSON(accountJson);
    },
    getNetworkState() {
      return networkState;
    },
    async sendTransaction(txn) {
      txn.sign();
      let zkappCommandJson = ZkappCommand3.toJSON(txn.transaction);
      let commitments = transactionCommitments(transaction_bigint_exports.ZkappCommand.fromJSON(zkappCommandJson));
      if (enforceTransactionLimits)
        verifyTransactionLimits(txn.transaction);
      for (const update of txn.transaction.accountUpdates) {
        let accountJson = ledger.getAccount(Ml.fromPublicKey(update.body.publicKey), Ml.constFromField(update.body.tokenId));
        if (accountJson) {
          let account = Account4.fromJSON(accountJson);
          await verifyAccountUpdate(account, update, commitments, proofsEnabled);
        }
      }
      try {
        ledger.applyJsonTransaction(JSON.stringify(zkappCommandJson), String(accountCreationFee2), JSON.stringify(networkState));
      } catch (err) {
        try {
          let errors = JSON.parse(err.message);
          err.message = invalidTransactionError(txn.transaction, errors, {
            accountCreationFee: accountCreationFee2
          });
        } finally {
          throw err;
        }
      }
      txn.transaction.accountUpdates.forEach((p3, i2) => {
        var _a4, _b;
        let pJson = zkappCommandJson.accountUpdates[i2];
        let addr = pJson.body.publicKey;
        let tokenId = pJson.body.tokenId;
        events[addr] ?? (events[addr] = {});
        if (p3.body.events.data.length > 0) {
          (_a4 = events[addr])[tokenId] ?? (_a4[tokenId] = []);
          let updatedEvents = p3.body.events.data.map((data) => {
            return {
              data,
              transactionInfo: {
                transactionHash: "",
                transactionStatus: "",
                transactionMemo: ""
              }
            };
          });
          events[addr][tokenId].push({
            events: updatedEvents,
            blockHeight: networkState.blockchainLength,
            globalSlot: networkState.globalSlotSinceGenesis,
            // The following fields are fetched from the Mina network. For now, we mock these values out
            // since networkState does not contain these fields.
            blockHash: "",
            parentBlockHash: "",
            chainStatus: ""
          });
        }
        let storedActions = actions[addr]?.[tokenId];
        let latestActionState_ = storedActions?.[storedActions.length - 1]?.hash;
        let latestActionState = latestActionState_ !== void 0 ? Field4(latestActionState_) : Actions.emptyActionState();
        actions[addr] ?? (actions[addr] = {});
        if (p3.body.actions.data.length > 0) {
          let newActionState = Actions.updateSequenceState(latestActionState, p3.body.actions.hash);
          (_b = actions[addr])[tokenId] ?? (_b[tokenId] = []);
          actions[addr][tokenId].push({
            actions: pJson.body.actions,
            hash: newActionState.toString()
          });
        }
      });
      return {
        isSuccess: true,
        wait: async (_options) => {
          console.log("Info: Waiting for inclusion in a block is not supported for LocalBlockchain.");
        },
        hash: () => {
          const message = "Info: Txn Hash retrieving is not supported for LocalBlockchain.";
          console.log(message);
          return message;
        }
      };
    },
    async transaction(sender2, f) {
      let tx = createTransaction(sender2, f, 0, {
        isFinalRunOutsideCircuit: false,
        proofsEnabled,
        fetchMode: "test"
      });
      let hasProofs = tx.transaction.accountUpdates.some(Authorization.hasLazyProof);
      return createTransaction(sender2, f, 1, {
        isFinalRunOutsideCircuit: !hasProofs,
        proofsEnabled
      });
    },
    applyJsonTransaction(json) {
      return ledger.applyJsonTransaction(json, String(accountCreationFee2), JSON.stringify(networkState));
    },
    async fetchEvents(publicKey, tokenId = TokenId4.default) {
      return events?.[publicKey.toBase58()]?.[TokenId4.toBase58(tokenId)] ?? [];
    },
    async fetchActions(publicKey, actionStates, tokenId = TokenId4.default) {
      return this.getActions(publicKey, actionStates, tokenId);
    },
    getActions(publicKey, actionStates, tokenId = TokenId4.default) {
      let currentActions = actions?.[publicKey.toBase58()]?.[TokenId4.toBase58(tokenId)] ?? [];
      let { fromActionState, endActionState } = actionStates ?? {};
      let emptyState = Actions.emptyActionState();
      if (endActionState?.equals(emptyState).toBoolean())
        return [];
      let start = fromActionState?.equals(emptyState).toBoolean() ? void 0 : fromActionState?.toString();
      let end = endActionState?.toString();
      let startIndex = 0;
      if (start) {
        let i2 = currentActions.findIndex((e) => e.hash === start);
        if (i2 === -1)
          throw Error(`getActions: fromActionState not found.`);
        startIndex = i2 + 1;
      }
      let endIndex;
      if (end) {
        let i2 = currentActions.findIndex((e) => e.hash === end);
        if (i2 === -1)
          throw Error(`getActions: endActionState not found.`);
        endIndex = i2 + 1;
      }
      return currentActions.slice(startIndex, endIndex);
    },
    addAccount,
    /**
     * An array of 10 test accounts that have been pre-filled with
     * 30000000000 units of currency.
     */
    testAccounts,
    setGlobalSlot(slot) {
      networkState.globalSlotSinceGenesis = UInt322.from(slot);
    },
    incrementGlobalSlot(increment) {
      networkState.globalSlotSinceGenesis = networkState.globalSlotSinceGenesis.add(increment);
    },
    setBlockchainLength(height) {
      networkState.blockchainLength = height;
    },
    setTotalCurrency(currency) {
      networkState.totalCurrency = currency;
    },
    setProofsEnabled(newProofsEnabled) {
      proofsEnabled = newProofsEnabled;
    }
  };
}
function Network2(input) {
  let accountCreationFee2 = UInt642.from(defaultAccountCreationFee);
  let minaGraphqlEndpoint;
  let archiveEndpoint;
  if (input && typeof input === "string") {
    minaGraphqlEndpoint = input;
    setGraphqlEndpoint(minaGraphqlEndpoint);
  } else if (input && typeof input === "object") {
    if (!input.mina || !input.archive)
      throw new Error("Network: malformed input. Please provide an object with 'mina' and 'archive' endpoints.");
    if (Array.isArray(input.mina) && input.mina.length !== 0) {
      minaGraphqlEndpoint = input.mina[0];
      setGraphqlEndpoint(minaGraphqlEndpoint);
      setMinaGraphqlFallbackEndpoints(input.mina.slice(1));
    } else if (typeof input.mina === "string") {
      minaGraphqlEndpoint = input.mina;
      setGraphqlEndpoint(minaGraphqlEndpoint);
    }
    if (Array.isArray(input.archive) && input.archive.length !== 0) {
      archiveEndpoint = input.archive[0];
      setArchiveGraphqlEndpoint(archiveEndpoint);
      setArchiveGraphqlFallbackEndpoints(input.archive.slice(1));
    } else if (typeof input.archive === "string") {
      archiveEndpoint = input.archive;
      setArchiveGraphqlEndpoint(archiveEndpoint);
    }
  } else {
    throw new Error("Network: malformed input. Please provide a string or an object with 'mina' and 'archive' endpoints.");
  }
  const genesisTimestampString = "2023-02-23T20:00:01Z";
  const genesisTimestamp = UInt642.from(Date.parse(genesisTimestampString.slice(0, -1) + "+00:00"));
  const slotTime = UInt642.from(3 * 60 * 1e3);
  return {
    accountCreationFee: () => accountCreationFee2,
    getNetworkConstants() {
      return {
        genesisTimestamp,
        slotTime,
        accountCreationFee: accountCreationFee2
      };
    },
    currentSlot() {
      throw Error("currentSlot() is not implemented yet for remote blockchains.");
    },
    hasAccount(publicKey, tokenId = TokenId4.default) {
      if (!currentTransaction.has() || currentTransaction.get().fetchMode === "cached") {
        return !!getCachedAccount(publicKey, tokenId, minaGraphqlEndpoint);
      }
      return false;
    },
    getAccount(publicKey, tokenId = TokenId4.default) {
      if (currentTransaction()?.fetchMode === "test") {
        markAccountToBeFetched(publicKey, tokenId, minaGraphqlEndpoint);
        let account = getCachedAccount(publicKey, tokenId, minaGraphqlEndpoint);
        return account ?? dummyAccount(publicKey);
      }
      if (!currentTransaction.has() || currentTransaction.get().fetchMode === "cached") {
        let account = getCachedAccount(publicKey, tokenId, minaGraphqlEndpoint);
        if (account !== void 0)
          return account;
      }
      throw Error(`${reportGetAccountError(publicKey.toBase58(), TokenId4.toBase58(tokenId))}
Graphql endpoint: ${minaGraphqlEndpoint}`);
    },
    getNetworkState() {
      if (currentTransaction()?.fetchMode === "test") {
        markNetworkToBeFetched(minaGraphqlEndpoint);
        let network = getCachedNetwork(minaGraphqlEndpoint);
        return network ?? defaultNetworkState();
      }
      if (!currentTransaction.has() || currentTransaction.get().fetchMode === "cached") {
        let network = getCachedNetwork(minaGraphqlEndpoint);
        if (network !== void 0)
          return network;
      }
      throw Error(`getNetworkState: Could not fetch network state from graphql endpoint ${minaGraphqlEndpoint}`);
    },
    async sendTransaction(txn) {
      txn.sign();
      verifyTransactionLimits(txn.transaction);
      let [response, error] = await sendZkapp(txn.toJSON());
      let errors;
      if (response === void 0 && error !== void 0) {
        console.log("Error: Failed to send transaction", error);
        errors = [error];
      } else if (response && response.errors && response.errors.length > 0) {
        console.log("Error: Transaction returned with errors", JSON.stringify(response.errors, null, 2));
        errors = response.errors;
      }
      let isSuccess = errors === void 0;
      let maxAttempts;
      let attempts = 0;
      let interval;
      return {
        isSuccess,
        data: response?.data,
        errors,
        async wait(options) {
          if (!isSuccess) {
            console.warn("Transaction.wait(): returning immediately because the transaction was not successful.");
            return;
          }
          maxAttempts = options?.maxAttempts ?? 45;
          interval = options?.interval ?? 2e4;
          const executePoll = async (resolve, reject) => {
            let txId = response?.data?.sendZkapp?.zkapp?.hash;
            let res;
            try {
              res = await checkZkappTransaction(txId);
            } catch (error2) {
              isSuccess = false;
              return reject(error2);
            }
            attempts++;
            if (res.success) {
              isSuccess = true;
              return resolve();
            } else if (res.failureReason) {
              isSuccess = false;
              return reject(new Error(`Transaction failed.
TransactionId: ${txId}
Attempts: ${attempts}
failureReason(s): ${res.failureReason}`));
            } else if (maxAttempts && attempts === maxAttempts) {
              isSuccess = false;
              return reject(new Error(`Exceeded max attempts.
TransactionId: ${txId}
Attempts: ${attempts}
Last received status: ${res}`));
            } else {
              setTimeout(executePoll, interval, resolve, reject);
            }
          };
          return new Promise(executePoll);
        },
        hash() {
          return response?.data?.sendZkapp?.zkapp?.hash;
        }
      };
    },
    async transaction(sender2, f) {
      let tx = createTransaction(sender2, f, 0, {
        fetchMode: "test",
        isFinalRunOutsideCircuit: false
      });
      await fetchMissingData(minaGraphqlEndpoint, archiveEndpoint);
      let hasProofs = tx.transaction.accountUpdates.some(Authorization.hasLazyProof);
      return createTransaction(sender2, f, 1, {
        fetchMode: "cached",
        isFinalRunOutsideCircuit: !hasProofs
      });
    },
    async fetchEvents(publicKey, tokenId = TokenId4.default, filterOptions = {}) {
      let pubKey = publicKey.toBase58();
      let token = TokenId4.toBase58(tokenId);
      return fetchEvents({ publicKey: pubKey, tokenId: token }, archiveEndpoint, filterOptions);
    },
    async fetchActions(publicKey, actionStates, tokenId = TokenId4.default) {
      let pubKey = publicKey.toBase58();
      let token = TokenId4.toBase58(tokenId);
      let { fromActionState, endActionState } = actionStates ?? {};
      let fromActionStateBase58 = fromActionState ? fromActionState.toString() : void 0;
      let endActionStateBase58 = endActionState ? endActionState.toString() : void 0;
      return fetchActions({
        publicKey: pubKey,
        actionStates: {
          fromActionState: fromActionStateBase58,
          endActionState: endActionStateBase58
        },
        tokenId: token
      }, archiveEndpoint);
    },
    getActions(publicKey, actionStates, tokenId = TokenId4.default) {
      if (currentTransaction()?.fetchMode === "test") {
        markActionsToBeFetched(publicKey, tokenId, archiveEndpoint, actionStates);
        let actions = getCachedActions(publicKey, tokenId);
        return actions ?? [];
      }
      if (!currentTransaction.has() || currentTransaction.get().fetchMode === "cached") {
        let actions = getCachedActions(publicKey, tokenId);
        if (actions !== void 0)
          return actions;
      }
      throw Error(`getActions: Could not find actions for the public key ${publicKey}`);
    },
    proofsEnabled: true
  };
}
function BerkeleyQANet(graphqlEndpoint) {
  return Network2(graphqlEndpoint);
}
var activeInstance = {
  accountCreationFee: () => UInt642.from(defaultAccountCreationFee),
  getNetworkConstants() {
    throw new Error("must call Mina.setActiveInstance first");
  },
  currentSlot: () => {
    throw new Error("must call Mina.setActiveInstance first");
  },
  hasAccount(publicKey, tokenId = TokenId4.default) {
    if (!currentTransaction.has() || currentTransaction.get().fetchMode === "cached") {
      return !!getCachedAccount(publicKey, tokenId, networkConfig.minaEndpoint);
    }
    return false;
  },
  getAccount(publicKey, tokenId = TokenId4.default) {
    if (currentTransaction()?.fetchMode === "test") {
      markAccountToBeFetched(publicKey, tokenId, networkConfig.minaEndpoint);
      return dummyAccount(publicKey);
    }
    if (!currentTransaction.has() || currentTransaction.get().fetchMode === "cached") {
      let account = getCachedAccount(publicKey, tokenId, networkConfig.minaEndpoint);
      if (account === void 0)
        throw Error(`${reportGetAccountError(publicKey.toBase58(), TokenId4.toBase58(tokenId))}

Either call Mina.setActiveInstance first or explicitly add the account with addCachedAccount`);
      return account;
    }
    throw new Error("must call Mina.setActiveInstance first");
  },
  getNetworkState() {
    throw new Error("must call Mina.setActiveInstance first");
  },
  sendTransaction() {
    throw new Error("must call Mina.setActiveInstance first");
  },
  async transaction(sender2, f) {
    return createTransaction(sender2, f, 0);
  },
  fetchEvents(_publicKey, _tokenId = TokenId4.default) {
    throw Error("must call Mina.setActiveInstance first");
  },
  fetchActions(_publicKey, _actionStates, _tokenId = TokenId4.default) {
    throw Error("must call Mina.setActiveInstance first");
  },
  getActions(_publicKey, _actionStates, _tokenId = TokenId4.default) {
    throw Error("must call Mina.setActiveInstance first");
  },
  proofsEnabled: true
};
function setActiveInstance(m) {
  activeInstance = m;
}
function transaction(senderOrF, fOrUndefined) {
  let sender2;
  let f;
  try {
    if (fOrUndefined !== void 0) {
      sender2 = senderOrF;
      f = fOrUndefined;
    } else {
      sender2 = void 0;
      f = senderOrF;
    }
    return activeInstance.transaction(sender2, f);
  } catch (error) {
    throw prettifyStacktrace(error);
  }
}
function sender() {
  let tx = currentTransaction();
  if (tx === void 0)
    throw Error(`The sender is not available outside a transaction. Make sure you only use it within \`Mina.transaction\` blocks or smart contract methods.`);
  let sender2 = currentTransaction()?.sender;
  if (sender2 === void 0)
    throw Error(`The sender is not available, because the transaction block was created without the optional \`sender\` argument.
Here's an example for how to pass in the sender and make it available:

Mina.transaction(sender, // <-- pass in sender's public key here
() => {
  // methods can use this.sender
});
`);
  return sender2;
}
function currentSlot() {
  return activeInstance.currentSlot();
}
function getAccount(publicKey, tokenId) {
  return activeInstance.getAccount(publicKey, tokenId);
}
function hasAccount(publicKey, tokenId) {
  return activeInstance.hasAccount(publicKey, tokenId);
}
function getNetworkState() {
  return activeInstance.getNetworkState();
}
function getBalance(publicKey, tokenId) {
  return activeInstance.getAccount(publicKey, tokenId).balance;
}
function accountCreationFee() {
  return activeInstance.accountCreationFee();
}
async function sendTransaction(txn) {
  return await activeInstance.sendTransaction(txn);
}
async function fetchEvents2(publicKey, tokenId, filterOptions = {}) {
  return await activeInstance.fetchEvents(publicKey, tokenId, filterOptions);
}
async function fetchActions2(publicKey, actionStates, tokenId) {
  return await activeInstance.fetchActions(publicKey, actionStates, tokenId);
}
function getActions(publicKey, actionStates, tokenId) {
  return activeInstance.getActions(publicKey, actionStates, tokenId);
}
function getProofsEnabled() {
  return activeInstance.proofsEnabled;
}
function dummyAccount(pubkey) {
  let dummy = transaction_exports.Account.emptyValue();
  if (pubkey)
    dummy.publicKey = pubkey;
  return dummy;
}
function defaultNetworkState() {
  let epochData = {
    ledger: { hash: Field4(0), totalCurrency: UInt642.zero },
    seed: Field4(0),
    startCheckpoint: Field4(0),
    lockCheckpoint: Field4(0),
    epochLength: UInt322.zero
  };
  return {
    snarkedLedgerHash: Field4(0),
    blockchainLength: UInt322.zero,
    minWindowDensity: UInt322.zero,
    totalCurrency: UInt642.zero,
    globalSlotSinceGenesis: UInt322.zero,
    stakingEpochData: epochData,
    nextEpochData: cloneCircuitValue(epochData)
  };
}
async function verifyAccountUpdate(account, accountUpdate, transactionCommitments2, proofsEnabled) {
  if (accountUpdate.body.callDepth === 0 && !AccountUpdate3.MayUseToken.isNo(accountUpdate).toBoolean()) {
    throw Error("Top-level account update can not use or pass on token permissions. Make sure that\naccountUpdate.body.mayUseToken = AccountUpdate.MayUseToken.No;");
  }
  let perm = account.permissions;
  if (accountUpdate.authorization === dummySignature()) {
    let pk = PublicKey2.toBase58(accountUpdate.body.publicKey);
    throw Error(`verifyAccountUpdate: Detected a missing signature for (${pk}), private key was missing.`);
  }
  function includesChange(val) {
    if (Array.isArray(val)) {
      return !val.every((v) => v === null);
    } else {
      return val !== null;
    }
  }
  function permissionForUpdate(key) {
    switch (key) {
      case "appState":
        return perm.editState;
      case "delegate":
        return perm.setDelegate;
      case "verificationKey":
        return perm.setVerificationKey;
      case "permissions":
        return perm.setPermissions;
      case "zkappUri":
        return perm.setZkappUri;
      case "tokenSymbol":
        return perm.setTokenSymbol;
      case "timing":
        return perm.setTiming;
      case "votingFor":
        return perm.setVotingFor;
      case "actions":
        return perm.editActionState;
      case "incrementNonce":
        return perm.incrementNonce;
      case "send":
        return perm.send;
      case "receive":
        return perm.receive;
      default:
        throw Error(`Invalid permission for field ${key}: does not exist.`);
    }
  }
  let accountUpdateJson = accountUpdate.toJSON();
  const update = accountUpdateJson.body.update;
  let errorTrace = "";
  let isValidProof = false;
  let isValidSignature = false;
  if (!proofsEnabled)
    isValidProof = true;
  if (accountUpdate.authorization.proof && proofsEnabled) {
    try {
      let publicInput = accountUpdate.toPublicInput();
      let publicInputFields = ZkappPublicInput.toFields(publicInput);
      const proof = SmartContract.Proof().fromJSON({
        maxProofsVerified: 2,
        proof: accountUpdate.authorization.proof,
        publicInput: publicInputFields.map((f) => f.toString()),
        publicOutput: []
      });
      let verificationKey = account.zkapp?.verificationKey?.data;
      isValidProof = await verify2(proof.toJSON(), verificationKey);
      if (!isValidProof) {
        throw Error(`Invalid proof for account update
${JSON.stringify(update)}`);
      }
    } catch (error) {
      errorTrace += "\n\n" + error.message;
      isValidProof = false;
    }
  }
  if (accountUpdate.authorization.signature) {
    try {
      isValidSignature = verifyAccountUpdateSignature(transaction_bigint_exports.AccountUpdate.fromJSON(accountUpdateJson), transactionCommitments2, "testnet");
    } catch (error) {
      errorTrace += "\n\n" + error.message;
      isValidSignature = false;
    }
  }
  let verified = false;
  function checkPermission(p0, field) {
    let p3 = transaction_exports.AuthRequired.toJSON(p0);
    if (p3 === "None")
      return;
    if (p3 === "Impossible") {
      throw Error(`Transaction verification failed: Cannot update field '${field}' because permission for this field is '${p3}'`);
    }
    if (p3 === "Signature" || p3 === "Either") {
      verified || (verified = isValidSignature);
    }
    if (p3 === "Proof" || p3 === "Either") {
      verified || (verified = isValidProof);
    }
    if (!verified) {
      throw Error(`Transaction verification failed: Cannot update field '${field}' because permission for this field is '${p3}', but the required authorization was not provided or is invalid.
        ${errorTrace !== "" ? "Error trace: " + errorTrace : ""}`);
    }
  }
  Object.entries(update).forEach(([key, value]) => {
    if (includesChange(value)) {
      let p3 = permissionForUpdate(key);
      checkPermission(p3, key);
    }
  });
  if (accountUpdate.body.actions.data.length > 0) {
    let p3 = permissionForUpdate("actions");
    checkPermission(p3, "actions");
  }
  if (accountUpdate.body.incrementNonce.toBoolean()) {
    let p3 = permissionForUpdate("incrementNonce");
    checkPermission(p3, "incrementNonce");
  }
  if (errorTrace && !verified) {
    throw Error(`One or more proofs were invalid and no other form of authorization was provided.
${errorTrace}`);
  }
}
function verifyTransactionLimits({ accountUpdates }) {
  let eventElements = { events: 0, actions: 0 };
  let authKinds = accountUpdates.map((update) => {
    eventElements.events += countEventElements(update.body.events);
    eventElements.actions += countEventElements(update.body.actions);
    let { isSigned, isProved, verificationKeyHash } = update.body.authorizationKind;
    return {
      isSigned: isSigned.toBoolean(),
      isProved: isProved.toBoolean(),
      verificationKeyHash: verificationKeyHash.toString()
    };
  });
  authKinds.unshift({
    isSigned: true,
    isProved: false,
    verificationKeyHash: ""
  });
  let authTypes = filterGroups(authKinds);
  let totalTimeRequired = TransactionCost.PROOF_COST * authTypes.proof + TransactionCost.SIGNED_PAIR_COST * authTypes.signedPair + TransactionCost.SIGNED_SINGLE_COST * authTypes.signedSingle;
  let isWithinCostLimit = totalTimeRequired < TransactionCost.COST_LIMIT;
  let isWithinEventsLimit = eventElements.events <= TransactionLimits.MAX_EVENT_ELEMENTS;
  let isWithinActionsLimit = eventElements.actions <= TransactionLimits.MAX_ACTION_ELEMENTS;
  let error = "";
  if (!isWithinCostLimit) {
    error += `Error: The transaction is too expensive, try reducing the number of AccountUpdates that are attached to the transaction.
Each transaction needs to be processed by the snark workers on the network.
Certain layouts of AccountUpdates require more proving time than others, and therefore are too expensive.

${JSON.stringify(authTypes)}


`;
  }
  if (!isWithinEventsLimit) {
    error += `Error: The account updates in your transaction are trying to emit too much event data. The maximum allowed number of field elements in events is ${TransactionLimits.MAX_EVENT_ELEMENTS}, but you tried to emit ${eventElements.events}.

`;
  }
  if (!isWithinActionsLimit) {
    error += `Error: The account updates in your transaction are trying to emit too much action data. The maximum allowed number of field elements in actions is ${TransactionLimits.MAX_ACTION_ELEMENTS}, but you tried to emit ${eventElements.actions}.

`;
  }
  if (error)
    throw Error("Error during transaction sending:\n\n" + error);
}
function countEventElements({ data }) {
  return data.reduce((acc, ev) => acc + ev.length, 0);
}
var isPair = (a2, b2) => !a2.isProved && !b2.isProved;
function filterPairs(xs) {
  if (xs.length <= 1)
    return { xs, pairs: 0 };
  if (isPair(xs[0], xs[1])) {
    let rec = filterPairs(xs.slice(2));
    return { xs: rec.xs, pairs: rec.pairs + 1 };
  } else {
    let rec = filterPairs(xs.slice(1));
    return { xs: [xs[0]].concat(rec.xs), pairs: rec.pairs };
  }
}
function filterGroups(xs) {
  let pairs = filterPairs(xs);
  xs = pairs.xs;
  let singleCount = 0;
  let proofCount = 0;
  xs.forEach((t) => {
    if (t.isProved)
      proofCount++;
    else
      singleCount++;
  });
  return {
    signedPair: pairs.pairs,
    signedSingle: singleCount,
    proof: proofCount
  };
}
async function waitForFunding(address) {
  let attempts = 0;
  let maxAttempts = 30;
  let interval = 3e4;
  const executePoll = async (resolve, reject) => {
    let { account } = await fetchAccount({ publicKey: address });
    attempts++;
    if (account) {
      return resolve();
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error(`Exceeded max attempts`));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };
  return new Promise(executePoll);
}
async function faucet(pub, network = "berkeley-qanet") {
  let address = pub.toBase58();
  let response = await fetch("https://faucet.minaprotocol.com/api/v1/faucet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      network,
      address
    })
  });
  response = await response.json();
  if (response.status.toString() !== "success") {
    throw new Error(`Error funding account ${address}, got response status: ${response.status}, text: ${response.statusText}`);
  }
  await waitForFunding(address);
}

// dist/node/lib/encryption.js
var encryption_exports = {};
__export(encryption_exports, {
  decrypt: () => decrypt,
  encrypt: () => encrypt
});
function encrypt(message, otherPublicKey) {
  let privateKey = Provable.witness(Scalar3, () => Scalar3.random());
  let publicKey = Group3.generator.scale(privateKey);
  let sharedSecret = otherPublicKey.toGroup().scale(privateKey);
  let sponge = new Poseidon2.Sponge();
  sponge.absorb(sharedSecret.x);
  let cipherText = [];
  for (let i2 = 0; i2 < message.length; i2++) {
    let keyStream = sponge.squeeze();
    let encryptedChunk = message[i2].add(keyStream);
    cipherText.push(encryptedChunk);
    if (i2 % 2 === 1)
      sponge.absorb(cipherText[i2 - 1]);
    if (i2 % 2 === 1 || i2 === message.length - 1)
      sponge.absorb(cipherText[i2]);
  }
  let authenticationTag = sponge.squeeze();
  cipherText.push(authenticationTag);
  return { publicKey, cipherText };
}
function decrypt({ publicKey, cipherText }, privateKey) {
  let sharedSecret = publicKey.scale(privateKey.s);
  let sponge = new Poseidon2.Sponge();
  sponge.absorb(sharedSecret.x);
  let authenticationTag = cipherText.pop();
  let message = [];
  for (let i2 = 0; i2 < cipherText.length; i2++) {
    let keyStream = sponge.squeeze();
    let messageChunk = cipherText[i2].sub(keyStream);
    message.push(messageChunk);
    if (i2 % 2 === 1)
      sponge.absorb(cipherText[i2 - 1]);
    if (i2 % 2 === 1 || i2 === cipherText.length - 1)
      sponge.absorb(cipherText[i2]);
  }
  sponge.squeeze().assertEquals(authenticationTag);
  return message;
}

// dist/node/lib/string.js
var import_tslib8 = require("tslib");
var DEFAULT_STRING_LENGTH = 128;
var Character = class extends CircuitValue {
  isNull() {
    return this.equals(NullCharacter());
  }
  toField() {
    return this.value;
  }
  toString() {
    const charCode = Number(this.value.toString());
    return String.fromCharCode(charCode);
  }
  static fromString(str) {
    const char = Field4(str.charCodeAt(0));
    return new Character(char);
  }
  // TODO: Add support for more character sets
  // right now it's 16 bits because 8 not supported :/
  static check(c) {
    c.value.rangeCheckHelper(16).assertEquals(c.value);
  }
};
(0, import_tslib8.__decorate)([
  prop,
  (0, import_tslib8.__metadata)("design:type", Field4)
], Character.prototype, "value", void 0);
var CircuitString = class extends CircuitValue {
  // constructor is private because
  // * we do not want extra logic inside CircuitValue constructors, as a general pattern (to be able to create them generically)
  // * here, not running extra logic to fill up the characters would be wrong
  constructor(values) {
    super(values);
  }
  // this is the publicly accessible constructor
  static fromCharacters(chars) {
    return new CircuitString(fillWithNull(chars, this.maxLength));
  }
  maxLength() {
    return this.constructor.maxLength;
  }
  // some O(n) computation that should be only done once in the circuit
  computeLengthAndMask() {
    let n = this.values.length;
    let length = Field4(0);
    let mask = [];
    let wasntNullAlready = Bool4(true);
    for (let i2 = 0; i2 < n; i2++) {
      let isNull = this.values[i2].isNull();
      mask[i2] = isNull.and(wasntNullAlready);
      wasntNullAlready = isNull.not().and(wasntNullAlready);
      length.add(wasntNullAlready.toField());
    }
    mask[n] = wasntNullAlready;
    this._length = length;
    this._mask = mask;
    return { mask, length };
  }
  lengthMask() {
    return this._mask ?? this.computeLengthAndMask().mask;
  }
  length() {
    return this._length ?? this.computeLengthAndMask().length;
  }
  /**
   * appends another string to this one, returns the result and proves that it fits
   * within the `maxLength` of this string (the other string can have a different maxLength)
   */
  append(str) {
    let n = this.maxLength();
    this.length().add(str.length()).assertLessThan(n);
    let chars = this.values;
    let otherChars = fillWithNull(str.values, n);
    let possibleResults = [];
    for (let length = 0; length < n + 1; length++) {
      possibleResults[length] = chars.slice(0, length).concat(otherChars.slice(0, n - length));
    }
    let result = [];
    let mask = this.lengthMask();
    for (let i2 = 0; i2 < n; i2++) {
      let possibleCharsAtI = possibleResults.map((r) => r[i2]);
      result[i2] = Provable.switch(mask, Character, possibleCharsAtI);
    }
    return CircuitString.fromCharacters(result);
  }
  // TODO
  /**
   * returns true if `str` is found in this `CircuitString`
   */
  // contains(str: CircuitString): Bool {
  //   // only succeed if the dynamic length is smaller
  //   let otherLength = str.length();
  //   otherLength.assertLessThan(this.length());
  // }
  hash() {
    return Poseidon2.hash(this.values.map((x) => x.value));
  }
  substring(start, end) {
    return CircuitString.fromCharacters(this.values.slice(start, end));
  }
  toString() {
    return this.values.map((x) => x.toString()).join("").replace(/[^ -~]+/g, "");
  }
  static fromString(str) {
    if (str.length > this.maxLength) {
      throw Error("CircuitString.fromString: input string exceeds max length!");
    }
    let characters = str.split("").map((x) => Character.fromString(x));
    return CircuitString.fromCharacters(characters);
  }
};
CircuitString.maxLength = DEFAULT_STRING_LENGTH;
(0, import_tslib8.__decorate)([
  arrayProp(Character, DEFAULT_STRING_LENGTH),
  (0, import_tslib8.__metadata)("design:type", Array)
], CircuitString.prototype, "values", void 0);
var NullCharacter = () => new Character(Field4(0));
function fillWithNull([...values], length) {
  let nullChar = NullCharacter();
  for (let i2 = values.length; i2 < length; i2++) {
    values[i2] = nullChar;
  }
  return values;
}

// dist/node/lib/merkle_tree.js
var MerkleTree = class {
  /**
   * Creates a new, empty [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree).
   * @param height The height of Merkle Tree.
   * @returns A new MerkleTree
   */
  constructor(height) {
    this.height = height;
    this.nodes = {};
    this.zeroes = new Array(height);
    this.zeroes[0] = Field4(0);
    for (let i2 = 1; i2 < height; i2 += 1) {
      this.zeroes[i2] = Poseidon2.hash([this.zeroes[i2 - 1], this.zeroes[i2 - 1]]);
    }
  }
  /**
   * Returns a node which lives at a given index and level.
   * @param level Level of the node.
   * @param index Index of the node.
   * @returns The data of the node.
   */
  getNode(level, index) {
    return this.nodes[level]?.[index.toString()] ?? this.zeroes[level];
  }
  /**
   * Returns the root of the [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree).
   * @returns The root of the Merkle Tree.
   */
  getRoot() {
    return this.getNode(this.height - 1, 0n);
  }
  // TODO: this allows to set a node at an index larger than the size. OK?
  setNode(level, index, value) {
    var _a4;
    ((_a4 = this.nodes)[level] ?? (_a4[level] = {}))[index.toString()] = value;
  }
  // TODO: if this is passed an index bigger than the max, it will set a couple of out-of-bounds nodes but not affect the real Merkle root. OK?
  /**
   * Sets the value of a leaf node at a given index to a given value.
   * @param index Position of the leaf node.
   * @param leaf New value.
   */
  setLeaf(index, leaf) {
    if (index >= this.leafCount) {
      throw new Error(`index ${index} is out of range for ${this.leafCount} leaves.`);
    }
    this.setNode(0, index, leaf);
    let currIndex = index;
    for (let level = 1; level < this.height; level++) {
      currIndex /= 2n;
      const left = this.getNode(level - 1, currIndex * 2n);
      const right = this.getNode(level - 1, currIndex * 2n + 1n);
      this.setNode(level, currIndex, Poseidon2.hash([left, right]));
    }
  }
  /**
   * Returns the witness (also known as [Merkle Proof or Merkle Witness](https://computersciencewiki.org/index.php/Merkle_proof)) for the leaf at the given index.
   * @param index Position of the leaf node.
   * @returns The witness that belongs to the leaf.
   */
  getWitness(index) {
    if (index >= this.leafCount) {
      throw new Error(`index ${index} is out of range for ${this.leafCount} leaves.`);
    }
    const witness2 = [];
    for (let level = 0; level < this.height - 1; level++) {
      const isLeft = index % 2n === 0n;
      const sibling = this.getNode(level, isLeft ? index + 1n : index - 1n);
      witness2.push({ isLeft, sibling });
      index /= 2n;
    }
    return witness2;
  }
  // TODO: this will always return true if the merkle tree was constructed normally; seems to be only useful for testing. remove?
  /**
   * Checks if the witness that belongs to the leaf at the given index is a valid witness.
   * @param index Position of the leaf node.
   * @returns True if the witness for the leaf node is valid.
   */
  validate(index) {
    const path = this.getWitness(index);
    let hash2 = this.getNode(0, index);
    for (const node of path) {
      hash2 = Poseidon2.hash(node.isLeft ? [hash2, node.sibling] : [node.sibling, hash2]);
    }
    return hash2.toString() === this.getRoot().toString();
  }
  // TODO: should this take an optional offset? should it fail if the array is too long?
  /**
   * Fills all leaves of the tree.
   * @param leaves Values to fill the leaves with.
   */
  fill(leaves) {
    leaves.forEach((value, index) => {
      this.setLeaf(BigInt(index), value);
    });
  }
  /**
   * Returns the amount of leaf nodes.
   * @returns Amount of leaf nodes.
   */
  get leafCount() {
    return 2n ** BigInt(this.height - 1);
  }
};
var BaseMerkleWitness = class extends CircuitValue {
  height() {
    return this.constructor.height;
  }
  /**
   * Takes a {@link Witness} and turns it into a circuit-compatible Witness.
   * @param witness Witness.
   * @returns A circuit-compatible Witness.
   */
  constructor(witness2) {
    super();
    let height = witness2.length + 1;
    if (height !== this.height()) {
      throw Error(`Length of witness ${height}-1 doesn't match static tree height ${this.height()}.`);
    }
    this.path = witness2.map((item) => item.sibling);
    this.isLeft = witness2.map((item) => Bool4(item.isLeft));
  }
  /**
   * Calculates a root depending on the leaf value.
   * @param leaf Value of the leaf node that belongs to this Witness.
   * @returns The calculated root.
   */
  calculateRoot(leaf) {
    let hash2 = leaf;
    let n = this.height();
    for (let i2 = 1; i2 < n; ++i2) {
      let isLeft = this.isLeft[i2 - 1];
      const [left, right] = maybeSwap(isLeft, hash2, this.path[i2 - 1]);
      hash2 = Poseidon2.hash([left, right]);
    }
    return hash2;
  }
  /**
   * Calculates a root depending on the leaf value.
   * @deprecated This is a less efficient version of {@link calculateRoot} which was added for compatibility with existing deployed contracts
   */
  calculateRootSlow(leaf) {
    let hash2 = leaf;
    let n = this.height();
    for (let i2 = 1; i2 < n; ++i2) {
      let isLeft = this.isLeft[i2 - 1];
      const [left, right] = maybeSwapBad(isLeft, hash2, this.path[i2 - 1]);
      hash2 = Poseidon2.hash([left, right]);
    }
    return hash2;
  }
  /**
   * Calculates the index of the leaf node that belongs to this Witness.
   * @returns Index of the leaf.
   */
  calculateIndex() {
    let powerOfTwo = Field4(1);
    let index = Field4(0);
    let n = this.height();
    for (let i2 = 1; i2 < n; ++i2) {
      index = Provable.if(this.isLeft[i2 - 1], index, index.add(powerOfTwo));
      powerOfTwo = powerOfTwo.mul(2);
    }
    return index;
  }
};
function MerkleWitness(height) {
  class MerkleWitness_ extends BaseMerkleWitness {
  }
  MerkleWitness_.height = height;
  arrayProp(Field4, height - 1)(MerkleWitness_.prototype, "path");
  arrayProp(Bool4, height - 1)(MerkleWitness_.prototype, "isLeft");
  return MerkleWitness_;
}
function maybeSwapBad(b2, x, y) {
  const x_ = Provable.if(b2, x, y);
  const y_ = Provable.if(b2, y, x);
  return [x_, y_];
}
function maybeSwap(b2, x, y) {
  let m = b2.toField().mul(x.sub(y));
  const x_ = y.add(m);
  const y_ = x.sub(m);
  return [x_, y_];
}

// dist/node/lib/merkle_map.js
var import_tslib9 = require("tslib");
var bits = 255;
var printDebugs = false;
var MerkleMap = class {
  // ------------------------------------------------
  /**
   * Creates a new, empty Merkle Map.
   * @returns A new MerkleMap
   */
  constructor() {
    if (bits > 255) {
      throw Error("bits must be <= 255");
    }
    if (bits !== 255) {
      console.warn("bits set to", bits + ". Should be set to 255 in production to avoid collisions");
    }
    this.tree = new MerkleTree(bits + 1);
  }
  // ------------------------------------------------
  _keyToIndex(key) {
    let keyBits = key.toBits().slice(0, bits).reverse().map((b2) => b2.toBoolean());
    let n = 0n;
    for (let i2 = 0; i2 < keyBits.length; i2++) {
      const b2 = keyBits[i2] ? 1 : 0;
      n += 2n ** BigInt(i2) * BigInt(b2);
    }
    return n;
  }
  // ------------------------------------------------
  /**
   * Sets a key of the merkle map to a given value.
   * @param key The key to set in the map.
   * @param key The value to set.
   */
  set(key, value) {
    const index = this._keyToIndex(key);
    this.tree.setLeaf(index, value);
  }
  // ------------------------------------------------
  /**
   * Returns a value given a key. Values are by default Field(0).
   * @param key The key to get the value from.
   * @returns The value stored at the key.
   */
  get(key) {
    const index = this._keyToIndex(key);
    return this.tree.getNode(0, index);
  }
  // ------------------------------------------------
  /**
   * Returns the root of the Merkle Map.
   * @returns The root of the Merkle Map.
   */
  getRoot() {
    return this.tree.getRoot();
  }
  /**
   * Returns a circuit-compatible witness (also known as [Merkle Proof or Merkle Witness](https://computersciencewiki.org/index.php/Merkle_proof)) for the given key.
   * @param key The key to make a witness for.
   * @returns A MerkleMapWitness, which can be used to assert changes to the MerkleMap, and the witness's key.
   */
  getWitness(key) {
    const index = this._keyToIndex(key);
    class MyMerkleWitness extends MerkleWitness(bits + 1) {
    }
    const witness2 = new MyMerkleWitness(this.tree.getWitness(index));
    if (printDebugs) {
      console.log("witness bits", witness2.isLeft.map((l) => l.toBoolean() ? "0" : "1").join(", "));
      console.log("key bits", key.toBits().slice(0, bits).map((l) => l.toBoolean() ? "1" : "0").join(", "));
    }
    return new MerkleMapWitness(witness2.isLeft, witness2.path);
  }
};
var MerkleMapWitness = class extends CircuitValue {
  constructor(isLefts, siblings) {
    super();
    this.isLefts = isLefts;
    this.siblings = siblings;
  }
  /**
   * computes the merkle tree root for a given value and the key for this witness
   * @param value The value to compute the root for.
   * @returns A tuple of the computed merkle root, and the key that is connected to the path updated by this witness.
   */
  computeRootAndKey(value) {
    let hash2 = value;
    const isLeft = this.isLefts;
    const siblings = this.siblings;
    let key = Field4(0);
    for (let i2 = 0; i2 < bits; i2++) {
      const left = Provable.if(isLeft[i2], hash2, siblings[i2]);
      const right = Provable.if(isLeft[i2], siblings[i2], hash2);
      hash2 = Poseidon2.hash([left, right]);
      const bit = Provable.if(isLeft[i2], Field4(0), Field4(1));
      key = key.mul(2).add(bit);
    }
    return [hash2, key];
  }
};
(0, import_tslib9.__decorate)([
  arrayProp(Bool4, bits),
  (0, import_tslib9.__metadata)("design:type", Array)
], MerkleMapWitness.prototype, "isLefts", void 0);
(0, import_tslib9.__decorate)([
  arrayProp(Field4, bits),
  (0, import_tslib9.__metadata)("design:type", Array)
], MerkleMapWitness.prototype, "siblings", void 0);

// dist/node/lib/nullifier.js
var Nullifier = class extends Struct({
  publicKey: Group3,
  public: {
    nullifier: Group3,
    s: Scalar3
  },
  private: {
    c: Field4,
    g_r: Group3,
    h_m_pk_r: Group3
  }
}) {
  static fromJSON(json) {
    return super.fromJSON(json);
  }
  /**
   * Verifies that the Nullifier belongs to a specific message. Throws an error if the Nullifier is incorrect.
   *
   * @example
   *
   * ```ts
   * let nullifierMessage = [voteId, ...otherData];
   * // throws an error if the nullifier is invalid or doesn't belong to this specific message
   * nullifier.verify(nullifierMessage);
   * ```
   */
  verify(message) {
    let { publicKey, public: { nullifier, s }, private: { c } } = this;
    let G = Group3.generator;
    let pk_fields = Group3.toFields(publicKey);
    let { x, y: { x0 } } = Poseidon2.hashToGroup([...message, ...pk_fields]);
    x0.isEven().assertTrue();
    let h_m_pk = Group3.fromFields([x, x0]);
    let pk_c = scaleShifted(this.publicKey, Scalar3.fromBits(c.toBits()));
    let g_r = G.scale(s).sub(pk_c);
    let h_m_pk_s = Group3.scale(h_m_pk, s);
    let h_m_pk_s_div_nullifier_s = h_m_pk_s.sub(scaleShifted(nullifier, Scalar3.fromBits(c.toBits())));
    Poseidon2.hash([
      ...Group3.toFields(G),
      ...pk_fields,
      x,
      x0,
      ...Group3.toFields(nullifier),
      ...Group3.toFields(g_r),
      ...Group3.toFields(h_m_pk_s_div_nullifier_s)
    ]).assertEquals(c, "Nullifier does not match private input!");
  }
  /**
   * The key of the nullifier, which belongs to a unique message and a public key.
   * Used as an index in Merkle trees.
   *
   * @example
   * ```ts
   * // returns the key of the nullifier which can be used as index in a Merkle tree/map
   * let key = nullifier.key();
   * ```
   */
  key() {
    return Poseidon2.hash(Group3.toFields(this.public.nullifier));
  }
  /**
   * Returns the state of the Nullifier.
   *
   * @example
   * ```ts
   * // returns a Bool based on whether or not the nullifier has been used before
   * let isUnused = nullifier.isUnused();
   * ```
   */
  isUnused(witness2, root) {
    let [newRoot, key] = witness2.computeRootAndKey(Field4(0));
    key.assertEquals(this.key());
    let isUnused = newRoot.equals(root);
    let isUsed = witness2.computeRootAndKey(Field4(1))[0].equals(root);
    isUsed.or(isUnused).assertTrue();
    return isUnused;
  }
  /**
   * Checks if the Nullifier has been used before.
   *
   * @example
   * ```ts
   * // asserts that the nullifier has not been used before, throws an error otherwise
   * nullifier.assertUnused();
   * ```
   */
  assertUnused(witness2, root) {
    let [impliedRoot, key] = witness2.computeRootAndKey(Field4(0));
    this.key().assertEquals(key);
    impliedRoot.assertEquals(root);
  }
  /**
   * Sets the Nullifier, returns the new Merkle root.
   *
   * @example
   * ```ts
   * // calculates the new root of the Merkle tree in which the nullifier is set to used
   * let newRoot = nullifier.setUsed(witness);
   * ```
   */
  setUsed(witness2) {
    let [newRoot, key] = witness2.computeRootAndKey(Field4(1));
    key.assertEquals(this.key());
    return newRoot;
  }
  /**
   * Returns the {@link PublicKey} that is associated with this Nullifier.
   *
   * @example
   * ```ts
   * let pk = nullifier.getPublicKey();
   * ```
   */
  getPublicKey() {
    return PublicKey2.fromGroup(this.publicKey);
  }
  /**
   *
   * _Note_: This is *not* the recommended way to create a Nullifier in production. Please use mina-signer to create Nullifiers.
   * Also, this function cannot be run within provable code to avoid unintended creations of Nullifiers - a Nullifier should never be created inside proveable code (e.g. a smart contract) directly, but rather created inside the users wallet (or other secure enclaves, so the private key never leaves that enclave).
   *
   * PLUME: An ECDSA Nullifier Scheme for Unique
   * Pseudonymity within Zero Knowledge Proofs
   * https://eprint.iacr.org/2022/1255.pdf chapter 3 page 14
   */
  static createTestNullifier(message, sk) {
    if (Provable.inCheckedComputation()) {
      throw Error("This function cannot not be run within provable code. If you want to create a Nullifier, run this method outside provable code or use mina-signer to do so.");
    }
    const Hash22 = Poseidon2.hash;
    const Hash3 = Poseidon2.hashToGroup;
    const pk = sk.toPublicKey().toGroup();
    const G = Group3.generator;
    const r = Scalar3.random();
    const gm = Hash3([...message, ...Group3.toFields(pk)]);
    const h_m_pk = Group3({ x: gm.x, y: gm.y.x0 });
    const nullifier = h_m_pk.scale(sk.toBigInt());
    const h_m_pk_r = h_m_pk.scale(r.toBigInt());
    const g_r = G.scale(r.toBigInt());
    const c = Hash22([
      ...Group3.toFields(G),
      ...Group3.toFields(pk),
      ...Group3.toFields(h_m_pk),
      ...Group3.toFields(nullifier),
      ...Group3.toFields(g_r),
      ...Group3.toFields(h_m_pk_r)
    ]);
    const s = r.add(sk.s.mul(Scalar3.from(c.toBigInt())));
    return {
      publicKey: pk.toJSON(),
      private: {
        c: c.toString(),
        g_r: g_r.toJSON(),
        h_m_pk_r: h_m_pk_r.toJSON()
      },
      public: {
        nullifier: nullifier.toJSON(),
        s: s.toJSON()
      }
    };
  }
};

// dist/node/index.js
var Experimental_ = {
  Callback,
  createChildAccountUpdate,
  memoizeWitness,
  ZkProgram
};
var Experimental;
(function(Experimental2) {
  Experimental2.ZkProgram = Experimental_.ZkProgram;
  Experimental2.createChildAccountUpdate = Experimental_.createChildAccountUpdate;
  Experimental2.memoizeWitness = Experimental_.memoizeWitness;
  Experimental2.Callback = Experimental_.Callback;
})(Experimental || (Experimental = {}));
Error.stackTraceLimit = 1e3;
var isReady = Promise.resolve();
function shutdown() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Account,
  AccountUpdate,
  Bool,
  Character,
  Circuit,
  CircuitString,
  CircuitValue,
  Empty,
  Encoding,
  Encryption,
  Experimental,
  Field,
  Group,
  Int64,
  Keypair,
  Ledger,
  MerkleMap,
  MerkleMapWitness,
  MerkleTree,
  MerkleWitness,
  Mina,
  Nullifier,
  Permissions,
  Poseidon,
  PrivateKey,
  Proof,
  Provable,
  PublicKey,
  Reducer,
  Scalar,
  SelfProof,
  Sign,
  Signature,
  SmartContract,
  State,
  Struct,
  Token,
  TokenId,
  TokenSymbol,
  Types,
  UInt32,
  UInt64,
  Undefined,
  VerificationKey,
  Void,
  ZkappPublicInput,
  addCachedAccount,
  arrayProp,
  checkZkappTransaction,
  circuitMain,
  declareMethods,
  declareState,
  fetchAccount,
  fetchEvents,
  fetchLastBlock,
  fetchTransactionStatus,
  isReady,
  matrixProp,
  method,
  prop,
  provable,
  provablePure,
  public_,
  scaleShifted,
  sendZkapp,
  setArchiveGraphqlEndpoint,
  setGraphqlEndpoint,
  setGraphqlEndpoints,
  shutdown,
  state,
  verify
});
