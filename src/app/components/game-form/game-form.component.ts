import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Player, Score } from '../../models/match.model';

@Component({
  selector: 'app-game-form',
  templateUrl: './game-form.component.html',
  styleUrls: ['./game-form.component.scss']
})
export class GameFormComponent implements OnInit {
  gameForm: FormGroup;
  numberOfPlayers: number = 2;
  isEnteringScores: boolean = false;

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private router: Router
  ) {
    this.gameForm = this.fb.group({
      players: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.updateForm();
  }

  get players() {
    return this.gameForm.get('players') as FormArray;
  }

  updateForm(): void {
    // Clear existing form array
    while (this.players.length) {
      this.players.removeAt(0);
    }

    // Add new form controls
    for (let i = 0; i < this.numberOfPlayers; i++) {
      this.players.push(this.fb.group({
        name: ['', Validators.required],
        points: [0, [Validators.required]]
      }));
    }
  }

  onNextStep(): void {
    if (this.gameForm.valid) {
      this.isEnteringScores = true;
    }
  }

  onSubmit(): void {
    if (this.gameForm.valid) {
      const formValue = this.gameForm.value;
      const players: Player[] = formValue.players.map((p: any) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: p.name,
        totalScore: 0
      }));
      
      const scores: Score[] = formValue.players.map((p: any, index: number) => ({
        playerId: players[index].id,
        points: p.points
      }));

      this.gameService.createMatch(players, scores);
      this.router.navigate(['/matches']);
    }
  }

  validateScore(player: any): void {
    const pointsControl = player.get('points');
    let value = pointsControl?.value;
    
    // Remove any non-digit characters
    value = value.toString().replace(/[^\d]/g, '');
    
    // Convert to number
    const numValue = parseInt(value) || 0;
    
    // Update the control value
    pointsControl?.setValue(numValue, { emitEvent: false });
  }

  onScoreInput(event: any): void {
    // Allow only: numbers, backspace, delete, tab, escape, enter
    if (event.key === '-' || event.key === 'e' || event.key === '.' || event.key === ',') {
      event.preventDefault();
    }
  }
} 