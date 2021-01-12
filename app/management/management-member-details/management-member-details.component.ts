import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { ManagementMember } from 'src/app/interfaces/management-member.interface';
import { ManagementService } from '../management.service';

@Component({
  selector: 'app-management-member-details',
  templateUrl: './management-member-details.component.html',
  styleUrls: ['./management-member-details.component.css']
})
export class ManagementMemberDetailsComponent implements OnInit, OnDestroy {
  memberId: string = null;
  memberSubscription!: Subscription;
  selectedMember: Observable<ManagementMember[]>;
  constructor(private route: ActivatedRoute,
    private managementService: ManagementService) { }

  ngOnInit(): void {
    this.memberSubscription = this.route.params
      .subscribe(params=>{
        this.memberId = params['id'];
        this.selectedMember = this.managementService.getMember(this.memberId);
      })
  }

  onDeleteMember(){
    this.managementService.deleteMember(this.memberId);
  }

  ngOnDestroy(){
    this.memberSubscription.unsubscribe();
  }
}
