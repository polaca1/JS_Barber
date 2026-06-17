import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { barberProfiles, getBarberLabel, services } from '@lib/site';

export type BookingStatus = 'Pendiente' | 'Confirmada' | 'Cancelada';

export type WorkerRecord = {
  id: string;
  value: string;
  name: string;
  role: string;
  active: boolean;
};

export type BookingRecord = {
  id: string;
  name: string;
  phone: string;
  service: string;
  barber: string;
  barberLabel: string;
  date: string;
  time: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
};

type CustomerIdentity = {
  name: string;
  phone: string;
};

type BookingSpan = {
  start: number;
  end: number;
};

export type DashboardData = {
  bookings: BookingRecord[];
  workers: WorkerRecord[];
  activeBookings: BookingRecord[];
  pendingBookings: BookingRecord[];
  confirmedBookings: BookingRecord[];
  cancelledBookings: BookingRecord[];
  totalBookings: number;
};

const state = globalThis as typeof globalThis & {
  __jsbStore?: StoreData;
  __jsbStorePromise?: Promise<StoreData>;
};

type StoreData = {
  bookings: BookingRecord[];
  workers: WorkerRecord[];
};

const repoStorePath = join(process.cwd(), 'data', 'jsb-store.json');
const runtimePath = process.cwd().replace(/\\/g, '/');
const isServerlessRuntime =
  runtimePath.startsWith('/var/task') || process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const storePath = isServerlessRuntime ? join('/tmp', 'jsb-store.json') : repoStorePath;

function seedWorkers() {
  return barberProfiles.map((worker) => ({
    id: crypto.randomUUID(),
    value: worker.value,
    name: worker.name,
    role: worker.role === 'Barbero senior' ? 'Barbero' : worker.role,
    active: true,
  }));
}

function seedStore(): StoreData {
  return {
    bookings: [],
    workers: seedWorkers(),
  };
}

async function persistStore() {
  const store = state.__jsbStore ?? seedStore();
  state.__jsbStore = store;
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  return store;
}

async function loadStore() {
  try {
    const raw = await readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    const workers = Array.isArray(parsed.workers) && parsed.workers.length > 0 ? parsed.workers : seedWorkers();
    const bookings = Array.isArray(parsed.bookings) ? parsed.bookings : [];
    state.__jsbStore = {
      workers: workers.map((worker) => ({
        ...worker,
        role: worker.role === 'Barbero senior' ? 'Barbero' : worker.role,
        active: worker.active !== false,
      })),
      bookings: bookings.filter((booking): booking is BookingRecord => Boolean(booking && booking.id)),
    };
  } catch {
    try {
      const repoRaw = await readFile(repoStorePath, 'utf8');
      const repoParsed = JSON.parse(repoRaw) as Partial<StoreData>;
      const workers =
        Array.isArray(repoParsed.workers) && repoParsed.workers.length > 0
          ? repoParsed.workers
          : seedWorkers();
      const bookings = Array.isArray(repoParsed.bookings) ? repoParsed.bookings : [];

      state.__jsbStore = {
        workers: workers.map((worker) => ({
          ...worker,
          role: worker.role === 'Barbero senior' ? 'Barbero' : worker.role,
          active: worker.active !== false,
        })),
        bookings: bookings.filter((booking): booking is BookingRecord => Boolean(booking && booking.id)),
      };
    } catch {
      state.__jsbStore = seedStore();
    }

    await persistStore();
  }

  return state.__jsbStore ?? seedStore();
}

function slugifyWorkerName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function sortBookings(bookings: BookingRecord[]) {
  return [...bookings].sort((a, b) => {
    const left = `${a.date}T${a.time}`;
    const right = `${b.date}T${b.time}`;
    return left.localeCompare(right);
  });
}

function getServiceDurationMinutes(serviceName: string) {
  const duration = services.find((service) => service.name === serviceName)?.duration ?? '30 min';
  return Number.parseInt(duration, 10) || 30;
}

function toMinutes(value: string) {
  const [hours = '0', minutes = '0'] = String(value || '').split(':');
  return Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes, 10);
}

function getBookingSpan(record: Pick<BookingRecord, 'service' | 'time'>): BookingSpan {
  const start = toMinutes(record.time);
  return {
    start,
    end: start + getServiceDurationMinutes(record.service),
  };
}

