/* CWinformatics — shared site behaviour
   Navigation, scroll state, reveal-on-scroll, figure hover captions, and the contact form.
   Everything degrades: the site is fully usable without this file. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Header scroll state ---------------- */
  var header = doc.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 4); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Mobile navigation ---------------- */
  var toggle = doc.querySelector(".nav-toggle");
  var nav = doc.getElementById("site-nav");
  var scrim = doc.querySelector(".nav-scrim");
  var mq = window.matchMedia("(max-width: 880px)");

  function navIsOpen() { return toggle && toggle.getAttribute("aria-expanded") === "true"; }
  function openNav() {
    if (!toggle || !nav) return;
    nav.classList.add("is-open");
    doc.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    var first = nav.querySelector("a");
    if (first) first.focus();
  }
  function closeNav(returnFocus) {
    if (!toggle || !nav) return;
    nav.classList.remove("is-open");
    doc.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    if (returnFocus) toggle.focus();
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { navIsOpen() ? closeNav(true) : openNav(); });
    if (scrim) scrim.addEventListener("click", function () { closeNav(true); });
    doc.addEventListener("keydown", function (e) {
      if (!navIsOpen()) return;
      if (e.key === "Escape") { e.preventDefault(); closeNav(true); return; }
      if (e.key === "Tab") {
        var focusables = [toggle].concat(Array.prototype.slice.call(nav.querySelectorAll("a, button")));
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(false); });
    var onMq = function () { if (!mq.matches && navIsOpen()) closeNav(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = doc.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
    }
  }

  /* ---------------- Figure hover captions ----------------
     Inside a .fig, elements with [data-caption] are "parts". Hovering or focusing
     one dims the others and writes its caption into the figure footer. */
  Array.prototype.forEach.call(doc.querySelectorAll(".fig"), function (fig) {
    var cap = fig.querySelector(".fig-cap");
    var parts = fig.querySelectorAll("[data-caption]");
    if (!cap || !parts.length) return;
    var defaultText = cap.textContent;
    function activate(part) {
      Array.prototype.forEach.call(parts, function (p) { p.classList.toggle("is-active", p === part); });
      fig.classList.add("is-hovering");
      cap.textContent = part.getAttribute("data-caption");
    }
    function reset() {
      Array.prototype.forEach.call(parts, function (p) { p.classList.remove("is-active"); });
      fig.classList.remove("is-hovering");
      cap.textContent = defaultText;
    }
    Array.prototype.forEach.call(parts, function (part) {
      part.classList.add("part");
      part.addEventListener("mouseenter", function () { activate(part); });
      part.addEventListener("mouseleave", reset);
      part.addEventListener("focus", function () { activate(part); });
      part.addEventListener("blur", reset);
    });
  });

  /* ---------------- Contact form ----------------
     Posts JSON to CONTACT_ENDPOINT. Until an endpoint is connected, submissions are
     refused with an honest message instead of a fake success. See HANDOFF.md. */
  var CONTACT_ENDPOINT = ""; // e.g. "https://api.example.com/contact" — set during handoff

  var form = doc.getElementById("contact-form");
  if (form) {
    var status = doc.getElementById("form-status");
    var success = doc.getElementById("form-success");
    var submitBtn = form.querySelector('button[type="submit"]');
    var fields = {
      name: form.querySelector("#name"),
      email: form.querySelector("#email"),
      organization: form.querySelector("#organization"),
      message: form.querySelector("#message")
    };
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function fieldWrap(input) { return input.closest(".field"); }
    function setError(input, msg) {
      var wrap = fieldWrap(input);
      var err = wrap.querySelector(".error-text");
      wrap.classList.toggle("is-invalid", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    }
    function validate(input) {
      var v = input.value.trim(), msg = "";
      if (input === fields.name && !v) msg = "Please enter your name.";
      if (input === fields.email) {
        if (!v) msg = "Please enter your work email.";
        else if (!EMAIL_RE.test(v)) msg = "That email address doesn't look complete.";
      }
      if (input === fields.organization && !v) msg = "Please enter your organization.";
      if (input === fields.message) {
        if (!v) msg = "Tell us a little about what you'd like to improve.";
        else if (v.length < 20) msg = "A sentence or two helps us prepare — please add a bit more detail.";
      }
      setError(input, msg);
      return !msg;
    }
    Object.keys(fields).forEach(function (k) {
      var input = fields[k];
      if (!input) return;
      input.addEventListener("blur", function () { if (input.value.trim() || fieldWrap(input).classList.contains("is-invalid")) validate(input); });
      input.addEventListener("input", function () { if (fieldWrap(input).classList.contains("is-invalid")) validate(input); });
    });
    function showStatus(kind, text) { if (!status) return; status.className = "form-status show " + kind; status.querySelector(".status-text").textContent = text; }
    function hideStatus() { if (status) status.className = "form-status"; }
    function setLoading(on) {
      if (!submitBtn) return;
      submitBtn.classList.toggle("is-loading", on);
      submitBtn.setAttribute("aria-disabled", on ? "true" : "false");
      submitBtn.disabled = on;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideStatus();
      var ok = true, firstBad = null;
      ["name", "email", "organization", "message"].forEach(function (k) {
        if (!validate(fields[k])) { ok = false; if (!firstBad) firstBad = fields[k]; }
      });
      if (!ok) { firstBad.focus(); showStatus("error", "Please check the highlighted fields and try again."); return; }
      var hp = form.querySelector('[name="company_website"]');
      if (hp && hp.value) return;
      if (!CONTACT_ENDPOINT) {
        showStatus("error", "This form isn't connected to a delivery service yet, so your message was not sent. Please try again later.");
        return;
      }
      var payload = {
        name: fields.name.value.trim(), email: fields.email.value.trim(),
        organization: fields.organization.value.trim(), message: fields.message.value.trim(), page: location.href
      };
      setLoading(true);
      fetch(CONTACT_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.hidden = true;
          if (success) { success.classList.add("show"); success.setAttribute("tabindex", "-1"); success.focus(); }
        })
        .catch(function () { showStatus("error", "We couldn't send your message just now. Please try again in a moment."); })
        .finally(function () { setLoading(false); });
    });
  }
})();
