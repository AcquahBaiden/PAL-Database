import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.css']
})
export class ChildrenComponent implements OnInit {
  isIdSelected = true;
  constructor() { }

  ngOnInit(): void {
  }

  idHasBeenSelected(event){
    console.log('Final changed', this.isIdSelected);
    this.isIdSelected = true;
  }
}
