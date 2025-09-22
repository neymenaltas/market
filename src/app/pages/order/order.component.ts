import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
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

  // ✅ FIX: BehaviorSubject kullanarak products değişikliklerini takip et
  private productsSubject = new BehaviorSubject<any[]>([]);
  public filteredProducts$: Observable<any[]>;

  private priceUpdateSubscription: Subscription | null = null;
  private initialPricesSubscription: Subscription | null = null;

  constructor(public productService: ProductService) {
    // ✅ FIX: Products değiştiğinde otomatik güncellenen observable
    this.filteredProducts$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(searchText => this.filterProducts(searchText ?? '', this.productsSubject.value))
    );
  }

  ngOnInit() {
    this.placeId = JSON.parse(<string>localStorage.getItem("userData")).user.placeIds[0];
    this.workerId = JSON.parse(<string>localStorage.getItem("userData")).user.id;
    this.userRole = JSON.parse(<string>localStorage.getItem("userData")).user.role;

    this.getWorkerOrders();
    this.connectToPriceUpdates();
  }

  ngOnDestroy() {
    this.disconnectFromPriceUpdates();
  }

  toggleOrderDetails(index: number) {
    if (this.expandedOrder === index) {
      this.expandedOrder = null;
    } else {
      this.expandedOrder = index;
    }
  }

  connectToPriceUpdates(): void {
    this.productService.connectToPriceUpdates("" + this.placeId);

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

          // ✅ FIX: Products güncellendiğinde subject'i güncelle
          this.productsSubject.next(this.products);
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

          // ✅ FIX: Products güncellendiğinde subject'i güncelle
          this.productsSubject.next(this.products);
        }
      },
      error: (err) => {
        console.error('İlk fiyatlar alınırken hata:', err);
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
    this.productService.getProducts("" + this.placeId).subscribe({
      next: (res) => {
        if (res) {
          this.products = res.products.map((product: any) => ({
            ...product,
            count: 0
          }));
          console.log("Fallback: Ürünler HTTP ile getirildi:", this.products);

          // ✅ FIX: Products güncellendiğinde subject'i güncelle
          this.productsSubject.next(this.products);
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
    this.productService.disconnectFromPriceUpdates("" + this.placeId);
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

      // ✅ FIX: Fiyat güncellendiğinde subject'i güncelle
      this.productsSubject.next(this.products);
    }
  }

  decrementOrder(product: any) {
    if (product.count > 0) {
      product.count = product.count - 1;
      // ✅ FIX: Count değiştiğinde subject'i güncelle
      this.productsSubject.next(this.products);
    }
  }

  incrementOrder(product: any) {
    product.count = product.count + 1;
    // ✅ FIX: Count değiştiğinde subject'i güncelle
    this.productsSubject.next(this.products);
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
        // Sipariş verildikten sonra count'ları sıfırla
        this.products = this.products.map(product => ({
          ...product,
          count: 0
        }));
        // ✅ FIX: Count'lar sıfırlandığında subject'i güncelle
        this.productsSubject.next(this.products);
        // Sipariş listesini yenile
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

  // Toplam tutarı hesapla
  getTotalAmount(): number {
    return this.products.reduce((total, product) => {
      return total + (product.currentPrice * product.count);
    }, 0);
  }

  // ✅ FIX: Filter metodunu güncelle - products array'ini parametre olarak al
  filterProducts(searchText: string, products: any[]): any[] {
    if (!searchText) return products;
    return products.filter(product =>
      product.productName.toLowerCase().includes(searchText.toLowerCase())
    );
  }
}
