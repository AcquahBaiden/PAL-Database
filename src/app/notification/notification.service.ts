import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private actionState = new BehaviorSubject({isError:false,message:'',showStatus: false});
  currentState = this.actionState.asObservable();
  constructor() { }

  setState(isError:boolean,message:string,showStatus:boolean){
    this.actionState.next({
      isError,
      message:message,
      showStatus,
    })
  }

}
