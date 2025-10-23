import { Component, OnInit } from '@angular/core';
import { OwnerNavigationComponent } from "@components/owner-navigation/owner-navigation.component";
import { ReportService } from "@services/report.service";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    OwnerNavigationComponent,
    CommonModule
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit {
  reportData: any | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  productsArray: any[] = [];
  totalSalesAmount = 0;
  selectedDate: string = '';
  maxDate: string = '';


  constructor(private reportService: ReportService) {}

  ngOnInit() {
    // Bugünün tarihi
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    // Varsayılan olarak dünün tarihi
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    this.selectedDate = yesterday.toISOString().split('T')[0];

    // İlk yükleme
    this.loadReport(this.selectedDate);
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.loadReport(this.selectedDate);
  }

  loadReport(dateString: string) {
    this.isLoading = true;
    this.error = '';

    const placeId = JSON.parse(<string>localStorage.getItem("userData")).user.placeIds[0];

    this.reportService.getReport(placeId, dateString).subscribe({
      next: (response) => {
        this.totalSalesAmount = response.data.totalSalesAmount;
        this.productsArray = Object.keys(response.data.products).map(key => ({
          name: this.formatProductName(key),
          totalSalesAmount: response.data.products[key].totalSalesAmount,
          totalQuantitySold: response.data.products[key].totalQuantitySold,
          averagePricePerUnit: response.data.products[key].averagePricePerUnit
        }));

        // Toplam satışa göre sırala
        this.productsArray.sort((a, b) => b.totalSalesAmount - a.totalSalesAmount);

        this.totalSalesAmount = response.data.totalSalesAmount;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Rapor yüklenirken bir hata oluştu';
        this.isLoading = false;
        console.error('Report Error:', error);
      }
    });
  }

  // Ürünleri array olarak almak için helper method
  getProductsArray(): any[] {
    if (!this.reportData?.data.products) return [];

    return Object.entries(this.reportData.data.products).map(([name, stats]:[string, any]) => ({
      name: name,
      totalSalesAmount: stats.totalSalesAmount,
      totalQuantitySold: stats.totalQuantitySold,
      averagePricePerUnit: stats.averagePricePerUnit
    }));
  }

  formatProductName(name: string): string {
    // camelCase'i düzgün formata çevir
    const formatted = name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
}
