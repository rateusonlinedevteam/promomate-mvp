// (function () {
//   "use strict";

//   // --------------------------------------------------
//   // Get script configuration
//   // --------------------------------------------------

//   const current = document.currentScript;

//   if (!current) {
//     console.warn("[PromoMate] Unable to find tracker script");
//     return;
//   }

//   const siteKey = current.dataset.siteId;
//   const api = (
//     current.dataset.api || "http://localhost:3033"
//   ).replace(/\/$/, "");

//   if (!siteKey) {
//     console.warn("[PromoMate] Missing data-site-id");
//     return;
//   }

//   // --------------------------------------------------
//   // ID helper
//   // --------------------------------------------------

//   function createId() {
//     try {
//       if (
//         typeof crypto !== "undefined" &&
//         typeof crypto.randomUUID === "function"
//       ) {
//         return crypto.randomUUID();
//       }
//     } catch (error) {
//       // fallback below
//     }

//     return (
//       Math.random().toString(36).slice(2) +
//       Date.now().toString(36)
//     );
//   }

//   // --------------------------------------------------
//   // Visitor ID
//   // --------------------------------------------------

//   const storageKey = "promomate_visitor_id";

//   let visitorId = null;

//   try {
//     visitorId = localStorage.getItem(storageKey);

//     if (!visitorId) {
//       visitorId = createId();
//       localStorage.setItem(storageKey, visitorId);
//     }
//   } catch (error) {
//     console.warn("[PromoMate] localStorage unavailable");

//     visitorId = createId();
//   }

//   // --------------------------------------------------
//   // Session ID
//   // --------------------------------------------------

//   const sessionKey = "promomate_session_id";

//   let sessionId = null;

//   try {
//     sessionId = sessionStorage.getItem(sessionKey);

//     if (!sessionId) {
//       sessionId = createId();
//       sessionStorage.setItem(sessionKey, sessionId);
//     }
//   } catch (error) {
//     console.warn("[PromoMate] sessionStorage unavailable");

//     sessionId = createId();
//   }

//   // --------------------------------------------------
//   // UTM parameters
//   // --------------------------------------------------

//   function getCampaignParams() {
//     const searchParams = new URLSearchParams(
//       window.location.search
//     );

//     return {
//       source: searchParams.get("utm_source") || "",
//       medium: searchParams.get("utm_medium") || "",
//       campaign: searchParams.get("utm_campaign") || ""
//     };
//   }

//   // --------------------------------------------------
//   // Send event
//   // --------------------------------------------------

//   function send(eventName, eventData) {
//     const campaign = getCampaignParams();

//     const payload = {
//       siteKey: siteKey,

//       eventName: String(eventName || "page_view"),

//       visitorId: visitorId,

//       sessionId: sessionId,

//       url: window.location.href,

//       path: window.location.pathname,

//       title: document.title,

//       referrer: document.referrer || "",

//       source: campaign.source,

//       medium: campaign.medium,

//       campaign: campaign.campaign,

//       eventData:
//         eventData && typeof eventData === "object"
//           ? eventData
//           : {}
//     };

//     const body = JSON.stringify(payload);

//     const endpoint = api + "/api/v1/track";

//     console.log("[PromoMate] Sending event:", eventName);

//     // ------------------------------------------------
//     // Prefer Beacon
//     // ------------------------------------------------

//     if (
//       typeof navigator !== "undefined" &&
//       typeof navigator.sendBeacon === "function"
//     ) {
//       try {
//         /*
//          * IMPORTANT:
//          *
//          * Use text/plain instead of application/json.
//          * This avoids unnecessary CORS preflight for Beacon.
//          *
//          * The body itself is still JSON.
//          */

//         const blob = new Blob(
//           [body],
//           {
//             type: "text/plain;charset=UTF-8"
//           }
//         );

//         const sent = navigator.sendBeacon(
//           endpoint,
//           blob
//         );

//         if (sent) {
//           return;
//         }
//       } catch (error) {
//         console.warn(
//           "[PromoMate] Beacon failed:",
//           error
//         );
//       }
//     }

//     // ------------------------------------------------
//     // Fetch fallback
//     // ------------------------------------------------

//     fetch(endpoint, {
//       method: "POST",

