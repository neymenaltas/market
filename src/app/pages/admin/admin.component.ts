import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {AdminService} from "@services/admin.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {

  placeName = '';
  username: string = "";
  password: string = "";
  places: any[] = [];
  owners: any[] = [];
  selectedOwnerId: string = '';
  selectedPlaceId: string = '';

  constructor(public adminService: AdminService) {
  }

  ngOnInit() {
    this.getOwners();
    this.getPlaces();
  }

  registerPlace() {
    this.adminService.registerPlace(this.placeName).subscribe({
      next: (res) => {
        console.log("Mekan Kayıt başarılı:", res);
      },
      error: (err) => {
        console.error("Mekan Kayıt hatası:", err);
      }
    });
  }

  createOwner() {
    this.adminService.createOwner(this.username, this.password).subscribe({
      next: (res) => {
        console.log("Kayıt başarılı:", res);
      },
      error: (err) => {
        console.error("Kayıt hatası:", err);
      }
    });
  }

  getPlaces() {
    this.adminService.getPlaces().subscribe({
      next: (res) => {
        this.places = res.places;
        console.log("Kayıt başarılı:", res);
      },
      error: (err) => {
        console.error("Kayıt hatası:", err);
      }
    });
  }

  getOwners() {
    this.adminService.getOwners().subscribe({
      next: (res) => {
        this.owners = res.owners;
        console.log("Kayıt başarılı:", res);
      },
      error: (err) => {
        console.error("Kayıt hatası:", err);
      }
    });
  }


  onOwnerChange(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    this.selectedOwnerId = selectEl.value;
    console.log('Seçilen Owner ID:', this.selectedOwnerId);
  }


  onPlaceChange(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    this.selectedPlaceId = selectEl.value;
    console.log('Seçilen Place ID:', this.selectedPlaceId);
  }

  assignOwnerToPlace() {
    this.adminService.assignOwnerToPlace(this.selectedOwnerId, this.selectedPlaceId).subscribe({
      next: (res) => {
        this.owners = res.owners;
        console.log("Assign başarılı:", res);
      },
      error: (err) => {
        console.error("Assign hatası:", err);
      }
    });
  }

}
