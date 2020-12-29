import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  onAddChild(){
    this.router.navigate(['add-child']);
  }
  onAddVolunteer(){
    this.router.navigate(['add-volunteer']);
  }

}
