import { Component } from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { GlobalGameClientService } from '../global-game-client.service';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about-popup',
  templateUrl: './about-popup.component.html',
  styleUrls: ['./about-popup.component.css']
})

export class AboutPopupComponent {

  colors:any;
  colorsVisible:any;
  name = new FormControl('', [Validators.required]);
  room = new FormControl('', [Validators.required]);

  constructor(public dialogRef: MatDialogRef<AboutPopupComponent>,private router: Router, private clientService: GlobalGameClientService ) {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  closeDialog()
  {
    this.dialogRef.close();
  }

  goToGithub()
  {
    window.location.href = "https://github.com/TyRozak/wavelength"
  }

}
