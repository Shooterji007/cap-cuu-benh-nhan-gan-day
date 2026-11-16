
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

const app = document.querySelector("#app");

app.innerHTML = `
<header class="topbar">
  <a class="brand" href="#" aria-label="Cấp cứu 115 trang chủ">
    <span class="brand-mark">+</span>
    <span><strong>CẤP CỨU 115</strong><small>Hỗ trợ tìm cơ sở y tế</small></span>
  </a>
  <a class="header-call" href="tel:115"><span>☎</span> Gọi 115</a>
</header>

<main>
  <section class="hero">
    <div class="hero-copy">
      <span class="eyebrow">HỖ TRỢ Y TẾ KHẨN CẤP</span>
      <h1>Tìm cơ sở y tế<br><em>gần bạn</em></h1>
      <p>Tìm bệnh viện, phòng khám và xem đường đi dựa trên vị trí hoặc địa phương bạn nhập.</p>
      <a class="hero-call" href="tel:115">
        <span class="pulse"></span>
        <span><b>GỌI CẤP CỨU 115</b><small>Chỉ gọi khi cần cấp cứu khẩn cấp</small></span>
        <strong>→</strong>
      </a>
    </div>
    <div class="hero-symbol" aria-hidden="true">
      <div class="cross">+</div>
      <div class="orbit orbit-one"></div>
      <div class="orbit orbit-two"></div>
    </div>
  </section>

  <section class="search-panel" aria-label="Tìm cơ sở y tế">
    <div class="section-heading">
      <div>
        <span class="eyebrow">TRA CỨU CƠ SỞ Y TẾ</span>
        <h2>Bạn cần tìm ở đâu?</h2>
      </div>
      <span class="live-tag"><i></i> Bản đồ trực tuyến</span>
    </div>

    <form id="search-form" class="search-form">
      <label class="search-input-wrap">
        <span class="input-icon">⌕</span>
        <input id="location-input" type="search"
          placeholder="Nhập tỉnh/thành, quận/huyện hoặc địa danh..."
          autocomplete="off"/>
      </label>
      <button class="primary-btn" type="submit">Tìm kiếm <span>→</span></button>
      <button class="gps-btn" id="gps-btn" type="button">
        <span>◎</span> Vị trí của tôi
      </button>
    </form>

    <div class="search-note">
      Tìm kiếm cơ sở y tế trên toàn quốc bằng dữ liệu OpenStreetMap.
      Kết quả có thể chưa đầy đủ.
    </div>
    <div id="status" class="status" role="status" aria-live="polite">
      Nhập địa phương hoặc chọn “Vị trí của tôi” để bắt đầu.
    </div>
  </section>

  <section class="results-section">
    <div class="results-title">
      <div>
        <span class="eyebrow">KẾT QUẢ TRA CỨU</span>
        <h2 id="results-heading">Cơ sở y tế quanh khu vực</h2>
      </div>
      <span id="result-count" class="result-count">0 địa điểm</span>
    </div>

    <div class="content-grid">
      <div class="map-wrap">
        <div id="map" aria-label="Bản đồ cơ sở y tế"></div>
        <div class="map-legend">
          <span><i class="legend-user"></i> Vị trí tìm kiếm</span>
          <span><i class="legend-place"></i> Cơ sở y tế</span>
        </div>
      </div>

      <div class="list-wrap">
        <div class="list-toolbar">
          <span>Danh sách cơ sở</span>
          <select id="type-filter" aria-label="Lọc loại cơ sở">
            <option value="all">Tất cả cơ sở</option>
            <option value="hospital">Bệnh viện</option>
            <option value="clinic">Phòng khám đa khoa</option>
            <option value="specialist">Phòng khám chuyên khoa</option>
            <option value="health_station">Trạm y tế</option>
            <option value="medical_center">Trung tâm y tế</option>
          </select>
        </div>

        <div id="results-list" class="results-list">
          <div class="empty-state">
            <div class="empty-icon">⌖</div>
            <b>Chưa có kết quả</b>
            <p>Hãy tìm địa phương hoặc chia sẻ vị trí để xem cơ sở y tế gần bạn.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="notice-grid">
    <article class="notice-card emergency-card">
      <span class="notice-icon">!</span>
      <div>
        <h3>Trường hợp nguy hiểm</h3>
        <p>Nếu người bệnh bất tỉnh, khó thở nghiêm trọng, đau ngực dữ dội, chảy máu nhiều hoặc có dấu hiệu đe dọa tính mạng, hãy gọi <b>115</b> ngay. Không trì hoãn để tìm kiếm trên ứng dụng.</p>
      </div>
    </article>

    <article class="notice-card">
      <span class="notice-icon soft">✓</span>
      <div>
        <h3>Kiểm tra trước khi di chuyển</h3>
        <p>Gọi cơ sở y tế để xác nhận địa chỉ, chuyên khoa, khả năng tiếp nhận và giờ hoạt động.</p>
      </div>
    </article>
  </section>
</main>

<footer>
  <span>© 2026 Cấp cứu 115 – Công cụ hỗ trợ tra cứu</span>
  <span>Dữ liệu địa điểm: OpenStreetMap</span>
</footer>

<div id="toast" class="toast" role="status" aria-live="polite"></div>
`;

