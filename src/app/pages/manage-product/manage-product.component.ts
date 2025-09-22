import {Component, OnInit} from '@angular/core';
import {ProductService} from "@services/product.service";
import {FormsModule} from "@angular/forms";
import {PlaceService} from "@services/place.service";
import {NgForOf} from "@angular/common";
import {OwnerNavigationComponent} from "@components/owner-navigation/owner-navigation.component";
import {MatDialog} from "@angular/material/dialog";
import {ProductDialogComponent} from "@components/product-dialog/product-dialog.component";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";

@Component({
  selector: 'app-manage-product',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    OwnerNavigationComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './manage-product.component.html',
  styleUrl: './manage-product.component.scss'
})
export class ManageProductComponent implements OnInit {


  selectedPlaceId = "";
  ownerId = ""
  places: any[] = [];
  products: any[] = [];

  constructor(public productService: ProductService, public placeService: PlaceService, private dialog: MatDialog) {

  }

  ngOnInit() {
    this.ownerId = JSON.parse(<string>localStorage.getItem("userData")).user.id;
    this.getPlaces();
  }

  registerProduct(productName: string, regularPrice: number, minPrice: number, maxPrice: number) {
    this.productService.registerProduct(this.selectedPlaceId, productName, regularPrice, minPrice, maxPrice).subscribe({
      next: (res) => {
        console.log(res)
        console.log(this.products)
        this.products = [
          {
            currentPrice: res.product.currentPrice,
            maxPrice: res.product.maxPrice,
            minPrice: res.product.minPrice,
            placeId: res.product.placeId,
            productName: res.product.productName,
            regularPrice: res.product.regularPrice,
            _id: res.product._id,
          },
          ...this.products,
        ];
        console.log("Kayıt başarılı:", res);
      },
      error: (err) => {
        console.error("Kayıt hatası:", err);
      }
    });
  }

  getPlaces() {
    this.placeService.getPlaces(this.ownerId).subscribe({
      next: (res) => {
        this.places = res.places;
        if (this.places.length === 1) {
          this.selectedPlaceId = this.places[0]._id;
          this.getProducts();
        }
        console.log("Kayıt başarılı:", res);
      },
      error: (err) => {
        console.error("Kayıt hatası:", err);
      }
    });
  }

  getProducts() {
    this.productService.getProducts(this.selectedPlaceId).subscribe({
      next: (res) => {
        this.products = res.products;
        console.log("Kayıt başarılı:", res);
      },
      error: (err) => {
        console.error("Kayıt hatası:", err);
      }
    });
  }

  onPlaceChange(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    this.selectedPlaceId = selectEl.value;
    this.getProducts();
    console.log('Seçilen Place ID:', this.selectedPlaceId);
  }

  deleteProduct(product: any) {
    this.productService.deleteProduct(product._id).subscribe({
      next: (res) => {
        this.products = this.products.filter(_product => _product._id !== product._id);
        console.log("Silme başarılı:", res);
      },
      error: (err) => {
        console.error("Silme hatası:", err);
      }
    });
  }

  editProduct(product: any) {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '600px',
      height: '500px',
      data: { ...product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Düzenlenen ürün:', result);

        // ProductService'deki editProduct metodunu çağır
        this.productService.editProduct(
          result._id,           // productId
          result.productName,   // productName
          result.regularPrice,  // regularPrice
          result.minPrice,      // minPrice
          result.maxPrice,      // maxPrice (isteğe bağlı)
          result.currentPrice   // currentPrice (isteğe bağlı)
        ).subscribe({
          next: (response) => {
            console.log('Ürün başarıyla güncellendi:', response);
            // Başarılı mesajı göster veya ürün listesini yenile
            this.getProducts(); // Ürün listesini yeniden yükle
          },
          error: (error) => {
            console.error('Ürün güncelleme hatası:', error);
          }
        });
      }
    });
  }

  openAddProductDialog() {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '600px',
      height: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.registerProduct(result.productName, result.regularPrice, result.minPrice, result.maxPrice);
      }
    });
  }

}
