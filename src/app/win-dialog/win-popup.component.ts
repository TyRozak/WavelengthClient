import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { GlobalGameClientService } from '../global-game-client.service';
import { Router } from '@angular/router';

export interface WinnerData {
  winner:string
}
@Component({
  selector: 'app-win-popup',
  templateUrl: './win-popup.component.html',
  styleUrls: ['./win-popup.component.css']
})

export class WinPopupComponent {

  messageToDisplay = "";

  constructor(  @Inject(MAT_DIALOG_DATA) public data: WinnerData, public dialogRef: MatDialogRef<WinPopupComponent>,private router: Router, private clientService: GlobalGameClientService ) {
    this.playApplause();
    dialogRef.disableClose = true;
    if(data.winner == "both")
    {
      this.messageToDisplay = "Both Teams Win!"
    }
    else if(data.winner == "one")
    {
      this.messageToDisplay = "Team 1 Wins!"
    }
    else if(data.winner == "two")
    {
      this.messageToDisplay = "Team 2 Wins!"
    }
  }
  onNoClick(): void {
   
  }
  
  closeDialog()
  {
    this.dialogRef.close();
  }

  restartGame()
  {
    this.clientService.startGame();
  }

  leave()
  {
    window.location.href = "https://wavelength.zone"
  }

  playApplause()
  {
    if(this.clientService.soundEnabled){
      var audio = new Audio();
      audio.src = "../../assets/applause.wav"
      audio.load();
      audio.play();
    }
  
  }
}
