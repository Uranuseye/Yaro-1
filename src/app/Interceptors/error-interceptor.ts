import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
} from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ErrorComponent } from "../Dialogs/error/error.component";
import { UIService } from "../Services/ui.service";

@Injectable()
/**
 * error interceptor , checks any request of http to find error message and display it
 */
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private uiService: UIService
  ) {}

  openErrorWindow(
    errorMessage: string | null = null,
    errorResponse: HttpErrorResponse
  ) {
    // console.error(errorResponse);
    // this.uiService.loadingChanged.next(false); // stops the loading banner
    // this.snackbar.open(errorMessage, null, { duration: 3000 }); // display snack bar error
    this.dialog.open(ErrorComponent, {
      data: { message: errorMessage, errorResponse: errorResponse },
    }); // display dialog error
    console.error(errorResponse);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // listens to any http request

    return next.handle(req).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        //debugger;
        //const errorResponse: HttpErrorResponse = errorResponse;
        let LocalErrorMessage = `Angular doesn't know: no message received.`; // init the error message
        console.warn(req.url);

        if (errorResponse.message) {
          //debugger;
          //debugger;
          this.openErrorWindow(
            JSON.stringify(errorResponse, null, 4),
            errorResponse,
          );
          //errorMessage = error.message; // sets new error messagen
        } else {
          LocalErrorMessage = "Oops Something Went Wrong! \r\n" + req.url;
          LocalErrorMessage += JSON.stringify(errorResponse, null, 4);
          this.openErrorWindow( LocalErrorMessage,errorResponse);
        }
        if (LocalErrorMessage === "DUP") {
          LocalErrorMessage += " !!! DUP !!!";
          this.openErrorWindow( LocalErrorMessage,errorResponse);
          return;
        }

        this.uiService.loadingChanged.next(false); // stops the loading banner
        this.snackbar.open(LocalErrorMessage, null, { duration: 3000 }); // display snack bar error
        return throwError(errorResponse); // returns back to process
      })
      // catchError((error: HttpErrorResponse) => {
      //   debugger;
      //   let errorMessage = 'An unknown error occurred!'; // init the error message
      //   console.log(req.url);
      //   if (error.error && error.status !== 0) {
      //     errorMessage = error.error; // sets new error messagen
      //   } else {
      //     errorMessage = 'Oops Something Went Wrong! \r\n'+ req.url;
      //   }
      //   if (errorMessage === 'DUP') {
      //     return;
      //   }
      //   this.uiService.loadingChanged.next(false); // stops the loading banner
      //   this.snackbar.open(errorMessage, null, {duration: 3000}); // display snack bar error
      //   this.dialog.open(ErrorComponent, {data: {message: errorMessage}}); // display dialog error
      //   console.log(error);
      //   return throwError(error); // returns back to process
      // })
    );
  }
}
