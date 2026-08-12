/* ELISENCE Passport — thin presentation adapters (no business truth). */
(function () {
  "use strict";

  var STATUS_LABEL = {
    ACTIVE: "Confirmed",
    PENDING_CONFIRMATION: "Pending Confirmation",
    UNSUBSCRIBED: "Unsubscribed",
    SUPPRESSED: "Suppressed",
    BOUNCED: "Bounced",
    COMPLAINED: "Complained",
    EXPIRED: "Expired"
  };

  var STATUS_API = {
    Confirmed: "ACTIVE",
    "Pending Confirmation": "PENDING_CONFIRMATION",
    Unsubscribed: "UNSUBSCRIBED",
    Suppressed: "SUPPRESSED",
    Bounced: "BOUNCED",
    Complained: "COMPLAINED"
  };

  var INTEREST_API = {
    Investment: "investment",
    "Strategic Partnership": "strategic_partnership",
    "Healthcare Systems": "healthcare_systems",
    "Technology & AI": "technology_ai",
    Research: "research",
    Events: "events",
    "General Updates": "general_updates"
  };

  function consentLabel(code) {
    return STATUS_LABEL[code] || code || "—";
  }

  function fmtNum(n) {
    if (n === null || n === undefined) return "—";
    return Number(n).toLocaleString();
  }

  function unavailable(label) {
    return { label: label, value: "Not available", unavailable: true };
  }

  function mapDashboard(body) {
    var o = (body && body.overview) || {};
    return {
      totalRelationships: o.total_relationships || 0,
      confirmed: o.confirmed || 0,
      pendingConfirmation: o.pending_confirmation || 0,
      unsubscribed: o.unsubscribed || 0,
      suppressedBounced: o.suppressed_or_bounced || 0,
      newThisMonth: o.new_this_month || 0,
      confirmationRate: o.confirmation_rate || 0,
      topInterests: o.top_interests || [],
      topSources: o.top_sources || [],
      funnel: [
        { label: "Submitted", value: (o.funnel && o.funnel.submitted) || 0 },
        { label: "Confirmed", value: (o.funnel && o.funnel.confirmed) || 0 },
        { label: "Pending", value: (o.funnel && o.funnel.pending_confirmation) || 0 },
        { label: "Active", value: (o.funnel && o.funnel.active) || 0 }
      ],
      recentActivity: (o.recent_activity || []).map(function (a) {
        return {
          when: a.when || "",
          text: (a.what || "") + (a.result ? " · " + a.result : "")
        };
      }),
      growth: (o.growth || []).map(function (g) {
        return { name: g.month, count: g.cumulative };
      })
    };
  }

  function mapRelationshipRow(item) {
    var status = consentLabel(item.consent_state);
    var redacted = item.redacted_fields || [];
    function field(name, value) {
      if (redacted.indexOf(name) >= 0 || value === null || value === undefined) {
        if (redacted.indexOf(name) >= 0) return "Not authorized";
      }
      return value || "";
    }
    return {
      id: item.relationship_id,
      name: field("display_name", item.display_name) || item.relationship_id,
      role: field("role", item.role),
      organisation: field("organisation", item.organisation),
      status: status,
      source: item.source || "",
      met: item.meeting_context || "",
      interests: item.interests || [],
      consentConfirmed: item.confirmed_at || (item.consent_state === "ACTIVE" ? "Yes" : "—"),
      lastCommunication: item.last_communication_at || "—"
    };
  }

  function mapDetail(body) {
    var r = body.relationship || {};
    var redacted = r.redacted_fields || [];
    function field(name, value) {
      if (redacted.indexOf(name) >= 0) return "Not authorized";
      return value || "—";
    }
    var status = consentLabel(r.consent_state);
    var timeline = (body.timeline || []).map(function (t) {
      return {
        date: t.at || "",
        title: t.title || t.kind || "",
        meta: t.meta || ""
      };
    });
    return {
      id: r.relationship_id,
      name: field("display_name", r.display_name) === "Not authorized"
        ? "Not authorized"
        : (r.display_name || r.relationship_id),
      role: field("role", r.role),
      organisation: field("organisation", r.organisation),
      status: status,
      source: r.source || "",
      met: r.meeting_context || "",
      interests: r.interests || [],
      consentConfirmed: r.confirmed_at || "—",
      lastCommunication: (body.communications && body.communications.length
        ? body.communications[body.communications.length - 1].created_at
        : "—"),
      engagement: r.suppression && r.suppression.active ? "Blocked" : status,
      email: field("primary_email", r.primary_email) === "Not authorized"
        ? "Not authorized"
        : (r.primary_email || ""),
      timeline: timeline
    };
  }

  window.ElisenceOperationsAdapters = {
    STATUS_API: STATUS_API,
    INTEREST_API: INTEREST_API,
    consentLabel: consentLabel,
    fmtNum: fmtNum,
    unavailable: unavailable,
    mapDashboard: mapDashboard,
    mapRelationshipRow: mapRelationshipRow,
    mapDetail: mapDetail
  };
})();