//       headers: {
//         "Content-Type": "text/plain;charset=UTF-8"
//       },

//       body: body,

//       keepalive: true
//     }).catch(function (error) {
//       console.warn(
//         "[PromoMate] Tracking request failed:",
//         error
//       );
//     });
//   }

//   // --------------------------------------------------
//   // Public API
//   // --------------------------------------------------

//   window.PromoMate = {
//     track: function (name, data) {
//       send(name, data);
//     }
//   };

//   // --------------------------------------------------
//   // Page view
//   // --------------------------------------------------

//   send("page_view");

//   // --------------------------------------------------
//   // Scroll tracking
//   // --------------------------------------------------

//   let lastScroll = 0;

//   window.addEventListener(
//     "scroll",
//     function () {
//       const documentHeight = Math.max(
//         document.documentElement.scrollHeight,
//         1
//       );

//       const percent = Math.round(
//         (
//           (window.scrollY + window.innerHeight) /
//           documentHeight
//         ) * 100
//       );

//       if (
//         percent >= 25 &&
//         lastScroll < 25
//       ) {
//         send("scroll", {
//           percent: 25
//         });
//       }

//       if (
//         percent >= 50 &&
//         lastScroll < 50
//       ) {
//         send("scroll", {
//           percent: 50
//         });
//       }

//       if (
//         percent >= 75 &&
//         lastScroll < 75
//       ) {
//         send("scroll", {
//           percent: 75
//         });
//       }

//       if (
//         percent >= 90 &&
//         lastScroll < 90
//       ) {
//         send("scroll", {
//           percent: 90
//         });
//       }

//       lastScroll = Math.max(
//         lastScroll,
//         percent
//       );
//     },
//     {
//       passive: true
//     }
//   );

//   // --------------------------------------------------
//   // Section tracking
//   // --------------------------------------------------

//   const sections =
//     document.querySelectorAll(
//       "[data-promomate]"
//     );

//   if (
//     "IntersectionObserver" in window &&
//     sections.length
//   ) {
//     const seen = new Set();

//     const observer =
//       new IntersectionObserver(
//         function (entries) {
//           entries.forEach(
//             function (entry) {
//               if (!entry.isIntersecting) {
//                 return;
//               }

//               const sectionId =
//                 entry.target.getAttribute(
//                   "data-promomate"
//                 );

//               if (
//                 sectionId &&
//                 !seen.has(sectionId)
//               ) {
//                 seen.add(sectionId);

//                 send(
//                   "section_view",
//                   {
//                     sectionId: sectionId
//                   }
//                 );
//               }
//             }
//           );
//         },
//         {
//           threshold: 0.35
//         }
//       );

//     sections.forEach(
//       function (section) {
//         observer.observe(section);
//       }
//     );
//   }

//   // --------------------------------------------------
//   // Custom click tracking
//   // --------------------------------------------------

//   document.addEventListener(
//     "click",
//     function (event) {
//       const target =
//         event.target.closest(
//           "[data-promomate-event]"
//         );

//       if (!target) {
//         return;
//       }

//       const eventName =
//         target.getAttribute(
//           "data-promomate-event"
//         );

//       send(
//         eventName,
//         {
//           text: (
//             target.innerText || ""
//           ).slice(0, 200)
//         }
//       );
//     }
//   );

//   console.log(
//     "[PromoMate] Tracker initialized",
//     {
//       siteKey: siteKey,
//       api: api,
//       visitorId: visitorId,
//       sessionId: sessionId
//     }
//   );
// })();