function bookingConflicts(
  store: StoreData,
  candidate: Pick<BookingRecord, 'service' | 'barber' | 'date' | 'time'>,
  excludeBookingId?: string,
) {
  const candidateSpan = getBookingSpan(candidate);

  return store.bookings.some((booking) => {
    if (booking.status === 'Cancelada') {
      return false;
    }

    if (excludeBookingId && booking.id === excludeBookingId) {
      return false;
    }

    if (booking.date !== candidate.date || booking.barber !== candidate.barber) {
      return false;
    }

    const bookingSpan = getBookingSpan(booking);
    return candidateSpan.start < bookingSpan.end && bookingSpan.start < candidateSpan.end;
  });
}

export async function getWorkers() {
  const store = await loadStore();
  return [...store.workers].filter((worker) => worker.active);
}

export async function getAllWorkers() {
  const store = await loadStore();
  return [...store.workers];
}

export async function addWorker(record: { name: string; role: string }) {
  const value = slugifyWorkerName(record.name);
  const store = await loadStore();
  const workers = store.workers;
  const duplicate = workers.find((worker) => worker.value === value && worker.active);
  if (duplicate) {
    return null;
  }

  const worker: WorkerRecord = {
    id: crypto.randomUUID(),
    value,
    name: record.name,
    role: record.role,
    active: true,
  };

  workers.push(worker);
  await persistStore();
  return worker;
}

export async function removeWorker(id: string) {
  const store = await loadStore();
  const worker = store.workers.find((item) => item.id === id);
  if (!worker) {
    return null;
  }

  worker.active = false;
  await persistStore();
  return worker;
}

export async function isActiveWorker(value: string) {
  return (await getWorkers()).some((worker) => worker.value === value);
}

export async function getWorkerLabel(value: string) {
  const worker = (await getAllWorkers()).find((item) => item.value === value);
  return worker?.name ?? getBarberLabel(value as never);
}

export async function createBooking(
  record: Omit<BookingRecord, 'id' | 'createdAt' | 'status' | 'barberLabel'>,
) {
  const store = await loadStore();
  if (bookingConflicts(store, record)) {
    return null;
  }

  const stored: BookingRecord = {
    ...record,
    barberLabel: await getWorkerLabel(record.barber),
    id: crypto.randomUUID(),
    status: 'Pendiente',
    createdAt: new Date().toISOString(),
  };

  store.bookings.unshift(stored);
  await persistStore();
  return stored;
}

export async function getBookings() {
  const store = await loadStore();
  return sortBookings(store.bookings);
}

function matchesCustomer(booking: BookingRecord, customer: CustomerIdentity) {
  return (
    booking.name.trim().toLowerCase() === customer.name.trim().toLowerCase() &&
    booking.phone.trim() === customer.phone.trim()
  );
}

export async function getCustomerBookings(customer: CustomerIdentity) {
  const store = await loadStore();
  return sortBookings(store.bookings.filter((booking) => matchesCustomer(booking, customer)));
}

export async function cancelBooking(id: string) {
  const store = await loadStore();
  const booking = store.bookings.find((item) => item.id === id);
  if (!booking) {
    return null;
  }

  booking.status = 'Cancelada';
  await persistStore();
  return booking;
}

export async function cancelCustomerBooking(id: string, customer: CustomerIdentity) {
  const store = await loadStore();
  const booking = store.bookings.find((item) => item.id === id && matchesCustomer(item, customer));
  if (!booking) {
    return null;
  }

  booking.status = 'Cancelada';
  await persistStore();
  return booking;
}

export async function updateCustomerBooking(
  id: string,
  customer: CustomerIdentity,
  record: Omit<BookingRecord, 'id' | 'createdAt' | 'status' | 'barberLabel' | 'name' | 'phone'>,
) {
  const store = await loadStore();
  const booking = store.bookings.find((item) => item.id === id && matchesCustomer(item, customer));
  if (!booking) {
    return null;
  }

  if (bookingConflicts(store, record, booking.id)) {
    return null;
  }

  booking.service = record.service;
  booking.barber = record.barber;
  booking.barberLabel = await getWorkerLabel(record.barber);
  booking.date = record.date;
  booking.time = record.time;
  booking.notes = record.notes;
  booking.status = 'Pendiente';
  await persistStore();
  return booking;
}

export async function getDashboardData(): Promise<DashboardData> {
  const bookings = await getBookings();
  const workers = await getWorkers();
  const activeBookings = bookings.filter((booking) => booking.status !== 'Cancelada');
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pendiente');
  const confirmedBookings = bookings.filter((booking) => booking.status === 'Confirmada');
  const cancelledBookings = bookings.filter((booking) => booking.status === 'Cancelada');

  return {
    bookings,
    workers,
    activeBookings,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    totalBookings: activeBookings.length,
  };
}
