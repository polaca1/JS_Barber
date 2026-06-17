    // @ts-nocheck
    (() => {
      const app = document.querySelector('[data-booking-app]');
      if (!app || !('querySelector' in app)) {
        return;
      }

      const isDomElement = (value) => Boolean(value && typeof value === 'object' && value.nodeType === 1);

      const todayIso = app.dataset.todayIso || '';
      const steps = Array.from(app.querySelectorAll('[data-step]'));
      const indicators = Array.from(app.querySelectorAll('[data-step-indicator]'));
      const serviceCards = Array.from(app.querySelectorAll('[data-service-card]'));
      const barberCards = Array.from(app.querySelectorAll('[data-barber-card]'));
      const periodButtons = Array.from(app.querySelectorAll('[data-period]'));
      const monthLabel = app.querySelector('[data-month-label]');
      const prevMonthButton = app.querySelector('[data-month-prev]');
      const nextMonthButton = app.querySelector('[data-month-next]');
      const calendar = app.querySelector('[data-calendar]');
      const timeGrid = app.querySelector('[data-time-grid]');
      const nextStepButton = app.querySelector('[data-nav-next]');
      const prevStepButton = app.querySelector('[data-nav-prev]');
      const summaryService = app.querySelector('[data-summary-service]');
      const summaryBarber = app.querySelector('[data-summary-barber]');
      const summaryDate = app.querySelector('[data-summary-date]');
      const summaryTime = app.querySelector('[data-summary-time]');
      const summaryPrice = app.querySelector('[data-summary-price]');
      const hiddenBookingId = app.querySelector('[data-hidden-booking-id]');
      const hiddenService = app.querySelector('[data-hidden-service]');
      const hiddenBarber = app.querySelector('[data-hidden-barber]');
      const hiddenDate = app.querySelector('[data-hidden-date]');
      const hiddenTime = app.querySelector('[data-hidden-time]');
      const bookingForm = document.getElementById('booking-form');
      const bookingStatus = document.querySelector('[data-booking-status]');
      const formTitle = document.querySelector('[data-form-title]');
      const formCopy = document.querySelector('[data-form-copy]');
      const formKicker = document.querySelector('[data-form-kicker]');
      const submitButton = document.querySelector('[data-submit-booking]');
      const lookupForm = document.querySelector('[data-lookup-form]');
      const lookupStatus = document.querySelector('[data-lookup-status]');
      const appointmentsList = document.querySelector('[data-appointments-list]');
      const manageSection = app.querySelector('[data-manage-section]');
      const showManageButton = app.querySelector('[data-show-manage]');
      if (
        !monthLabel ||
        !prevMonthButton ||
        !nextMonthButton ||
        !calendar ||
        !timeGrid ||
        !nextStepButton ||
        !prevStepButton ||
        !summaryService ||
        !summaryBarber ||
        !summaryDate ||
        !summaryTime ||
        !summaryPrice ||
        !hiddenBookingId ||
        !hiddenService ||
        !hiddenBarber ||
        !hiddenDate ||
        !hiddenTime ||
        !bookingForm ||
        !bookingStatus ||
        !formTitle ||
        !formCopy ||
        !formKicker ||
        !submitButton ||
        !lookupForm ||
        !lookupStatus ||
        !appointmentsList ||
        !manageSection ||
        !showManageButton
      ) {
        return;
      }

      const nameInput = bookingForm.elements.namedItem('name');
      const phoneInput = bookingForm.elements.namedItem('phone');
      const notesInput = bookingForm.elements.namedItem('notes');
      const lookupNameInput = lookupForm.elements.namedItem('name');
      const lookupPhoneInput = lookupForm.elements.namedItem('phone');

      if (!nameInput || !phoneInput || !notesInput || !lookupNameInput || !lookupPhoneInput) {
        return;
      }

      const baseToday = new Date(`${todayIso}T12:00:00`);
      const monthState = new Date(baseToday.getFullYear(), baseToday.getMonth(), 1);
      const maxMonth = new Date(baseToday.getFullYear(), baseToday.getMonth() + 4, 1);
      const initialBookings = (() => {
        try {
          const parsed = JSON.parse(app.dataset.bookings || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();
      const state = {
        step: 1,
        bookingId: '',
        service: '',
        servicePrice: '',
        serviceDuration: 30,
        barber: '',
        barberLabel: '',
        date: '',
        time: '',
        period: 'manana',
      };
      let knownBookings = initialBookings;
      const storageKey = 'jsb-customer-bookings';
      let customerBookings = [];

      const readLocalBookings = () => {
        try {
          const raw = window.localStorage.getItem(storageKey);
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      const writeLocalBookings = (bookings) => {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(bookings));
        } catch {
          // Local storage can be blocked; the server copy still remains.
        }
      };

      const mergeBookings = (...groups) => {
        const merged = new Map();
        groups.flat().forEach((booking) => {
          if (booking && typeof booking.id === 'string') {
            merged.set(booking.id, booking);
          }
        });
        return Array.from(merged.values()).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
      };

      const rememberKnownBooking = (booking) => {
        if (!booking || typeof booking.id !== 'string') return;
        knownBookings = mergeBookings(knownBookings.filter((item) => item.id !== booking.id), [booking]);
      };

      const forgetKnownBooking = (bookingId) => {
        knownBookings = knownBookings.filter((booking) => booking.id !== bookingId);
      };

      const removeStoredBooking = (bookingId) => {
        writeLocalBookings(readLocalBookings().filter((booking) => booking.id !== bookingId));
      };

      const replaceStoredBooking = (booking) => {
        if (!booking) return;
        const next = readLocalBookings().filter((item) => item.id !== booking.id);
        next.push(booking);
        writeLocalBookings(mergeBookings(next));
      };

      const getVisibleBookings = (name, phone, serverBookings = []) => {
        const normalizedName = String(name || '').trim().toLowerCase();
        const normalizedPhone = String(phone || '').trim();
        const localBookings = readLocalBookings().filter(
          (booking) =>
            booking.name?.trim().toLowerCase() === normalizedName &&
            booking.phone?.trim() === normalizedPhone,
        );
        const remoteBookings = (serverBookings || []).filter(
          (booking) =>
            booking.name?.trim().toLowerCase() === normalizedName &&
            booking.phone?.trim() === normalizedPhone,
        );
        return mergeBookings(localBookings, remoteBookings);
      };

      const openManageSection = () => {
        manageSection.hidden = false;
        manageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      const getErrorMessage = (data, fallback) => {
        const errors = data?.errors;
        if (!errors || typeof errors !== 'object') {
          return fallback;
        }

        const firstMessage = Object.values(errors).flat().find((value) => typeof value === 'string');
        return firstMessage || fallback;
      };

      const periodSlots = {
        manana: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'],
        tarde: ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'],
      };

      const toMinutes = (timeValue) => {
        const [hours = '0', minutes = '0'] = String(timeValue || '').split(':');
        return Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes, 10);
      };

      const getServiceDuration = (serviceName) => {
        const card = serviceCards.find(
          (serviceCard) => isDomElement(serviceCard) && serviceCard.dataset.serviceName === serviceName,
        );
        return Number.parseInt(isDomElement(card) ? card.dataset.serviceDuration || '30' : '30', 10) || 30;
      };

      const timeOverlapsBooking = (dateValue, slotStart, slotDuration, booking) => {
        if (booking.status === 'Cancelada' || booking.date !== dateValue) {
          return false;
        }

        const bookingStart = toMinutes(booking.time);
        const bookingDuration = getServiceDuration(booking.service);
        const bookingEnd = bookingStart + bookingDuration;
        const slotEnd = slotStart + slotDuration;
        return slotStart < bookingEnd && bookingStart < slotEnd;
      };

      const getAvailableBarbersForSlot = (dateValue, slotValue, durationMinutes) => {
        const slotStart = toMinutes(slotValue);
        return barberCards.filter((card) => {
          if (!isDomElement(card)) return false;
          const barberValue = card.dataset.barberValue || '';
          return !knownBookings.some(
            (booking) =>
              booking.barber === barberValue &&
              booking.date === dateValue &&
              timeOverlapsBooking(dateValue, slotStart, durationMinutes, booking),
          );
        });
      };

      const getSlotAvailability = (slotValue) => {
        if (!state.date || !state.service) {
          return barberCards.filter((card) => isDomElement(card)).length;
        }

        const durationMinutes = state.serviceDuration || getServiceDuration(state.service);
        return getAvailableBarbersForSlot(state.date, slotValue, durationMinutes).length;
      };

      const getCurrentSlotBarbers = () => {
        if (!state.date || !state.time || !state.service) {
          return barberCards.filter((card) => isDomElement(card));
        }

        const durationMinutes = state.serviceDuration || getServiceDuration(state.service);
        return getAvailableBarbersForSlot(state.date, state.time, durationMinutes);
      };

      const toIso = (dateValue) => {
        const year = dateValue.getFullYear();
        const month = `${dateValue.getMonth() + 1}`.padStart(2, '0');
        const day = `${dateValue.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const formatLongDate = (isoValue) =>
        new Intl.DateTimeFormat('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(new Date(`${isoValue}T12:00:00`));

      const formatMonth = (dateValue) =>
        new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(dateValue);

      const statusClassFor = (status) => {
        if (status === 'Cancelada') return 'is-error';
        return 'is-success';
      };

      const setStatus = (node, message = '', type = 'is-success') => {
        node.hidden = !message;
        node.textContent = message;
        node.className = `form-status ${type}`;
      };

      const getFirstValidDate = () => {
        for (let index = 0; index < 140; index += 1) {
          const candidate = new Date(baseToday);
          candidate.setDate(candidate.getDate() + index);
          const isoValue = toIso(candidate);
          if (isoValue >= todayIso && candidate.getDay() !== 0) {
            return isoValue;
          }
        }
        return todayIso;
      };

      const getPeriodFromTime = (value) => {
        if (periodSlots.manana.includes(value)) return 'manana';
        return 'tarde';
      };

      const isValidStep = () => {
        if (state.step === 1) return Boolean(state.service);
        if (state.step === 2) return Boolean(state.date && state.time && getSlotAvailability(state.time) > 0);
        if (state.step === 3) {
          return Boolean(
            state.barber &&
              getCurrentSlotBarbers().some((card) => isDomElement(card) && card.dataset.barberValue === state.barber),
          );
        }
        return true;
      };

      const syncSummary = () => {
        summaryService.textContent = state.service || 'Pendiente';
        summaryBarber.textContent = state.barberLabel || 'Pendiente';
        summaryDate.textContent = state.date ? formatLongDate(state.date) : 'Pendiente';
        summaryTime.textContent = state.time || 'Pendiente';
        summaryPrice.textContent = state.servicePrice || '0,00 EUR';
        hiddenBookingId.value = state.bookingId;
        hiddenService.value = state.service;
        hiddenBarber.value = state.barber;
        hiddenDate.value = state.date;
        hiddenTime.value = state.time;
      };

      const syncFormMode = () => {
        const editing = Boolean(state.bookingId);
        formKicker.textContent = editing ? 'Editar cita' : 'Confirmacion';
        formTitle.textContent = editing ? 'Actualiza la cita y vuelve a guardarla' : 'Dejanos la reserva cerrada';
        formCopy.textContent = editing
          ? 'Puedes cambiar el corte, la persona, el dia o la hora y guardar de nuevo la reserva.'
          : 'Te pedimos solo lo necesario para guardar la cita y poder localizarte.';
        submitButton.textContent = editing ? 'Guardar cambios' : 'Confirmar reserva';
      };

      const highlightCards = () => {
        serviceCards.forEach((card) => {
          if (!isDomElement(card)) return;
          card.classList.toggle('is-selected', card.dataset.serviceName === state.service);
        });

        barberCards.forEach((card) => {
          if (!isDomElement(card)) return;
          const availableNow = getCurrentSlotBarbers().some(
            (availableCard) => isDomElement(availableCard) && availableCard.dataset.barberValue === card.dataset.barberValue,
          );
          const selected = card.dataset.barberValue === state.barber;
          card.classList.toggle('is-selected', selected);
          card.classList.toggle('is-disabled', Boolean(state.date && state.time && !availableNow));
          card.toggleAttribute('disabled', Boolean(state.date && state.time && !availableNow));

          const note = card.querySelector('[data-barber-note]');
          if (isDomElement(note)) {
            note.textContent = state.date && state.time
              ? availableNow
                ? 'Disponible para esa hora'
                : 'Ocupado para esa hora'
              : 'Elige una hora para ver su disponibilidad.';
          }
        });

        periodButtons.forEach((button) => {
          if (!isDomElement(button)) return;
          button.classList.toggle('is-active', button.dataset.period === state.period);
        });
      };

      const renderTimes = () => {
        timeGrid.innerHTML = '';
        const durationMinutes = state.serviceDuration || getServiceDuration(state.service);
        const slots = periodSlots[state.period];
        if (state.time && state.date && getSlotAvailability(state.time) === 0) {
          state.time = '';
        }

        slots.forEach((slot) => {
          const availableBarbers = state.date ? getAvailableBarbersForSlot(state.date, slot, durationMinutes) : barberCards;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `time-slot${state.time === slot ? ' is-selected' : ''}${availableBarbers.length ? '' : ' is-disabled'}`;
          button.disabled = !availableBarbers.length;
          button.innerHTML = `<span>${slot}</span><small>${availableBarbers.length} libres</small>`;
          button.addEventListener('click', () => {
            if (!availableBarbers.length) {
              return;
            }
            state.time = slot;
            syncSummary();
            renderTimes();
            highlightCards();
            renderChrome();
          });
          timeGrid.appendChild(button);
        });

        const timeAvailabilityNote = app.querySelector('[data-time-availability-note]');
        if (isDomElement(timeAvailabilityNote)) {
          const availableCount = slots.filter((slot) => getSlotAvailability(slot) > 0).length;
          timeAvailabilityNote.textContent = state.date
            ? `${availableCount} horas libres para ${state.service || 'este servicio'}.`
            : 'Primero elige un dia para ver las horas disponibles.';
        }
      };

      const renderCalendar = () => {
        calendar.innerHTML = '';
        monthLabel.textContent = formatMonth(monthState);
        const firstDay = new Date(monthState.getFullYear(), monthState.getMonth(), 1);
        const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const daysInMonth = new Date(monthState.getFullYear(), monthState.getMonth() + 1, 0).getDate();

        for (let index = 0; index < offset; index += 1) {
          const spacer = document.createElement('div');
          spacer.className = 'calendar-day is-disabled';
          spacer.setAttribute('aria-hidden', 'true');
          calendar.appendChild(spacer);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
          const dateValue = new Date(monthState.getFullYear(), monthState.getMonth(), day, 12);
          const isoValue = toIso(dateValue);
          const isSunday = dateValue.getDay() === 0;
          const isPast = isoValue < todayIso;
          const disabled = isSunday || isPast;
          const button = document.createElement('button');
          button.type = 'button';
          button.className =
            `calendar-day${dateValue.getDay() === 6 ? ' is-saturday' : ''}${disabled ? ' is-disabled' : ''}${state.date === isoValue ? ' is-selected' : ''}`;
          button.textContent = `${day}`;
          button.disabled = disabled;
          button.addEventListener('click', () => {
            if (disabled) return;
            state.date = isoValue;
            if (state.time && getSlotAvailability(state.time) === 0) {
              state.time = '';
            }
            syncSummary();
            renderCalendar();
            renderTimes();
            highlightCards();
            renderChrome();
          });
          calendar.appendChild(button);
        }

        prevMonthButton.disabled =
          monthState.getFullYear() === baseToday.getFullYear() &&
          monthState.getMonth() === baseToday.getMonth();
        nextMonthButton.disabled = monthState >= maxMonth;
      };

      const renderChrome = () => {
        steps.forEach((step) => {
          const isCurrent = Number(step.getAttribute('data-step')) === state.step;
          step.classList.toggle('is-active', isCurrent);
        });

        indicators.forEach((indicator) => {
          const current = Number(indicator.getAttribute('data-step-indicator'));
          indicator.classList.toggle('is-active', current === state.step);
          indicator.style.color = current < state.step ? 'rgba(233, 193, 118, 0.7)' : '';
        });

        nextStepButton.disabled = !isValidStep();
        nextStepButton.textContent = state.step === 4 ? 'Confirmar cita' : 'Continuar';
        prevStepButton.style.display = state.step > 1 ? 'inline-flex' : 'none';
      };

      const setStateFromBooking = (booking) => {
        state.bookingId = booking.id || '';
        state.service = booking.service || '';
        state.servicePrice =
          serviceCards.find((card) => isDomElement(card) && card.dataset.serviceName === booking.service)?.dataset.servicePrice || '0,00 EUR';
        state.barber = booking.barber || '';
        state.barberLabel = booking.barberLabel || '';
        state.date = booking.date || getFirstValidDate();
        state.time = booking.time || periodSlots.manana[0];
        state.period = getPeriodFromTime(state.time);
        nameInput.value = booking.name || '';
        phoneInput.value = booking.phone || '';
        notesInput.value = booking.notes || '';
        monthState.setFullYear(Number(state.date.slice(0, 4)), Number(state.date.slice(5, 7)) - 1, 1);
        state.step = 1;
        highlightCards();
        syncSummary();
        syncFormMode();
        renderCalendar();
        renderTimes();
        renderChrome();
        setStatus(bookingStatus, 'Ahora estas editando una cita ya guardada.', 'is-success');
        window.scrollTo({ top: app.offsetTop - 90, behavior: 'smooth' });
      };

      const renderAppointments = (bookings) => {
        customerBookings = bookings;
        appointmentsList.innerHTML = '';

        if (!bookings.length) {
          appointmentsList.innerHTML = `
            <article class="appointment-card soft-surface">
              <h3>No hay citas guardadas con esos datos</h3>
              <p class="muted-note">Si acabas de reservar, revisa que el nombre y el telefono sean los mismos.</p>
            </article>
          `;
          return;
        }

        bookings.forEach((booking) => {
          const item = document.createElement('article');
          item.className = 'appointment-card soft-surface';
          item.innerHTML = `
            <div class="appointment-card-top">
              <div>
                <p class="eyebrow">Cita guardada</p>
                <h3>${booking.service}</h3>
              </div>
              <span class="status-pill ${booking.status === 'Cancelada' ? 'cancelled' : 'pending'}">${booking.status}</span>
            </div>
            <div class="appointment-meta-grid">
              <div><strong>Dia</strong><span>${formatLongDate(booking.date)}</span></div>
              <div><strong>Hora</strong><span>${booking.time}</span></div>
              <div><strong>Persona</strong><span>${booking.barberLabel}</span></div>
              <div><strong>Telefono</strong><span>${booking.phone}</span></div>
            </div>
          `;

          if (booking.status !== 'Cancelada') {
            const actions = document.createElement('div');
            actions.className = 'appointment-actions';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'btn btn-secondary';
            editButton.textContent = 'Cambiar cita';
            editButton.addEventListener('click', () => setStateFromBooking(booking));

            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'danger-btn';
            cancelButton.textContent = 'Eliminar cita';
            cancelButton.addEventListener('click', async () => {
              if (!window.confirm('¿Quieres cancelar esta cita?')) {
                return;
              }

              const response = await fetch('/api/bookings/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'cancel',
                  bookingId: booking.id,
                  name: lookupNameInput.value,
                  phone: lookupPhoneInput.value,
                  csrfToken: lookupForm.elements.namedItem('csrfToken')?.value || '',
                }),
              });

              const data = await response.json().catch(() => null);
              if (!response.ok) {
                setStatus(lookupStatus, 'No se ha podido cancelar la cita.', 'is-error');
                return;
              }

              setStatus(lookupStatus, 'La cita ha quedado cancelada.', statusClassFor('Cancelada'));
              removeStoredBooking(booking.id);
              forgetKnownBooking(booking.id);
              if (Array.isArray(data.bookings)) {
                data.bookings.forEach(rememberKnownBooking);
              }
              renderAppointments(getVisibleBookings(lookupNameInput.value, lookupPhoneInput.value, data.bookings || []));
            });

            actions.append(editButton, cancelButton);
            item.appendChild(actions);
          }

          appointmentsList.appendChild(item);
        });
      };

      app.addEventListener('click', (event) => {
        const target = event.target;
        if (!isDomElement(target)) {
          return;
        }

        const serviceCard = target.closest('[data-service-card]');
        if (isDomElement(serviceCard)) {
          state.service = serviceCard.dataset.serviceName || '';
          state.servicePrice = serviceCard.dataset.servicePrice || '';
          state.serviceDuration = Number.parseInt(serviceCard.dataset.serviceDuration || '30', 10) || 30;
          highlightCards();
          syncSummary();
          renderTimes();
          renderChrome();
          return;
        }

        const barberCard = target.closest('[data-barber-card]');
        if (isDomElement(barberCard)) {
          state.barber = barberCard.dataset.barberValue || '';
          state.barberLabel = barberCard.dataset.barberName || '';
          highlightCards();
          syncSummary();
          renderChrome();
          return;
        }

        const periodButton = target.closest('[data-period]');
        if (isDomElement(periodButton)) {
          state.period = periodButton.dataset.period || 'manana';
          if (state.time && getSlotAvailability(state.time) === 0) {
            state.time = '';
          }
          highlightCards();
          syncSummary();
          renderTimes();
          renderChrome();
          return;
        }

        if (target.closest('[data-month-prev]')) {
          if (prevMonthButton.disabled) return;
          monthState.setMonth(monthState.getMonth() - 1);
          renderCalendar();
          return;
        }

        if (target.closest('[data-month-next]')) {
          if (nextMonthButton.disabled) return;
          monthState.setMonth(monthState.getMonth() + 1);
          renderCalendar();
          return;
        }

        if (target.closest('[data-show-manage]')) {
          openManageSection();
          return;
        }

        if (target.closest('[data-nav-next]')) {
          if (state.step < 4 && isValidStep()) {
            state.step += 1;
            renderChrome();
            return;
          }

          if (state.step === 4 && isValidStep()) {
            bookingForm.requestSubmit();
          }
          return;
        }

        if (target.closest('[data-nav-prev]')) {
          if (state.step > 1) {
            state.step -= 1;
            renderChrome();
          }
        }
      });

      bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus(bookingStatus);
        const payload = Object.fromEntries(new FormData(bookingForm).entries());
        const editing = Boolean(state.bookingId);
        const response = await fetch(editing ? '/api/bookings/manage' : '/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing ? { ...payload, action: 'update' } : payload),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setStatus(
            bookingStatus,
            getErrorMessage(data, 'No se ha podido guardar la cita. Revisa los datos y la verificacion.'),
            'is-error',
          );
          return;
        }

        lookupNameInput.value = nameInput.value;
        lookupPhoneInput.value = phoneInput.value;
        if (data?.booking) {
          replaceStoredBooking(data.booking);
          rememberKnownBooking(data.booking);
        }
        if (Array.isArray(data?.bookings)) {
          data.bookings.forEach(rememberKnownBooking);
          renderAppointments(getVisibleBookings(nameInput.value, phoneInput.value, data.bookings));
        } else {
          const lookupResponse = await fetch('/api/bookings/manage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'lookup',
              name: nameInput.value,
              phone: phoneInput.value,
              csrfToken: bookingForm.elements.namedItem('csrfToken')?.value || '',
            }),
          });
          const lookupData = await lookupResponse.json().catch(() => null);
          renderAppointments(
            getVisibleBookings(
              nameInput.value,
              phoneInput.value,
              Array.isArray(lookupData?.bookings) ? lookupData.bookings : [],
            ),
          );
        }
        setStatus(
          bookingStatus,
          editing ? 'La cita ha quedado actualizada.' : 'La cita ha quedado guardada. Puedes verla y gestionarla desde aqui.',
          'is-success',
        );
        setStatus(lookupStatus, 'Tus citas se han actualizado.', 'is-success');
        state.bookingId = '';
        state.step = 1;
        syncFormMode();
        syncSummary();
        openManageSection();
      });

      lookupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus(lookupStatus);
        const payload = Object.fromEntries(new FormData(lookupForm).entries());
        const response = await fetch('/api/bookings/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, action: 'lookup' }),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setStatus(lookupStatus, 'No se han podido consultar tus citas.', 'is-error');
          return;
        }

        setStatus(lookupStatus, 'Estas son las citas que tenemos guardadas con tus datos.', 'is-success');
        if (Array.isArray(data.bookings)) {
          data.bookings.forEach(rememberKnownBooking);
        }
        renderAppointments(getVisibleBookings(payload.name, payload.phone, data.bookings || []));
        openManageSection();
      });

      state.date = getFirstValidDate();
      state.time = periodSlots[state.period][0];
      syncFormMode();
      syncSummary();
      highlightCards();
      renderCalendar();
      renderTimes();
      renderChrome();
    })();
