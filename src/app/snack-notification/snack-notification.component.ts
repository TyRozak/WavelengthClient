import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface SnackData {
  error: string;
}

@Component({
  selector: 'app-snack-notification',
  templateUrl: './snack-notification.component.html',
  styleUrls: ['./snack-notification.component.css']
})

export class SnackNotificationComponent implements OnInit {

  errorMessage:string;
  constructor( @Inject(MAT_SNACK_BAR_DATA) public data: SnackData) {
    this.errorMessage = data.error;
   }

  ngOnInit(): void {

  }

}
