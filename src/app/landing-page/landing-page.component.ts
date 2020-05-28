import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalGameClientService } from "../global-game-client.service";
import { MatDialog } from '@angular/material/dialog';
import { DialogPopupComponent } from '../dialog-popup/dialog-popup.component';
import {HelperArrowService} from "../helper-arrow/helper-arrow-service";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {

  constructor(private router: Router,private route: ActivatedRoute, 
     private clientService: GlobalGameClientService,
     private renderer: Renderer2,
      public dialog: MatDialog) { }

  ngOnInit() {
    var roomCode = this.route.snapshot.paramMap.get('room-code');
    if(roomCode)
    {
      this.openLandingDialog("join", roomCode)
    }
  }

  @ViewChild("waveWrapper") waveWrapper: ElementRef;
  @ViewChild("transitionBlock") transitionBlock: ElementRef;
  transitionOut()
  {
    this.renderer.addClass(this.waveWrapper.nativeElement, "waveWrapperGoUp");
    this.renderer.addClass(this.transitionBlock.nativeElement, "transitionBlockAnimate");
    setTimeout(()=>{
      this.router.navigateByUrl("/lobby");
    }, 2000);
  }

  openLandingDialog(mode, code?) {
    if(!code)
    {
      code = "";
    }
    const dialogRef = this.dialog.open(DialogPopupComponent, {
      width: '650px',
      data: { mode: mode, roomCode: code }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result.mode == 'create') {
          this.clientService.createRoom(result.name, result.score).then(result => {
            this.transitionOut();
          })
        }
        else {
          this.clientService.joinRoom(result.roomCode, result.name).then(result => {
            this.transitionOut();
          })
        }
      }
    });
  }


}