import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
showStaus:boolean = false;
isError:boolean = false;
message:string='No message here';
  constructor(private notiServicce: NotificationService) { }

  ngOnInit(): void {
    this.notiServicce.currentState.subscribe(stateData=>{
      this.reset();
      if(stateData.showStatus){
        this.setStatus(stateData.isError,stateData.message);
      }
    })
  }

  reset(){
    this.showStaus = false;
    this.message = '';
  }

  setStatus(isError:boolean,message:string){
    this.reset();
    this.isError = isError;
    setTimeout(()=>{
      this.message = message;
      this.showStaus = true;
    },1000)
  }

}
