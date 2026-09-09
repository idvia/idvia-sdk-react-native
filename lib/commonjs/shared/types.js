"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeError = makeError;
function makeError(code, message, nativeError) {
  return {
    code,
    message,
    nativeError
  };
}
//# sourceMappingURL=types.js.map