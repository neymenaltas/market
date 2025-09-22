import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './product-dialog.component.html',
  styleUrl: './product-dialog.component.scss'
})
export class ProductDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      this.productName = data.productName;
      this.regularPrice = data.regularPrice;
      this.minPrice = data.minPrice;
      this.maxPrice = data.maxPrice;
      this.productId = data._id;
      this.currentPrice = data.currentPrice;
    }
  }

  public productName: string = '';
  public regularPrice: number | undefined;
  public minPrice: number | undefined;
  public maxPrice: number | undefined;
  public productId: string | undefined;
  public currentPrice: number | undefined;

  save() {
    this.dialogRef.close(
      { productName: this.productName,
        regularPrice: this.regularPrice,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        _id: this.productId || '',
        currentPrice: this.currentPrice,
      });
  }

  close() {
    this.dialogRef.close(); // sadece kapat
  }
}
