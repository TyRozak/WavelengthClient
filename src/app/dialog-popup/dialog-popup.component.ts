import { Component , Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ColorEvent } from 'ngx-color';
import { GlobalGameClientService } from '../global-game-client.service';
import { FormControl, Validators } from '@angular/forms';

export interface DialogData {
  name: string;
  color: string;
  roomCode: string;
  score : 10;
  mode:string;
}

@Component({
  selector: 'app-dialog-popup',
  templateUrl: './dialog-popup.component.html',
  styleUrls: ['./dialog-popup.component.css']
})

export class DialogPopupComponent {

  colors:any;
  colorsVisible:any;
  name = new FormControl('', [Validators.required]);
  room = new FormControl('', [Validators.required]);
  points = new FormControl('', [Validators.required, Validators.min(0), Validators.max(99), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]);

  constructor(public dialogRef: MatDialogRef<DialogPopupComponent>,  @Inject(MAT_DIALOG_DATA) public data: DialogData, private clientService: GlobalGameClientService ) {
    this.data.score = 10;
  }

  
  roomInvalid = false;
  nameInvalid = false;
  close()
  {
    this.roomInvalid = true;
    this.nameInvalid = true;
  }  

  onNoClick(): void {
    this.dialogRef.close();
  }
  

}
