import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalGameClientService } from '../global-game-client.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackNotificationComponent } from '../snack-notification/snack-notification.component';
import { MatDialog } from '@angular/material/dialog';
import { PhaseChangeOverlayService } from '../phase-change-dialog/phase-change-service';
import { HelperArrowService } from '../helper-arrow/helper-arrow-service';
import { WinPopupComponent } from '../win-dialog/win-popup.component';

@Component({
  selector: 'app-game-screen',
  templateUrl: './game-screen.component.html',
  styleUrls: ['./game-screen.component.css']
})

export class GameScreenComponent implements OnInit {

  roomCode = this.route.snapshot.paramMap.get('roomcode');
  client = null;
  room = null;
  team1 = [];
  team2 = [];
  allplayers = [];
  currentPhase = "Pre-Game";
  currentTeam: number;
  currentPsychic: string;
  error: string;
  rotate = false;
  imagerotation = 0;
  currentTeamArray = [];
  lastPhase= "Pre-Game";

  constructor(private route: ActivatedRoute,
    private router: Router,
    public clientService: GlobalGameClientService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private phaseChangeDialog: PhaseChangeOverlayService,
    private helperArrowService: HelperArrowService,
    private renderer: Renderer2) { }

  @ViewChild("wavelengthCover") cover: ElementRef;
  @ViewChild("arm") arm: ElementRef;

  ngOnInit() {
    if (this.clientService.getRoom() == null) {
      this.clientService.reconnectToRoom().then(() => {
        this.initHandlers();
      }).catch((e) => {
        this.router.navigateByUrl("/landing-page");
        return;
      });
    }
    else {
      this.initHandlers();
    }
  }

  @ViewChild("transitionBlock") transitionBlock: ElementRef;
  transitionIn() {
    this.renderer.addClass(this.transitionBlock.nativeElement, "transitionBlockAnimate");
  }

  initHandlers() {
    setTimeout(() => {
      this.transitionIn();
    }, 100);

    this.clientService.ErrorChanged.subscribe(() => { this.handleErrorChange() });
    this.clientService.AllPlayersChanged.subscribe(() => { this.handleAllPlayersChange() });
    this.clientService.PhaseChanged.subscribe(() => { this.handlePhaseChange() });
    this.clientService.PsychicChanged.subscribe(() => { this.handlePsychicChange() });
    this.clientService.LeftClickChanged.subscribe(()=>{this.handleLeftClickChange()});

    this.handleAllPlayersChange();
    this.handlePhaseChange()
  }

  handleErrorChange() {
    if (this.clientService.error != "") {
      this.error = this.clientService.error;
      this.openSnackBar();
    }
  }

  handleAllPlayersChange() {
    this.team1 = this.clientService.team1;
    this.team2 = this.clientService.team2;

    if (this.clientService.allPlayers)
      this.currentTeamArray = this.clientService.allPlayers.filter(x => x.team == this.clientService.currentPlayingTeam && x.id != this.clientService.getMe().id && !x.isPsychic)

    this.allplayers = this.clientService.allPlayers;
    if(this.currentPhase == "Team" || this.currentPhase == "Scoring")
    {
      this.lockedInArmDegree = this.clientService.allPlayers.filter(x=> x.isGameController).filter(y => y.team == this.clientService.currentPlayingTeam)[0].rotation;
    }
  }

  sideCoverAngle = 0;
  lockedInArmDegree = 0;
  handlePhaseChange() {

    if(this.clientService.currentPhase == "TieWinner")
    {
      this.dialog.open(WinPopupComponent, {
        width: '450px',
        data: { winner: 'both', }
      });
      return;
    }
    else if(this.clientService.currentPhase == "Team1Winner")
    {
      this.dialog.open(WinPopupComponent, {
        width: '450px',
        data: { winner: 'one', }
      });
      return;
    }
    else if(this.clientService.currentPhase == "Team2Winner")
    {
      this.dialog.open(WinPopupComponent, {
        width: '450px',
        data: { winner: 'two', }
      });
      return;
    }

    this.handleAllPlayersChange();
    this.currentPhase = this.clientService.currentPhase;
    if (this.lastPhase != this.currentPhase) {
      this.lastPhase = this.currentPhase;

      this.phaseChangeDialog.open({
        data: { phase: this.currentPhase, psychic: this.clientService.currentPsychic }
      }).beforeClose().subscribe(() => {
        this.displayTutorial();
        if (this.clientService.allPlayers)
          this.currentTeamArray = this.clientService.allPlayers.filter(x => x.team == this.clientService.currentPlayingTeam && x.id != this.clientService.getMe().id && !x.isPsychic)

        this.handleLeftClickChange();
      });

    }
  }

