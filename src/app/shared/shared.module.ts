import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetDownloadURLPipe } from './get-download-url.pipe';

@NgModule({
  imports: [CommonModule, GetDownloadURLPipe],
  exports: [GetDownloadURLPipe]
})
export class SharedModule { }
