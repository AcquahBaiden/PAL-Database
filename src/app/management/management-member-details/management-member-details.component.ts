import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ManagementMember } from 'src/app/interfaces/management-member.interface';
import { ManagementService } from '../management.service';

import { switchMap, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-management-member-details',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './management-member-details.component.html',
  styleUrls: ['./management-member-details.component.css']
})
export class ManagementMemberDetailsComponent implements OnInit, OnDestroy {
  memberId: string = '';
  memberSubscription!: Subscription;
  selectedMember: ManagementMember;
  dataLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private managementService: ManagementService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.memberSubscription = this.route.params.pipe(
      tap(params => {
        this.memberId = params['id'];
        this.dataLoaded = false;
        this.cdr.detectChanges();
      }),
      switchMap(params => this.managementService.getMember(params['id']))
    ).subscribe(member => {
      this.selectedMember = member;
      this.dataLoaded = true;
      this.cdr.detectChanges();
    });
  }

  onDeleteMember() {
    if (confirm('Are you sure you want to delete this management member?')) {
      this.managementService.deleteMember(this.memberId);
      this.router.navigate(['management']);
    }
  }

  ngOnDestroy() {
    if (this.memberSubscription) {
      this.memberSubscription.unsubscribe();
    }
  }
}
