import { DocumentData, DocumentReference, Query, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export function stripUndefinedDeep<T>(value: T, seen = new WeakSet<object>()): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item, seen))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === 'object') {
    if (seen.has(value as object)) {
      return undefined as T;
    }

    seen.add(value as object);

    return Object.entries(value as Record<string, unknown>).reduce((acc, [key, entryValue]) => {
      if (entryValue !== undefined) {
        const sanitizedEntry = stripUndefinedDeep(entryValue, seen);
        if (sanitizedEntry !== undefined) {
          acc[key] = sanitizedEntry;
        }
      }

      return acc;
    }, {} as Record<string, unknown>) as T;
  }

  return value;
}

export function toFirestorePlainData<T>(value: T): T {
  return JSON.parse(JSON.stringify(stripUndefinedDeep(value))) as T;
}

export function compareByName<T extends { firstName?: string; lastName?: string }>(left: T, right: T): number {
  const lastNameCompare = (left.lastName || '').localeCompare(right.lastName || '');
  if (lastNameCompare !== 0) {
    return lastNameCompare;
  }

  return (left.firstName || '').localeCompare(right.firstName || '');
}

function withOptionalId<T>(value: T, id: string, idField?: string): T {
  if (!idField || !value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  return {
    ...(value as Record<string, unknown>),
    [idField]: id
  } as T;
}

export function observeDocumentData<T>(
  reference: DocumentReference<DocumentData>,
  options?: { idField?: string }
): Observable<T | undefined> {
  return new Observable<T | undefined>((subscriber) =>
    onSnapshot(
      reference,
      (snapshot) => {
        if (!snapshot.exists()) {
          subscriber.next(undefined);
          return;
        }

        subscriber.next(withOptionalId(snapshot.data() as T, snapshot.id, options?.idField));
      },
      (error) => subscriber.error(error)
    )
  );
}

export function observeCollectionData<T>(
  queryRef: Query<DocumentData>,
  options?: { idField?: string }
): Observable<T[]> {
  return new Observable<T[]>((subscriber) =>
    onSnapshot(
      queryRef,
      (snapshot) => {
        subscriber.next(
          snapshot.docs.map((docSnapshot) =>
            withOptionalId(docSnapshot.data() as T, docSnapshot.id, options?.idField)
          )
        );
      },
      (error) => subscriber.error(error)
    )
  );
}
