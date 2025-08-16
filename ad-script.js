/* script.js
   Dynamic Automated Ads
   Sponsored by It Is Unique Official
   -----------------------------------
   - Loads styles.css dynamically with fallback
   - Parses ad-data.xml (width, height, weight, rotation-interval)
   - Weighted ad selection
   - Auto rotation (interval from XML)
   - Impression & click counters stored in localStorage
   - Preload images
   - Detailed, styled console summary
*/

(function () {
  const CSS_HREF = "https://ads.itisuniqueofficial.com/ad-styles.css";
  const XML_PATH = "https://ads.itisuniqueofficial.com/ad-data.xml";
  const STORAGE_KEY = "ad_metrics_v1"; // localStorage key for metrics

  // Utility: safe query text
  const qText = (el, sel, def = "") => el.querySelector(sel)?.textContent?.trim() ?? def;

  // Utility: stable id for each ad
  const adIdFrom = (adEl) => {
    const href = qText(adEl, "href", "");
    const title = qText(adEl, "ad-title", "");
    let str = href + "||" + title;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `ad_${Math.abs(hash)}`;
  };

  // Load CSS dynamically with fallback
  function loadCSS(href) {
    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve(true);
      link.onerror = () => {
        console.warn(`styles.css failed to load — applying fallback CSS`);
        const fallback = document.createElement("style");
        fallback.textContent = `
          .ad-container{width:100%;margin:20px 0;font-family:Arial,sans-serif;display:flex;justify-content:center}
          .ad-card{width:100%;max-width:600px;border:1px solid #ddd;border-radius:8px;background:#fff;padding:10px;box-shadow:0 2px 6px rgba(0,0,0,0.05)}
          .ad-top{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#f8f9fa;border-bottom:1px solid #eee}
          .ad-body{display:flex;gap:12px;padding:10px;text-decoration:none;color:inherit}
          .ad-icon{width:80px;height:80px;object-fit:cover;border-radius:6px}
          .ad-title{font-size:16px;color:#0066cc;margin:0}
        `;
        document.head.appendChild(fallback);
        resolve(false);
      };
      document.head.appendChild(link);
    });
  }

  // Local storage metrics
  function loadMetrics() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }
  function saveMetrics(metrics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
    } catch (e) {
      console.warn("Failed to save metrics to localStorage", e);
    }
  }
  function ensureMetric(metrics, id) {
    if (!metrics[id]) {
      metrics[id] = { impressions: 0, clicks: 0, title: "", href: "" };
    }
    return metrics[id];
  }

  // Preload an image
  function preloadImage(src) {
    if (!src) return;
    const img = new Image();
    img.src = src;
  }

  // Fetch ads XML
  async function fetchAds(xmlPath) {
    const res = await fetch(xmlPath, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");
    const ads = Array.from(xml.getElementsByTagName("ad"));
    const rotationInterval = parseInt(xml.documentElement.getAttribute("rotation-interval")) || 0;
    return { ads, rotationInterval };
  }

  // Weighted ad selection
  function pickAdWeighted(ads) {
    const weighted = [];
    ads.forEach(ad => {
      const w = Math.max(1, parseInt(ad.getAttribute("weight")) || 1);
      for (let i = 0; i < w; i++) weighted.push(ad);
    });
    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  // Render ad into container
  function renderAdInto(container, adEl, metrics) {
    const href = qText(adEl, "href", "#");
    const sponsorUrl = qText(adEl, "sponsor-url", "#");
    const sponsorName = qText(adEl, "sponsor-name", "It Is Unique Official");
    const src = qText(adEl, "src", "https://img.itisuniqueofficial.com/placeholder.png");
    const alt = qText(adEl, "alt", sponsorName + " ad");
    const width = qText(adEl, "width", "80");
    const height = qText(adEl, "height", "80");
    const adTitle = qText(adEl, "ad-title", "Untitled Ad");
    const adDesc = qText(adEl, "ad-desc", "");
    const adLink = qText(adEl, "ad-link", href);

    const id = adIdFrom(adEl);
    const metric = ensureMetric(metrics, id);
    metric.title = adTitle;
    metric.href = href;

    const adCard = document.createElement("aside");
    adCard.className = "ad-card";
    adCard.setAttribute("aria-label", `Sponsored Ad: ${adTitle}`);

    adCard.innerHTML = `
      <header class="ad-top">
        <span class="ad-sponsor">Sponsored · <a href="${sponsorUrl}" target="_blank" rel="noopener nofollow">${sponsorName}</a></span>
        <button class="ad-close" aria-label="Dismiss ad">×</button>
      </header>
      <a class="ad-body" href="${href}" title="${adTitle}" target="_blank" rel="noopener sponsored">
        <img class="ad-icon" src="${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy" />
        <div class="ad-text">
          <h3 class="ad-title">${adTitle}</h3>
          <p class="ad-desc">${adDesc}</p>
          <span class="ad-link">${adLink}</span>
        </div>
      </a>
    `;

    // Close button
    adCard.querySelector(".ad-close").addEventListener("click", () => adCard.remove());

    // Click tracking
    adCard.querySelector(".ad-body").addEventListener("click", () => {
      metric.clicks++;
      saveMetrics(metrics);
    });

    // Impression tracking
    const img = adCard.querySelector(".ad-icon");
    const countImpression = () => {
      metric.impressions++;
      saveMetrics(metrics);
    };
    if (img.complete) countImpression();
    else img.addEventListener("load", countImpression, { once: true });

    container.innerHTML = "";
    container.appendChild(adCard);

    return {
      id, adTitle, sponsorName, sponsorUrl, href, src,
      size: `${width}x${height}`,
      impressions: metric.impressions,
      clicks: metric.clicks
    };
  }

  // Console Report
  function consoleReport(detailsList) {
    console.groupCollapsed("%c✔ Ads Loaded Report", "color:green;font-weight:700;font-size:14px");
    console.log("%cSponsored by: It Is Unique Official", "color:blue;font-weight:600");
    console.log(`%cTotal placements: ${detailsList.length}`, "color:purple");

    const tableRows = detailsList.map((d, i) => ({
      "#": i + 1,
      Title: d.adTitle,
      Sponsor: d.sponsorName,
      "Ad Link": d.href,
      "Image": d.src,
      "Size": d.size,
      Impressions: d.impressions,
      Clicks: d.clicks
    }));
    console.table(tableRows);
    console.groupEnd();
  }

  // Boot
  async function boot() {
    await loadCSS(CSS_HREF);
    let metrics = loadMetrics();
    let { ads, rotationInterval } = await fetchAds(XML_PATH);

    const containers = document.querySelectorAll(".ad-container");
    if (!ads.length) {
      containers.forEach(c => c.innerHTML = "<p>No ads available.</p>");
      return;
    }

    function renderAll() {
      const details = [];
      containers.forEach(container => {
        const ad = pickAdWeighted(ads);
        preloadImage(qText(ad, "src", ""));
        details.push(renderAdInto(container, ad, metrics));
      });
      consoleReport(details);
    }

    renderAll();

    if (rotationInterval > 0) {
      setInterval(renderAll, rotationInterval * 1000);
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();