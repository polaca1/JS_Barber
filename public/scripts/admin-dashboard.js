    // @ts-nocheck
    const dashboardRoot = document.querySelector('[data-admin-dashboard]');
    const dataNode = document.getElementById('admin-bookings-json');
    if (dashboardRoot instanceof HTMLElement && dataNode instanceof HTMLScriptElement) {
      const bookings = JSON.parse(dataNode.textContent || '[]');
      const agendaTitle = dashboardRoot.querySelector('[data-agenda-title]');
      const agendaCount = dashboardRoot.querySelector('[data-agenda-count]');
      const agendaDetails = dashboardRoot.querySelector('[data-agenda-details]');
      const agendaList = dashboardRoot.querySelector('[data-agenda-list]');
      const dayButtons = Array.from(dashboardRoot.querySelectorAll('[data-admin-date]'));
      const workerList = dashboardRoot.querySelector('[data-worker-list]');
      const workerCreateForm = document.getElementById('worker-create-form');
      const csrfToken = dashboardRoot.dataset.csrfToken || '';
      let selectedDate = dashboardRoot.dataset.initialDate || '';

      const formatDate = (isoValue) =>
        new Intl.DateTimeFormat('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(new Date(`${isoValue}T12:00:00`));

      const attachWorkerDeleteHandlers = () => {
        dashboardRoot.querySelectorAll('[data-remove-worker]').forEach((button) => {
          if (!(button instanceof HTMLButtonElement)) return;
          button.onclick = async () => {
            const workerId = button.dataset.removeWorker || '';
            if (!workerId || !window.confirm('¿Quitar esta persona de las reservas?')) {
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
              if (!window.confirm('¿Cancelar esta cita?')) {
                return;
              }

              const response = await fetch(`/api/admin/bookings/${booking.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csrfToken }),
              });

              if (response.ok) {
                window.location.reload();
              }
            });
            actions.appendChild(button);
            item.appendChild(actions);
          }

          agendaList.appendChild(item);
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
      renderAgenda();
    }

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
