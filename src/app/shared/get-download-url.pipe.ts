import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Pipe({
  name: 'getDownloadURL',
  standalone: true
})
export class GetDownloadURLPipe implements PipeTransform {
  constructor(private storage: AngularFireStorage) {}

  transform(path: string): Observable<string | null> {
    if (!path) return of(null);
    return this.storage.ref(path).getDownloadURL().pipe(
      catchError(() => of(null))
    );
  }
}
