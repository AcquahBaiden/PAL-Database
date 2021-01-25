import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

@Component({
  selector: 'app-children-list',
  templateUrl: './children-list.component.html',
  styleUrls: ['./children-list.component.css']
})
export class ChildrenListComponent implements OnInit {
  isFetching:boolean = true;
  searchText = '';

  dbchildren:Observable<Child[]>;
  constructor(private childrenService: ChildrenService) {}


  ngOnInit(): void {
    this.isFetching = true;
  this.dbchildren =  this.childrenService.getDbChildren();
  this.isFetching = false;
  }

}
