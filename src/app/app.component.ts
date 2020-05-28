import { Component, OnInit, ElementRef, ViewChild,Renderer2, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { TutorialDialogComponent } from './tutorial-dialog/tutorial-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GlobalGameClientService } from './global-game-client.service';
import { HelperArrowService, HelperArrowConfig } from "./helper-arrow/helper-arrow-service";
import { HELPER_ARROW_DATA } from './helper-arrow/helper-arrow-tokens';
import { AboutPopupComponent } from './about-dialog/about-popup.component';
import { BugPopupComponent } from './bug-dialog/bug-popup.component';
import { WinPopupComponent } from './win-dialog/win-popup.component';
import { CookieService } from 'ngx-cookie-service';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'WavelengthClient';

  @ViewChild("tutorialBox") tutorialBox: MatCheckbox;
  @ViewChild("soundBox") soundBox: MatCheckbox;

  constructor(public dialog: MatDialog, private cookieService: CookieService,
    private router: Router,
    private cdref: ChangeDetectorRef,
    private clientService: GlobalGameClientService) {
  }

  ngOnInit(): void{
   
  }

  ngAfterViewInit()
  {
    var soundCookie = this.cookieService.get("sound");
    if (soundCookie) {
      this.clientService.soundEnabled = soundCookie == "true" ? true : false;
      this.soundBox.checked = soundCookie == "true" ? true : false;
    }

    var tutorialsCookie = this.cookieService.get("tutorials");
    if (tutorialsCookie) {
      this.clientService.tutorialsEnabled = tutorialsCookie == "true" ? true : false;
      this.tutorialBox.checked = tutorialsCookie == "true" ? true : false;
    }
    
    this.cdref.detectChanges();
  }
  
  openTutorialDialog() {
    this.dialog.open(TutorialDialogComponent, {
      width: '100%',
      height: '100%'
    });
  }

  showAbout()
  {
    this.dialog.open(AboutPopupComponent, {
      width: '650px'
    });
  }

  showBugReport()
  {
    this.dialog.open(BugPopupComponent, {
      width: '450px'
    });
  }

  showWin()
  {
    this.dialog.open(WinPopupComponent, {
      width: '450px',
      data: { winner: 'both', }
    });
  }

  goHome()
  {
    this.clientService.clearAll();
    this.router.navigateByUrl('');
  }

  clickTutorialsEnabled()
  {
    this.clientService.tutorialsEnabled = !this.clientService.tutorialsEnabled;
    var expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    this.cookieService.set("tutorials", this.clientService.tutorialsEnabled + '',expiry);
  }

  clickSoundEnabled()
  {
    this.clientService.soundEnabled = !this.clientService.soundEnabled;
    var expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    this.cookieService.set("sound", this.clientService.soundEnabled + '',expiry);
  }

  goToWavelengthPage()
  {
    window.location.href = "https://www.wavelength.zone/";
  }
  
}
