import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProductService } from "@services/product.service";
import {PlaceService} from "@services/place.service";

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit, OnDestroy {
  placeId = JSON.parse(<string>localStorage.getItem("userData")).user.placeIds[0];
  products: any[] = [];
  loading = true;
  error: string | null = null;
  crashMessage: string = '';
  private crashMessageSubscription: Subscription | null = null;

  // Auto-scroll için yeni özellikler
  currentHighlightedIndex: number = -1;
  private animationFrameId: number | null = null;
  private lastScrollTime: number = 0;
  private readonly SCROLL_INTERVAL = 3000; // 3 saniye
  private readonly SCROLL_DELAY = 5000; // Başlangıç gecikmesi
  private scrollStartTime: number = 0;

  private priceUpdateSubscription: Subscription | null = null;
  private initialPricesSubscription: Subscription | null = null;
  private errorSubscription: Subscription | null = null;
  private connectionTimeout: any = null;

  constructor(private productService: ProductService, private placeService: PlaceService) { }

  ngOnInit(): void {
    this.loadProducts();
    this.connectToPriceUpdates();
    this.listenToCrashMessage();

    // Auto-scroll'u başlat (biraz gecikme ile)
    setTimeout(() => {
      this.startAutoScroll();
    }, this.SCROLL_DELAY);
  }

  ngOnDestroy(): void {
    this.disconnectFromPriceUpdates();
    this.stopAutoScroll();
    if (this.crashMessageSubscription) {
      this.crashMessageSubscription.unsubscribe();
      this.crashMessageSubscription = null;
    }
  }

  // Auto-scroll başlat (requestAnimationFrame ile)
  startAutoScroll(): void {
    if (this.products.length === 0) return;

    this.scrollStartTime = performance.now();
    this.lastScrollTime = performance.now();
    this.autoScrollLoop();
  }

  // Ana scroll döngüsü
  private autoScrollLoop = (): void => {
    const currentTime = performance.now();

    // SCROLL_INTERVAL süre geçtiyse bir sonraki satıra geç
    if (currentTime - this.lastScrollTime >= this.SCROLL_INTERVAL) {
      this.highlightNextRow();
      this.lastScrollTime = currentTime;
    }

    // Döngüyü devam ettir
    this.animationFrameId = requestAnimationFrame(this.autoScrollLoop);
  }

  // Auto-scroll durdur
  stopAutoScroll(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Bir sonraki satırı highlight et ve scroll yap
  highlightNextRow(): void {
    if (this.products.length === 0) return;

    this.currentHighlightedIndex++;

    // Eğer son satıra ulaştıysak başa dön
    if (this.currentHighlightedIndex >= this.products.length) {
      this.currentHighlightedIndex = 0;
      this.scrollToTop();
    } else {
      this.scrollToRow(this.currentHighlightedIndex);
    }
  }

  // Belirli bir satıra scroll yap
  scrollToRow(index: number): void {
    const element = document.getElementById(`product-${this.products[index]._id}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  // Tablonun en üstüne scroll yap
  scrollToTop(): void {
    const tableContainer = document.querySelector('.products-table tbody');
    if (tableContainer) {
      tableContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  // Satırın highlight olup olmadığını kontrol et
  isRowHighlighted(index: number): boolean {
    return this.currentHighlightedIndex === index;
  }

  // Ürünleri yükle
  loadProducts(): void {
    this.productService.getProducts(this.placeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
          this.loading = false;
        } else {
          this.error = 'Ürünler yüklenirken hata oluştu';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Sunucu bağlantı hatası';
        this.loading = false;
        console.error('Ürün yükleme hatası:', err);
      }
    });
  }

  // Fiyat güncellemelerine bağlan
  connectToPriceUpdates(): void {
    this.productService.connectToPriceUpdates(this.placeId);

    // İlk fiyatları dinle (timeout ile)
    this.initialPricesSubscription = this.productService.getInitialPrices().subscribe({
      next: (products) => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.products = products;
        this.loading = false;

        // Ürünler yüklendiğinde auto-scroll'u başlat
        setTimeout(() => {
          this.startAutoScroll();
        }, this.SCROLL_DELAY);
      },
      error: (err) => {
        console.error('İlk fiyatlar alınırken hata:', err);
        this.loading = false;
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

    // Hataları dinle
    this.errorSubscription = this.productService.getErrors().subscribe({
      next: (error) => {
        this.error = error.message || 'WebSocket hatası';
        console.error('WebSocket hatası:', error);
      }
    });

    // 10 saniye içinde bağlantı kurulamazsa timeout
    this.connectionTimeout = setTimeout(() => {
      if (this.loading) {
        this.error = 'WebSocket bağlantısı zaman aşımına uğradı';
        this.loading = false;
        console.error('WebSocket bağlantı zaman aşımı');
      }
    }, 10000);
  }

  // Fiyat güncellemelerinden bağlantıyı kes
  disconnectFromPriceUpdates(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.priceUpdateSubscription) {
      this.priceUpdateSubscription.unsubscribe();
      this.priceUpdateSubscription = null;
    }
    if (this.initialPricesSubscription) {
      this.initialPricesSubscription.unsubscribe();
      this.initialPricesSubscription = null;
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
      this.errorSubscription = null;
    }

    this.productService.disconnectFromPriceUpdates(this.placeId);
  }

  // Ürün fiyatını güncelle
  updateProductPrice(update: any): void {
    const productIndex = this.products.findIndex(p => p._id === update.productId);

    if (productIndex !== -1) {
      // Yeni fiyatı güncelle ve animasyon için işaretle
      this.products[productIndex].currentPrice = update.newPrice;
      this.products[productIndex].justUpdated = true;

      // 2 saniye sonra animasyon işaretini kaldır
      setTimeout(() => {
        if (this.products[productIndex]) {
          this.products[productIndex].justUpdated = false;
        }
      }, 2000);
    }
  }

  get sortedProductsByChange() {
    return this.products
      .map(p => ({
        ...p,
        changePercent: ((p.currentPrice - p.regularPrice) / p.regularPrice) * 100
      }))
      .sort((a, b) => a.changePercent - b.changePercent);
  }

  listenToCrashMessage(): void {
    this.crashMessageSubscription = this.placeService.socketService
      .onCrashMessageUpdate()
      .subscribe({
        next: (update) => {
          console.log('🚨 YENİ CRASH MESSAGE:', update.crashMessage);
          this.crashMessage = update.crashMessage;
        },
        error: (err) => {
          console.error('Crash message dinleme hatası:', err);
        }
      });
  }
}
