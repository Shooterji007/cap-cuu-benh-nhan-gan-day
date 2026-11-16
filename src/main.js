import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

const app = document.querySelector("#app");
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="Cấp cứu 115 trang chủ"><span class="brand-mark">+</span><span><strong>CẤP CỨU 115</strong><small>Hỗ trợ tìm cơ sở y tế</small></span></a>
    <a class="header-call" href="tel:115"><span>☎</span> Gọi 115</a>
  </header>
  <main>
    <section class="hero"><div class="hero-copy"><span class="eyebrow">HỖ TRỢ Y TẾ KHẨN CẤP</span><h1>Tìm cơ sở y tế<br><em>gần bạn</em></h1><p>Tìm bệnh viện, phòng khám và xem đường đi dựa trên vị trí hoặc địa phương bạn nhập.</p><a class="hero-call" href="tel:115"><span class="pulse"></span><span><b>GỌI CẤP CỨU 115</b><small>Chỉ gọi khi cần cấp cứu khẩn cấp</small></span><strong>→</strong></a></div><div class="hero-symbol" aria-hidden="true"><div class="cross">+</div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div></div></section>
    <section class="search-panel" aria-label="Tìm cơ sở y tế"><div class="section-heading"><div><span class="eyebrow">TRA CỨU CƠ SỞ Y TẾ</span><h2>Bạn cần tìm ở đâu?</h2></div><span class="live-tag"><i></i> Bản đồ trực tuyến</span></div>
      <form id="search-form" class="search-form"><label class="search-input-wrap"><span class="input-icon">⌕</span><input id="location-input" type="search" placeholder="Nhập tỉnh/thành, quận/huyện hoặc địa danh..." autocomplete="off" /></label><button class="primary-btn" type="submit">Tìm kiếm <span>→</span></button><button class="gps-btn" id="gps-btn" type="button"><span>◎</span> Vị trí của tôi</button></form>
      <div class="search-note">Dữ liệu cơ sở lấy từ OpenStreetMap và danh bạ đã được xác minh. Thông tin có thể chưa đầy đủ.</div><div id="status" class="status" role="status" aria-live="polite">Nhập địa phương hoặc chọn “Vị trí của tôi” để bắt đầu.</div>
    </section>
    <section class="results-section"><div class="results-title"><div><span class="eyebrow">KẾT QUẢ TRA CỨU</span><h2 id="results-heading">Cơ sở y tế quanh khu vực</h2></div><span id="result-count" class="result-count">0 địa điểm</span></div>
      <div class="content-grid"><div class="map-wrap"><div id="map" aria-label="Bản đồ cơ sở y tế"></div><div class="map-legend"><span><i class="legend-user"></i> Vị trí tìm kiếm</span><span><i class="legend-place"></i> Cơ sở y tế</span></div></div>
        <div class="list-wrap"><div class="list-toolbar"><span>Danh sách cơ sở</span><select id="type-filter" aria-label="Lọc loại cơ sở"><option value="all">Tất cả</option><option value="hospital">Bệnh viện</option><option value="clinic">Phòng khám</option><option value="doctors">Phòng mạch / bác sĩ</option></select></div><div id="results-list" class="results-list"><div class="empty-state"><div class="empty-icon">⌖</div><b>Chưa có kết quả</b><p>Hãy tìm theo địa phương hoặc chia sẻ vị trí để xem các cơ sở y tế gần đó.</p></div></div></div>
      </div>
    </section>
    <section class="report-panel" id="report-panel"><div class="report-heading"><span class="eyebrow">CÙNG CẬP NHẬT DANH BẠ</span><h2>Bổ sung số điện thoại hoặc thông tin cơ sở</h2><p>Thông tin gửi lên sẽ ở trạng thái chờ duyệt. Chỉ dữ liệu được quản trị viên xác minh mới hiển thị công khai.</p></div>
      <form id="report-form" class="report-form">
        <label>Tên bệnh viện / phòng khám<input name="facility_name" required maxlength="180" placeholder="Ví dụ: Bệnh viện Đa khoa ..." /></label>
        <div class="report-two"><label>Số điện thoại<input name="phone" required maxlength="40" inputmode="tel" placeholder="Ví dụ: 0274 3..." /></label><label>Website (nếu có)<input name="website" type="url" maxlength="300" placeholder="https://..." /></label></div>
        <label>Địa chỉ<input name="address" required maxlength="300" placeholder="Số nhà, đường, phường/xã, tỉnh/thành" /></label>
        <label>Nguồn xác minh số điện thoại<input name="source_url" type="url" maxlength="500" placeholder="Trang web chính thức / trang liên hệ của cơ sở" /></label>
        <label>Ghi chú (không bắt buộc)<textarea name="note" rows="2" maxlength="500" placeholder="Ví dụ: Số tổng đài, giờ tiếp nhận... "></textarea></label>
        <button class="primary-btn report-submit" type="submit">Gửi thông tin chờ duyệt →</button><p id="report-status" class="report-status" role="status" aria-live="polite"></p>
      </form>
      <p class="report-footnote">Không gửi thông tin bệnh án hoặc dữ liệu cá nhân của người bệnh. Số điện thoại chưa xác minh sẽ không được công khai.</p>
    </section>
    <section class="notice-grid"><article class="notice-card emergency-card"><span class="notice-icon">!</span><div><h3>Trường hợp nguy hiểm</h3><p>Nếu người bệnh bất tỉnh, khó thở nghiêm trọng, đau ngực dữ dội, chảy máu nhiều hoặc có dấu hiệu đe dọa tính mạng, hãy gọi <b>115</b> ngay. Không trì hoãn để tìm kiếm trên ứng dụng.</p></div></article><article class="notice-card"><span class="notice-icon soft">✓</span><div><h3>Kiểm tra trước khi di chuyển</h3><p>Gọi cơ sở y tế để xác nhận địa chỉ, chuyên khoa, khả năng tiếp nhận và giờ hoạt động. Khoảng cách hiển thị là ước tính đường thẳng, không phải thời gian di chuyển.</p></div></article></section>
  </main>
  <footer><span>© 2026 Cấp cứu 115 – Công cụ hỗ trợ tra cứu</span><span>Dữ liệu địa điểm: OpenStreetMap · Bản đồ: OpenStreetMap</span></footer><div id="toast" class="toast" role="status" aria-live="polite"></div>
