/**
 * Imports of used components and modules
 */
 import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { runInThisContext } from 'vm';


@Component({
  templateUrl: './error.component.html',
  selector: 'app-error',

})

export class ErrorComponent {

  public messageText:string;
  public errorResponseTextLines:string;
  /**
   * constructor init with injectable Mat dialog data with message of type string
   * @param {{message: string}} data
   */
  constructor(@Inject(MAT_DIALOG_DATA) 
  public data: { message: string, errorResponse: HttpErrorResponse| null }) {}

  OnInit(){
    this.messageText = this.data.message;
    //this.errorResponseText;
    this.seterrorResponseTextLines();
  }

  seterrorResponseTextLines(){
    console.debug(this.data.errorResponse);
    this.errorResponseTextLines = JSON.stringify(this.data.errorResponse, null, 4);
  }
}
