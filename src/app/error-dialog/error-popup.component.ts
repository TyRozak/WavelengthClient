import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';

export interface WinnerData {
  error:string
}
@Component({
  selector: 'app-error-popup',
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.css']
})

export class ErrorPopupComponent {

  messageToDisplay = "";

  constructor(  @Inject(MAT_DIALOG_DATA) public data: WinnerData, 
                public dialogRef: MatDialogRef<ErrorPopupComponent>) {
    if(data.error =="server")
      this.messageToDisplay = "There seems to have been a server error, please try again in a bit";
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  closeDialog()
  {
    this.dialogRef.close();
  }

}
