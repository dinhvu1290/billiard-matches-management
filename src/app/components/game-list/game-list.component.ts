import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Match } from '../../models/match.model';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {
  matches: Match[] = [];
  displayedColumns: string[] = ['name', 'score'];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.getMatches().subscribe(matches => {
      this.matches = matches;
    });
  }

  getPlayerScore(match: Match, playerId: string): number {
    return match.scores.find(s => s.playerId === playerId)?.points || 0;
  }
} 