// ========================================
// 1. KHAI BÁO BIẾN
// ========================================

const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#results-list");
const countEl = document.querySelector("#result-count");
const headingEl = document.querySelector("#results-heading");
const filterEl = document.querySelector("#type-filter");
const toastEl = document.querySelector("#toast");
const inputEl = document.querySelector("#location-input");

const RADIUS = 30000;
const CACHE_TIME = 10 * 60 * 1000;
const MAX_MARKERS = 200;
const MAX_LIST = 100;

let facilities = [];
let userLocation = null;
let userMarker = null;
let toastTimer = null;
let activeSearchId = 0;
let lastGeocodeTime = 0;

const memoryCache = new Map();

const map = L.map("map", {
  scrollWheelZoom: false
}).setView([16, 106], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const facilityLayer = L.layerGroup().addTo(map);

const userIcon = L.divIcon({
  className: "custom-marker",
  html: '<span class="user-pin">●</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const placeIcon = L.divIcon({
  className: "custom-marker",
  html: '<span class="place-pin">+</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// ========================================
// 2. TIỆN ÍCH
// ========================================

function setStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${kind}`;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3500);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function distanceKm(a, b) {
  const rad = n => n * Math.PI / 180;

  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) *
    Math.cos(rad(b.lat)) *
    Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(
    Math.sqrt(x),
    Math.sqrt(1 - x)
  );
}

function getCoords(element) {
  if (
    Number.isFinite(element.lat) &&
    Number.isFinite(element.lon)
  ) {
    return {
      lat: element.lat,
      lon: element.lon
    };
  }

  if (
    element.center &&
    Number.isFinite(element.center.lat) &&
    Number.isFinite(element.center.lon)
  ) {
    return {
      lat: element.center.lat,
      lon: element.center.lon
    };
  }

  return null;
}

// ========================================
// 3. PHÂN LOẠI 5 NHÓM CƠ SỞ Y TẾ
// ========================================

function facilityType(tags = {}) {
  const amenity = tags.amenity || "";
  const healthcare = tags.healthcare || "";

  if (
    amenity === "hospital" ||
    healthcare === "hospital"
  ) {
    return "hospital";
  }

  if (
    healthcare === "health_post" ||
    healthcare === "health_station"
  ) {
    return "health_station";
  }

  if (
    ["centre", "health_centre", "health_center"].includes(healthcare)
  ) {
    return "medical_center";
  }

  if (
    amenity === "doctors" ||
    healthcare === "doctor"
  ) {
    return "specialist";
  }

  if (
    amenity === "clinic" ||
    healthcare === "clinic"
  ) {
    return "clinic";
  }

  return "medical_center";
}

function facilityTypeLabel(type) {
  const labels = {
    hospital: "Bệnh viện",
    clinic: "Phòng khám đa khoa",
    specialist: "Phòng khám chuyên khoa / bác sĩ",
    health_station: "Trạm y tế",
    medical_center: "Trung tâm y tế"
  };

  return labels[type] || "Cơ sở y tế";
}

// ========================================
// 4. ĐỊA CHỈ VÀ SỐ ĐIỆN THOẠI
// ========================================

function getAddress(tags = {}) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:district"],
    tags["addr:city"],
    tags["addr:province"]
  ].filter(Boolean);

  return parts.join(", ") ||
    tags["addr:full"] ||
    "Chưa có địa chỉ chi tiết trên bản đồ";
}

function getPhone(tags = {}) {
  return (
    tags.phone ||
    tags["contact:phone"] ||
    tags["contact:mobile"] ||
    ""
  );
}

// ========================================
// 5. VỊ TRÍ VÀ BẢN ĐỒ
// ========================================

function setUserLocation(coords, label = "Vị trí tìm kiếm") {
  userLocation = {
    lat: coords.lat,
    lon: coords.lon
  };

  if (userMarker) {
    map.removeLayer(userMarker);
  }

  userMarker = L.marker(
    [coords.lat, coords.lon],
    { icon: userIcon }
  )
    .addTo(map)
    .bindPopup(`<b>${escapeHtml(label)}</b>`);

  map.setView([coords.lat, coords.lon], 13);
}

function openDirections(place) {
  const url =
    `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

function clearFacilities() {
  facilityLayer.clearLayers();
  facilities = [];
}

// ========================================
// 6. BỘ NHỚ TẠM KẾT QUẢ TÌM KIẾM
// ========================================

function cacheKey(coords) {
  return `${coords.lat.toFixed(3)}_${coords.lon.toFixed(3)}_${RADIUS}`;
}

function getCachedData(coords) {
  const key = cacheKey(coords);
  const item = memoryCache.get(key);

  if (!item) return null;

  if (Date.now() - item.time > CACHE_TIME) {
    memoryCache.delete(key);
    return null;
  }

  return item.data;
}

function saveCachedData(coords, data) {
  const key = cacheKey(coords);

  memoryCache.set(key, {
    time: Date.now(),
    data
  });

  if (memoryCache.size > 20) {
    const oldest = memoryCache.keys().next().value;
    memoryCache.delete(oldest);
  }
}

// ========================================
// 7. TRUY VẤN OPENSTREETMAP TỐI ƯU
// ========================================

function createQuery(coords) {
  return `
[out:json][timeout:20];
(
  nwr["amenity"~"^(hospital|clinic|doctors)$"]
    (around:${RADIUS},${coords.lat},${coords.lon});

  nwr["healthcare"~"^(hospital|clinic|doctor|health_post|health_station|health_centre|health_center|centre)$"]
    (around:${RADIUS},${coords.lat},${coords.lon});
);
out center tags;
`;
}

async function fetchFromEndpoint(endpoint, query, controller) {
  const timer = setTimeout(() => {
    controller.abort();
  }, 18000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Máy chủ lỗi ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFacilities(coords) {
  const cached = getCachedData(coords);

  if (cached) {
    return {
      data: cached,
      cached: true
    };
  }

  const query = createQuery(coords);

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];

  const controllers = endpoints.map(
    () => new AbortController()
  );

  const requests = endpoints.map((endpoint, index) =>
    fetchFromEndpoint(
      endpoint,
      query,
      controllers[index]
    )
  );

  try {
    const data = await Promise.any(requests);

    controllers.forEach(controller => {
      controller.abort();
    });

    saveCachedData(coords, data);

    return {
      data,
      cached: false
    };
  } catch (error) {
    controllers.forEach(controller => {
      controller.abort();
    });

    throw new Error(
      "Các máy chủ bản đồ hiện không phản hồi. Vui lòng thử lại."
    );
  }
}

// ========================================
// 8. HIỂN THỊ KẾT QUẢ
// ========================================

function renderResults() {
  const selected = filterEl.value;

  const filtered = facilities.filter(item =>
    selected === "all" || item.type === selected
  );

  countEl.textContent = `${filtered.length} địa điểm`;

  listEl.replaceChildren();

  if (!filtered.length) {
    const empty = document.createElement("div");

    empty.className = "empty-state";

    empty.innerHTML = `
      <div class="empty-icon">⌖</div>
      <b>Không tìm thấy cơ sở phù hợp</b>
      <p>Thử chọn loại cơ sở khác hoặc tìm ở khu vực lân cận.</p>
    `;

    listEl.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered.slice(0, MAX_LIST).forEach(place => {
    const card = document.createElement("article");

    card.className = "facility-card";

    const distance = userLocation
      ? `${distanceKm(userLocation, place).toFixed(1)} km`
      : "Chưa xác định";

    const phone = getPhone(place.tags);
    const name = place.name || "Cơ sở y tế chưa có tên";

    card.innerHTML = `
      <div class="facility-top">
        <span class="facility-type">
          ${escapeHtml(facilityTypeLabel(place.type))}
        </span>
        <span class="distance">${distance}</span>
      </div>

      <h3>${escapeHtml(name)}</h3>

      <p class="facility-address">
        <span>⌖</span> ${escapeHtml(place.address)}
      </p>

      <div class="facility-actions">
        ${
          phone
            ? `<a class="small-action phone-action"
                 href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">
                 ☎ Gọi cơ sở
               </a>`
            : '<span class="no-phone">Chưa có số điện thoại</span>'
        }

        <button class="small-action direction-action" type="button">
          Chỉ đường ↗
        </button>
      </div>
    `;

    card.querySelector(".direction-action")
      .addEventListener("click", () => openDirections(place));

    card.addEventListener("click", event => {
      if (event.target.closest("a,button")) return;

      map.setView([place.lat, place.lon], 16);
      place.marker?.openPopup();
    });

    fragment.append(card);
  });

  listEl.append(fragment);

  if (filtered.length > MAX_LIST) {
    const note = document.createElement("p");

    note.className = "search-note";
    note.textContent =
      `Đang hiển thị ${MAX_LIST} cơ sở gần nhất trong tổng số ${filtered.length} cơ sở.`;

    listEl.append(note);
  }
}

// ========================================
// 9. TÌM KIẾM CƠ SỞ Y TẾ
// ========================================

async function searchFacilities(coords, label) {
  const searchId = ++activeSearchId;

  clearFacilities();

  setStatus(
    "Đang tìm cơ sở y tế gần bạn...",
    "loading"
  );

  headingEl.textContent = `Cơ sở y tế quanh ${label}`;

  try {
    const result = await fetchFacilities(coords);

    if (searchId !== activeSearchId) return;

    const data = result.data;

    const seen = new Set();

    const elements = data.elements || [];

    for (const element of elements) {
      const point = getCoords(element);

      if (!point) continue;

      const tags = element.tags || {};

      const key = `${element.type}-${element.id}`;

      if (seen.has(key)) continue;

      seen.add(key);

      const item = {
        ...point,
        id: key,
        name:
          tags.name ||
          tags["name:vi"] ||
          tags.operator ||
          "",
        address: getAddress(tags),
        tags,
        type: facilityType(tags),
        marker: null
      };

      facilities.push(item);
    }

    facilities.sort((a, b) =>
      distanceKm(coords, a) - distanceKm(coords, b)
    );

    // Chỉ tạo tối đa 200 marker để giảm tải bản đồ
    facilities.slice(0, MAX_MARKERS).forEach(item => {
      item.marker = L.marker(
        [item.lat, item.lon],
        { icon: placeIcon }
      ).addTo(facilityLayer);

      item.marker.bindPopup(`
        <b>${escapeHtml(item.name || "Cơ sở y tế")}</b>
        <br>
        ${escapeHtml(facilityTypeLabel(item.type))}
        <br>
        ${escapeHtml(item.address)}
      `);
    });

    renderResults();

    if (facilities.length) {
      setStatus(
        result.cached
          ? `Đã tải ${facilities.length} cơ sở từ bộ nhớ tạm.`
          : `Tìm thấy ${facilities.length} cơ sở y tế trong bán kính 30 km. Hãy gọi xác nhận trước khi đến.`,
        "success"
      );

      const bounds = L.latLngBounds([
        [coords.lat, coords.lon],
        ...facilities.slice(0, MAX_MARKERS).map(p => [
          p.lat,
          p.lon
        ])
      ]);

      map.fitBounds(bounds.pad(0.12), {
        maxZoom: 14
      });
    } else {
      setStatus(
        "Chưa tìm thấy cơ sở y tế trong bán kính 30 km. Thử địa phương lân cận.",
        "warning"
      );
    }
  } catch (error) {
    if (searchId !== activeSearchId) return;

    setStatus(error.message, "error");
    showToast(error.message);
  }
}

// ========================================
// 10. TÌM ĐỊA DANH
// ========================================

async function geocodeLocation(query) {
  const elapsed = Date.now() - lastGeocodeTime;

  if (elapsed < 1100) {
    await new Promise(resolve =>
      setTimeout(resolve, 1100 - elapsed)
    );
  }

  lastGeocodeTime = Date.now();

  const url = new URL(
    "https://nominatim.openstreetmap.org/search"
  );

  url.search = new URLSearchParams({
    q: `${query}, Việt Nam`,
    format: "jsonv2",
    limit: "1",
    countrycodes: "vn"
  }).toString();

  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(
        "Không tra cứu được địa danh. Vui lòng thử lại."
      );
    }

    const results = await response.json();

    if (!results.length) {
      throw new Error(
        "Không tìm thấy địa danh. Hãy nhập rõ hơn, ví dụ: Thủ Dầu Một, Bình Dương."
      );
    }

    return {
      lat: Number(results[0].lat),
      lon: Number(results[0].lon),
      label: results[0].display_name
        .split(",")
        .slice(0, 3)
        .join(", ")
    };
  } finally {
    clearTimeout(timer);
  }
}

// ========================================
// 11. ĐỊNH VỊ GPS
// ========================================

function useGPS() {
  if (!("geolocation" in navigator)) {
    setStatus(
      "Trình duyệt không hỗ trợ định vị GPS.",
      "error"
    );
    return;
  }

  setStatus(
    "Đang xác định vị trí của bạn...",
    "loading"
  );

  navigator.geolocation.getCurrentPosition(
    async position => {
      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };

      setUserLocation(coords, "Vị trí của bạn");

      await searchFacilities(
        coords,
        "vị trí của bạn"
      );
    },

    error => {
      const messages = {
        1: "Bạn chưa cấp quyền vị trí. Hãy cho phép trình duyệt truy cập GPS.",
        2: "Không xác định được vị trí. Hãy thử lại hoặc nhập địa phương.",
        3: "Định vị quá thời gian. Hãy thử lại."
      };

      setStatus(
        messages[error.code] ||
        "Không thể lấy vị trí hiện tại.",
        "error"
      );
    },

    {
      enableHighAccuracy: false,
      timeout: 12000,
      maximumAge: 300000
    }
  );
}

// ========================================
// 12. SỰ KIỆN TÌM KIẾM
// ========================================

document
  .querySelector("#search-form")
  .addEventListener("submit", async event => {
    event.preventDefault();

    const query = inputEl.value.trim();

    if (!query) {
      showToast(
        "Hãy nhập tỉnh/thành hoặc địa danh cần tìm."
      );

      inputEl.focus();
      return;
    }

    try {
      setStatus(
        "Đang xác định địa danh...",
        "loading"
      );

      const result = await geocodeLocation(query);

      setUserLocation(result, result.label);

      await searchFacilities(
        result,
        result.label
      );
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

document
  .querySelector("#gps-btn")
  .addEventListener("click", useGPS);

filterEl.addEventListener(
  "change",
  renderResults
);

window.addEventListener("resize", () => {
  map.invalidateSize();
});

setTimeout(() => {
  map.invalidateSize();
}, 250);
