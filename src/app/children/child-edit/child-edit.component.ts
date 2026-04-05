import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable, firstValueFrom } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

import { take } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-child-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './child-edit.component.html',
  styleUrls: ['./child-edit.component.css']
})
export class ChildEditComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute, 
    private childrenService: ChildrenService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  @ViewChild('editForm', { static: false }) editForm!: NgForm;
  childId: string = '';
  selectedChild: Child;
  childSubscription!: Subscription;
  dataLoaded = false;
  isUploading = false;
  uploadPercent: Observable<number | undefined>;

  ngOnInit(): void {
    this.childSubscription = this.route.params.subscribe(async (params) => {
      try {
        this.childId = params['id'];
        this.dataLoaded = false;
        this.cdr.detectChanges();
        const child = await firstValueFrom(this.childrenService.getChild(this.childId).pipe(take(1)));
        if (!child) {
          return;
        }

        this.selectedChild = child;
        this.dataLoaded = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          if (this.editForm) {
            this.editForm.form.patchValue({
              firstName: child.firstName,
              lastName: child.lastName,
              residence: child.residence || '',
              class: child.class || '',
              school: child.school || '',
              parentName: child.parentName || '',
              parentTel: child.parentTel || '',
              description: child.description || '',
              telephone: child.telephone || '',
            });
            this.cdr.detectChanges();
          }
        });
      } catch (error) {
        console.error('Error loading child for edit:', error);
      }
    });
  }

  async onUpdateChild(form: NgForm) {
    if (form.valid) {
      await this.childrenService.updateChild(this.childId, form.value);
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  async onuploadProfileImg(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const fileName = `${this.selectedChild.firstName}_${this.selectedChild.lastName}_${Date.now()}`;
    this.cdr.detectChanges();

    try {
      const uploadPromise = this.childrenService.uploadFile(event, fileName);
      this.uploadPercent = this.childrenService.uploadPercent;
      this.cdr.detectChanges();

      await uploadPromise;
      await this.childrenService.updateChildProfile(this.childId, fileName);
    } finally {
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.childSubscription) {
      this.childSubscription.unsubscribe();
    }
  }
}
