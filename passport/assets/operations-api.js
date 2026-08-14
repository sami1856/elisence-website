/* ELISENCE Passport — Operations READ API client (GET only). Local/test. */
(function () {
  "use strict";

  var TOKEN_HEADER = "X-ERCP-Operations-Token";

  function cfg() {
    return window.ElisencePassportConfig || { apiBase: "http://127.0.0.1:8000", operationsToken: "" };
  }

  function OpsError(message, status, body) {
    this.name = "OpsError";
    this.message = message;
    this.status = status || 0;
    this.body = body || null;
  }
  OpsError.prototype = Object.create(Error.prototype);

  function buildQuery(params) {
    if (!params) return "";
    var parts = [];
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null || v === "") return;
      parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v)));
    });
    return parts.length ? "?" + parts.join("&") : "";
  }

  function getJson(path, params) {
    var c = cfg();
    if (!c.operationsToken) {
      return Promise.reject(
        new OpsError("Operations access token missing. Provide a LoA2 Canonical Auth ACCESS token via sessionStorage ERCP_OPERATIONS_LOCAL_TOKEN or ?opsToken=.", 401, null)
      );
    }
    var url = c.apiBase + path + buildQuery(params);
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = null;
    if (controller) {
      timer = setTimeout(function () {
        try {
          controller.abort();
        } catch (e) {}
      }, 15000);
    }
    return fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-ERCP-Operations-Token": c.operationsToken,
        Authorization: "Bearer " + c.operationsToken
      },
      credentials: "omit",
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        return res.text().then(function (text) {
          var body = null;
          try {
            body = text ? JSON.parse(text) : null;
          } catch (e) {
            body = { raw: text };
          }
          if (!res.ok) {
            throw new OpsError(
              (body && body.status) || "operations_request_failed",
              res.status,
              body
            );
          }
          return body;
        });
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        if (err && err.name === "OpsError") throw err;
        throw new OpsError(err && err.message ? err.message : "network_error", 0, null);
      });
  }

  // Explicit GET-only surface — no POST/PUT/PATCH/DELETE helpers.
  window.ElisenceOperationsApi = {
    OpsError: OpsError,
    getDashboard: function () {
      return getJson("/ercp/operations/dashboard");
    },
    getRelationships: function (params) {
      return getJson("/ercp/operations/relationships", params || {});
    },
    getRelationship: function (relationshipId) {
      return getJson("/ercp/operations/relationships/" + encodeURIComponent(relationshipId));
    },
    getSegments: function () {
      return getJson("/ercp/operations/segments");
    },
    getCampaigns: function () {
      return getJson("/ercp/operations/campaigns");
    },
    getCampaign: function (campaignId) {
      return getJson("/ercp/operations/campaigns/" + encodeURIComponent(campaignId));
    },
    getExecutions: function () {
      return getJson("/ercp/operations/executions");
    },
    getExecution: function (executionId) {
      return getJson("/ercp/operations/executions/" + encodeURIComponent(executionId));
    },
    getDeliveryAnalytics: function () {
      return getJson("/ercp/operations/analytics/delivery");
    },
    getConsentSummary: function () {
      return getJson("/ercp/operations/consent/summary");
    },
    getAudit: function (params) {
      return getJson("/ercp/operations/audit", params || {});
    }
  };
})();
