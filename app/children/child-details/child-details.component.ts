import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { PALService } from 'src/app/pal.service';
import { ChildrenService } from '../children.service';

@Component({
  selector: 'app-child-details',
  templateUrl: './child-details.component.html',
  styleUrls: ['./child-details.component.css']
})
export class ChildDetailsComponent implements OnInit, OnDestroy {
  isChildSelected: boolean = false;
  selectedChild!: Observable<Child[] | Child>;
  childId:string = '';
  childChangeSubscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private childrenService: ChildrenService,
    private palservice: PALService) { }


  ngOnInit(){
    this.isChildSelected= true;
    // console.log(this.childId);
    this.childChangeSubscription = this.childChangeSubscription= this.route.params
      .subscribe(params=>{
      this.childId = params['id'];
      // console.log('the fetched id is', this.childId);
      this.selectedChild = this.palservice.getChild(this.childId);
    })


  }

  ngOnDestroy(): void {
    // console.log('leaving');
    this.childChangeSubscription.unsubscribe();
  }

}
