import { Component, Input, Inject, HostListener, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { trigger, state, style, transition, animate, AnimationEvent, group, query } from '@angular/animations';

import { HelperArrowRef } from './helper-arrow-ref'
import { HELPER_ARROW_DATA } from './helper-arrow-tokens';
import { render } from 'ngx-color';

const ANIMATION_TIMINGS = '2s';


@Component({
  selector: 'helper-arrow',
  templateUrl: './helper-arrow.component.html',
  styleUrls: ['./helper-arrow.component.css'],
  animations: [
    trigger('fade', [
      state('fadeOut', style({ opacity: 0 })),
      state('fadeIn', style({ opacity: 1 })),
      transition('* => fadeIn', animate(ANIMATION_TIMINGS))
    ]),
    trigger('fadeOut', [
      state('fadeOut', style({ opacity: 1 })),
      state('fadeIn', style({ opacity: 0 })),
      transition('* => fadeIn', animate(ANIMATION_TIMINGS))
    ])
  ]
})

export class HelperArrowComponent {
  loading = true;
  animationState: 'void' | 'enter' | 'leave' = 'enter';
  animationStateChanged = new EventEmitter<AnimationEvent>();

  constructor(
    public dialogRef: HelperArrowRef,
    @Inject(HELPER_ARROW_DATA) public data: any
  ) { }

  onLoad(event: Event) {
    this.loading = false;
  }

  close() {
   // console.log("Adding fadeOutAnim");
    this.helperContainerClassList += " fadeOutAnim";
    this.dialogRef.hardClose();
  }

  angle = 0;
  helperArrowContainerClassList="helperArrowContainer clicker";
  helperContainerClassList = "";

  onAnimationStart(event: AnimationEvent) {
    this.animationStateChanged.emit(event);
  }

  onAnimationDone(event: AnimationEvent) {
    this.animationStateChanged.emit(event);
  }

  startExitAnimation() {
    this.animationState = 'leave';
  }
}
