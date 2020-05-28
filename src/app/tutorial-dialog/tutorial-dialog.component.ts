import { Component, OnInit, Inject, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-tutorial-dialog',
  templateUrl: './tutorial-dialog.component.html',
  styleUrls: ['./tutorial-dialog.component.css']
})
export class TutorialDialogComponent implements OnInit, AfterViewInit {

  constructor(public dialogRef: MatDialogRef<TutorialDialogComponent>,
     @Inject(MAT_DIALOG_DATA) public data: any,
     private cdref: ChangeDetectorRef) { }

  @ViewChild("stepper") stepper: MatStepper;
  ngOnInit(): void {
  }

  ngAfterViewInit()
  {
    if(this.data && this.data.slide)
    {
      switch(this.data.slide)
      { 
        case "psychic":
          this.stepper.selectedIndex = 2;
          this.indexChanged({selectedIndex: 2});
          break;
        case "team":
          this.stepper.selectedIndex = 3;
          this.indexChanged({selectedIndex: 3});
          break;
        case "side":
          this.stepper.selectedIndex = 4;
          this.indexChanged({selectedIndex: 4});
          break;
        case "scoring":
          this.stepper.selectedIndex = 5;
          this.indexChanged({selectedIndex: 5});
          break;
      }
    }
    this.cdref.detectChanges();
  }

  forwardButtonVisible = true;
  backButtonVisible = false;
  doneButtonVisible = false;

  indexChanged(e)
  {
    if(e.selectedIndex == 0)
    {
      this.forwardButtonVisible = true;
      this.backButtonVisible = false;
      this.doneButtonVisible = false;
    }
    else if(e.selectedIndex == 1)
    {
      this.forwardButtonVisible = true;
      this.backButtonVisible = true;
      this.doneButtonVisible = false;
    }
    else if(e.selectedIndex == 2)
    {
      this.forwardButtonVisible = true;
      this.backButtonVisible = true;
      this.doneButtonVisible = false;
    }
    else if(e.selectedIndex == 3)
    {
      this.forwardButtonVisible = true;
      this.backButtonVisible = true;
      this.doneButtonVisible = false;
    }
    else if(e.selectedIndex == 4)
    {
      this.forwardButtonVisible = true;
      this.backButtonVisible = true;
      this.doneButtonVisible = false;
    }
    else if(e.selectedIndex == 5)
    {
      this.forwardButtonVisible = false;
      this.backButtonVisible = true;
      this.doneButtonVisible = true;
    }
  }

  closeDialog()
  {
    this.dialogRef.close();
  }

  goForward()
  {
    this.stepper.next();
  }

  goBack()
  {
    this.stepper.previous();
  }

}
