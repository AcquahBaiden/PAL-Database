import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

@Component({
  selector: 'app-child-details',
  templateUrl: './child-details.component.html',
  styleUrls: ['./child-details.component.css']
})
export class ChildDetailsComponent implements OnInit, OnDestroy {

  selectedChild: Child;
  childId:string = 'nothing';
  childChangeSubscription!: Subscription;
   profileUrl: Observable<string | null>;

  constructor(private route: ActivatedRoute,
    private childrenService: ChildrenService) { }


    ngOnInit(){
    this.childChangeSubscription = this.route.params
      .subscribe(params=>{
      this.childId = params['id'];
      this.childrenService.getChild(this.childId).subscribe((child)=>{
        this.selectedChild = child;
      }
      );
    })

  }

  onDeleteChild(){
    this.childrenService.deleteChild(this.childId);
  }

  ngOnDestroy(): void {
    this.childChangeSubscription.unsubscribe();
  }

}
