import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { GameScreenComponent } from './game-screen/game-screen.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MaterialModule} from "./materiel-components";
import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';
import { ColorCircleModule } from 'ngx-color/circle';
import { SnackNotificationComponent } from './snack-notification/snack-notification.component';
import { LobbyPageComponent } from './lobby-page/lobby-page.component';
import { TutorialDialogComponent } from './tutorial-dialog/tutorial-dialog.component';
import { PhaseChangeDialogComponent } from './phase-change-dialog/phase-change-dialog.component';
import { PhaseChangeOverlayService } from './phase-change-dialog/phase-change-service';
import { CookieService } from 'ngx-cookie-service';
import { HelperArrowComponent } from './helper-arrow/helper-arrow.component';
import { HelperArrowService } from './helper-arrow/helper-arrow-service';
import { ClipboardModule } from 'ngx-clipboard';
import { AboutPopupComponent } from './about-dialog/about-popup.component';
import { BugPopupComponent } from './bug-dialog/bug-popup.component';
import { WinPopupComponent } from './win-dialog/win-popup.component';


const appRoutes: Routes = [
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'landing-page/:room-code', component: LandingPageComponent },
  { path: 'join/:room-code', component: LandingPageComponent },
  { path: 'lobby', component: LobbyPageComponent },
  { path: 'gamescreen', component: GameScreenComponent },
  { path: '',
    redirectTo: '/landing-page',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    GameScreenComponent,
    DialogPopupComponent,
    AboutPopupComponent,
    BugPopupComponent,
    SnackNotificationComponent,
    WinPopupComponent,
    LobbyPageComponent,
    TutorialDialogComponent,
    PhaseChangeDialogComponent,
    HelperArrowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    MaterialModule,
    ColorCircleModule,
    ClipboardModule,
    ReactiveFormsModule 
  ],
  entryComponents: [
    DialogPopupComponent,
    AboutPopupComponent,
    WinPopupComponent,
    BugPopupComponent,
    SnackNotificationComponent
  ],
  providers: [PhaseChangeOverlayService,CookieService, HelperArrowService],
  bootstrap: [AppComponent]
})
export class AppModule { }
