import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

@Component({
  selector: 'app-child-details',
  templateUrl: './child-details.component.html',
  styleUrls: ['./child-details.component.css']
})
export class ChildDetailsComponent implements OnInit, OnDestroy {
  isChildSelected: boolean = false;
  // @Output() isChildSelected = new EventEmitter<{answer:boolean}>();
  selectedChild!: Child;
  childId:number=0;
  childChangeSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private childrenService: ChildrenService) { }


  ngOnInit(){
    this.isChildSelected= true;
    console.log(this.childId);
    this.childChangeSubscription = this.childChangeSubscription= this.route.params
    .subscribe(params=>{
    this.childId = params['id'];
    console.log('Id >> ', this.childId);
    this.selectedChild = this.childrenService.getChild(this.childId);

  })
  }

  ngOnDestroy(): void {
    console.log('leaving');
    // this.isChildSelected.emit({
    //   answer:false
    //   });
    this.childChangeSubscription.unsubscribe();
  }

}
