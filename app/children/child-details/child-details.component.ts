import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
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
  // isChildSelected: boolean = true;

  selectedChild: Observable<Child[] | Iterable<Child> | (Iterable<Child> & Child[]) | (Child[] & Iterable<Child>)>;
  childId:string = 'nothing';
  childChangeSubscription!: Subscription;
   profileUrl: Observable<string | null>;

  constructor(private route: ActivatedRoute,
    private childrenService: ChildrenService,
    private palservice: PALService,
    private storage: AngularFireStorage) { }


    ngOnInit(){
    this.childChangeSubscription = this.route.params
      .subscribe(params=>{
      this.childId = params['id'];
      console.log('the params value', this.childId);
      this.selectedChild = this.palservice.getChild(this.childId);
      // this.isChildSelected = true;
      // console.log('starting at', this.isChildSelected);
    })

  }

  onDeleteChild(){
    this.childrenService.deleteChild(this.childId);
  }

  ngOnDestroy(): void {
    this.childChangeSubscription.unsubscribe();
  }

}
