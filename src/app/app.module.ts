import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { GameComponent } from './game/game.component';
import { GameOverComponent } from './game-over/game-over.component';
import { GameConfigurationComponent } from './game-configuration/game-configuration.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "game", component: GameComponent },
  { path: "game-over", component: GameOverComponent },
  { path: "game-configuration", component: GameConfigurationComponent },
  { path: "leaderboard", component: LeaderboardComponent },
  { path: "**", redirectTo: "" } // Redirect any unknown routes to home
];

@NgModule({
  declarations: [AppComponent, HomeComponent, GameComponent, GameOverComponent, GameConfigurationComponent, LeaderboardComponent],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}