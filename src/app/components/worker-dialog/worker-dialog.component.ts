import {Component, Inject} from '@angular/core';
import {CommonModule, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-worker-dialog',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './worker-dialog.component.html',
  styleUrl: './worker-dialog.component.scss'
})
export class WorkerDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<WorkerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      this.username = data.username;
      this.userId = data._id;
    }
  }

  public username: string = '';
  public userId: string = '';
  password: string = '';
  placeIds: string[] = [];

  save() {
    this.dialogRef.close(
      { username: this.username,
        _id: this.userId || '',
        password: this.password,
      });
  }

  close() {
    this.dialogRef.close(); // sadece kapat
  }
}
