import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { environment } from './environments/environment';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';

if (environment.production) {
  enableProdMode();
}

const useEmulators = !environment.production && environment.useEmulators;

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      if (useEmulators) {
        connectAuthEmulator(
          auth,
          `http://${environment.emulators.auth.host}:${environment.emulators.auth.port}`,
          { disableWarnings: true }
        );
      }

      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (useEmulators) {
        connectFirestoreEmulator(
          firestore,
          environment.emulators.firestore.host,
          environment.emulators.firestore.port
        );
      }

      return firestore;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (useEmulators) {
        connectStorageEmulator(
          storage,
          environment.emulators.storage.host,
          environment.emulators.storage.port
        );
      }

      return storage;
    }),
    ...(useEmulators ? [] : [provideAnalytics(() => getAnalytics())]),
    importProvidersFrom(
      AppRoutingModule,
      NgbModule,
      FormsModule,
    )
  ]
}).catch(err => console.error(err));
