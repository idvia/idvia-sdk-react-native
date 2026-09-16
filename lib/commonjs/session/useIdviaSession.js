"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIdviaSession = useIdviaSession;
var _react = require("react");
var _openIdviaSession = require("./openIdviaSession");
function useIdviaSession() {
  const [status, setStatus] = (0, _react.useState)('idle');
  const [result, setResult] = (0, _react.useState)(null);
  const [error, setError] = (0, _react.useState)(null);
  const generationRef = (0, _react.useRef)(0);
  const present = (0, _react.useCallback)(async options => {
    const generation = ++generationRef.current;
    setStatus('presenting');
    setResult(null);
    setError(null);
    try {
      const sessionResult = await (0, _openIdviaSession.openIdviaSession)(options);
      if (generationRef.current === generation) {
        setStatus(sessionResult.outcome);
        setResult(sessionResult);
      }
      return sessionResult;
    } catch (e) {
      if (generationRef.current === generation) {
        setStatus('error');
        setError(e);
      }
      throw e;
    }
  }, []);
  return {
    status,
    result,
    error,
    present
  };
}
//# sourceMappingURL=useIdviaSession.js.map