  handleLeftClickChange()
  {
    if(this.clientService.leftButtonClicked)
      this.sideCoverAngle = 90 - Math.abs(this.lockedInArmDegree);
    else
      this.sideCoverAngle = -(90 + Math.abs(this.lockedInArmDegree));
  }

  handlePsychicChange() {
    this.currentPsychic = this.clientService.currentPsychic;
  }

  openSnackBar() {
    this._snackBar.openFromComponent(SnackNotificationComponent, {
      duration: 5000,
      data: { error: this.error }
    });
  }

  rotateCover() {
    this.rotate = !this.rotate;
  }

  advanceTurn() {

    if (this.clientService.currentPhase == "Scoring" && !this.clientService.revealed) {
      this.clientService.calculateScore();
      this.clientService.revealGoal();
    }
    else {

      this.clientService.advancePhase();
    }
  }

  updateArmAngle(id, angle) {

    this.clientService.updateAngle(id, angle);
  }

  dragging = false;
  myArmDegree = 0;
  originLeft: any;
  originBottom: any;

  offset(el) {
    var rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft, bottom: rect.top + scrollTop + rect.height }
  }

  handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dragging = true;

    if (!this.originLeft)
      this.originLeft = this.offset(this.arm.nativeElement).left;
    if (!this.originBottom)
      this.originBottom = this.offset(this.arm.nativeElement).bottom;
  }

  handleMouseMove(e) {
    if (this.dragging) {
      var adj = this.originBottom - e.pageY;
      var opp = -(this.originLeft - e.pageX);

      var angle = Math.atan(opp / adj) * (180 / Math.PI);
      this.myArmDegree = angle;

      this.updateArmAngle(this.clientService.getMe().id, this.myArmDegree);
    }
  }

  handleMouseUp(e) {
    this.dragging = false;
  }

  leftClicked() {
    this.clientService.sendLeftClick(true);
  }
  rightClicked() {
    this.clientService.sendLeftClick(false);
  }

  getAbsolutePosition(el) {
    var offsetLeft = 0;
    var offsetTop = 0;

    while (el) {
      offsetLeft += el.offsetLeft;
      offsetTop += el.offsetTop;
      // console.log("offsetleft: " + offsetLeft);
      // console.log("offsettop: " + offsetTop);
      // console.log("el: " + el);
      el = el.offsetParent;
    }
    return { offsetTop: offsetTop, offsetLeft: offsetLeft }
  }

  @ViewChild("psychicAnswerGivenButton", { read: ElementRef }) psychicAnswerGivenButton: ElementRef;
  @ViewChild("answerCard", { read: ElementRef }) answerCard: ElementRef;
  @ViewChild("phaseIndicatorPsychic", { read: ElementRef }) phaseIndicatorPsychic: ElementRef;
  @ViewChild("phaseIndicatorTeam", { read: ElementRef }) phaseIndicatorTeam: ElementRef;
  @ViewChild("phaseIndicatorSide", { read: ElementRef }) phaseIndicatorSide: ElementRef;
  @ViewChild("phaseIndicatorScoring", { read: ElementRef }) phaseIndicatorScoring: ElementRef;
  @ViewChild("myArm", { read: ElementRef }) myArm: ElementRef;
  @ViewChild("gameControllerAnswerButton", { read: ElementRef }) gameControllerAnswerButton: ElementRef;
  @ViewChild("leftButton", { read: ElementRef }) leftButton: ElementRef;
  @ViewChild("rightButton", { read: ElementRef }) rightButton: ElementRef;
  @ViewChild("revealButton", { read: ElementRef }) revealButton: ElementRef;
  @ViewChild("startNextTurnButton", { read: ElementRef }) startNextTurnButton: ElementRef;

  tutorialsShown =
    {
      psychicPhase:
      {
        psychic_playing_psychic: false,
        psychic_playing_not: false,
        psychic_notplaying: false
      },
      teamPhase:
      {
        team_playing_psychic: false,
        team_playing_controller: false,
        team_playing_not: false,
        team_notplaying: false
      },
      sidePhase:
      {
        side_playing: false,
        side_notplaying_controller: false,
        side_notplaying_not: false
      },
      scoringPhase:
      {
        scoring_psychic_revealed: false,
        scoring_psychic_notrevealed: false,
        scoring_not: false
      }
    }

  displayTutorial(fromButton?) {
    if (!this.clientService.tutorialsEnabled && !fromButton)
      return;

    switch (this.clientService.currentPhase) {
      case "Psychic":
        {
          if (this.clientService.currentPlayingTeam == this.clientService.getMe().team) {
            if (this.clientService.getMe().isPsychic) {
              //Psychic Phase, Playing Team, Im the Psychic
              if (!this.tutorialsShown.psychicPhase.psychic_playing_psychic || fromButton) {
                this.helperArrowService.openMultiple(
                  [
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.phaseIndicatorPsychic.nativeElement,
                        timeout: 5000,
                        message: "It is the Psychic Round! And YOU are the Psychic"
                      }
                    },
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.answerCard.nativeElement,
                        timeout: 5000,
                        message: "Check out this card. It is your job to give a clue to your team to help them guess where the '4' is on the spinner above."
                      }
                    },
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.psychicAnswerGivenButton,
                        timeout: 5000,
                        message: "Click this button once you have given your team a clue! This will advance the game into the team phase."
                      }
                    },
                  ]);
                this.tutorialsShown.psychicPhase.psychic_playing_psychic = true;
              }
            }
            else {
              //Psychic Phase, Playing Team, Im not the Psychic
              if (!this.tutorialsShown.psychicPhase.psychic_playing_not || fromButton) {
                this.helperArrowService.openMultiple(
                  [
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.phaseIndicatorPsychic.nativeElement,
                        timeout: 5000,
                        message: "It is the Psychic Round! But you are NOT the Psychic"
                      }
                    },
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.answerCard.nativeElement,
                        timeout: 5000,
                        message: "Your psychic is thinking about a clue to help you guess where to place your pointer based on this card."
                      }
                    },
                  ]);
                this.tutorialsShown.psychicPhase.psychic_playing_not = true;
              }
            }
          }
          else {
            //Psychic Phase, Non Playing Team
            if (!this.tutorialsShown.psychicPhase.psychic_notplaying || fromButton) {
              this.helperArrowService.openMultiple(
                [
                  {
                    data: {
                      direction: "pointDown",
                      originElement: this.phaseIndicatorPsychic.nativeElement,
                      timeout: 5000,
                      message: "It is the Psychic Round! But your team isn't playing right now. \n\n Nothing for you to do right now but listen! (Feel free to mess with them!)"
                    }
                  },
                ]);
              this.tutorialsShown.psychicPhase.psychic_notplaying = true;
            }
          }
          break;
        }
      case "Team":
        {
          if (this.clientService.currentPlayingTeam == this.clientService.getMe().team) {
            //Team Phase, Playing Team, Im the Psychic
            if (!this.tutorialsShown.teamPhase.team_playing_psychic) {
              if (this.clientService.getMe().isPsychic) {
                this.helperArrowService.openMultiple(
                  [
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.phaseIndicatorTeam.nativeElement,
                        timeout: 5000,
                        message: "It is the Team Round!"
                      }
                    },
                    {
                      data: {
                        direction: "pointRight",
                        originElement: this.myArm.nativeElement,
                        timeout: 5000,
                        message: "Based on your clue, your team has to collaborate and figure out where to place their pointer on the spectrum! \n\n No helping!"
                      }
                    }
                  ]);
                this.tutorialsShown.teamPhase.team_playing_psychic = true;
              }
            }
            else if (this.clientService.getMe().isGameController) {
              //Team Phase, Playing Team, Im the Controller
              if (!this.tutorialsShown.teamPhase.team_playing_controller || fromButton) {
                this.helperArrowService.openMultiple(
                  [
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.phaseIndicatorTeam.nativeElement,
                        timeout: 5000,
                        message: "It is the Team Round! And YOU are your team's controller."
                      }
                    },
                    {
                      data: {
                        direction: "pointRight",
                        originElement: this.myArm.nativeElement,
                        timeout: 5000,
                        message: "Based on your Psychic's clue, you and your team have to collaborate and figure out where to place your pointer on the spectrum!"
                      }
                    },
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.gameControllerAnswerButton.nativeElement,
                        timeout: 5000,
                        message: "Since you are your team's controller you get to hit the submit button. \n\n Once you and the team are happy with where YOUR pointer is, hit this button to lock it in."
                      }
                    },
                  ]);
                this.tutorialsShown.teamPhase.team_playing_controller = true;
              }
            }
            else {
              //Team Phase, Playing Team, Im not the Controller
              if (!this.tutorialsShown.teamPhase.team_playing_not || fromButton) {
                this.helperArrowService.openMultiple(
                  [
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.phaseIndicatorTeam.nativeElement,
                        timeout: 5000,
                        message: "It is the Team Round!"
                      }
                    },
                    {
                      data: {
                        direction: "pointRight",
                        originElement: this.myArm.nativeElement,
                        timeout: 5000,
                        message: "Based on your Psychic's clue, you and your team have to collaborate and figure out where to place your pointer on the spectrum!"
                      }
                    },
                    {
                      data: {
                        direction: "pointLeft",
                        originElement: this.myArm.nativeElement,
                        timeout: 5000,
                        message: "You aren't your team's controller this round, so your job is to help them place their pointer and lock it in!"
                      }
                    },
                  ]);
                this.tutorialsShown.teamPhase.team_playing_not = true;
              }
            }
          }
          else {
            //Team Phase, Non Playing Team
            if (!this.tutorialsShown.teamPhase.team_notplaying || fromButton) {
              this.helperArrowService.openMultiple(
                [
                  {
                    data: {
                      direction: "pointDown",
                      originElement: this.phaseIndicatorTeam.nativeElement,
                      timeout: 5000,
                      message: "It is the Team Round!"
                    }
                  },
                  {
                    data: {
                      direction: "pointDown",
                      originElement: this.phaseIndicatorTeam.nativeElement,
                      timeout: 5000,
                      message: "But it isn't your team's turn. So hang tight until it is!"
                    }
                  },
                ]);
              this.tutorialsShown.teamPhase.team_notplaying = true;
            }
          }
          break;
        }
      case "Side":
        {
          if (this.clientService.currentPlayingTeam == this.clientService.getMe().team) {
            //Side Phase, Playing Team
            if (!this.tutorialsShown.sidePhase.side_playing || fromButton) {
              this.helperArrowService.openMultiple(
                [
                  {
                    data: {
                      direction: "pointDown",
                      originElement: this.phaseIndicatorSide.nativeElement,
                      timeout: 5000,
                      message: "It is the Left/Right Round!"
                    }
                  },
                  {
                    data: {
                      direction: "pointLeft",
                      originElement: this.leftButton.nativeElement,
                      timeout: 5000,
                      message: "The other team now has to decide whether your team's guess was to the left of the real answer..."
                    }
                  },
                  {
                    data: {
                      direction: "pointRight",
                      originElement: this.rightButton.nativeElement,
                      timeout: 5000,
                      message: "... or to the right of the real answer."
                    }
                  },
                ]);
              this.tutorialsShown.sidePhase.side_playing = true;
            }
          }
          else {
            if (this.clientService.getMe().isGameController) {
              //Side Phase, Non-Playing Team, Im the Controller
              if (!this.tutorialsShown.sidePhase.side_notplaying_controller || fromButton) {
                this.helperArrowService.openMultiple(
                  [
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.phaseIndicatorSide.nativeElement,
                        timeout: 5000,
                        message: "It is the Left/Right Round!"
                      }
                    },
                    {
                      data: {
                        direction: "pointLeft",
                        originElement: this.leftButton.nativeElement,
                        timeout: 5000,
                        message: "You and your team now have to decide whether the other team's guess was to the left of the real answer..."
                      }
                    },
                    {
                      data: {
                        direction: "pointRight",
                        originElement: this.rightButton.nativeElement,
                        timeout: 5000,
                        message: "... or to the right of the real answer."
                      }
                    },
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.gameControllerAnswerButton.nativeElement,
                        timeout: 5000,
                        message: "Since you are your team's controller you get to hit the submit button. \n\n Once you and the team are happy with your left/right choice, hit this button to lock it in."
                      }
                    },
                  ]);
                this.tutorialsShown.sidePhase.side_notplaying_controller = true;
              }
            }
            else {
              //Side Phase, Non-Playing Team, Im not the Controller
              if (!this.tutorialsShown.sidePhase.side_notplaying_not || fromButton) {
                this.helperArrowService.openMultiple(
                  [
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.phaseIndicatorSide.nativeElement,
                        timeout: 5000,
                        message: "It is the Left/Right Round!"
                      }
                    },
                    {
                      data: {
                        direction: "pointLeft",
                        originElement: this.leftButton.nativeElement,
                        timeout: 5000,
                        message: "You and your team now have to decide whether the other team's guess was to the left of the real answer..."
                      }
                    },
                    {
                      data: {
                        direction: "pointRight",
                        originElement: this.rightButton.nativeElement,
                        timeout: 5000,
                        message: "... or to the right of the real answer."
                      }
                    }
                  ]);
                this.tutorialsShown.sidePhase.side_notplaying_not = true;
              }
            }
          }
          break;
        }
      case "Scoring":
        {
          if (this.clientService.getMe().isPsychic) {
            if (this.clientService.revealed) {
              //Scoring Phase, Im the Psychic and have already revealed 

              if (!this.tutorialsShown.scoringPhase.scoring_psychic_revealed || fromButton) {
                this.helperArrowService.openMultiple(
                  [
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.startNextTurnButton.nativeElement,
                        timeout: 5000,
                        message: "When you are ready, start the next turn!"
                      }
                    },
                  ]);
                this.tutorialsShown.scoringPhase.scoring_psychic_revealed = true;
              }
            }
            else {
              //Scoring Phase, Im the Psychic and have not already revealed 
              if (!this.tutorialsShown.scoringPhase.scoring_psychic_notrevealed || fromButton) {
                this.helperArrowService.openMultiple(
                  [
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.phaseIndicatorScoring.nativeElement,
                        timeout: 5000,
                        message: "It is finally the Scoring Round!"
                      }
                    },
                    {
                      data: {
                        direction: "pointDown",
                        originElement: this.revealButton.nativeElement,
                        timeout: 5000,
                        message: "Since you were the Psychic this round, you get the pleasure of revealing the real answer to the group! \n\n Just hit this button when you are ready!"
                      }
                    },
                  ]);
                this.tutorialsShown.scoringPhase.scoring_psychic_notrevealed = true;
              }
            }
          }
          else {
            //Scoring Phase, Im not the psychic
            if (!this.tutorialsShown.scoringPhase.scoring_psychic_notrevealed || fromButton) {
              this.helperArrowService.openMultiple(
                [
                  {
                    data: {
                      direction: "pointDown",
                      originElement: this.phaseIndicatorScoring.nativeElement,
                      timeout: 5000,
                      message: "It is the Scoring Round! Let's see what happened!"
                    }
                  },
                ]);
              this.tutorialsShown.scoringPhase.scoring_psychic_notrevealed = true;
            }
          }
          break;
        }
    }
  }

}
