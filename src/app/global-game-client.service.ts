import { Injectable } from '@angular/core';
import { Client } from 'colyseus.js'
import { EventEmitter } from '@angular/core';
import {CookieService} from "ngx-cookie-service"
import { ErrorPopupComponent } from './error-dialog/error-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class GlobalGameClientService {

  client = null;
  room = null;
  colors = null;
  me = null;

  constructor(private cookieService: CookieService,
    public dialog: MatDialog) {
    this.client = new Client('wss://api.wavelengthonline.app');
  }

  getColors() {
    return this.colors;
  }

  getClient() {
    return this.client;
  }

  setRoom(room) {
    this.room = room;
  }

  getRoom() {
    return this.room;
  }

  getMe() {
    return this.me;
  }

  createRoom(name, score) {
    if(!score)
      score = 10;
    var promise = new Promise((resolve, reject) => {
      this.client.create("wavelength-room", { name: name, score: +score }).then(room => {
        var expiry = new Date();
        expiry.setSeconds(expiry.getSeconds() + 20);
        this.cookieService.set("roomId", room.id,expiry);
        this.cookieService.set("sessionId", room.sessionId,expiry);
        this.setRoom(room);
        this.room.state.onChange = (changes) =>this.handleStateChange(changes);
        // this.room.onStateChange((state) => {
        //   console.log("the room state has been updated:", state);
        // });
        //this.fake9PeopleJoin();
        resolve();
      }).catch(e => {
        this.dialog.open(ErrorPopupComponent, {
          width: '450px',
          data: { error: "server", }
        });
        reject();
      });
    });
    return promise;
  }

  joinRoom(id, name) {
    var promise = new Promise((resolve, reject) => {
      this.client.joinById(id, { name: name }).then(room => {

        var expiry = new Date();
        expiry.setSeconds(expiry.getSeconds() + 20);
        this.cookieService.set("roomId", room.id,expiry);
        this.cookieService.set("sessionId", room.sessionId, expiry);

        this.setRoom(room);

        // this.room.onStateChange((state) => {
        //   console.log("the room state has been updated:", state);
        // });
        this.room.state.onChange = (changes) =>this.handleStateChange(changes);

        resolve();
      }).catch(e => {
        this.dialog.open(ErrorPopupComponent, {
          width: '450px',
          data: { error: "server", }
        });
        reject();
      })
    });
    return promise;
  }

  reconnectToRoom()
  {
    var promise = new Promise((resolve, reject) => {
    var roomId = this.cookieService.get("roomId");
    var sessionId = this.cookieService.get("sessionId");

    if(roomId == null || sessionId == null)
    {
      //console.log("RECONNECT ERROR", "Cant Reconnect, No Cookie Found");
      reject(false);
    }

    this.client.reconnect(roomId, sessionId).then(room => {
      //console.log("joined successfully", room);
      this.setRoom(room);
      // this.room.onStateChange((state) => {
      //   console.log("the room state has been updated:", state);
      // });
      this.room.state.onChange = (changes) =>this.handleStateChange(changes);
      resolve("reconnected");
    }).catch(e => {
      this.dialog.open(ErrorPopupComponent, {
        width: '450px',
        data: { error: "server", }
      });
      reject("error");
    });});
    return promise;
  }

  fake9PeopleJoin() {
      this.joinRoom(this.room.id, "Lauren").then(() => {
       // console.log("Lauren Joined");
        this.joinRoom(this.room.id, "Cam").then(() => {
         // console.log("Cam Joined");
          this.joinRoom(this.room.id, "Esta").then(() => {
           // console.log("Esta Joined");
            this.joinRoom(this.room.id, "Tesh").then(() => {
             // console.log("Tesh Joined");
              this.joinRoom(this.room.id, "Mike").then(() => {
               // console.log("Mike Joined");
                this.joinRoom(this.room.id, "Bryan").then(() => {
                 // console.log("Bryan Joined");
                  this.joinRoom(this.room.id, "Dasha").then(() => {
                   // console.log("Dasha Joined");
                    this.joinRoom(this.room.id, "Amirah").then(() => {
                     // console.log("Amirah Joined");
                      this.joinRoom(this.room.id,"Colby");
                    });
                  });
                });
              });
            });
          });
        });
      });    
  }

  ErrorChanged = new EventEmitter();
  AllPlayersChanged = new EventEmitter();
  PhaseChanged = new EventEmitter();
  PlayingTeamChanged = new EventEmitter();
  PsychicChanged = new EventEmitter();
  LeftClickChanged = new EventEmitter();

  tutorialsEnabled = true;
  soundEnabled = true;

  allPlayers: any;
  team1:any;
  team2:any;
  error:any;
  currentPhase:any;
  currentPlayingTeam:any;
  currentPsychic:any;
  currentCard:any;
  team1Score:number;
  team2Score:number;
  currentRotationGoal:number;
  currentRotationGoalForPsychic:number;
  revealed:boolean;
  currentMainScore:number;
  currentOffScore:number;
  angleDif:number;
  leftButtonClicked:boolean;
  maxPoints:number;

  handleStateChange(changes) {
      changes.forEach(change => {
        switch (change.field) {
          case "error":
            this.error = change.field;
            this.ErrorChanged.emit();
            break;
          case "allplayers":
            if(this.me == null)
            {
              for(var index in change.value)
              {
                var player = change.value[index];
                if(player.id == this.room.sessionId)
                  this.me = player;
              }
            }

            this.team1 = change.value.filter(player => player.team == 1);
            this.team2 = change.value.filter(player => player.team == 2);
            this.allPlayers = change.value;

            var psy = change.value.find(player => player.isPsychic);
            if(psy)
              this.currentPsychic = psy.name;

           // console.log("Current Psychic: " + this.currentPsychic)

            this.AllPlayersChanged.emit();
            break;
          case "currentPhase":
            this.currentPhase = change.value;
            this.PhaseChanged.emit();
            break;
          case "currentPlayingTeam":
            this.currentPlayingTeam = change.value;
            this.PlayingTeamChanged.emit();
            break;
          case "availableColors":
            this.colors = change.value;
            break;
          case "currentCard":
            this.currentCard = change.value;
            break;
          case "team1Score":
              this.team1Score = change.value;
              break;
          case "team2Score":
              this.team2Score = change.value;
              break;
          case "currentRotationGoal":
                this.currentRotationGoal = change.value;
                break;
          case "currentRotationGoalForPsychic":
              this.currentRotationGoalForPsychic = change.value.angle;
              this.currentRotationGoal = 0;
              break;
          case "revealed":
                this.revealed = change.value;
                break;
          case "currentMainScore":
              this.currentMainScore = change.value;
              break;
          case "currentOffScore":
              this.currentOffScore = change.value;
              break;
          case "angleDif":
                this.angleDif = change.value;
                break;
          case "leftButtonClicked":
              this.leftButtonClicked = change.value;
              this.LeftClickChanged.emit();
              break;
          case "maxPoints":
              this.maxPoints = change.value;
              break;
        }
      });
  }

  startGame()
  {
    this.room.send({ command: "startGame" });
  }

  advancePhase()
  {
    this.room.send({ command: "nextTurn" });
  }

  updateAngle(id, angle)
  {
    this.room.send({ command: "updateAngle", playerId: id, angle: angle });
  }

  revealGoal()
  {
    this.room.send({ command: "reveal"});
  }

  calculateScore()
  {
    this.room.send({command:"score"});
  }

  sendLeftClick(bool)
  {
    this.room.send({command:"clickleft", leftClick:bool });
  }

  changeTeam(id,team)
  {
    this.room.send({command:"updateTeam", playerId: id, team:team });
  }

  clearAll()
  {
    this.room = null;
  }
}
