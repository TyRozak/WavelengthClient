import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalGameClientService } from '../global-game-client.service';
import { ClipboardService } from 'ngx-clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-lobby-page',
  templateUrl: './lobby-page.component.html',
  styleUrls: ['./lobby-page.component.css']
})
export class LobbyPageComponent implements OnInit {

  constructor(private router: Router,
     public clientService: GlobalGameClientService,
     private _clipboardService: ClipboardService,
     private snackBar : MatSnackBar,
     private renderer: Renderer2 ) { }

  ngOnInit() {
    if (this.clientService.getRoom() == null) {
      this.clientService.reconnectToRoom().then(()=> {
        this.initHandlers();
      }).catch((e) => {
        this.router.navigateByUrl("/landing-page");
        return;
      });
    }
    else
    {
      this.initHandlers();
    }
  }

  transitionOut()
  {
    this.renderer.removeClass(this.waveWrapper.nativeElement, "waveWrapperGoUp");
    this.renderer.removeClass(this.transitionBlock.nativeElement, "transitionBlockAnimate");
    setTimeout(()=>{
      this.startGame();
    },2000);
  }

  initHandlers()
  {

    setTimeout(()=>{
      this.renderer.addClass(this.waveWrapper.nativeElement, "waveWrapperGoUp");
      this.renderer.addClass(this.transitionBlock.nativeElement, "transitionBlockAnimate");
    },100)

    this.clientService.ErrorChanged.subscribe(() => { this.handleErrorChange() });
    this.clientService.AllPlayersChanged.subscribe(() => { this.handleAllPlayersChange() });
    this.clientService.PhaseChanged.subscribe(() => { this.handlePhaseChange() });
  }

  copyUrlToClipboard()
  {
    this._clipboardService.copy("https://wavelengthonline.app/join/" + this.clientService.getRoom().id);
    this.snackBar.open('Copied to Clipboard', null, {
      duration: 2000});
  }

  copyCodeToClipboard()
  {
    this._clipboardService.copy(this.clientService.getRoom().id);
    this.snackBar.open('Copied to Clipboard', null, {
      duration: 2000});
  }

  updateTeam()
  {
    this.clientService.changeTeam(this.clientService.getMe().id,this.clientService.getMe().team ==1?2:1);
  }
  
  @ViewChild("waveWrapper") waveWrapper: ElementRef;
  @ViewChild("transitionBlock") transitionBlock: ElementRef;
  handleErrorChange() {

  }

  currentNumPlayers = 0;
  team1Count = 0;
  team2Count = 0;
  handleAllPlayersChange() {
    this.currentNumPlayers = this.clientService.allPlayers.filter(x=>x.name != "Open Slot").length;
    this.team1Count = this.clientService.allPlayers.filter(x=>x.name != "Open Slot").filter(x=>x.team == 1).length;
    this.team2Count = this.clientService.allPlayers.filter(x=>x.name != "Open Slot").filter(x=>x.team == 2).length;
  }

  handlePhaseChange() {
    if(this.clientService.currentPhase != "Pre-Game")
       {
        this.renderer.addClass(this.waveWrapper.nativeElement, "waveWrapperGoUp");
        this.renderer.addClass(this.transitionBlock.nativeElement, "transitionBlockAnimate");
        setTimeout(()=>{
          this.router.navigateByUrl("/gamescreen");
        }, 2000);
       }
  }

  add9()
  {
    this.clientService.fake9PeopleJoin();
  }

  startGame()
  {
    this.clientService.startGame();
    this.router.navigateByUrl("/gamescreen");
  }

}
