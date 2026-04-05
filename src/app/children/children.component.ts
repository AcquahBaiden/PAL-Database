import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChildrenListComponent } from './children-list/children-list.component';

@Component({
  selector: 'app-children',
  standalone: true,
  imports: [CommonModule, RouterModule, ChildrenListComponent],
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.css']
})
export class ChildrenComponent {}
