import { Injectable } from '@angular/core';
import { Child } from '../interfaces/child.interface';
import { AngularFireDatabase } from '../../../node_modules/@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class ChildrenService {
//   MockData:Child[] = [
//     {
//     firstName: 'Kofi',
//     lastName: 'Oppong',
//     img:'https://via.placeholder.com/150'
//   },
//   {
//     firstName: 'Yaw',
//     lastName: 'Opoku',
//     img:'https://via.placeholder.com/150'
//   },
//   {
//     firstName: 'Joseph',
//     lastName: 'Mensah',
//     img:'https://via.placeholder.com/150'
//   },
//   {
//     firstName: 'Henry',
//     lastName: 'Oteng',
//     img:'https://via.placeholder.com/150'
//   },
//   {
//     firstName: 'Aba',
//     lastName: 'Oppong',
//     img:'https://via.placeholder.com/150'
//   },
//   {
//     firstName: 'Kwame',
//     lastName: 'Owuah',
//     img:'https://via.placeholder.com/150'
//   }
// ]

  constructor(private db: AngularFireDatabase) { }

  // getChildrenData(){
  //   return this.MockData;
  // }

  // getChildrenFromDB(){
  //   return this.db.list('children').valueChanges();
  // }

  // addChild(childData:Child){
  //   this.MockData.push(childData);
  // }

  saveToFirebase(data: Child){
    const itemsRef = this.db.list('Children');
    itemsRef.push(data);
  }


}
