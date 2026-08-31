/* ============================================================
   DB VIRTUAL SOLUTIONS — Site Script
   Vanilla JS only. Accessible, lightweight, dependency-free.
   ============================================================ */
window.DBVS_CONFIG = {
  GA_MEASUREMENT_ID: "",
  META_PIXEL_ID: "",
  LINKEDIN_PARTNER_ID: "",
  FORM_ENDPOINT: ""
};

(function () {
  "use strict";

  var isSpanish = (document.documentElement.lang || "").toLowerCase().indexOf("es") === 0;
  var copy = isSpanish ? {
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    validation: "Corrige los campos señalados antes de preparar tu solicitud.",
    sending: "Enviando",
    preparing: "Preparando",
    sendError: "No pudimos enviar tu solicitud. Inténtalo de nuevo o escribe directamente a info@dbvirtualsolutions.com.",
    fallbackStatus: "Tu aplicación de correo debería abrirse con la solicitud. Si no ocurre, escribe directamente a info@dbvirtualsolutions.com.",
    subject: "DB Virtual Solutions — Solicitud de consulta"
  } : {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    validation: "Please correct the highlighted fields before preparing your request.",
    sending: "Sending",
    preparing: "Preparing",
    sendError: "We couldn't send your request. Please try again or email info@dbvirtualsolutions.com directly.",
    fallbackStatus: "Your email app should open with the request. If it doesn't, email info@dbvirtualsolutions.com directly.",
    subject: "DB Virtual Solutions — Consultation Request"
  };

  var ICON_MENU = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var ICON_X = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  window.trackEvent = function (name, params) {
    params = params || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (window.gtag && window.DBVS_CONFIG.GA_MEASUREMENT_ID) window.gtag("event", name, params);
    if (window.fbq && window.DBVS_CONFIG.META_PIXEL_ID) window.fbq("trackCustom", name, params);
    if (window.lintrk && window.DBVS_CONFIG.LINKEDIN_PARTNER_ID) window.lintrk("track", { conversion_id: name });
  };

  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-track]");
    if (el) trackEvent(el.getAttribute("data-track"), { cta_text: (el.textContent || "").trim().slice(0, 60), page: location.pathname });
  });

  /* Mobile navigation: keyboard-safe, Escape-to-close, focus return. */
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".mobile-panel");
  var lastFocused = null;
  function closeNav(returnFocus) {
    if (!toggle || !panel) return;
    panel.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", copy.openMenu);
    toggle.innerHTML = ICON_MENU;
    if (returnFocus) toggle.focus();
  }
  if (toggle && panel) {
    toggle.setAttribute("type", "button");
    toggle.setAttribute("aria-label", copy.openMenu);
    toggle.innerHTML = ICON_MENU;
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? copy.closeMenu : copy.openMenu);
      toggle.innerHTML = open ? ICON_X : ICON_MENU;
      if (open) {
        lastFocused = document.activeElement;
        var first = panel.querySelector("a");
        if (first) first.focus();
      }
    });
    panel.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { closeNav(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) {
        closeNav(false);
        if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
      }
    });
    var desktopNav = window.matchMedia && window.matchMedia("(min-width: 1101px)");
    if (desktopNav) {
      var handleNavBreakpoint = function (event) { if (event.matches && panel.classList.contains("open")) closeNav(false); };
      if (desktopNav.addEventListener) desktopNav.addEventListener("change", handleNavBreakpoint);
      else if (desktopNav.addListener) desktopNav.addListener(handleNavBreakpoint);
    }
  }

  /* Scroll reveal: disabled when reduced motion is requested. */
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window && reveals.length) {
    document.documentElement.classList.add("reveal-ready");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add("in"); });

  /* Let keyboard users inspect horizontally scrollable comparison tables. */
  document.querySelectorAll(".table-scroll[tabindex]").forEach(function (scroller) {
    scroller.addEventListener("keydown", function (e) {
      var step = Math.max(48, Math.round(scroller.clientWidth * 0.25));
      if (e.key === "ArrowRight") { scroller.scrollLeft += step; e.preventDefault(); }
      if (e.key === "ArrowLeft") { scroller.scrollLeft -= step; e.preventDefault(); }
      if (e.key === "Home") { scroller.scrollLeft = 0; e.preventDefault(); }
      if (e.key === "End") { scroller.scrollLeft = scroller.scrollWidth; e.preventDefault(); }
    });
  });

  /* Consultation form */
  var form = document.getElementById("consultation-form");
  if (form) {
    var status = document.getElementById("form-status");
    var submit = form.querySelector('button[type="submit"]');
    var success = document.getElementById("form-success");
    var submitDefaultHTML = submit ? submit.innerHTML : "";

    function setStatus(message, type) {
      if (!status) return;
      status.textContent = message;
      status.hidden = false;
      status.className = "form-note form-status form-status--" + (type || "info");
      status.setAttribute("role", type === "error" ? "alert" : "status");
    }
    function clearStatus() { if (status) { status.hidden = true; status.textContent = ""; } }
    function validateField(field) {
      var input = field.querySelector("input,select,textarea");
      if (!input || input.disabled || !input.required) return true;
      var value = input.value.trim();
      var ok = !!value;
      if (ok && input.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      field.classList.toggle("invalid", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      var err = field.querySelector(".err");
      if (err) {
        if (!err.id) err.id = input.id + "-error";
        input.setAttribute("aria-describedby", err.id);
      }
      return ok;
    }
    form.querySelectorAll(".field").forEach(function (field) {
      var input = field.querySelector("input,select,textarea");
      if (!input) return;
      input.addEventListener("blur", function () { validateField(field); });
      input.addEventListener("input", function () { if (field.classList.contains("invalid")) validateField(field); clearStatus(); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearStatus();
      var hp = form.querySelector(".hp input");
      if (hp && hp.value) return;
      var firstBad = null;
      form.querySelectorAll(".field").forEach(function (field) { if (!validateField(field) && !firstBad) firstBad = field; });
      if (firstBad) {
        setStatus(copy.validation, "error");
        var target = firstBad.querySelector("input,select,textarea");
        if (target) target.focus();
        return;
      }

      var data = new FormData(form);
      if (submit) {
        submit.disabled = true;
        submit.classList.add("is-loading");
        submit.setAttribute("aria-busy", "true");
        submit.textContent = window.DBVS_CONFIG.FORM_ENDPOINT ? copy.sending : copy.preparing;
      }

      function restore() {
        if (submit) { submit.disabled = false; submit.classList.remove("is-loading"); submit.removeAttribute("aria-busy"); submit.innerHTML = submitDefaultHTML; }
      }
      function done() {
        form.style.display = "none";
        if (success) { success.classList.add("show"); success.setAttribute("tabindex", "-1"); success.focus(); }
        trackEvent("generate_lead", { form: "consultation", page: location.pathname });
      }

      if (window.DBVS_CONFIG.FORM_ENDPOINT) {
        fetch(window.DBVS_CONFIG.FORM_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: data })
          .then(function (response) { if (!response.ok) throw new Error("Request failed"); done(); })
          .catch(function () { restore(); setStatus(copy.sendError, "error"); });
      } else {
        /* Safe fallback: never claim server receipt. Correct field names included. */
        var subject = encodeURIComponent(copy.subject);
        var fullName = (data.get("name") || "").trim();
        if (!fullName) fullName = ((data.get("first_name") || "") + " " + (data.get("last_name") || "")).trim();
        var lines = isSpanish ? [
          "Nombre: " + fullName,
          "Correo: " + (data.get("email") || ""),
          "Empresa: " + (data.get("company") || ""),
          "Teléfono: " + (data.get("phone") || ""),
          "Sector: " + (data.get("industry") || ""),
          "Servicio: " + (data.get("service_needed") || ""),
          "Miembros necesarios: " + (data.get("team_members_needed") || ""),
          "Tamaño actual del equipo: " + (data.get("current_team_size") || ""),
          "Qué quiere externalizar: " + (data.get("looking_to_outsource") || ""),
          "Información adicional: " + (data.get("additional_info") || "")
        ] : [
          "Name: " + fullName,
          "Email: " + (data.get("email") || ""),
          "Company: " + (data.get("company") || ""),
          "Phone: " + (data.get("phone") || ""),
          "Industry: " + (data.get("industry") || ""),
          "Service Needed: " + (data.get("service_needed") || ""),
          "Team Members Needed: " + (data.get("team_members_needed") || ""),
          "Current Team Size: " + (data.get("current_team_size") || ""),
          "What They Want to Outsource: " + (data.get("looking_to_outsource") || ""),
          "Additional Information: " + (data.get("additional_info") || "")
        ];
        var body = encodeURIComponent(lines.join("\n"));
        window.location.href = "mailto:info@dbvirtualsolutions.com?subject=" + subject + "&body=" + body;
        restore();
        setStatus(copy.fallbackStatus, "info");
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
