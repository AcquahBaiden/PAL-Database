import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription, Observable } from "rxjs";

import { ManagementMember } from "src/app/interfaces/management-member.interface";
import { ManagementService } from "../management.service";

import { switchMap, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: "app-management-member-edit",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: "./management-member-edit.component.html",
  styleUrls: ["./management-member-edit.component.css"],
})
export class ManagementMemberEditComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private managementService: ManagementService,
    private cdr: ChangeDetectorRef
  ) {}
  @ViewChild("editForm", { static: false }) editForm!: NgForm;
  memberId: string = '';
  memberSubscription!: Subscription;
  member: ManagementMember;
  isUploading = false;
  uploadPercent: Observable<number | undefined>;
  dataLoaded = false;

  ngOnInit(): void {
    this.memberSubscription = this.route.params.pipe(
      tap(params => {
        this.memberId = params['id'];
        this.dataLoaded = false;
        this.cdr.detectChanges();
      }),
      switchMap(params => this.managementService.getMember(params['id']))
    ).subscribe(member => {
      if (member) {
        this.member = member;
        this.dataLoaded = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          if (this.editForm) {
            this.editForm.form.patchValue({
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email || '',
              telephone: member.telephone || '',
              residence: member.residence || '',
              position: member.position || '',
              description: member.description || '',
            });
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  async onUpdateMember(form: NgForm) {
    if (form.valid) {
      await this.managementService.updateManagementMember(
        this.memberId,
        form.value
      );
    }
  }

  onuploadProfileImg(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const fileName = `mgmt_${this.member.firstName}_${this.member.lastName}_${Date.now()}`;
    
    this.managementService.uploadFile(event, fileName);
    this.uploadPercent = this.managementService.uploadPercent;

    setTimeout(async () => {
      await this.managementService.updateMemberProfilePhoto(this.memberId, fileName);
      this.isUploading = false;
    }, 4000);
  }

  ngOnDestroy() {
    if (this.memberSubscription) {
      this.memberSubscription.unsubscribe();
    }
  }
}
