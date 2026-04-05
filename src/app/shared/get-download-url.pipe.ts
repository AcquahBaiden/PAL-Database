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

  transform(path: string): Observable<string | null> {
    if (!path) return of(null);
    return from(getDownloadURL(ref(this.storage, path))).pipe(
      catchError(() => of(null))
    );
  }
}
