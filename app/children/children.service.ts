import { Injectable } from '@angular/core';
import { Child } from '../interfaces/child.interface';
import { AngularFireDatabase } from '../../../node_modules/@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChildrenService {
  public uploadPercent: Observable<number>;
  public downloadURL!: Observable<string>;

  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) { }

  saveToFirebase(data: Child){
    const itemsRef = this.db.list('Children');
    itemsRef.push(data);
  }

  uploadFile(event: any, fileName:string) {
    console.log('on the other side');
    const file = event.target.files[0];
    const fileRef = this.storage.ref('children/'+fileName);
    const task = this.storage.upload('children/'+fileName, file);
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL() )
   )
  .subscribe()
  }

  deleteChild(id:string){
    const childRef = this.db.list('Children/'+id);
    console.log('to be deleted is', childRef);
    childRef.remove();
  }


  getProfileUrl(ref:string ){
    const profileImgRef = this.storage.ref('children/'.concat(ref));
    // this.profileUrl =  ref.getDownloadURL();
    console.log('ref ===', profileImgRef);
    console.log('retrieved url ====', profileImgRef.getDownloadURL());
    return profileImgRef.getDownloadURL();
  }

}
