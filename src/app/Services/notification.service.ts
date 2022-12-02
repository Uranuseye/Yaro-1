import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map, tap} from 'rxjs/operators';
import {NotificationModel} from '../DataModels/notification.model';
import {hostApi} from '../globals';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hostApiNotifications = hostApi + '/notification/';
  private notifications: NotificationModel[] = [];
  private unreadNotificationSize: number;
  private notificationUpdated = new Subject<NotificationModel[]>();
  private notificationSizeUpdate = new Subject<number>();

  constructor(private http: HttpClient) {
  }

  /**
   * method responsible to get updated post observable
   */
  getPostUpdateListener() {
    return this.notificationUpdated.asObservable();
  }

  /**
   * method responsible to get unread notiffication observable
   */
  getUnreadNotificatinListener() {
    return this.notificationSizeUpdate.asObservable();
  }

  /**
   * method responsible to get unread notification size
   */
  getUnreadNotificationsSize() {
    const size = this.notifications.filter(x => x.read === false).length;
    // console.log('The Size of unread is :' + size);
    this.notificationSizeUpdate.next(size);
  }

  /**
   * method responsible to het users notiffication from the server
   */
  getUserNotification() {
    return this.http.get(this.hostApiNotifications + 'notifications/')
      .pipe(//tap(console.log),
       map(serverResponse => serverResponse)) // we re-edit the information to remove the  messages
      .subscribe((files :NotificationModel[]) => {
          this.notifications = files;
          // console.log(JSON.stringify(this.notifications));
          this.notificationUpdated.next(this.notifications);
          this.getUnreadNotificationsSize();// we return the information trough observable
        }
      );
  }

  /**
   * method responsible to delete spesific nottification
   * @param nottificationId
   */
  public deleteNotification(nottificationId: string) {
    this.http.delete(this.hostApiNotifications + 'delete_notification/' + nottificationId) // pass album id as parameter
      .subscribe(() => {
        // console.log('deleted!');
        const updateNotifications = this.notifications.filter(not => not.id !== nottificationId); // we remove the album from our list
        this.notifications = updateNotifications; // init the album list with the filtered list
        this.notificationUpdated.next([...this.notifications]); // and we inform the subject and return new copy of albums array
      });
  }

  /**
   * method responsible to mark nottification as read
   * @param nottificationId
   */
  public markNotificationAsRead(nottificationId: String) {
    const objIndex = this.notifications.findIndex((obj => obj.id === nottificationId));
    this.notifications[objIndex].read = true;
    this.notificationUpdated.next([...this.notifications]);
    this.getUnreadNotificationsSize();
    return this.http.post(this.hostApiNotifications + 'mark_read/', {notificationobjId: nottificationId})
      .pipe(//tap(console.log), 
      map((serverResponse => serverResponse)))
      .subscribe((data) => {
          // console.log('Received Data:' + data);
          // console.dir(data);
                  //  this.posts.unshift(data);
                  //   this.postUpdated.next([...this.posts]);
                  //   console.dir(this.posts);
        }
      );
  }

  /**
   * method responsible to mark all notiffication as read.
   */
  public markAllAsRead() {
    this.notifications.forEach((element) => {
      element.read = true;
    });
    this.notificationUpdated.next([...this.notifications]);
    this.getUnreadNotificationsSize();
    return this.http.post(this.hostApiNotifications + 'mark_all_read/', null)
      .pipe(//tap(console.log),
       map((serverResponse => serverResponse)))
      .subscribe((data) => {
          // console.log('Received Data:' + data);
          // console.dir(data);
          /*          this.posts.unshift(data);
                    this.postUpdated.next([...this.posts]);
                    console.dir(this.posts);*/
        }
      );
  }
}
