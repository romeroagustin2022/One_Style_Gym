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

  setMapStatus("Vista previa cargada por dirección. Cuando tengas tu API Key, el mapa puede pasar a la versión interactiva con marcador personalizado.");
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

  window.addEventListener("scroll", updateNavbarOnScroll, { passive: true });
});
