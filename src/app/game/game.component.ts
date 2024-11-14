import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import fetchFromSpotify, { request } from "../../services/api";
import { interval, Subscription } from 'rxjs';

const TOKEN_KEY = "whos-who-access-token";
const AUTH_ENDPOINT = "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const GAME_DURATION = 30; // 30 seconds total game time

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  token: string = '';
  tracks: any[] = [];
  currentQuestion: number = 1;
  score: number = 0;
  points: number = 0;
  currentTrack: any = null;
  options: string[] = [];
  selectedAnswer: string = '';
  gameOver: boolean = false;
  selectedGenre: string = '';
  audioContext: AudioContext | null = null;
  audioSource: AudioBufferSourceNode | null = null;
  isPlaying: boolean = false;
  timerSubscription: Subscription | null = null;
  secondsRemaining: number = GAME_DURATION;
  hasListened: boolean = false;
  answerSubmitted: boolean = false;

  constructor(private router: Router) { }
  pointVal: number =  Number(localStorage.getItem("points"))
  showName: boolean = localStorage.getItem("set_name") == "true"
  showCover: boolean = localStorage.getItem("set_cover") == "true"

  ngOnInit(): void {
    this.selectedGenre = localStorage.getItem('selectedGenre') || '';
    console.log("Selected genre in game component:", this.selectedGenre);
    this.initializeToken();
  }

  ngOnDestroy(): void {
    this.stopAudio();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  async initializeToken() {
    const tokenString = localStorage.getItem(TOKEN_KEY);
    if (tokenString) {
      const token = JSON.parse(tokenString);
      if (token.expiration > Date.now()) {
        this.token = token.value;
        this.startNewGame();
      } else {
        await this.refreshToken();
      }
    } else {
      await this.refreshToken();
    }
  }

  async refreshToken() {
    try {
      const { access_token, expires_in } = await request(AUTH_ENDPOINT);
      const newToken = {
        value: access_token,
        expiration: Date.now() + expires_in * 1000
      };
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
      this.token = newToken.value;
      this.startNewGame();
    } catch (error) {
      console.error("Error refreshing token:", error);
      this.router.navigate(['/']);
    }
  }

  async startNewGame() {
    if (!this.selectedGenre) {
      console.error("No genre selected");
      this.router.navigate(['/']);
      return;
    }
    
    if (!this.isTokenValid()) {
      await this.refreshToken();
    }
    
    await this.fetchTracks(this.selectedGenre);
    this.resetGame();
    this.prepareQuestion();
    this.startTimer();
  }

  isTokenValid(): boolean {
    const tokenString = localStorage.getItem(TOKEN_KEY);
    if (tokenString) {
      const token = JSON.parse(tokenString);
      return token.expiration > Date.now();
    }
    return false;
  }

  async fetchTracks(genre: string) {
    try {
      const response = await fetchFromSpotify({
        token: this.token,
        endpoint: 'search',
        params: {
          q: `genre:${genre}`,
          type: 'track',
          limit: 50
        }
      });
      this.tracks = response.tracks.items.filter((track: any) => track.preview_url);
      if (this.tracks.length === 0) {
        console.error("No tracks with preview URLs found for this genre");
        alert("No playable tracks found for this genre. Please try another genre.");
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
      alert("Error fetching tracks. Please try again.");
    }
  }

  prepareQuestion() {
    this.stopAudio();
    this.fetchNextTrack();
    this.hasListened = false;
    this.answerSubmitted = false;
  }

  fetchNextTrack() {
    this.currentTrack = this.getRandomTrack();
    console.log("Current track preview URL:", this.currentTrack.preview_url);
    
    this.options = this.generateOptions();
  }

  getRandomTrack() {
    const index = Math.floor(Math.random() * this.tracks.length);
    return this.tracks[index];
    
  }

  generateOptions(): string[] {
    const options = [this.currentTrack.name];
    while (options.length < 4) {
      const randomTrack = this.getRandomTrack();
      if (!options.includes(randomTrack.name)) {
        options.push(randomTrack.name);
      }
    }
    return this.shuffleArray(options);
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async playAudio() {
    this.stopAudio();
    if (this.currentTrack && this.currentTrack.preview_url) {
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const response = await fetch(this.currentTrack.preview_url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = audioBuffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);

        this.audioSource.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        this.audioSource.start();
        this.isPlaying = true;
        this.hasListened = true;
        
        console.log("Audio started playing successfully");

        this.audioSource.onended = () => {
          console.log("Audio playback finished");
          this.isPlaying = false;
        };
      } catch (error) {
        console.error("Error playing audio:", error);
        alert("Error playing audio. Moving to next track.");
        this.prepareQuestion();
      }
    } else {
      console.error("No preview URL available for current track");
      alert("No audio available for this track. Moving to next track.");
      this.prepareQuestion();
    }
  }

  stopAudio() {
    if (this.audioSource) {
      this.audioSource.stop();
      this.audioSource.disconnect();
      this.audioSource = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isPlaying = false;
  }

  selectAnswer(answer: string) {
    this.selectedAnswer = answer;
    this.answerSubmitted = true;
    this.checkAnswer();
  }

  checkAnswer() {
    if (this.selectedAnswer === this.currentTrack.name) {
      this.score++;
      this.points += this.pointVal;
    }
    this.currentQuestion++;
    this.selectedAnswer = '';
    this.stopAudio();
    
    if (this.secondsRemaining > 0) {
      this.prepareQuestion();
    } else {
      this.endGame();
    }
  }

  startTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.secondsRemaining > 0) {
        this.secondsRemaining--;
      } else {
        this.endGame();
      }
    });
  }

  resetGame() {
    this.currentQuestion = 1;
    this.score = 0;
    this.gameOver = false;
    this.secondsRemaining = GAME_DURATION;
    this.hasListened = false;
    this.answerSubmitted = false;
  }

  endGame() {
    this.gameOver = true;
    this.stopAudio();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.router.navigate(['/game-over'], { 
      state: { 
        correctAnswers: this.score,
        totalQuestions: this.currentQuestion - 1,
        pointsScored: this.points
      }
    });
  }
}