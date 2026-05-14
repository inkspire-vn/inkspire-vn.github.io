SCRIPT_START
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeBtn');

  function setTheme(mode) {
    html.setAttribute('data-bs-theme', mode);
    localStorage.setItem('theme', mode);
    themeBtn.textContent = mode === 'dark' ? '☀️' : '🌙';
  }
  setTheme(localStorage.getItem('theme') || 'light');
  themeBtn.onclick = () => setTheme(html.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light');

  function parseEventDate(str) {
    if (!str) return null;
    const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (m) {
      let [, day, month, year, hour, min, ampm] = m;
      hour = parseInt(hour);
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
      }
      return new Date(+year, +month - 1, +day, hour, parseInt(min));
    }
    return new Date(str);
  }

  let currentEvents = [];
  let currentlyExpandedKey = null;

  function renderEvents() {
    const grid = document.getElementById('event-grid');
    if (!grid || currentEvents.length === 0) return;
    const now = new Date();
    grid.innerHTML = '';
    currentEvents.forEach(event => {
      const start = parseEventDate(event.start);
      const end   = parseEventDate(event.end);
      let statusClass, statusText;
      if (event.aborted)             { statusClass = 'status-aborted';  statusText = 'Bị hủy'; }
      else if (event.delayed)        { statusClass = 'status-delayed';  statusText = 'Bị hoãn'; }
      else if (start && now < start) { statusClass = 'status-upcoming'; statusText = 'Sắp diễn ra'; }
      else if (end   && now > end)   { statusClass = 'status-expired';  statusText = 'Đã kết thúc'; }
      else                           { statusClass = 'status-current';  statusText = 'Đang diễn ra'; }

      const fullDesc = event.desc || '';
      const hasMore = fullDesc.length > 150;
      const shortDesc = hasMore ? fullDesc.substring(0, 150) + '...' : fullDesc;

      grid.innerHTML += `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 event-card position-relative">
            ${event.image ? `<img src="${event.image}" class="card-img-top" alt="${event.title}">` : ''}
            <div class="card-body">
              <h5 class="card-title fw-bold">${event.title || 'Không có tiêu đề'}</h5>
              <p class="event-time mb-2"><i class="fas fa-clock me-2"></i>${event.start || 'N/A'} → ${event.end || 'N/A'}</p>
              <p class="card-text event-desc mb-1" id="desc-${event.key}">${shortDesc}</p>
              ${hasMore ? `<button class="toggle-btn" data-key="${event.key}" data-full="${encodeURIComponent(fullDesc)}" data-short="${encodeURIComponent(shortDesc)}">Xem thêm</button>` : ''}
              <br>
              <span class="status-badge ${statusClass} mt-2 d-inline-block">${statusText}</span>
            </div>
          </div>
        </div>`;
    });
  }

  onValue(ref(db, 'events'), (snapshot) => {
    const loading  = document.getElementById('loading');
    const grid     = document.getElementById('event-grid');
    const noEvents = document.getElementById('no-events');
    if (loading) loading.classList.add('d-none');
    const data = snapshot.val() || {};
    currentEvents = Object.values(data);
    if (currentEvents.length === 0) {
      if (noEvents) noEvents.classList.remove('d-none');
      if (grid) { grid.classList.add('d-none'); grid.innerHTML = ''; }
      return;
    }
    if (noEvents) noEvents.classList.add('d-none');
    if (grid) grid.classList.remove('d-none');
    renderEvents();
  });

  document.getElementById('event-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    const key    = btn.dataset.key;
    const descEl = document.getElementById(`desc-${key}`);
    if (!descEl) return;
    const isExpanded = btn.dataset.expanded === 'true';
    if (currentlyExpandedKey && currentlyExpandedKey !== key) {
      const prevBtn  = document.querySelector(`.toggle-btn[data-key="${currentlyExpandedKey}"]`);
      const prevDesc = document.getElementById(`desc-${currentlyExpandedKey}`);
      if (prevBtn && prevDesc) {
        prevDesc.textContent = decodeURIComponent(prevBtn.dataset.short);
        prevDesc.classList.remove('expanded');
        prevBtn.textContent = 'Xem thêm';
        prevBtn.dataset.expanded = 'false';
      }
    }
    if (!isExpanded) {
      descEl.textContent = decodeURIComponent(btn.dataset.full);
      descEl.classList.add('expanded');
      btn.textContent = 'Thu gọn';
      btn.dataset.expanded = 'true';
      currentlyExpandedKey = key;
    } else {
      descEl.textContent = decodeURIComponent(btn.dataset.short);
      descEl.classList.remove('expanded');
      btn.textContent = 'Xem thêm';
      btn.dataset.expanded = 'false';
      currentlyExpandedKey = null;
    }
  });
SCRIPT_END
