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
        <a class="hero-call" href="tel:115"><span class="pulse"></span><span><b>GỌI CẤP CỨU 115</b><small>Chỉ gọi khi cần cấp cứu khẩn cấp</small></span><strong>→</strong></a>
      </div>
      <div class="hero-symbol" aria-hidden="true"><div class="cross">+</div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div></div>
    </section>

    <section class="search-panel" aria-label="Tìm cơ sở y tế">
      <div class="section-heading">
        <div><span class="eyebrow">TRA CỨU CƠ SỞ Y TẾ</span><h2>Bạn cần tìm ở đâu?</h2></div>
        <span class="live-tag"><i></i> Bản đồ trực tuyến</span>
      </div>
      <form id="search-form" class="search-form">
        <label class="search-input-wrap">
          <span class="input-icon">⌕</span>
          <input id="location-input" type="search" placeholder="Nhập tỉnh/thành, quận/huyện hoặc địa danh..." autocomplete="off" />
        </label>
        <button class="primary-btn" type="submit">Tìm kiếm <span>→</span></button>
        <button class="gps-btn" id="gps-btn" type="button"><span>◎</span> Vị trí của tôi</button>
      </form>
      <div class="search-note">Có thể tìm theo địa phương trên toàn quốc. Kết quả phụ thuộc dữ liệu bản đồ OpenStreetMap và có thể chưa đầy đủ.</div>
      <div id="status" class="status" role="status" aria-live="polite">Nhập địa phương hoặc chọn “Vị trí của tôi” để bắt đầu.</div>
    </section>

    <section class="results-section">
      <div class="results-title">
        <div><span class="eyebrow">KẾT QUẢ TRA CỨU</span><h2 id="results-heading">Cơ sở y tế quanh khu vực</h2></div>
        <span id="result-count" class="result-count">0 địa điểm</span>
      </div>
      <div class="content-grid">
        <div class="map-wrap">
          <div id="map" aria-label="Bản đồ cơ sở y tế"></div>
          <div class="map-legend"><span><i class="legend-user"></i> Vị trí tìm kiếm</span><span><i class="legend-place"></i> Cơ sở y tế</span></div>
        </div>
        <div class="list-wrap">
          <div class="list-toolbar">
            <span>Danh sách cơ sở</span>
            <select id="type-filter" aria-label="Lọc loại cơ sở">
              <option value="all">Tất cả</option>
              <option value="hospital">Bệnh viện</option>
              <option value="clinic">Phòng khám</option>
              <option value="doctors">Phòng mạch / bác sĩ</option>
            </select>
          </div>
          <div id="results-list" class="results-list">
            <div class="empty-state"><div class="empty-icon">⌖</div><b>Chưa có kết quả</b><p>Hãy tìm theo địa phương hoặc chia sẻ vị trí để xem các cơ sở y tế gần đó.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="notice-grid">
      <article class="notice-card emergency-card"><span class="notice-icon">!</span><div><h3>Trường hợp nguy hiểm</h3><p>Nếu người bệnh bất tỉnh, khó thở nghiêm trọng, đau ngực dữ dội, chảy máu nhiều hoặc có dấu hiệu đe dọa tính mạng, hãy gọi <b>115</b> ngay. Không trì hoãn để tìm kiếm trên ứng dụng.</p></div></article>
      <article class="notice-card"><span class="notice-icon soft">✓</span><div><h3>Kiểm tra trước khi di chuyển</h3><p>Gọi cơ sở y tế để xác nhận địa chỉ, chuyên khoa, khả năng tiếp nhận và giờ hoạt động. Khoảng cách hiển thị là ước tính đường thẳng, không phải thời gian di chuyển.</p></div></article>
    </section>
  </main>

  <footer><span>© 2026 Cấp cứu 115 – Công cụ hỗ trợ tra cứu</span><span>Dữ liệu địa điểm: OpenStreetMap · Bản đồ: OpenStreetMap</span></footer>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
