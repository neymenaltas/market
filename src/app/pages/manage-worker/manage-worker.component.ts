import {Component, OnInit} from '@angular/core';
import {WorkerService} from "@services/worker.service";
import {PlaceService} from "@services/place.service";
import {FormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";
import {OwnerNavigationComponent} from "@components/owner-navigation/owner-navigation.component";
import {MatDialog} from "@angular/material/dialog";
import {WorkerDialogComponent} from "@components/worker-dialog/worker-dialog.component";

@Component({
  selector: 'app-manage-worker',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    OwnerNavigationComponent
  ],
  templateUrl: './manage-worker.component.html',
  styleUrl: './manage-worker.component.scss'
})
export class ManageWorkerComponent implements OnInit {

  selectedPlaceId = "";
  places: any[] = [];
  workers: any[] = [];
  ownerId = ""

  constructor(public workerService: WorkerService, public placeService: PlaceService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.ownerId = JSON.parse(<string>localStorage.getItem("userData")).user.id;
    this.getPlaces();
  }

  registerWorker(username:string, password:string) {
    this.workerService.registerWorker(username, password, this.selectedPlaceId).subscribe({
      next: (res) => {
        console.log(res)
        this.workers = [
          {
            _id: res.user.id,
            username: res.user.username,
            role: res.user.role
          },
          ...this.workers
        ]
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
          this.getWorkers();
        }
        console.log("Kayıt başarılı:", res);
      },
      error: (err) => {
        console.error("Kayıt hatası:", err);
      }
    });
  }

  getWorkers() {
    this.workerService.getWorkers(this.selectedPlaceId).subscribe({
      next: (res) => {
        this.workers = res.workers;
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
    this.getWorkers();
    console.log('Seçilen Place ID:', this.selectedPlaceId);
  }

  deleteWorker(worker: any) {
    this.workerService.deleteWorker(worker._id).subscribe({
      next: (res) => {
        this.workers = this.workers.filter(_worker => _worker._id !== worker._id);
        console.log("Silme başarılı:", res);
      },
      error: (err) => {
        console.error("Silme hatası:", err);
      }
    });
  }

  editWorker(worker: any) {
    const dialogRef = this.dialog.open(WorkerDialogComponent, {
      width: '600px',
      height: '500px',
      data: { ...worker }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result)
        this.workerService.editWorker(result._id, result.username, result.password).subscribe({
          next: (response) => {
            console.log('Worker başarıyla güncellendi:', response);
            this.getWorkers();
          },
          error: (error) => {
            console.error('Worker güncelleme hatası:', error);
          }
        });;
      }
    });
  }

  openAddWorkerDialog() {
    const dialogRef = this.dialog.open(WorkerDialogComponent, {
      width: '600px',
      height: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.registerWorker(result.username, result.password);
      }
    });
  }

}