(function () {
  "use strict";

  const current = document.currentScript;
  const siteKey = current && current.dataset ? current.dataset.siteId : null;
  const api = current && current.dataset && current.dataset.api
    ? current.dataset.api
    : "http://localhost:3033";

  if (!siteKey) {
    console.warn("[PromoMate] Missing data-site-id");
    return;
  }

  const storageKey = "promomate_visitor_id";
  const sessionKey = "promomate_session_id";

  function id() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  let visitorId = localStorage.getItem(storageKey);
  if (!visitorId) {
    visitorId = id();
    localStorage.setItem(storageKey, visitorId);
  }

  let sessionId = sessionStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = id();
    sessionStorage.setItem(sessionKey, sessionId);
  }

  function params() {
    const p = new URLSearchParams(location.search);
    return {
      source: p.get("utm_source") || "",
      medium: p.get("utm_medium") || "",
      campaign: p.get("utm_campaign") || ""
    };
  }

  // function send(eventName, eventData) {
  //   const u = params();
  //   const payload = {
  //     siteKey,
  //     eventName,
  //     visitorId,
  //     sessionId,
  //     url: location.href,
  //     path: location.pathname,
  //     title: document.title,
  //     referrer: document.referrer || "",
  //     source: u.source,
  //     medium: u.medium,
  //     campaign: u.campaign,
  //     eventData: eventData || {}
  //   };

  //   const body = JSON.stringify(payload);
  //   if (navigator.sendBeacon) {
  //     const blob = new Blob([body], { type: "application/json" });
  //     navigator.sendBeacon(api + "/api/v1/track", blob);
  //   } else {
  //     fetch(api + "/api/v1/track", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body,
  //       keepalive: true
  //     }).catch(function () {});
  //   }
  // }

  function trackSections() {
  const sections = document.querySelectorAll(
    "[data-promomate]"
  );

  console.log("[PromoMate] Found sections:", sections);
  if (
    !("IntersectionObserver" in window) ||
    !sections.length
  ) {
    return;
  }

  const seen = new Set();

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target;

        const sectionId =
          element.getAttribute("data-promomate");

        if (!sectionId) {
          return;
        }

        if (seen.has(sectionId)) {
          return;
        }

        seen.add(sectionId);

        send("section_view", {
          sectionId: sectionId,
          sectionTitle: (
            element.querySelector("h1,h2,h3,h4")?.innerText || ""
          ).slice(0, 200)
        });
      });
    },
    {
      threshold: 0.35
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
}



  function send(eventName, eventData) {
  const u = params();

  const payload = {
    siteKey,
    eventName,
    visitorId,
    sessionId,
    url: location.href,
    path: location.pathname,
    title: document.title,
    referrer: document.referrer || "",
    source: u.source,
    medium: u.medium,
    campaign: u.campaign,
    eventData: eventData || {}
  };

  console.log("[PromoMate] Sending event:", eventName, payload);

  const endpoint = api + "/api/v1/track";

  console.log("[PromoMate] POST:", endpoint);
  console.log("[PromoMate] Payload:", payload);

  fetch(endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(payload),

    keepalive: true
  })
    .then(async function (response) {
      const text = await response.text();

      console.log(
        "[PromoMate] Track response:",
        response.status,
        text
      );

      if (!response.ok) {
        console.error(
          "[PromoMate] Tracking failed:",
          response.status,
          text
        );
      }
    })
    .catch(function (error) {
      console.error(
        "[PromoMate] Tracking request error:",
        error
      );
    });
}

  window.PromoMate = {
    track: function (name, data) {
      send(name, data);
    }
  };

  send("page_view");

  let lastScroll = 0;
  window.addEventListener("scroll", function () {
    const percent = Math.round(
      ((window.scrollY + window.innerHeight) /
        Math.max(document.documentElement.scrollHeight, 1)) * 100
    );
    if (percent >= 25 && lastScroll < 25) send("scroll", { percent: 25 });
    if (percent >= 50 && lastScroll < 50) send("scroll", { percent: 50 });
    if (percent >= 75 && lastScroll < 75) send("scroll", { percent: 75 });
    if (percent >= 90 && lastScroll < 90) send("scroll", { percent: 90 });
    lastScroll = Math.max(lastScroll, percent);
  }, { passive: true });
  alert("[PromoMate] Tracker initialized");
  const sections = document.querySelectorAll("[data-promomate]");
  console.log("[PromoMate] Found sections:", sections);
  // trackSections();
  send("section_view", { sectionId:"testDemo" });
  if ("IntersectionObserver" in window && sections.length) {
    const seen = new Set();
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("data-promomate");
          if (sectionId && !seen.has(sectionId)) {
            seen.add(sectionId);
            send("section_view", { sectionId });
          }
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-promomate-event]");
    if (!target) return;
    send(target.getAttribute("data-promomate-event"), {
      text: (target.innerText || "").slice(0, 200)
    });
  });
})();
