const gymConfig = window.GYM_CONFIG || {};

function setMapStatus(message) {
  const status = document.getElementById("mapStatus");
  if (status) {
    status.textContent = message;
  }
}

function updateNavbarOnScroll() {
  const navbar = document.getElementById("mainNav");
  if (!navbar) return;

  navbar.classList.toggle("navbar-scrolled", window.scrollY > 24);
}

function initRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal, .reveal-up");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealElements.forEach((element) => observer.observe(element));
}

function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = Number(counter.dataset.target || 0);
      const duration = 1400;
      const start = performance.now();

      function step(timestamp) {
        const progress = Math.min((timestamp - start) / duration, 1);
        counter.textContent = Math.floor(progress * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(step);
      observer.unobserve(counter);
    });
  }, { threshold: 0.65 });

  counters.forEach((counter) => observer.observe(counter));
}

function initSmoothNavBehavior() {
  const navLinks = document.querySelectorAll(".navbar .nav-link");
  const navbarCollapse = document.querySelector(".navbar-collapse");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        new bootstrap.Collapse(navbarCollapse).hide();
      }
    });
  });
}

function initHeroParallax() {
  const hero = document.querySelector(".hero-section");
  if (!hero) return;

  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.25;
    hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
  }, { passive: true });
}

/* ============================================================
   BOTÓN FLOTANTE DE WHATSAPP
   ============================================================ */

function buildWhatsAppLink() {
  const wa = gymConfig.whatsapp || {};
  const phone = String(wa.phone || "").replace(/\D/g, ""); // solo dígitos
  if (!phone) return "";

  const message =
    wa.message ||
    `¡Hola ${gymConfig.gymName || ""}! Quiero consultar por los planes y horarios.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function initWhatsAppButton() {
  const url = buildWhatsAppLink();

  // Si no hay número cargado, no mostramos nada (evita links rotos)
  if (!url) {
    console.warn("WhatsApp: falta configurar gymConfig.whatsapp.phone");
    return;
  }

  const link = document.createElement("a");
  link.className = "whatsapp-float";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", "Escribinos por WhatsApp");
  link.setAttribute("title", "Escribinos por WhatsApp");

  link.innerHTML = `
    <span class="whatsapp-float__icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" focusable="false">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.19 1.6 6.02L4 29l8.13-1.55a12 12 0 0 0 3.9.65h.01C22.68 28.1 28.08 22.7 28.08 16.06 28.08 8.4 22.68 3 16.04 3zm0 22.02h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-4.82.92.93-4.7-.24-.38a9.86 9.86 0 0 1-1.51-5.22c0-5.46 4.45-9.9 9.92-9.9 2.65 0 5.14 1.03 7.01 2.9a9.83 9.83 0 0 1 2.9 7c0 5.47-4.45 9.91-9.9 9.91zm5.44-7.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/>
      </svg>
    </span>
    <span class="whatsapp-float__tooltip">Escribinos</span>
  `;

  document.body.appendChild(link);

  // Aparece suavemente después de pasar el hero
  const toggleVisibility = () => {
    link.classList.toggle("is-visible", window.scrollY > 200);
  };

  toggleVisibility();
  window.addEventListener("scroll", toggleVisibility, { passive: true });
}

function renderMapFallback() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  const location = gymConfig.location || { lat: -32.0690, lng: -64.5363 };
  const zoom = gymConfig.zoom || 15;
  const query = gymConfig.mapQuery || gymConfig.address || `${location.lat},${location.lng}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;

  mapContainer.innerHTML = `
    <iframe
      title="Mapa de ${gymConfig.gymName || "Mi gimnasio"}"
      src="${embedUrl}"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      allowfullscreen>
    </iframe>
  `;

  setMapStatus("Vista previa cargada por dirección.");
}

function loadGoogleMapsScript() {
  const apiKey = gymConfig.apiKey;

  if (!apiKey || apiKey === "PON_AQUI_TU_API_KEY") {
    renderMapFallback();
    return;
  }

  window.initMap = initMap;

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initMap`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    renderMapFallback();
    setMapStatus("No se pudo cargar Google Maps. Revisá si la API Key es válida y si la API de Maps JavaScript está habilitada.");
  };

  document.body.appendChild(script);
}

function initMap() {
  const mapContainer = document.getElementById("map");
  const location = gymConfig.location || { lat: -34.6037, lng: -58.3816 };
  const gymName = gymConfig.gymName || "Mi gimnasio";
  const zoom = gymConfig.zoom || 15;

  if (!mapContainer || !window.google || !window.google.maps) {
    renderMapFallback();
    return;
  }

  const map = new google.maps.Map(mapContainer, {
    center: location,
    zoom,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#111111" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#111111" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#c9c9c9" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#232323" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b0b0b" }] }
    ]
  });

  const marker = new google.maps.Marker({
    position: location,
    map,
    title: gymName,
    animation: google.maps.Animation.DROP
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="padding: 8px 10px; min-width: 180px;">
        <strong>${gymName}</strong><br>
        <span>${gymConfig.address || "Definí aquí la dirección de tu gimnasio"}</span>
      </div>
    `
  });

  marker.addListener("click", () => infoWindow.open({ anchor: marker, map }));
  infoWindow.open({ anchor: marker, map });
  setMapStatus(`Ubicación cargada: ${gymConfig.address || `${location.lat}, ${location.lng}`}`);
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbarOnScroll();
  initRevealAnimations();
  animateCounters();
  initSmoothNavBehavior();
  initHeroParallax();
  loadGoogleMapsScript();
  initWhatsAppButton();   // 👈 ESTA LÍNEA FALTABA

  window.addEventListener("scroll", updateNavbarOnScroll, { passive: true });
});
