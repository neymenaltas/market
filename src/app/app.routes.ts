import { Routes } from '@angular/router';
import {MarketComponent} from "src/app/pages/market/market.component";
import {LoginComponent} from "@app/pages/login/login.component";
import {ReportComponent} from "@app/pages/report/report.component";
import {OrderComponent} from "@app/pages/order/order.component";
import {ManageProductComponent} from "@app/pages/manage-product/manage-product.component";
import {ManageWorkerComponent} from "@app/pages/manage-worker/manage-worker.component";
import {roleGuard} from "@app/shared/role.guard";
import {AdminComponent} from "@app/pages/admin/admin.component";
import {ExchangeComponent} from "@app/pages/exchange/exchange.component";

export const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'market',
    component: MarketComponent,
    canActivate: [roleGuard],
    data: { roles: ['owner', 'worker'] }
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'report',
    component: ReportComponent,
    canActivate: [roleGuard],
    data: { roles: ['owner'] }
  },
  {
    path: 'order',
    component: OrderComponent,
    canActivate: [roleGuard],
    data: { roles: ['owner', 'worker'] }
  },
  {
    path: 'product',
    component: ManageProductComponent,
    canActivate: [roleGuard],
    data: { roles: ['owner'] }
  },
  {
    path: 'worker',
    component: ManageWorkerComponent,
    canActivate: [roleGuard],
    data: { roles: ['owner'] }
  },
  {
    path: 'exchange',
    component: ExchangeComponent,
    canActivate: [roleGuard],
    data: { roles: ['owner'] }
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin'] }
  },
  { path: '**', redirectTo: '/login' }
];
