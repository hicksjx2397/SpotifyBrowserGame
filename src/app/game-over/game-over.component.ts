import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.css']
})
export class GameOverComponent implements OnInit {
  correctAnswers: number = 0;
  totalQuestions: number = 0;
  pointsScored: number = 0;
  playerName: string = '';
  isSubmitted: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.correctAnswers = history.state.correctAnswers || 0;
    this.totalQuestions = history.state.totalQuestions || 0;
    this.pointsScored = history.state.pointsScored || 0;
  }

  get scoreRatio(): string {
    return `${this.correctAnswers}/${this.totalQuestions}`;
  }

  get scorePercentage(): number {
    return this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0;
  }

  submitScore() {
    console.log(`Score submitted: ${this.scoreRatio} (${this.scorePercentage.toFixed(2)}%) for player: ${this.playerName}`);
    if (localStorage.getItem("p# " + this.playerName) == null || Number(localStorage.getItem("p# " + this.playerName)) < this.pointsScored) {
      localStorage.setItem("p# " + this.playerName, this.pointsScored.toString())
    }
    this.isSubmitted = true;
    
    setTimeout(() => {
      this.isSubmitted = false;
    }, 2000);
  }

  playAgain() {
    this.router.navigate(['/game']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}