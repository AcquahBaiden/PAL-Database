import { Component, OnInit } from '@angular/core';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';
import { PALService } from 'src/app/pal.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-children-list',
  templateUrl: './children-list.component.html',
  styleUrls: ['./children-list.component.css']
})
export class ChildrenListComponent implements OnInit {
  fetchedChildren!:  Child[];
  isFetching:boolean = true;
  profileUrl!: Observable<any>;

  dbchildren:any;
  constructor(private childrenService: ChildrenService,
    private palservice: PALService) {}


  ngOnInit(): void {
    this.isFetching = true;
  // this.fetchedChildren =  this.childrenService.getChildrenData();
  this.dbchildren =  this.palservice.getDbChildren();
  this.isFetching = false;
  this.profileUrl = this.childrenService.getProfileUrl('EmmanuelBaiden');
  }

}
