import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AlbumModel } from '../DataModels/album.model';
import { ChatMessage } from '../DataModels/chat-message.model';
import { map, tap } from 'rxjs/operators';
import { hostApi } from '../globals';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private hostApiMessage = hostApi + '/message/';
  private messages: ChatMessage[] = []; // albums array
  private message: ChatMessage;
  private unreadMessageSize: number;
  private unreadMessageSizeUpdated = new Subject<number>();
  private messageUpdated = new Subject<ChatMessage[]>();

  constructor(private http: HttpClient) {}

  /**
   * method responsible to get message observable
   */
  getMessagetUpdateListener() {
    return this.messageUpdated.asObservable();
  }

  /**
   * method responsible to get unread message listner
   */
  getUnreadMessageListner() {
    return this.unreadMessageSizeUpdated.asObservable();
  }

  /**
   *
   * @param msg method responsible to send message
   */
  sendMessage(msg: ChatMessage) {
    this.http
      .post(this.hostApiMessage + 'message/', msg)
      .pipe(
        tap(console.log),
        map((serverResponse) => serverResponse)
      )
      .subscribe((data) => {
        console.log('sendMessage(msg: ChatMessage)');
        console.dir(data);
        this.messages.push(data);
        this.messageUpdated.next([...this.messages]);
      });
  }

  /**
   *
   * @param receiverID method responsible to get all messages
   */
  getConversation(receiverID) {
    console.log(`getConversation(${receiverID})`);
    this.http
      .get(this.hostApiMessage + 'messages/' + receiverID)
      .pipe(
        tap(console.log),
        map((serverResponse) => serverResponse)
      ) // we re-edit the information to remove the  messages
      .subscribe((converasations) => {
        console.dir(converasations);

        if (converasations !== null) {
          this.messages = converasations;
          this.messageUpdated.next(this.messages);
          this.getUnreadMessageSize(); // we return the information trough observable
        } else {
          this.messages = [];
          this.messageUpdated.next(this.messages);
        }
      });
  }

  /**
   * method responsible to get number of unread messages
   */
  getUnreadMessageSize() {
    this.http
      .get(this.hostApiMessage + 'unread_messages/' + 'something')
      .pipe(
        tap(console.log),
        map((serverResponse) => serverResponse)
      ) // we re-edit the information to remove the  messages
      .subscribe((files) => {
        console.log('getUnreadMessageSize()');
        this.unreadMessageSize = files;
        console.log(JSON.stringify(this.unreadMessageSize));
        this.unreadMessageSizeUpdated.next(this.unreadMessageSize); // we return the information trough observable
      });
  }
}
