import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { Subject } from 'rxjs';
import {SignalInfo, UserInfo} from '../DataModels/video.model';
import {hostApi} from '../globals';


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private hubConnection: signalR.HubConnection;

  private newPeer = new Subject<UserInfo>();
  public newPeer$ = this.newPeer.asObservable();

  private helloAnswer = new Subject<UserInfo>();
  public helloAnswer$ = this.helloAnswer.asObservable();

  private disconnectedPeer = new Subject<UserInfo>();
  public disconnectedPeer$ = this.disconnectedPeer.asObservable();

  private signal = new Subject<SignalInfo>();
  public signal$ = this.signal.asObservable();

  constructor() { }

  public async startConnection(currentUser: string): Promise<void> {

    // ths is the HUB connection setting
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hostApi + '/videostream')
      .build();

    // this is starting connection to HUB
    await this.hubConnection.start();
    console.log('Connection started');

    // registration of 'NewUserArrived' method
    this.hubConnection.on('NewUserArrived', (userName) => {
      this.newPeer.next(JSON.parse(userName));
    });

    // registration of 'UserSaidHello' method
    this.hubConnection.on('UserSaidHello', (data) => {
      this.helloAnswer.next(JSON.parse(data));
    });

    // registration of 'UserDisconnect' method
    this.hubConnection.on('UserDisconnect', (data) => {
      this.disconnectedPeer.next(JSON.parse(data));
    });

    // registration of 'SendSignal' method
    this.hubConnection.on('SendSignal', (user, signal) => {
      this.signal.next({ user: user, signal: signal });
    });

    // this is calling - invoking the request to HUB server
    // and calling 'NewUser' methodthat accepts currentUser
    // as argument
    this.hubConnection.invoke('NewUser', currentUser);
  }

  // public method to be called in angular
  public sendSignalToUser(signal: string, user: string) {
    // invoking 'SendSignal' method on HUB
    this.hubConnection.invoke('SendSignal', signal, user);
  }

  // public method to be called in angular
  public sayHello(userName: string, user: string): void {
    // invoking 'HelloUser' method on HUB
    this.hubConnection.invoke('HelloUser', userName, user);
  }

}
