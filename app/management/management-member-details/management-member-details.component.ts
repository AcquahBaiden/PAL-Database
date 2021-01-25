import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
  selectedMember: ManagementMember;
  dataLoaded = false;
  constructor(private route: ActivatedRoute,
    private managementService: ManagementService) { }

  ngOnInit(): void {
    this.memberSubscription = this.route.params
      .subscribe(params=>{
        this.memberId = params['id'];
         this.managementService.getMember(this.memberId).subscribe(member=>{
          this.selectedMember = member;
          this.dataLoaded = true;
        });
      })
  }

  onDeleteMember(){
    this.managementService.deleteMember(this.memberId);
  }

  ngOnDestroy(){
    this.memberSubscription.unsubscribe();
    this.dataLoaded =false;
  }
}
