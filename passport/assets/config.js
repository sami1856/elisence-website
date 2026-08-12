/* ELISENCE Passport — Operations API config.
   NO secrets committed. Token must be supplied at runtime via:
   - sessionStorage ERCP_OPERATIONS_LOCAL_TOKEN
   - query ?opsToken=...
   - window.__ERCP_OPS_TOKEN__ (test harness only)
   API base via localStorage ERCP_OPERATIONS_API_BASE or ?apiBase= or default.
*/
(function () {
  "use strict";

  function qs(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function readToken() {
    try {
      var fromSession = sessionStorage.getItem("ERCP_OPERATIONS_LOCAL_TOKEN");
      if (fromSession) return fromSession;
    } catch (e) {}
    if (typeof window.__ERCP_OPS_TOKEN__ === "string" && window.__ERCP_OPS_TOKEN__) {
      return window.__ERCP_OPS_TOKEN__;
    }
    var fromQs = qs("opsToken");
    return fromQs || "";
  }

  function readBase() {
    try {
      var fromLs = localStorage.getItem("ERCP_OPERATIONS_API_BASE");
      if (fromLs) return fromLs.replace(/\/$/, "");
    } catch (e) {}
    var fromQs = qs("apiBase");
    if (fromQs) return String(fromQs).replace(/\/$/, "");
    // Production public Operations authority (narrow /ercp/operations/ on api.elisence.com).
    return "https://api.elisence.com";
  }

  window.ElisencePassportConfig = {
    apiBase: readBase(),
    operationsToken: readToken(),
    mode: "LIVE_ERCP_READ",
    localTestOnly: false
  };
})();
