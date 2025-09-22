import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from "@services/auth.service";


export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data?.['roles'] ?? [];
  const userRole = authService.getUserRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true; // kullanıcı rolü izinli
  }

  // izin yoksa login sayfasına veya yetkisiz sayfaya yönlendir
  router.navigate(['/']);
  return false;
};
