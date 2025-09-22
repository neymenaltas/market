import { Component } from '@angular/core';
import {OwnerNavigationComponent} from "@components/owner-navigation/owner-navigation.component";

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    OwnerNavigationComponent
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {

}
