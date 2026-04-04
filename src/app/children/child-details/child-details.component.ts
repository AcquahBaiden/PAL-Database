import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

import { switchMap, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-child-details',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './child-details.component.html',
  styleUrls: ['./child-details.component.css']
})
export class ChildDetailsComponent implements OnInit, OnDestroy {

  selectedChild: Child;
  childId: string;
  childSubscription!: Subscription;
  dataLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private childrenService: ChildrenService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.childSubscription = this.route.params.pipe(
      tap(params => {
        this.childId = params['id'];
        this.dataLoaded = false;
        this.cdr.detectChanges();
      }),
      switchMap(params => this.childrenService.getChild(params['id']))
    ).subscribe(child => {
      this.selectedChild = child;
      this.dataLoaded = true;
      this.cdr.detectChanges();
    });
  }

  onDeleteChild() {
    if (confirm('Are you sure you want to delete this profile?')) {
      this.childrenService.deleteChild(this.childId);
      this.router.navigate(['/children']);
    }
  }

  ngOnDestroy(): void {
    if (this.childSubscription) {
      this.childSubscription.unsubscribe();
    }
  }
}
