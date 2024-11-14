import { Component, OnInit } from '@angular/core';
import { forEach } from 'lodash';
import Player from '../models/Player';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  
  board: Player[] = new Array()
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    for (var i = 0; i < localStorage.length; i++){
      let key = localStorage.key(i);
      if (key != null && key.includes("p#")) {
        let val = localStorage.getItem(key)
        this.board.push({
          username: key.split(" ")[1],
          score: Number(val)
        });
      }
    }
    this.board.sort((a, b) => {
      return this.compare(a, b);
    });
  }

  compare(a: {score: number}, b: {score: number}): number {
    return (a.score > b.score ? -1 : 1);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
