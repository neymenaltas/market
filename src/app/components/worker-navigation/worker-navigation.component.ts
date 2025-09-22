import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-worker-navigation',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './worker-navigation.component.html',
  styleUrl: './worker-navigation.component.scss'
})
export class WorkerNavigationComponent {

}
