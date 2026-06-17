// @ts-nocheck
const dashboardRoot = document.querySelector('[data-admin-dashboard]');
const dataNode = document.getElementById('admin-bookings-json');

if (dashboardRoot instanceof HTMLElement && dataNode instanceof HTMLScriptElement) {
  const storageKey = 'jsb-customer-bookings';
  const readLocalBookings = () => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const mergeBookings = (...groups) => {
    const merged = new Map();
    groups.flat().forEach((booking) => {
      if (!booking || typeof booking !== 'object') {
        return;
      }

      const key = [
        String(booking.name || '').trim().toLowerCase(),
        String(booking.phone || '').trim(),
        String(booking.service || '').trim().toLowerCase(),
        String(booking.barber || '').trim().toLowerCase(),
        String(booking.date || '').trim(),
        String(booking.time || '').trim(),
        String(booking.notes || '').trim().toLowerCase(),
        String(booking.status || '').trim().toLowerCase(),
      ].join('|');

      merged.set(key, booking);
    });
    return Array.from(merged.values()).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  };

  let bookings = mergeBookings(JSON.parse(dataNode.textContent || '[]'), readLocalBookings());
  const agendaTitle = dashboardRoot.querySelector('[data-agenda-title]');
  const agendaCount = dashboardRoot.querySelector('[data-agenda-count]');
  const adminTotal = dashboardRoot.querySelector('[data-admin-total]');
  const agendaDetails = dashboardRoot.querySelector('[data-agenda-details]');
  const agendaList = dashboardRoot.querySelector('[data-agenda-list]');
  const dayButtons = Array.from(dashboardRoot.querySelectorAll('[data-admin-date]'));
  const workerList = dashboardRoot.querySelector('[data-worker-list]');
  const workerCreateForm = document.getElementById('worker-create-form');
  const csrfToken = dashboardRoot.dataset.csrfToken || '';
  let selectedDate = dashboardRoot.dataset.initialDate || '';
  const bookingsUrl = '/api/admin/bookings';
  let refreshTimer = null;

  const formatDate = (isoValue) =>
    new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(`${isoValue}T12:00:00`));

  const getActiveBookingsByDate = () => {
    const index = new Map();
    bookings.forEach((booking) => {
      if (booking.status === 'Cancelada') {
        return;
      }

      const list = index.get(booking.date) ?? [];
      list.push(booking);
      index.set(booking.date, list);
    });
    return index;
  };

  const syncCalendarCounts = () => {
    const countsByDate = getActiveBookingsByDate();

    if (adminTotal instanceof HTMLElement) {
      const activeCount = bookings.filter((booking) => booking.status !== 'Cancelada').length;
      adminTotal.textContent = `${activeCount} ${activeCount === 1 ? 'cita' : 'citas'}`;
    }

    dayButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;

      const dateValue = button.dataset.adminDate || '';
      const count = countsByDate.get(dateValue)?.length ?? 0;
      const inner = button.querySelector('.admin-calendar-day-inner');
      if (!(inner instanceof HTMLElement)) return;

      const currentCount = inner.querySelector('[data-admin-count]');
      if (count > 0) {
        let countNode = currentCount;
        if (!(countNode instanceof HTMLElement)) {
          countNode = document.createElement('span');
          countNode.className = 'admin-calendar-count';
          countNode.dataset.adminCount = 'true';
          inner.appendChild(countNode);
        }
        countNode.textContent = `${count} ${count === 1 ? 'cita' : 'citas'}`;
      } else if (currentCount instanceof HTMLElement) {
        currentCount.remove();
      }
    });
  };

  const renderAgenda = () => {
    if (!(agendaTitle instanceof HTMLElement) || !(agendaList instanceof HTMLElement)) {
      return;
    }

    agendaTitle.textContent = selectedDate ? formatDate(selectedDate) : 'Reservas guardadas';
    const items = bookings
      .filter((booking) => booking.date === selectedDate)
      .sort((left, right) => `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`));

    if (agendaCount instanceof HTMLElement) {
      agendaCount.textContent = `${items.length} ${items.length === 1 ? 'cita' : 'citas'}`;
    }

    agendaList.innerHTML = '';

    if (agendaDetails instanceof HTMLDetailsElement) {
      agendaDetails.open = true;
    }

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'soft-surface booking-panel';
      empty.innerHTML = '<p class="muted-note">Todavia no hay reservas para este dia.</p>';
      agendaList.appendChild(empty);
      return;
    }

    items.forEach((booking) => {
      const item = document.createElement('article');
      const statusClass =
        booking.status === 'Cancelada'
          ? 'cancelled'
          : booking.status === 'Confirmada'
            ? 'confirmed'
            : 'pending';
      item.className = `agenda-item${booking.status === 'Cancelada' ? ' is-cancelled' : ' is-highlight'}`;
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:start;">
          <div>
            <div class="agenda-time">${booking.time}</div>
            <h3 class="agenda-name">${booking.name}</h3>
            <p class="agenda-meta">Telefono: ${booking.phone}</p>
            <p class="agenda-meta">Servicio: ${booking.service}</p>
            <p class="agenda-meta">Peluquero: ${booking.barberLabel}</p>
          </div>
          <span class="status-pill ${statusClass}">${booking.status}</span>
        </div>
      `;

      if (booking.status !== 'Cancelada') {
        const actions = document.createElement('div');
        actions.style.marginTop = '12px';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'danger-btn';
        button.textContent = 'Cancelar cita';
        button.addEventListener('click', async () => {
          if (!window.confirm('Cancelar esta cita?')) {
            return;
          }

          const response = await fetch(`/api/admin/bookings/${booking.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csrfToken }),
          });

          if (response.ok) {
            await refreshBookings();
          }
        });
        actions.appendChild(button);
        item.appendChild(actions);
      }

      agendaList.appendChild(item);
    });
  };

  const refreshBookings = async () => {
    try {
      const response = await fetch(bookingsUrl, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        return false;
      }

      const payload = await response.json();
      if (!payload?.ok || !payload?.data || !Array.isArray(payload.data.bookings)) {
        return false;
      }

      bookings = mergeBookings(payload.data.bookings, readLocalBookings());
      syncCalendarCounts();
      renderAgenda();
      return true;
    } catch {
      return false;
    }
  };

  const attachWorkerDeleteHandlers = () => {
    dashboardRoot.querySelectorAll('[data-remove-worker]').forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      button.onclick = async () => {
        const workerId = button.dataset.removeWorker || '';
        if (!workerId || !window.confirm('Quitar esta persona de las reservas?')) {
          return;
        }

        const response = await fetch(`/api/admin/workers/${workerId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csrfToken }),
        });

        if (response.ok) {
          window.location.reload();
        }
      };
    });
  };

  dayButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener('click', () => {
      const dateValue = button.dataset.adminDate || '';
      if (!dateValue) return;
      selectedDate = dateValue;
      dayButtons.forEach((item) => item.classList.remove('is-selected'));
      button.classList.add('is-selected');
      renderAgenda();
      if (agendaDetails instanceof HTMLDetailsElement) {
        agendaDetails.open = true;
        agendaDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  if (workerCreateForm instanceof HTMLFormElement) {
    workerCreateForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(workerCreateForm).entries());
      const response = await fetch('/api/admin/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.reload();
      }
    });
  }

  attachWorkerDeleteHandlers();
  syncCalendarCounts();
  renderAgenda();
  refreshBookings();
  refreshTimer = window.setInterval(refreshBookings, 30000);
  window.addEventListener('focus', refreshBookings);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      refreshBookings();
    }
  });

  const logoutForm = document.getElementById('admin-logout-form');
  if (logoutForm instanceof HTMLFormElement) {
    logoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(logoutForm).entries());
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      window.location.href = '/admin';
    });
  }

  window.addEventListener('beforeunload', () => {
    if (refreshTimer) {
      window.clearInterval(refreshTimer);
    }
  });
}
