import { Pipe, PipeTransform, inject } from '@angular/core';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Pipe({
  name: 'getDownloadURL',
  standalone: true
})
export class GetDownloadURLPipe implements PipeTransform {
  private storage = inject(Storage);

  transform(path: unknown): Observable<string | null> {
    if (typeof path !== 'string') {
      return of(null);
    }

    const normalizedPath = path.trim();
    if (!normalizedPath) {
      return of(null);
    }

    try {
      return from(getDownloadURL(ref(this.storage, normalizedPath))).pipe(
        catchError(() => of(null))
      );
    } catch {
      return of(null);
    }
  }
}
