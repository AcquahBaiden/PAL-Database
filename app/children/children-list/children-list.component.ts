import { Component, OnInit } from '@angular/core';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';
import { Observable } from 'rxjs';
import { FilterPipe } from '../filter.pipe';

@Component({
  selector: 'app-children-list',
  templateUrl: './children-list.component.html',
  styleUrls: ['./children-list.component.css']
})
export class ChildrenListComponent implements OnInit {
  fetchedChildren!:  Child[];
  isFetching:boolean = true;
  searchText = '';
  characters = [
    'Ant-Man',
    'Aquaman',
    'Asterix',
    'The Atom',
    'The Avengers',
    'Batgirl',
    'Batman',
    'Batwoman'
  ];

  dbchildren:Observable<Child[]>;
  constructor(private childrenService: ChildrenService) {}


  ngOnInit(): void {
    this.isFetching = true;
  this.dbchildren =  this.childrenService.getDbChildren();
  this.isFetching = false;
  }

  onIdSelection(){
  }

}