`;

const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#results-list");
const countEl = document.querySelector("#result-count");
const headingEl = document.querySelector("#results-heading");
const filterEl = document.querySelector("#type-filter");
const toastEl = document.querySelector("#toast");

const map = L.map("map", { scrollWheelZoom: false }).setView([16.0, 106.0], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
}).addTo(map);

const facilityLayer = L.layerGroup().addTo(map);
let userMarker = null;
let userLocation = null;
let facilities = [];
let toastTimer;

const userIcon = L.divIcon({ className: "custom-marker", html: '<span class="user-pin">●</span>', iconSize: [24, 24], iconAnchor: [12, 12] });
const placeIcon = L.divIcon({ className: "custom-marker", html: '<span class="place-pin">+</span>', iconSize: [30, 30], iconAnchor: [15, 15] });

function setStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${kind}`;
}
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3500);
}
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function distanceKm(a, b) {
  const rad = n => n * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function facilityType(tags = {}) {
  if (tags.amenity === "hospital" || tags.healthcare === "hospital") return "hospital";
  if (tags.amenity === "doctors" || tags.healthcare === "doctor") return "doctors";
  return "clinic";
}
function facilityTypeLabel(type) {
  return type === "hospital" ? "Bệnh viện" : type === "doctors" ? "Phòng mạch / bác sĩ" : "Phòng khám";
}
function getAddress(tags = {}) {
  const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], tags["addr:district"], tags["addr:city"]].filter(Boolean);
  return parts.join(", ") || tags["addr:full"] || "Chưa có địa chỉ chi tiết trên dữ liệu bản đồ";
}
function getPhone(tags = {}) {
  return tags.phone || tags["contact:phone"] || tags["contact:mobile"] || "";
}
function getCoords(element) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return { lat: element.lat, lon: element.lon };
  if (element.center && Number.isFinite(element.center.lat) && Number.isFinite(element.center.lon)) return { lat: element.center.lat, lon: element.center.lon };
  return null;
}
function setUserLocation(coords, label = "Vị trí tìm kiếm") {
  userLocation = { lat: coords.lat, lon: coords.lon };
  if (userMarker) map.removeLayer(userMarker);
  userMarker = L.marker([coords.lat, coords.lon], { icon: userIcon }).addTo(map).bindPopup(`<b>${escapeHtml(label)}</b>`);
  map.setView([coords.lat, coords.lon], 13);
}
function openDirections(place) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
function renderResults() {
  const selected = filterEl.value;
  const filtered = facilities.filter(item => selected === "all" || item.type === selected);
  countEl.textContent = `${filtered.length} địa điểm`;
  listEl.replaceChildren();

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = '<div class="empty-icon">⌖</div><b>Không tìm thấy cơ sở phù hợp</b><p>Thử chọn loại cơ sở khác hoặc tìm ở khu vực lân cận.</p>';
    listEl.append(empty);
    return;
  }

  filtered.forEach((place, index) => {
    const card = document.createElement("article");
    card.className = "facility-card";
    const distance = userLocation ? `${distanceKm(userLocation, place).toFixed(1)} km` : "Chưa xác định";
    const phone = getPhone(place.tags);
    const name = place.name || "Cơ sở y tế chưa có tên";
    card.innerHTML = `
      <div class="facility-top"><span class="facility-type">${facilityTypeLabel(place.type)}</span><span class="distance">${distance}</span></div>
      <h3>${escapeHtml(name)}</h3>
      <p class="facility-address"><span>⌖</span> ${escapeHtml(place.address)}</p>
      <div class="facility-actions">
        ${phone ? `<a class="small-action phone-action" href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">☎ Gọi cơ sở</a>` : '<span class="no-phone">Chưa có số điện thoại</span>'}
        <button class="small-action direction-action" type="button" data-index="${index}">Chỉ đường ↗</button>
      </div>`;
    card.querySelector(".direction-action").addEventListener("click", () => openDirections(place));
    card.addEventListener("click", event => {
      if (event.target.closest("a,button")) return;
      map.setView([place.lat, place.lon], 16);
      place.marker?.openPopup();
    });
    listEl.append(card);
  });
}
function clearFacilities() {
  facilityLayer.clearLayers();
  facilities = [];
}
async function searchFacilities(coords, label) {
  clearFacilities();
  setStatus("Đang tìm bệnh viện và phòng khám quanh khu vực...", "loading");
  headingEl.textContent = `Cơ sở y tế quanh ${label}`;
  const radius = 30000;
  const query = `[out:json][timeout:35];(
    node["amenity"~"^(hospital|clinic|doctors)$"](around:${radius},${coords.lat},${coords.lon});
    way["amenity"~"^(hospital|clinic|doctors)$"](around:${radius},${coords.lat},${coords.lon});
    relation["amenity"~"^(hospital|clinic|doctors)$"](around:${radius},${coords.lat},${coords.lon});
    node["healthcare"~"^(hospital|clinic|doctor)$"](around:${radius},${coords.lat},${coords.lon});
    way["healthcare"~"^(hospital|clinic|doctor)$"](around:${radius},${coords.lat},${coords.lon});
    relation["healthcare"~"^(hospital|clinic|doctor)$"](around:${radius},${coords.lat},${coords.lon});
  );out center tags;`;
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];
  let data = null;
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: `data=${encodeURIComponent(query)}`
      });
      if (!response.ok) throw new Error(`Máy chủ bản đồ trả về lỗi ${response.status}`);
      data = await response.json();
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!data) {
    setStatus("Không kết nối được dữ liệu bản đồ lúc này. Vui lòng thử lại sau.", "error");
    showToast(lastError?.message || "Lỗi kết nối dữ liệu.");
    renderResults();
    return;
  }

  const seen = new Set();
  for (const element of data.elements || []) {
    const point = getCoords(element);
    if (!point) continue;
    const tags = element.tags || {};
    const key = `${element.type}-${element.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const item = {
      ...point,
      id: key,
      name: tags.name || tags["name:vi"] || tags.operator || "",
      address: getAddress(tags),
      tags,
      type: facilityType(tags)
    };
    item.marker = L.marker([item.lat, item.lon], { icon: placeIcon }).addTo(facilityLayer);
    item.marker.bindPopup(`<b>${escapeHtml(item.name || "Cơ sở y tế")}</b><br>${escapeHtml(facilityTypeLabel(item.type))}<br>${escapeHtml(item.address)}`);
    facilities.push(item);
  }

  facilities.sort((a, b) => distanceKm(coords, a) - distanceKm(coords, b));
  renderResults();
  if (facilities.length) {
    setStatus(`Tìm thấy ${facilities.length} cơ sở y tế trong bán kính khoảng 30 km. Hãy gọi xác nhận trước khi đến.`, "success");
    const bounds = L.latLngBounds([[coords.lat, coords.lon], ...facilities.map(p => [p.lat, p.lon])]);
    map.fitBounds(bounds.pad(0.12), { maxZoom: 14 });
  } else {
    setStatus("Chưa tìm thấy dữ liệu cơ sở y tế trong bán kính khoảng 30 km. Thử tìm địa phương lân cận.", "warning");
  }
}
async function geocodeLocation(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({ q: `${query}, Việt Nam`, format: "jsonv2", limit: "1", countrycodes: "vn" }).toString();
  const response = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!response.ok) throw new Error("Không tra cứu được địa danh. Vui lòng thử lại.");
  const results = await response.json();
  if (!results.length) throw new Error("Không tìm thấy địa danh. Hãy nhập rõ hơn, ví dụ: Thủ Dầu Một, Bình Dương.");
  return { lat: Number(results[0].lat), lon: Number(results[0].lon), label: results[0].display_name.split(",").slice(0, 3).join(", ") };
}
function useGPS() {
  if (!("geolocation" in navigator)) {
    setStatus("Trình duyệt này không hỗ trợ định vị GPS.", "error");
    return;
  }
  setStatus("Đang xin quyền truy cập vị trí của bạn...", "loading");
  navigator.geolocation.getCurrentPosition(
    async position => {
      const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
      setUserLocation(coords, "Vị trí của bạn");
      await searchFacilities(coords, "vị trí của bạn");
    },
    error => {
      const messages = {
        1: "Bạn chưa cấp quyền vị trí. Hãy cho phép trình duyệt truy cập vị trí hoặc nhập địa phương.",
        2: "Không xác định được vị trí. Hãy thử lại hoặc nhập địa phương.",
        3: "Định vị quá thời gian. Hãy thử lại."
      };
      setStatus(messages[error.code] || "Không thể lấy vị trí hiện tại.", "error");
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

document.querySelector("#search-form").addEventListener("submit", async event => {
  event.preventDefault();
  const query = document.querySelector("#location-input").value.trim();
  if (!query) {
    showToast("Hãy nhập tỉnh/thành hoặc địa danh cần tìm.");
    document.querySelector("#location-input").focus();
    return;
  }
  try {
    setStatus("Đang xác định địa danh...", "loading");
    const result = await geocodeLocation(query);
    setUserLocation(result, result.label);
    await searchFacilities(result, result.label);
  } catch (error) {
    setStatus(error.message, "error");
  }
});
document.querySelector("#gps-btn").addEventListener("click", useGPS);
filterEl.addEventListener("change", renderResults);

window.addEventListener("resize", () => map.invalidateSize());
setTimeout(() => map.invalidateSize(), 250);
