import {Injectable} from '@angular/core';
import {HubConnection, HubConnectionBuilder} from '@aspnet/signalr';
import {AuthenticationService} from './auth.service';
import {hostApi} from '../globals';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  hubConnection: HubConnection;
  userId: string;

  constructor(private authService: AuthenticationService) {
  }


  public startConnection = () => {
    this.userId = this.authService.getUserID();
    console.log('The User that is on signalR is' + this.userId);
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hostApi + '/notiffication')
      ///hostApi + '/notiffication'
      /* hostApi + '/notiffication'
       */
      //hostApi + '/notiffication'
      .build();

    this.hubConnection.start().then(() => {
      console.log('Connection started with SignalR');

      this.hubConnection.invoke('getConnectionId')
        .then((connectionId) => {
          console.log(connectionId);
        });

    }).catch(err => console.log('Error' + err));

    this.hubConnection.on('Send', (data) => {
      console.log(data);
    });
  };

  public stopConnection = () => {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  };
}
