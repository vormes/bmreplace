Cu.import("resource://gre/modules/Services.jsm");

let tests = {},
    total = 0, successful = 0,
    errors = {},
    undos = [];

function test(name, body) {
  tests[name] = body;
  ++total;
  return undefined;
}

function assertEqual(expected, actual, message) {
  if (expected != actual) {
    throw message || "expected: " + expected + ", received: " + actual;
  }
}

function assertTrue(value, message) {
  assertFalse(!value, message || "expected " + value + " to be true");
}


function assertFalse(value, message) {
  if (value) {
    throw message || "expected " + value + " to be false";
  }
}

function assertArraysEqual(expected, actual) {
  assertTrue(typeof actual === "object", actual + " is not an object");
  assertTrue(!((expected < actual) || (expected > actual)),
             "expected: " + expected + ", received: " + actual);
}

function runTests() {
  for (let test in tests) {
    try {
      tests[test]();
      ++successful;
    } catch (e) {
      errors[test] = e;
    }
    undos.forEach(function(func) {func();});
    undos = [];
  }
  repl.print("successful: " + successful + ", total: " + total);
  for (let name in errors) {
    repl.print("'" + name + "' failed: " + errors[name]);
  }
}

function undo(func) {
  undos.push(func);
}

function getPref(key) {
  return PREFS[key];
}
