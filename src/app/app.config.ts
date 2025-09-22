import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, isDevMode} from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';

import { routes } from './app.routes';
import {authInterceptor} from "@app/shared/auth.interceptor";
import {SocketService} from "@services/socket.service";
import {provideAnimations} from "@angular/platform-browser/animations";
import {MatDialogModule} from "@angular/material/dialog";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    importProvidersFrom(MatDialogModule),
    SocketService, provideAnimationsAsync(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ],
};
