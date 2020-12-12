import { Component, OnInit } from '@angular/core';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

@Component({
  selector: 'app-children-list',
  templateUrl: './children-list.component.html',
  styleUrls: ['./children-list.component.css']
})
export class ChildrenListComponent implements OnInit {
  // fetchedChildren: Child[] = [{firstName: 'Collin', lastName: 'Kapernick', img: 'https://via.placeholder.com/150'},
  // {firstName: 'Dave', lastName: 'Greensman', img:'https://via.placeholder.com/150'}];
  fetchedChildren!: Child[];
  constructor(private childrenService: ChildrenService) { }

  ngOnInit(): void {
   this.fetchedChildren =  this.childrenService.getChildrenData()
  }

}
