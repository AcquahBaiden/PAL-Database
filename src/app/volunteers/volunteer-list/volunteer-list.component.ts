import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { VolunteersFilterPipe } from '../volunteers.pipe';

@Component({
  selector: 'app-volunteer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, VolunteersFilterPipe],
  templateUrl: './volunteer-list.component.html',
  styleUrls: ['./volunteer-list.component.css']
})
export class VolunteerListComponent implements OnInit, OnDestroy {
  isFetching = true;
  searchText = '';
  volunteersData: Volunteer[] = [];
  private sub!: Subscription;

  constructor(private volunteersService: VolunteersService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sub = this.volunteersService.getVolunteersData().subscribe({
      next: (data) => {
        this.volunteersData = data;
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching volunteers:', err);
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
