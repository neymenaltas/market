import {Component, OnInit} from '@angular/core';
import {OwnerNavigationComponent} from "@components/owner-navigation/owner-navigation.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ProductService} from "@services/product.service";
import {NgForOf} from "@angular/common";
import {PlaceService} from "@services/place.service";

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [
    OwnerNavigationComponent,
    ReactiveFormsModule,
    NgForOf,
    FormsModule
  ],
  templateUrl: './exchange.component.html',
  styleUrl: './exchange.component.scss'
})
export class ExchangeComponent implements OnInit {

  public intervalMs: number = 0;
  places: any[] = [];
  selectedPlaceId = "";
  ownerId: string = "";

  constructor(public productService: ProductService, public placeService: PlaceService) {
  }

  ngOnInit() {
    this.ownerId = JSON.parse(<string>localStorage.getItem("userData")).user.id;
    this.getPlaces();
  }

  onPlaceChange(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    this.selectedPlaceId = selectEl.value;
    console.log('Seçilen Place ID:', this.selectedPlaceId);
  }

  getPlaces() {
    this.placeService.getPlaces(this.ownerId).subscribe({
      next: (res) => {
        this.places = res.places;
        if (this.places.length === 1) {
          this.selectedPlaceId = this.places[0]._id;
        }
        console.log("Kayıt başarılı:", res);
      },
      error: (err) => {
        console.error("Kayıt hatası:", err);
      }
    });
  }

  startExchange() {
    this.productService.startExchange(this.selectedPlaceId, this.intervalMs).subscribe({
      next: (res) => {
        console.log("Exchange başlatıldı:", res);
      },
      error: (err) => {
        console.error("Exchange başlatıldı hatası:", err);
      }
    })
  }

  stopExchange() {
    this.productService.stopExchange(this.selectedPlaceId).subscribe({
      next: (res) => {
        console.log("Exchange bitirildi:", res);
      },
      error: (err) => {
        console.error("Exchange bitirildi hatası:", err);
      }
    })
  }

}
