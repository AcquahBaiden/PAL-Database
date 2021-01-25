import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import { ManagementMember } from "src/app/interfaces/management-member.interface";
import { ManagementService } from "../management.service";

@Component({
  selector: "app-management-member-edit",
  templateUrl: "./management-member-edit.component.html",
  styleUrls: ["./management-member-edit.component.css"],
})
export class ManagementMemberEditComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private managementService: ManagementService
  ) {}
  @ViewChild("editForm", { static: false }) Form: NgForm;
  memberIDToEdit: string;
  editSubscription: Subscription;
  member: ManagementMember;
  profileImg: string = null;
  imageLoaded: boolean = false;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.memberIDToEdit = params["id"];
      this.editSubscription = this.managementService
        .getMember(this.memberIDToEdit)
        .subscribe((member) => {
          this.member = member;
          this.Form.setValue({
            firstName: this.member.firstName,
            lastName: member.lastName,
            email: member.email,
            telephone: member.telephone,
            residence: member.residence,
            position: member.position,
            description: member.description,
          });
          this.profileImg = this.member.img;
          this.profileImg === ""
            ? (this.imageLoaded = false)
            : (this.imageLoaded = true);
        });
    });
  }

  onUpdateMember(form: NgForm) {
    this.managementService.updateManagementMember(
      this.memberIDToEdit,
      form.value
    );
  }

  onuploadProfileImg(event: any) {
    const fileName = (this.member.firstName + this.member.lastName).concat(
      Math.floor(Math.random() * 100).toString()
    );
    this.managementService.uploadFile(event, fileName);
    setTimeout(() => {
      this.managementService
        .updateMemberProfilePhoto(this.memberIDToEdit, fileName)
        .then(() => {
          this.profileImg = fileName;
        });
    }, 2000);
  }

  ngOnDestroy() {
    this.editSubscription.unsubscribe();
    this.profileImg = null;
  }
}
