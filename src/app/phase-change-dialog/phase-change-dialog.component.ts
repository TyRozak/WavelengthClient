import { Component, Input, Inject, HostListener, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate, AnimationEvent, group, query } from '@angular/animations';

import { PhaseChangeDialogRef } from './phase-change-ref'
import { PHASE_CHANGED_DIALOG_DATA } from './phase-change-dialog-tokens';
import { GlobalGameClientService } from '../global-game-client.service';
import { MatDialog } from '@angular/material/dialog';
import { TutorialDialogComponent } from '../tutorial-dialog/tutorial-dialog.component';

const ESCAPE = 27;
const ANIMATION_TIMINGS = '400ms cubic-bezier(0.25, 0.8, 0.25, 1)';

@Component({
  selector: 'phase-change-dialog', 
  templateUrl: './phase-change-dialog.component.html',
  styleUrls: ['./phase-change-dialog.component.css'],
  animations: [
    trigger('fade', [
      state('fadeOut', style({ opacity: 0 })),
      state('fadeIn', style({ opacity: 1 })),
      transition('* => fadeIn', animate(ANIMATION_TIMINGS))
    ]),
    trigger('slideContent', [
      state('void', style({ transform: 'translate3d(0, 25%, 0) scale(0.9)', opacity: 0 })),
      state('enter', style({ transform: 'none', opacity: 1 })),
      state('leave', style({ transform: 'translate3d(0, 25%, 0)', opacity: 0 })),
      transition('* => *', animate(ANIMATION_TIMINGS)),
    ])
  ]
})

export class PhaseChangeDialogComponent {

  loading = true;
  animationState: 'void' | 'enter' | 'leave' = 'enter';
  animationStateChanged = new EventEmitter<AnimationEvent>();

  @HostListener('document:keydown', ['$event']) private handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === ESCAPE) {
      this.dialogRef.close();
    }
  }

  constructor(
    public dialogRef: PhaseChangeDialogRef,
    public dialog: MatDialog,
    public clientService: GlobalGameClientService,
    @Inject(PHASE_CHANGED_DIALOG_DATA) public data: any
   ) { 
     this.playDing();
   }

  onLoad(event: Event) {
    this.loading = false;
  }

  playDing()
  {
    if(this.clientService.soundEnabled){
    var audio = new Audio();
    audio.src = "../../assets/ding.wav"
    audio.load();
    audio.play();
    }
  }

  onAnimationStart(event: AnimationEvent) {
    this.animationStateChanged.emit(event);
  }

  onAnimationDone(event: AnimationEvent) {
    this.animationStateChanged.emit(event);
  }

  startExitAnimation() {
    this.animationState = 'leave';
  }

  closeThisAndDisplayTutorial(slide)
  {
    this.dialog.open(TutorialDialogComponent, {
      width: '100%',
      height: '100%',
      data: {
        slide: slide
      }
    });
  }

  closeDialog()
  {
    this.dialogRef.close();
  }
}
