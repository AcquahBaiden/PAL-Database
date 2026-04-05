import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ArchivedListComponent } from './archived-list/archived-list.component';

@Component({
  selector: 'app-archived',
  standalone: true,
  imports: [CommonModule, RouterModule, ArchivedListComponent],
  templateUrl: './archived.component.html',
  styleUrls: ['./archived.component.css']
})
export class ArchivedComponent {}
