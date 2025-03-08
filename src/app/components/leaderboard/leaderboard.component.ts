import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameService } from '../../services/game.service';
import { Player } from '../../models/match.model';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  players: Player[] = [];
  displayedColumns: string[] = ['rank', 'name', 'totalScore'];
  dataSource: MatTableDataSource<Player>;

  constructor(
    private gameService: GameService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<Player>();
  }

  ngOnInit(): void {
    this.gameService.getPlayers().subscribe(players => {
      this.players = players.sort((a, b) => b.totalScore - a.totalScore);
      this.dataSource.data = this.players;
    });
  }

  resetLeaderboard(): void {
    if (confirm('Are you sure you want to reset the leaderboard? This action cannot be undone.')) {
      this.gameService.resetLeaderboard();
    }
  }
} 