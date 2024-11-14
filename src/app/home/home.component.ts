import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import fetchFromSpotify, { request } from "../../services/api";

const AUTH_ENDPOINT = "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  title = "Guess The Song Game";
  genres: string[] = [
    "Pop", "Rock", "Hip-Hop", "R&B", "Country", "Jazz", "Electronic", 
    "Classical", "Reggae", "Blues", "Latin", "Metal", "Rap", "K-Pop", "Emo", "Folk", "Indie"
  ];
  selectedGenre: string = "";
  authLoading: boolean = false;
  configLoading: boolean = false;
  token: string = "";

  ngOnInit(): void {
    this.authLoading = true;
    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    if (storedTokenString) {
      const storedToken = JSON.parse(storedTokenString);
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage");
        this.authLoading = false;
        this.token = storedToken.value;
        return;
      }
    }
    console.log("Sending request to AWS endpoint");
    request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
      const newToken = {
        value: access_token,
        expiration: Date.now() + (expires_in - 20) * 1000,
      };
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
      this.authLoading = false;
      this.token = newToken.value;
    });
  }

  setGenre(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedGenre = target.value;
    console.log("Selected genre:", this.selectedGenre);
    localStorage.setItem('selectedGenre', this.selectedGenre);
  }

  startGame() {
    if (this.selectedGenre) {
      console.log("Starting game with genre:", this.selectedGenre);
      this.router.navigate(['/game']);
    } else {
      console.log("Please select a genre before starting the game");
    }
  }

  openConfiguration() {
    this.router.navigate(['/game-configuration']);
  }

  openLeaderboard() {
    this.router.navigate(['/leaderboard']);
  }
}