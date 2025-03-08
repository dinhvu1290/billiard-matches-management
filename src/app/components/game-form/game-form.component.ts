import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
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
  isSelectingPlayers: boolean = false;
  existingPlayers: Player[] = [];

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private router: Router
  ) {
    this.gameForm = this.fb.group({
      numberOfPlayers: [2, [Validators.required, Validators.min(2), Validators.max(8)]],
      players: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Load existing players
    this.gameService.getPlayers().subscribe(players => {
      this.existingPlayers = players;
      if (this.existingPlayers.length > 0) {
        // If we have existing players, initialize the form with them
        this.initializeWithExistingPlayers();
      }
    });
  }

  private initializeWithExistingPlayers(): void {
    // Set number of players to match existing players
    this.gameForm.patchValue({
      numberOfPlayers: this.existingPlayers.length
    });

    // Clear and recreate player form array
    while (this.players.length) {
      this.players.removeAt(0);
    }

    // Add form controls for each existing player
    this.existingPlayers.forEach(player => {
      this.players.push(this.fb.group({
        playerId: [player.id, Validators.required],
        points: [0, [Validators.required]]
      }));
    });

    // Skip directly to score entry
    this.isEnteringScores = true;
  }

  get players() {
    return this.gameForm.get('players') as FormArray;
  }

  updateForm(): void {
    const numPlayers = this.gameForm.get('numberOfPlayers')?.value || 2;
    
    // Clear existing form array
    while (this.players.length) {
      this.players.removeAt(0);
    }

    // Add new form controls
    for (let i = 0; i < numPlayers; i++) {
      this.players.push(this.fb.group({
        name: ['', Validators.required],
        points: [0, [Validators.required]]
      }));
    }
  }

  onStartSelectingPlayers(): void {
    if (this.gameForm.get('numberOfPlayers')?.valid) {
      this.updateForm();
      this.isSelectingPlayers = true;
    }
  }

  onNextStep(): void {
    if (this.gameForm.valid) {
      // First, create any new players
      const formValue = this.gameForm.value;
      formValue.players.forEach((p: any) => {
        const existingPlayer = this.gameService.getPlayerByName(p.name);
        if (!existingPlayer) {
          this.gameService.addPlayer(p.name);
        }
      });

      this.isEnteringScores = true;
    }
  }

  onSubmit(): void {
    if (this.gameForm.valid) {
      const formValue = this.gameForm.value;
      let players: Player[];
      let scores: Score[];

      if (this.existingPlayers.length > 0) {
        // Use existing players
        players = formValue.players.map((p: any) => 
          this.existingPlayers.find(ep => ep.id === p.playerId)!
        );
        
        scores = formValue.players.map((p: any) => ({
          playerId: p.playerId,
          points: p.points
        }));
      } else {
        // Create new players
        players = formValue.players.map((p: any) => {
          const existingPlayer = this.gameService.getPlayerByName(p.name);
          if (existingPlayer) {
            return existingPlayer;
          }
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: p.name,
            totalScore: 0
          };
        });

        scores = players.map((player: Player, index: number) => ({
          playerId: player.id,
          points: formValue.players[index].points
        }));
      }

      this.gameService.createMatch(players, scores);
      this.router.navigate(['/matches']);
    }
  }

  validateScore(player: AbstractControl): void {
    const pointsControl = player.get('points');
    if (!pointsControl) return;

    let value = pointsControl.value;
    
    // Allow empty input or just a minus sign
    if (value === '' || value === '-') {
      return;
    }
    
    // Convert to number, allowing negative values
    const numValue = Number(value);
    
    // Update only if it's a valid number
    if (!isNaN(numValue)) {
      pointsControl.setValue(numValue, { emitEvent: false });
    }
  }

  onScoreInput(event: KeyboardEvent): void {
    // Allow numbers, minus sign, and control keys
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '-'];
    const isNumber = /[0-9]/.test(event.key);
    
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
      return;
    }

    // Allow minus sign anywhere in empty input
    if (event.key === '-') {
      const input = event.target as HTMLInputElement;
      if (input.value !== '' && input.selectionStart !== 0) {
        event.preventDefault();
      }
    }
  }

  getPlayerName(playerId: string): string {
    const player = this.existingPlayers.find(p => p.id === playerId);
    return player ? player.name : '';
  }
} 