import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-configuration',
  templateUrl: './game-configuration.component.html',
  styleUrls: ['./game-configuration.component.css']
})
export class GameConfigurationComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void {
    localStorage.setItem("set_cover", "true");
    localStorage.setItem("set_name", "true");
    localStorage.setItem("points", "10");
  }

  option1: boolean = true;
  option2: boolean = true;
  isSaved: boolean = false;

  goHome() {
    this.router.navigate(['/']);
  }

  changeOption(op: string) {
    switch (op) {
      case 'option1': {
        this.option1 = !this.option1;
        break;
      }
      case 'option2': {
        this.option2 = !this.option2;
        break;
      }
      default: {
        console.log("no value bound to slider");
        break;
      }
    }
  }

  saveSettings() {
    let scoreModifiers: number = 10;
    if (!this.option1) {
      scoreModifiers += 5;
    }
    if (!this.option2) {
      scoreModifiers += 5;
    }
    localStorage.setItem("set_cover", this.option1.toString());
    localStorage.setItem("set_name", this.option2.toString());
    localStorage.setItem("points", scoreModifiers.toString());
    
    // Set isSaved to true when settings are saved
    this.isSaved = true;

    // Reset isSaved after 2 seconds
    setTimeout(() => {
      this.isSaved = false;
    }, 2000);
  }
}