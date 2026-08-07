const DB_NAME = 'MSC_Scanner_DB';
const DB_VERSION = 1;

export interface OfflineCheckin {
  id?: number;
  eventId: string;
  hash: string;
  type: 'PRIMARY' | 'MEMBER';
  memberIndex?: number;
  timestamp: number;
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is not available on server-side'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database failed to open:', event);
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('registrations')) {
        db.createObjectStore('registrations', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getStore(storeName: 'registrations' | 'sync_queue', mode: IDBTransactionMode): Promise<IDBObjectStore> {
  const db = await initDB();
  return db.transaction(storeName, mode).objectStore(storeName);
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRegistrations(regs: any[]): Promise<void> {
  const store = await getStore('registrations', 'readwrite');
  store.clear();
  regs.forEach((reg) => store.put(reg));
}

export async function saveSingleRegistration(reg: any): Promise<void> {
  const store = await getStore('registrations', 'readwrite');
  await reqToPromise(store.put(reg));
}

export async function getRegistrationByHash(hash: string): Promise<any | null> {
  const store = await getStore('registrations', 'readonly');
  const all = await reqToPromise(store.getAll());
  return all.find((reg: any) => reg.hash_payload === hash) || null;
}

export async function updateLocalRegistrationCheckin(
  hash: string,
  type: 'PRIMARY' | 'MEMBER',
  memberIndex?: number
): Promise<void> {
  const reg = await getRegistrationByHash(hash);
  if (!reg) return;

  if (type === 'PRIMARY') {
    reg.checked_in = true;
  } else if (type === 'MEMBER' && typeof memberIndex === 'number' && reg.team_data?.members?.[memberIndex]) {
    reg.team_data.members[memberIndex].checked_in = true;
  }

  const store = await getStore('registrations', 'readwrite');
  await reqToPromise(store.put(reg));
}

export async function addToSyncQueue(
  eventId: string,
  hash: string,
  type: 'PRIMARY' | 'MEMBER',
  memberIndex?: number
): Promise<void> {
  const store = await getStore('sync_queue', 'readwrite');
  await reqToPromise(
    store.add({ eventId, hash, type, memberIndex, timestamp: Date.now() })
  );
}

export async function getSyncQueue(): Promise<OfflineCheckin[]> {
  const store = await getStore('sync_queue', 'readonly');
  return reqToPromise(store.getAll());
}

export async function removeFromSyncQueue(ids: number[]): Promise<void> {
  const store = await getStore('sync_queue', 'readwrite');
  ids.forEach((id) => store.delete(id));
}

export async function getRegistrationCount(): Promise<number> {
  const store = await getStore('registrations', 'readonly');
  return reqToPromise(store.count());
}

export async function searchCachedRegistrations(query: string): Promise<any[]> {
  if (!query.trim()) return [];
  const store = await getStore('registrations', 'readonly');
  const all = await reqToPromise(store.getAll());
  const term = query.toLowerCase();
  const matches = all.filter((reg: any) => {
    const leadEmail = reg.lead_email?.toLowerCase() || '';
    const name = reg.form_data?.fullName?.toLowerCase() || '';
    const regNum = reg.form_data?.regNum?.toLowerCase() || '';
    const teamName = reg.team_data?.teamName?.toLowerCase() || '';

    const memberMatch = reg.team_data?.members?.some((m: any) =>
      m.fullName?.toLowerCase().includes(term) ||
      m.regNum?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term)
    );

    return leadEmail.includes(term) || name.includes(term) || regNum.includes(term) || teamName.includes(term) || memberMatch;
  });

  return matches.slice(0, 5);
}