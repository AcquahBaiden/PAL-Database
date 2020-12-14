import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.css']
})
export class ChildrenComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // onChildIdSelected(EventReceived:any){
  //   console.log('Recieved = ', EventReceived);
  //   console.log('Answer = ', EventReceived);
  // }

}