`;

const statusEl = document.querySelector("#status");
const listEl = document.querySelector("#results-list");
const countEl = document.querySelector("#result-count");
const headingEl = document.querySelector("#results-heading");
const filterEl = document.querySelector("#type-filter");
const toastEl = document.querySelector("#toast");
const reportForm = document.querySelector("#report-form");
const reportStatus = document.querySelector("#report-status");

const map = L.map("map", { scrollWheelZoom: false }).setView([16.0, 106.0], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>' }).addTo(map);
const facilityLayer = L.layerGroup().addTo(map);
let userMarker = null;
let userLocation = null;
let facilities = [];
let toastTimer;
const userIcon = L.divIcon({ className: "custom-marker", html: '<span class="user-pin">●</span>', iconSize: [24, 24], iconAnchor: [12, 12] });
const placeIcon = L.divIcon({ className: "custom-marker", html: '<span class="place-pin">+</span>', iconSize: [30, 30], iconAnchor: [15, 15] });

function setStatus(message, kind = "") { statusEl.textContent = message; statusEl.className = `status ${kind}`; }
function showToast(message) { toastEl.textContent = message; toastEl.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3500); }
function escapeHtml(value = "") { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function distanceKm(a, b) { const rad = n => n * Math.PI / 180; const dLat = rad(b.lat - a.lat); const dLon = rad(b.lon - a.lon); const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2; return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)); }
function facilityType(tags = {}) { if (tags.amenity === "hospital" || tags.healthcare === "hospital") return "hospital"; if (tags.amenity === "doctors" || tags.healthcare === "doctor") return "doctors"; return "clinic"; }
function facilityTypeLabel(type) { return type === "hospital" ? "Bệnh viện" : type === "doctors" ? "Phòng mạch / bác sĩ" : "Phòng khám"; }
function getAddress(tags = {}) { const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], tags["addr:district"], tags["addr:city"]].filter(Boolean); return parts.join(", ") || tags["addr:full"] || "Chưa có địa chỉ chi tiết trên dữ liệu bản đồ"; }
function getPhone(tags = {}) { return tags.phone || tags["contact:phone"] || tags["contact:mobile"] || tags.telephone || tags["phone:mobile"] || ""; }
function cleanPhone(value = "") { return String(value).trim().replace(/\s*(;|,|\/)\s*/g, ", "); }
function telTarget(value = "") { return String(value).split(/[;,/]/)[0].trim().replace(/[^\d+]/g, ""); }
function getCoords(element) { if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return { lat: element.lat, lon: element.lon }; if (element.center && Number.isFinite(element.center.lat) && Number.isFinite(element.center.lon)) return { lat: element.center.lat, lon: element.center.lon }; return null; }
function setUserLocation(coords, label = "Vị trí tìm kiếm") { userLocation = { lat: coords.lat, lon: coords.lon }; if (userMarker) map.removeLayer(userMarker); userMarker = L.marker([coords.lat, coords.lon], { icon: userIcon }).addTo(map).bindPopup(`<b>${escapeHtml(label)}</b>`); map.setView([coords.lat, coords.lon], 13); }
function openDirections(place) { window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`, "_blank", "noopener,noreferrer"); }
function phoneLookupUrl(place) { return `https://www.google.com/search?q=${encodeURIComponent(`${place.name} ${place.address} số điện thoại chính thức`)}`; }
function renderResults() {
  const selected = filterEl.value;
  const filtered = facilities.filter(item => selected === "all" || item.type === selected);
  countEl.textContent = `${filtered.length} địa điểm`;
  listEl.replaceChildren();
  if (!filtered.length) { const empty = document.createElement("div"); empty.className = "empty-state"; empty.innerHTML = '<div class="empty-icon">⌖</div><b>Không tìm thấy cơ sở phù hợp</b><p>Thử chọn loại cơ sở khác hoặc tìm ở khu vực lân cận.</p>'; listEl.append(empty); return; }
  filtered.forEach(place => {
    const card = document.createElement("article"); card.className = "facility-card";
    const distance = userLocation ? `${distanceKm(userLocation, place).toFixed(1)} km` : "Chưa xác định";
    const phone = cleanPhone(place.phone || getPhone(place.tags));
    const name = place.name || "Cơ sở y tế chưa có tên";
    const phoneSource = place.verified ? "Số điện thoại đã xác minh" : phone ? "Số do OpenStreetMap cung cấp – cần gọi xác nhận" : "Chưa có số trên dữ liệu bản đồ";
    const callAction = phone ? `<a class="small-action phone-action" href="tel:${escapeHtml(telTarget(phone))}">☎ Gọi ${escapeHtml(phone)}</a>` : `<a class="small-action lookup-action" href="${phoneLookupUrl(place)}" target="_blank" rel="noopener noreferrer">⌕ Tra cứu số điện thoại</a>`;
    card.innerHTML = `<div class="facility-top"><span class="facility-type">${facilityTypeLabel(place.type)}</span><span class="distance">${distance}</span></div><h3>${escapeHtml(name)}</h3><p class="facility-address"><span>⌖</span> ${escapeHtml(place.address)}</p><p class="phone-source ${place.verified ? "verified-source" : ""}">${place.verified ? "✓ " : "ℹ "}${phoneSource}</p><div class="facility-actions">${callAction}<button class="small-action direction-action" type="button">Chỉ đường ↗</button><button class="small-action suggest-action" type="button">Báo thông tin</button></div>`;
    card.querySelector(".direction-action").addEventListener("click", () => openDirections(place));
    card.querySelector(".suggest-action").addEventListener("click", () => { reportForm.elements.facility_name.value = name; reportForm.elements.address.value = place.address.includes("Chưa có") ? "" : place.address; reportForm.scrollIntoView({ behavior: "smooth", block: "center" }); reportForm.elements.phone.focus(); });
    card.addEventListener("click", event => { if (event.target.closest("a,button")) return; map.setView([place.lat, place.lon], 16); place.marker?.openPopup(); });
    listEl.append(card);
  });
}
function clearFacilities() { facilityLayer.clearLayers(); facilities = []; }
async function fetchOverpass(query) {
  const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
  let lastError;
  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body: `data=${encodeURIComponent(query)}`, signal: controller.signal });
      if (!response.ok) throw new Error(`Máy chủ bản đồ trả về lỗi ${response.status}`);
      return await response.json();
    } catch (error) { lastError = error; }
    finally { clearTimeout(timer); }
  }
  throw lastError || new Error("Không kết nối được dữ liệu bản đồ.");
}
async function fetchApprovedContacts(coords) {
  if (!hasSupabase) return [];
  const url = new URL(`${SUPABASE_URL}/rest/v1/facility_contacts`);
  url.search = new URLSearchParams({ select: "id,facility_name,phone,address,website,latitude,longitude,osm_id,osm_type,verified_at", status: "eq.approved", limit: "1000" }).toString();
  const response = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
  if (!response.ok) return [];
  const rows = await response.json();
  return rows.filter(row => row.latitude != null && row.longitude != null && Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)) && distanceKm(coords, { lat: Number(row.latitude), lon: Number(row.longitude) }) <= 30);
}
async function searchFacilities(coords, label) {
  clearFacilities(); setStatus("Đang tìm cơ sở y tế quanh khu vực...", "loading"); headingEl.textContent = `Cơ sở y tế quanh ${label}`;
  const radius = 30000;
  const query = `[out:json][timeout:25];(node["amenity"~"^(hospital|clinic|doctors)$"](around:${radius},${coords.lat},${coords.lon});way["amenity"~"^(hospital|clinic|doctors)$"](around:${radius},${coords.lat},${coords.lon});relation["amenity"~"^(hospital|clinic|doctors)$"](around:${radius},${coords.lat},${coords.lon});node["healthcare"~"^(hospital|clinic|doctor)$"](around:${radius},${coords.lat},${coords.lon});way["healthcare"~"^(hospital|clinic|doctor)$"](around:${radius},${coords.lat},${coords.lon});relation["healthcare"~"^(hospital|clinic|doctor)$"](around:${radius},${coords.lat},${coords.lon}););out center tags;`;
  try {
    const [data, approvedContacts] = await Promise.all([fetchOverpass(query), fetchApprovedContacts(coords).catch(() => [])]);
    const seen = new Set();
    for (const element of data.elements || []) {
      const point = getCoords(element); if (!point) continue;
      const tags = element.tags || {}; const key = `${element.type}-${element.id}`; if (seen.has(key)) continue; seen.add(key);
      const item = { ...point, id: key, osmId: String(element.id), osmType: element.type, name: tags.name || tags["name:vi"] || tags.operator || "", address: getAddress(tags), tags, phone: getPhone(tags), website: tags.website || tags["contact:website"] || "", type: facilityType(tags), verified: false };
      item.marker = L.marker([item.lat, item.lon], { icon: placeIcon }).addTo(facilityLayer);
      item.marker.bindPopup(`<b>${escapeHtml(item.name || "Cơ sở y tế")}</b><br>${escapeHtml(facilityTypeLabel(item.type))}<br>${escapeHtml(item.address)}${item.phone ? `<br>Điện thoại: ${escapeHtml(item.phone)}` : ""}`);
      facilities.push(item);
    }
    for (const row of approvedContacts) {
      const lat = Number(row.latitude), lon = Number(row.longitude);
      const existing = facilities.find(item => (row.osm_id && item.osmId === String(row.osm_id)) || (item.name.toLowerCase() === String(row.facility_name).toLowerCase() && distanceKm(item, { lat, lon }) < 0.25));
      if (existing) { existing.phone = row.phone || existing.phone; existing.website = row.website || existing.website; existing.verified = Boolean(row.phone); existing.address = row.address || existing.address; }
      else {
        const item = { lat, lon, id: `verified-${row.id}`, name: row.facility_name, address: row.address || "", phone: row.phone || "", website: row.website || "", type: "clinic", tags: {}, verified: true };
        item.marker = L.marker([lat, lon], { icon: placeIcon }).addTo(facilityLayer).bindPopup(`<b>${escapeHtml(item.name)}</b><br>${escapeHtml(item.address)}<br>✓ Thông tin đã xác minh`);
        facilities.push(item);
      }
    }
    facilities.sort((a, b) => distanceKm(coords, a) - distanceKm(coords, b)); renderResults();
    if (facilities.length) { const verifiedCount = facilities.filter(p => p.verified && p.phone).length; setStatus(`Tìm thấy ${facilities.length} cơ sở trong bán kính 30 km; ${verifiedCount} số điện thoại đã xác minh. Hãy gọi kiểm tra trước khi đến.`, "success"); const bounds = L.latLngBounds([[coords.lat, coords.lon], ...facilities.map(p => [p.lat, p.lon])]); map.fitBounds(bounds.pad(0.12), { maxZoom: 14 }); }
    else setStatus("Chưa tìm thấy cơ sở trong bán kính khoảng 30 km. Thử địa phương lân cận hoặc kiểm tra lại sau.", "warning");
  } catch (error) { setStatus("Không kết nối được dữ liệu bản đồ lúc này. Vui lòng thử lại sau.", "error"); showToast(error?.name === "AbortError" ? "Máy chủ bản đồ phản hồi quá chậm." : (error?.message || "Lỗi kết nối dữ liệu.")); renderResults(); }
}
async function geocodeLocation(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search"); url.search = new URLSearchParams({ q: `${query}, Việt Nam`, format: "jsonv2", limit: "1", countrycodes: "vn" }).toString();
  const response = await fetch(url, { headers: { Accept: "application/json" } }); if (!response.ok) throw new Error("Không tra cứu được địa danh. Vui lòng thử lại.");
  const results = await response.json(); if (!results.length) throw new Error("Không tìm thấy địa danh. Hãy nhập rõ hơn, ví dụ: Thuận An, TP. Hồ Chí Minh.");
  return { lat: Number(results[0].lat), lon: Number(results[0].lon), label: results[0].display_name.split(",").slice(0, 3).join(", ") };
}
function useGPS() {
  if (!("geolocation" in navigator)) { setStatus("Trình duyệt này không hỗ trợ định vị GPS.", "error"); return; }
  setStatus("Đang xin quyền truy cập vị trí của bạn...", "loading");
  navigator.geolocation.getCurrentPosition(async position => { const coords = { lat: position.coords.latitude, lon: position.coords.longitude }; setUserLocation(coords, "Vị trí của bạn"); await searchFacilities(coords, "vị trí của bạn"); }, error => { const messages = { 1: "Bạn chưa cấp quyền vị trí. Hãy cho phép trình duyệt truy cập vị trí hoặc nhập địa phương.", 2: "Không xác định được vị trí. Hãy thử lại hoặc nhập địa phương.", 3: "Định vị quá thời gian. Hãy thử lại." }; setStatus(messages[error.code] || "Không thể lấy vị trí hiện tại.", "error"); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
}

document.querySelector("#search-form").addEventListener("submit", async event => {
  event.preventDefault(); const query = document.querySelector("#location-input").value.trim();
  if (!query) { showToast("Hãy nhập tỉnh/thành hoặc địa danh cần tìm."); document.querySelector("#location-input").focus(); return; }
  try { setStatus("Đang xác định địa danh...", "loading"); const result = await geocodeLocation(query); setUserLocation(result, result.label); await searchFacilities(result, result.label); }
  catch (error) { setStatus(error.message, "error"); }
});
document.querySelector("#gps-btn").addEventListener("click", useGPS);
filterEl.addEventListener("change", renderResults);

reportForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!hasSupabase) { reportStatus.textContent = "Chức năng gửi dữ liệu trực tuyến chưa được bật. Quản trị viên cần cấu hình Supabase theo hướng dẫn trong README trước khi nhận góp ý."; reportStatus.className = "report-status warning"; return; }
  const values = Object.fromEntries(new FormData(reportForm).entries());
  const phone = cleanPhone(values.phone);
  if (!phone || !/[0-9]{6,}/.test(phone.replace(/\D/g, ""))) { reportStatus.textContent = "Vui lòng nhập số điện thoại hợp lệ."; reportStatus.className = "report-status error"; return; }
  const payload = { facility_name: values.facility_name.trim(), phone, website: values.website.trim() || null, address: values.address.trim(), source_url: values.source_url.trim() || null, note: values.note.trim() || null, status: "pending" };
  const nearby = facilities.find(item => item.name.toLowerCase() === payload.facility_name.toLowerCase() && distanceKm(item, userLocation || item) < 0.5);
  if (nearby) {
    payload.latitude = nearby.lat; payload.longitude = nearby.lon;
    payload.osm_id = nearby.osmId || null; payload.osm_type = nearby.osmType || null;
  } else {
    try {
      const location = await geocodeLocation(payload.address);
      payload.latitude = location.lat; payload.longitude = location.lon;
    } catch {
      reportStatus.textContent = "Chưa xác định được vị trí cơ sở từ địa chỉ. Hãy bổ sung địa chỉ rõ hơn rồi gửi lại.";
      reportStatus.className = "report-status warning";
      return;
    }
  }
  reportStatus.textContent = "Đang gửi thông tin..."; reportStatus.className = "report-status";
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/facility_contacts`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(payload) });
    if (!response.ok) { const detail = await response.text(); throw new Error(detail.includes("relation") ? "Chưa tạo bảng dữ liệu. Hãy chạy tệp supabase/schema.sql." : `Không gửi được thông tin (${response.status}).`); }
    reportForm.reset(); reportStatus.textContent = "Đã nhận góp ý. Thông tin đang chờ quản trị viên xác minh và sẽ chưa hiển thị công khai."; reportStatus.className = "report-status success";
  } catch (error) { reportStatus.textContent = error.message || "Lỗi gửi dữ liệu. Vui lòng thử lại."; reportStatus.className = "report-status error"; }
});

window.addEventListener("resize", () => map.invalidateSize());
setTimeout(() => map.invalidateSize(), 250);
