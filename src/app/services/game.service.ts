import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Match, Player, Score } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly STORAGE_KEY = 'billiard_matches';
  private readonly PLAYERS_KEY = 'billiard_players';
  private matches: Match[] = [];
  private players: Player[] = [];
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  private playersSubject = new BehaviorSubject<Player[]>([]);

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const storedMatches = localStorage.getItem(this.STORAGE_KEY);
    const storedPlayers = localStorage.getItem(this.PLAYERS_KEY);
    
    if (storedMatches) {
      this.matches = JSON.parse(storedMatches);
      this.matchesSubject.next(this.matches);
    }
    
    if (storedPlayers) {
      this.players = JSON.parse(storedPlayers);
      this.playersSubject.next(this.players);
    }
  }

  private saveData(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.matches));
    localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(this.players));
  }

  getMatches(): Observable<Match[]> {
    return this.matchesSubject.asObservable();
  }

  getPlayers(): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  addPlayer(name: string): void {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: name,
      totalScore: 0
    };
    
    this.players.push(newPlayer);
    this.playersSubject.next(this.players);
    localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(this.players));
  }

  createMatch(players: Player[], scores: Score[]): void {
    const newMatch: Match = {
      id: Date.now().toString(),
      date: new Date(),
      players,
      scores
    };

    this.matches.unshift(newMatch);
    scores.forEach(score => {
      const player = this.players.find(p => p.id === score.playerId);
      if (player) {
        player.totalScore += score.points;
      }
    });
    
    this.matchesSubject.next(this.matches);
    this.playersSubject.next(this.players);
    this.saveData();
  }

  resetLeaderboard(): void {
    this.matches = [];
    this.players.forEach(player => player.totalScore = 0);
    this.matchesSubject.next(this.matches);
    this.playersSubject.next(this.players);
    this.saveData();
  }
} 