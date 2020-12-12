import { Injectable } from '@angular/core';
import { Child } from '../interfaces/child.interface';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChildrenService {
  MockData:Child[] = [
    {
    firstName: 'Kofi',
    lastName: 'Oppong',
    img:'https://via.placeholder.com/150'
  },
  {
    firstName: 'Yaw',
    lastName: 'Opoku',
    img:'https://via.placeholder.com/150'
  },
  {
    firstName: 'Joseph',
    lastName: 'Mensah',
    img:'https://via.placeholder.com/150'
  },
  {
    firstName: 'Henry',
    lastName: 'Oteng',
    img:'https://via.placeholder.com/150'
  },
  {
    firstName: 'Aba',
    lastName: 'Oppong',
    img:'https://via.placeholder.com/150'
  },
  {
    firstName: 'Kwame',
    lastName: 'Owuah',
    img:'https://via.placeholder.com/150'
  }
]

  constructor(private db: AngularFireDatabase) { }

  getChildrenData(){
    return this.MockData;
  }

  addChild(childData:Child){
    console.log('service recieved', childData);
    this.MockData.push(childData);

  }

  getChild(id:number){
    return this.MockData[id];
  }

  saveToFirebase(data: Child){
    const itemsRef = this.db.list('children');
    itemsRef.push(data);
  }
}
