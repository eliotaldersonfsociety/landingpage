// lib/behavior-tracker.ts

let initialized = false;

export function startBehaviorTracking() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  console.log("🧠 Behavior AI Tracker iniciado");

  const startTime = Date.now();
  let lastScrollPercent = 0;
  let clickCount = 0;
  let ctaSeen = false;

  // ✉️ Función para enviar evento a tu API
  const sendEvent = async (data: Record<string, any>) => {
    try {
      await fetch("/api/realtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ts: Date.now(),
          country: "🌎", // opcional: podrías detectar país si tienes geoIP
        }),
      });
    } catch (err) {
      console.warn("📡 Error al enviar evento:", err);
    }
  };

  // 👁️ Verificar si el CTA (botón) está visible
  const checkCtaVisibility = () => {
    // Ajusta este selector a tu botón real (ej: #cta, .buy-button, etc.)
    const cta = document.querySelector("#cta-button, .cta, .buy-button, button[type='submit']");
    if (cta && !ctaSeen) {
      const rect = cta.getBoundingClientRect();
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        ctaSeen = true;
        sendEvent({ type: "behavior", ctaSeen: 1 });
      }
    }
  };

  // 🖱️ Contar clics en toda la página (o en áreas relevantes)
  const handleClick = () => {
    clickCount++;
    sendEvent({ type: "click", clicks: clickCount });
  };

  // 📏 Trackear scroll (solo cada 10% para no saturar)
  const handleScroll = () => {
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;

    const scrollPercent = window.scrollY / scrollHeight;
    if (scrollPercent > lastScrollPercent + 0.1) {
      lastScrollPercent = scrollPercent;
      sendEvent({
        type: "behavior",
        scroll: scrollPercent,
        time: Date.now() - startTime,
        ctaSeen: ctaSeen ? 1 : 0,
      });
    }
    checkCtaVisibility();
  };

  // 🛒 Detectar conversión (ajusta esto a tu lógica real)
  const handleConversion = () => {
    sendEvent({
      type: "behavior",
      converted: 1,
      addToCart: 1,
      scroll: lastScrollPercent,
      time: Date.now() - startTime,
      clicks: clickCount,
      ctaSeen: ctaSeen ? 1 : 0,
    });
  };

  // 🔌 Adjuntar listeners
  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("click", handleClick);

  // Ejemplo: detectar compra si hay un formulario o botón específico
  document.addEventListener("submit", (e) => {
    if (e.target instanceof HTMLFormElement) {
      handleConversion();
    }
  });

  // También puedes escuchar clics en botones de "comprar"
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (
      target.matches?.(".buy-button, #buy-now, [data-conversion]") ||
      (target instanceof HTMLButtonElement && /comprar|buy|checkout/i.test(target.textContent || ""))
    ) {
      handleConversion();
    }
  });

  // 👁️ Verificación inicial (por si el CTA ya está visible al cargar)
  setTimeout(checkCtaVisibility, 500);
}