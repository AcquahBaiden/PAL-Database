import { Component, Input, OnInit } from '@angular/core';
import { AdminServiceService } from '../admin-service.service';

@Component({
  selector: 'app-access-control',
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.css']
})
export class AccessControlComponent implements OnInit {
  @Input() userAccessData: any;

  constructor(private adminService: AdminServiceService) { }

  ngOnInit(): void {
  }
  toggleChildrenAccess(){
    this.adminService.updateAccessToChildren(this.userAccessData.id,this.userAccessData.children);
  }
  toggleVolunteersAccess(){
    this.adminService.updateAccessToVolunteers(this.userAccessData.id,this.userAccessData.volunteers);
  }
}
