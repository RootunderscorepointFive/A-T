(function () {
  "use strict";

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = () => reduceMotionQuery.matches;

  const nav = document.getElementById("nav");
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const ham = document.getElementById("hamburger");
  const mob = document.getElementById("mob-menu");
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  const form = document.getElementById("contact-form");
  const formBody = document.getElementById("form-body");
  const formOk = document.getElementById("form-ok");
  const subBtn = document.getElementById("sub-btn");
  const resetBtn = document.getElementById("reset-btn");
  const revealItems = document.querySelectorAll(".rv");
  const mobLinks = mob ? Array.from(mob.querySelectorAll("a")) : [];

  let toastTimer;
  let formStatus = document.getElementById("form-status");
  let lastFocusedElement = null;

  window.addEventListener("error", function (event) {
    console.error("A&T Runtime Error:", event.error);
    showToast("Script error. Please refresh and try again.");
  });

  document.querySelectorAll("[data-email]").forEach(function (el) {
    const fullEmail = "info@aandtgroup.co.za";
    el.textContent = fullEmail;
    const anchor = el.closest("a");
    if (anchor) {
      anchor.href = "mailto:" + fullEmail;
    }
  });

  function closeMenu() {
    if (ham) {
      ham.classList.remove("open");
      ham.setAttribute("aria-expanded", "false");
    }
    if (mob) {
      mob.classList.remove("open");
      mob.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "";
  }

  function openMenu() {
    if (!ham || !mob) {
      return;
    }

    lastFocusedElement = document.activeElement;
    ham.classList.add("open");
    ham.setAttribute("aria-expanded", "true");
    mob.classList.add("open");
    mob.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (mobLinks[0]) {
      mobLinks[0].focus();
    }
  }

  if (ham) {
    ham.addEventListener("click", function () {
      const open = !ham.classList.contains("open");
      if (open) {
        openMenu();
      } else {
        closeMenu();
        ham.focus();
      }
    });
  }

  document.addEventListener("click", function (e) {
    if (ham && mob && !ham.contains(e.target) && !mob.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && ham && ham.classList.contains("open")) {
      closeMenu();
      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
      } else {
        ham.focus();
      }
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (id === "#") {
        e.preventDefault();
        return;
      }

      const target = document.querySelector(id);
      if (!target) {
        return;
      }

      e.preventDefault();
      closeMenu();
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  function updateNavState() {
    if (nav) {
      nav.classList.toggle("scrolled", window.scrollY > 50);
    }

    let currentSection = "";
    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - 140) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + currentSection);
    });
  }

  window.addEventListener("scroll", updateNavState, { passive: true });
  updateNavState();

  if (prefersReducedMotion()) {
    revealItems.forEach(function (item) {
      item.classList.add("in");
    });
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("in");
    });
  }

  function showToast(message) {
    if (!toast || !toastMsg) {
      return;
    }

    toastMsg.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 4500);
  }

  if (form && !formStatus) {
    formStatus = document.createElement("div");
    formStatus.id = "form-status";
    formStatus.className = "form-status";
    formStatus.setAttribute("aria-live", "polite");
    if (subBtn && subBtn.parentNode === form) {
      form.insertBefore(formStatus, subBtn);
    } else {
      form.appendChild(formStatus);
    }
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setErr(fieldId, errId, show) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.toggle("err", show);
    }

    const msg = document.getElementById(errId);
    if (msg) {
      msg.style.display = show ? "block" : "none";
    }
  }

  function setStatus(message, isError) {
    if (!formStatus) {
      return;
    }

    formStatus.textContent = message || "";
    formStatus.classList.toggle("is-error", !!isError);
    formStatus.classList.toggle("is-success", !!message && !isError);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      const canUseAjax =
        window.location.protocol !== "file:" &&
        /^https?:$/.test(window.location.protocol) &&
        typeof window.fetch === "function";

      if (!canUseAjax) {
        return;
      }

      e.preventDefault();

      const nameEl = document.getElementById("fn");
      const emailEl = document.getElementById("fe");
      const msgEl = document.getElementById("fm");
      if (!nameEl || !emailEl || !msgEl) {
        setStatus("Form inputs are missing. Please refresh and try again.", true);
        return;
      }

      const name = nameEl.value.trim();
      const email = emailEl.value.trim();
      const msg = msgEl.value.trim();

      let valid = true;
      setStatus("", false);
      setErr("fn", "fn-err", !name);
      if (!name) valid = false;
      setErr("fe", "fe-err", !validEmail(email));
      if (!validEmail(email)) valid = false;
      setErr("fm", "fm-err", !msg);
      if (!msg) valid = false;

      if (!valid) {
        setStatus("Please correct the highlighted fields.", true);
        return;
      }

      if (!subBtn) {
        return;
      }

      subBtn.disabled = true;
      const originalBtnHtml = subBtn.innerHTML;
      subBtn.innerHTML = '<svg width="15" height="15" style="animation:spin 1s linear infinite" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Sending...';
      setStatus("Sending your message...", false);

      const formData = new FormData(form);
      const controller = new AbortController();
      const timeoutId = setTimeout(function () {
        controller.abort();
      }, 15000);

      fetch(form.action, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: { Accept: "application/json" }
      }).then(function (response) {
        clearTimeout(timeoutId);

        if (response.ok) {
          if (formBody) {
            formBody.style.display = "none";
          }
          if (formOk) {
            formOk.style.display = "block";
          }
          setStatus("", false);
          showToast("Message sent successfully.");
          form.reset();
          return null;
        }

        return response.json().then(function (data) {
          const errorMsg = data && data.errors
            ? data.errors.map(function (err) { return err.message; }).join(", ")
            : "Submission failed";
          setStatus(errorMsg, true);
          showToast(errorMsg);
          return null;
        }).catch(function () {
          const fallbackMsg = "Error: " + response.status;
          setStatus(fallbackMsg, true);
          showToast(fallbackMsg);
          return null;
        });
      }).catch(function (error) {
        clearTimeout(timeoutId);
        console.error("A&T Form: Network error", error);
        setStatus("Connection issue detected. Submitting directly...", true);
        showToast(error.name === "AbortError"
          ? "Request timed out, retrying via direct submit..."
          : "Network error, retrying via direct submit...");
        HTMLFormElement.prototype.submit.call(form);
      }).finally(function () {
        subBtn.disabled = false;
        subBtn.innerHTML = originalBtnHtml;
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (formBody) {
        formBody.style.display = "block";
      }
      if (formOk) {
        formOk.style.display = "none";
      }
      setStatus("", false);
      if (form) {
        form.reset();
      }
    });
  }
})();
