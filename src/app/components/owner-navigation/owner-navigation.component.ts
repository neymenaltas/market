import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-owner-navigation',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './owner-navigation.component.html',
  styleUrl: './owner-navigation.component.scss'
})
export class OwnerNavigationComponent {

}
