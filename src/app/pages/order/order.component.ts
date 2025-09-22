import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from "@services/product.service";
import { CommonModule } from "@angular/common";
import { debounceTime, map, Observable, startWith, Subscription, BehaviorSubject } from 'rxjs';
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { OwnerNavigationComponent } from "@components/owner-navigation/owner-navigation.component";
import { WorkerNavigationComponent } from "@components/worker-navigation/worker-navigation.component";

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OwnerNavigationComponent, WorkerNavigationComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, OnDestroy {

  activeTab: 'products' | 'orders' = 'products';
  placeId: number = 0;
  workerId: number = 0;
  products: any[] = [];
  orders: any[] = [];
  searchControl = new FormControl('');
  expandedOrder: number | null = null;
  userRole: string = "";

  // ✅ SADECE array kullan, observable kullanma
  filteredProducts: any[] = [];

  private priceUpdateSubscription: Subscription | null = null;
  private initialPricesSubscription: Subscription | null = null;

  constructor(public productService: ProductService) {}

  ngOnInit() {
    this.placeId = JSON.parse(<string>localStorage.getItem("userData")).user.placeIds[0];
    this.workerId = JSON.parse(<string>localStorage.getItem("userData")).user.id;
    this.userRole = JSON.parse(<string>localStorage.getItem("userData")).user.role;

    // ✅ Search değişikliklerini dinle ve array'i güncelle
    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(searchText => {
      this.updateFilteredProducts(searchText || '');
    });

    this.getWorkerOrders();
    this.connectToPriceUpdates();
  }

  ngOnDestroy() {
    this.disconnectFromPriceUpdates();
  }

  // ✅ Products değiştiğinde filteredProducts'ı güncelle
  private updateProducts(newProducts: any[]): void {
    this.products = newProducts;
    this.updateFilteredProducts(this.searchControl.value || '');
  }

  // ✅ Filtrelenmiş ürünleri güncelle
  private updateFilteredProducts(searchText: string): void {
    if (!searchText) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.productName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    console.log('🔍 Filtered products updated:', this.filteredProducts.length);
  }

  connectToPriceUpdates(): void {
    this.productService.connectToPriceUpdates("" + this.placeId);

    this.initialPricesSubscription = this.productService.getInitialPrices().subscribe({
      next: (products) => {
        console.log('Socket\'ten gelen initial products:', products);

        if (this.products.length === 0) {
          const newProducts = products.map((product: any) => ({
            ...product,
            count: 0
          }));
          // ✅ updateProducts metodunu kullan
          this.updateProducts(newProducts);
          console.log('İlk ürün yüklemesi tamamlandı:', this.products.length, 'ürün');
        } else {
          const updatedProducts = this.products.map(localProduct => {
            const updatedProduct = products.find((p: any) => p._id === localProduct._id);
            if (updatedProduct) {
              return {
                ...updatedProduct,
                count: localProduct.count || 0
              };
            }
            return localProduct;
          });
          // ✅ updateProducts metodunu kullan
          this.updateProducts(updatedProducts);
          console.log('Ürün fiyatları güncellendi');
        }
      },
      error: (err) => {
        console.error('İlk fiyatlar alınırken hata:', err);
        this.getProductsFallback();
      }
    });

    this.priceUpdateSubscription = this.productService.getPriceUpdates().subscribe({
      next: (update) => {
        this.updateProductPrice(update);
      },
      error: (err) => {
        console.error('Fiyat güncelleme dinleme hatası:', err);
      }
    });
  }

  private getProductsFallback(): void {
    this.productService.getProducts("" + this.placeId).subscribe({
      next: (res) => {
        if (res) {
          const newProducts = res.products.map((product: any) => ({
            ...product,
            count: 0
          }));
          // ✅ updateProducts metodunu kullan
          this.updateProducts(newProducts);
          console.log("Fallback: Ürünler HTTP ile getirildi:", this.products);
        }
      },
      error: (err) => {
        console.error("Fallback ürün getirme hatası:", err);
      }
    });
  }

  disconnectFromPriceUpdates(): void {
    if (this.priceUpdateSubscription) {
      this.priceUpdateSubscription.unsubscribe();
    }
    if (this.initialPricesSubscription) {
      this.initialPricesSubscription.unsubscribe();
    }
    this.productService.disconnectFromPriceUpdates("" + this.placeId);
  }

  updateProductPrice(update: any): void {
    const productIndex = this.products.findIndex(p => p._id === update.productId);

    if (productIndex !== -1) {
      const currentCount = this.products[productIndex].count;
      this.products[productIndex] = {
        ...this.products[productIndex],
        currentPrice: update.newPrice,
        count: currentCount
      };

      console.log(`Ürün fiyatı güncellendi: ${update.productId} -> ${update.newPrice}`);

      // ✅ Fiyat güncellendiğinde filteredProducts'ı da güncelle
      this.updateFilteredProducts(this.searchControl.value || '');
    }
  }

  decrementOrder(product: any) {
    if (product.count > 0) {
      product.count = product.count - 1;
      // Count değiştiğinde template otomatik güncellenecek
    }
  }

  incrementOrder(product: any) {
    product.count = product.count + 1;
    // Count değiştiğinde template otomatik güncellenecek
  }

  createOrder() {
    let orderedProducts: any[] = [];
    this.products.filter(product => product.count > 0).forEach((product: any) => {
      orderedProducts.push({
        productId: product._id,
        productName: product.productName,
        soldPrice: product.currentPrice,
        quantity: product.count
      });
    });

    if (orderedProducts.length === 0) {
      alert('Lütfen en az bir ürün seçin');
      return;
    }

    this.productService.createOrder("" + this.placeId, orderedProducts).subscribe({
      next: (res) => {
        console.log("Order başarılı:", res);
        // Count'ları sıfırla
        this.products = this.products.map(product => ({
          ...product,
          count: 0
        }));
        // ✅ Filtered products'ı güncelle
        this.updateFilteredProducts(this.searchControl.value || '');
        this.getWorkerOrders();
      },
      error: (err) => {
        console.error("Order hatası:", err);
      }
    });
  }

  getWorkerOrders() {
    this.productService.getWorkerOrders("" + this.workerId).subscribe({
      next: (res) => {
        if (res) {
          this.orders = res.orders;
          console.log("Orderlar getirildi:", this.orders);
        }
      },
      error: (err) => {
        console.error("Order getirme hatası:", err);
      }
    });
  }

  deleteOrder(order: any) {
    this.productService.deleteOrder(order._id).subscribe({
      next: (res) => {
        if (res) {
          this.orders = this.orders.filter(_order => _order._id !== order._id);
          console.log("Silme başarılı");
        }
      },
      error: (err) => {
        console.error("Silme hatası:", err);
      }
    });
  }

  getTotalAmount(): number {
    return this.products.reduce((total, product) => {
      return total + (product.currentPrice * product.count);
    }, 0);
  }

  toggleOrderDetails(index: number) {
    if (this.expandedOrder === index) {
      this.expandedOrder = null;
    } else {
      this.expandedOrder = index;
    }
  }
}
