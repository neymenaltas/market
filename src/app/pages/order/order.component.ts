import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from "@services/product.service";
import { CommonModule } from "@angular/common";
import {debounceTime, map, Observable, startWith, Subscription} from 'rxjs';
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {OwnerNavigationComponent} from "@components/owner-navigation/owner-navigation.component";
import {WorkerNavigationComponent} from "@components/worker-navigation/worker-navigation.component";

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
  filteredProducts$: Observable<any[]> = new Observable<any[]>(); // başlangıçta boş Observable
  searchControl = new FormControl('');
  expandedOrder: number | null = null; // Açık olan siparişin index'i
  userRole: string = "";

  private priceUpdateSubscription: Subscription | null = null;
  private initialPricesSubscription: Subscription | null = null;

  constructor(public productService: ProductService) {}

  ngOnInit() {
    this.placeId = JSON.parse(<string>localStorage.getItem("userData")).user.placeIds[0];
    this.workerId = JSON.parse(<string>localStorage.getItem("userData")).user.id;
    this.userRole = JSON.parse(<string>localStorage.getItem("userData")).user.role;

    this.filteredProducts$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(searchText => this.filterProducts(searchText ?? '')) // null ise '' kullan
    );

    //this.getProducts();
    this.getWorkerOrders();
    this.connectToPriceUpdates(); // Fiyat güncellemelerine bağlan
  }

  ngOnDestroy() {
    this.disconnectFromPriceUpdates(); // Bağlantıyı temizle
  }

  toggleOrderDetails(index: number) {
    if (this.expandedOrder === index) {
      this.expandedOrder = null;
    } else {
      this.expandedOrder = index;
    }
  }

// Fiyat güncellemelerine bağlan
  connectToPriceUpdates(): void {
    this.productService.connectToPriceUpdates(""+this.placeId);

    // İlk fiyatları dinle
    this.initialPricesSubscription = this.productService.getInitialPrices().subscribe({
      next: (products) => {
        console.log('Socket\'ten gelen initial products:', products);

        if (this.products.length === 0) {
          // İlk yükleme - tüm ürünleri count ile birlikte set et
          this.products = products.map((product: any) => ({
            ...product,
            count: 0
          }));
          console.log('İlk ürün yüklemesi tamamlandı:', this.products.length, 'ürün');
        } else {
          // Güncelleme - mevcut count değerlerini koru
          this.products = this.products.map(localProduct => {
            const updatedProduct = products.find((p: any) => p._id === localProduct._id);
            if (updatedProduct) {
              return {
                ...updatedProduct,
                count: localProduct.count || 0
              };
            }
            return localProduct;
          });
          console.log('Ürün fiyatları güncellendi');
        }
      },
      error: (err) => {
        console.error('İlk fiyatlar alınırken hata:', err);
        // Hata durumunda fallback olarak HTTP ile getir
        this.getProductsFallback();
      }
    });

    // Fiyat güncellemelerini dinle
    this.priceUpdateSubscription = this.productService.getPriceUpdates().subscribe({
      next: (update) => {
        this.updateProductPrice(update);
      },
      error: (err) => {
        console.error('Fiyat güncelleme dinleme hatası:', err);
      }
    });
  }

// Fallback metodu - socket başarısız olursa HTTP ile getir
  private getProductsFallback(): void {
    this.productService.getProducts(""+this.placeId).subscribe({
      next: (res) => {
        if (res) {
          this.products = res.products.map((product: any) => ({
            ...product,
            count: 0
          }));
          console.log("Fallback: Ürünler HTTP ile getirildi:", this.products);
        }
      },
      error: (err) => {
        console.error("Fallback ürün getirme hatası:", err);
      }
    });
  }

  // Fiyat güncellemelerinden bağlantıyı kes
  disconnectFromPriceUpdates(): void {
    if (this.priceUpdateSubscription) {
      this.priceUpdateSubscription.unsubscribe();
    }
    if (this.initialPricesSubscription) {
      this.initialPricesSubscription.unsubscribe();
    }

    this.productService.disconnectFromPriceUpdates(""+this.placeId);
  }

  // Ürün fiyatını güncelle
  updateProductPrice(update: any): void {
    const productIndex = this.products.findIndex(p => p._id === update.productId);

    if (productIndex !== -1) {
      // Yeni fiyatı güncelle ama count değerini koru
      const currentCount = this.products[productIndex].count;
      this.products[productIndex] = {
        ...this.products[productIndex],
        currentPrice: update.newPrice,
        count: currentCount
      };

      console.log(`Ürün fiyatı güncellendi: ${update.productId} -> ${update.newPrice}`);
    }
  }

  /*
  getProducts() {
    this.productService.getProducts(""+this.placeId).subscribe({
      next: (res) => {
        if (res) {
          this.products = res.products.map((product: any) => {
            // Mevcut count'u koru veya 0 yap
            const existingProduct = this.products.find(p => p._id === product._id);
            return {
              ...product,
              count: existingProduct ? existingProduct.count : 0
            };
          });
          console.log("Ürünler getirildi:", this.products);
        }
      },
      error: (err) => {
        console.error("Ürün getirme hatası:", err);
      }
    });
  }

   */

  decrementOrder(product: any) {
    if (product.count > 0) {
      product.count = product.count - 1;
    }
  }

  incrementOrder(product: any) {
    product.count = product.count + 1;
  }

  createOrder() {
    let orderedProducts: any[] = [];
    this.products.filter(product => product.count > 0).forEach((product: any) => {
      orderedProducts.push({
        productId: product._id,
        productName: product.productName,
        soldPrice: product.currentPrice, // Güncel fiyatı kullan
        quantity: product.count
      });
    });

    if (orderedProducts.length === 0) {
      alert('Lütfen en az bir ürün seçin');
      return;
    }

    this.productService.createOrder(""+this.placeId, orderedProducts).subscribe({
      next: (res) => {
        console.log("Order başarılı:", res);
        // Sipariş verildikten sonra count'ları sıfırla
        this.products = this.products.map(product => ({
          ...product,
          count: 0
        }));
        // Sipariş listesini yenile
        this.getWorkerOrders();
      },
      error: (err) => {
        console.error("Order hatası:", err);
      }
    });
  }

  getWorkerOrders() {
    this.productService.getWorkerOrders(""+this.workerId).subscribe({
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

// Toplam tutarı hesapla
  getTotalAmount(): number {
    return this.products.reduce((total, product) => {
      return total + (product.currentPrice * product.count);
    }, 0);
  }


  filterProducts(searchText: string) {
    if (!searchText) return this.products;
    return this.products.filter(product =>
      product.productName.toLowerCase().includes(searchText.toLowerCase())
    );
  }
}
