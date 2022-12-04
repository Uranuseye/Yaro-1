import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Post } from "../DataModels/post.model";
import { map, tap } from "rxjs/operators";
import { Subject } from "rxjs";
import { Users } from "../DataModels/users.model";
import { hostApi, hostApiAuthentication } from "../globals";

@Injectable({
  providedIn: "root",
})
export class FollowService {
  private hostApiFollow = hostApi + '/follow/';
  

  //public currentlocalhost = 'https://localhost:5001';
  private usersListAllButMe: Users[] = []; // albums array

  private usersUpdated = new Subject<Users[]>();
  usersUpdated$ = this.usersUpdated.asObservable();

  private usersFollowingUpdated = new Subject<Users[]>();
  usersFollowingUpdated$ = this.usersFollowingUpdated.asObservable();

  private usersFollowing: Users[] = [];

  groupUsers$ = this.usersUpdated.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * method responsible to get user update listener
   */
  getUsersUpdateListener() {
    return this.usersUpdated.asObservable();
  }

  /**
   * method responsible to get following update listener
   */
  getUsersFollowingUpdateListener() {
    return this.usersFollowingUpdated.asObservable();
  }

  /**
   * method responsible to get follow users
   */
  getUsers() {
    return this.http
      .get(hostApiAuthentication + 'GetAllUsers2/')
      .pipe(
        // tap(console.log),
        map((serverResponse) => serverResponse)
      ) // we re-edit the information to remove the  messages
      .subscribe((usersList: Users[]) => {
        this.usersListAllButMe = usersList;
        //console.log(JSON.stringify(this.users));
        this.usersUpdated.next(this.usersListAllButMe); // we return the information trough observable
      });
  }
  /**
   * method responsible to get followers users
   */
  getFollowingUsers() {
    return this.http
      .get(this.hostApiFollow + 'followers/')
      .pipe(
        tap(console.log),
        map((serverResponse) => serverResponse)
      ) // we re-edit the information to remove the  messages
      .subscribe((files: Users[]) => {
        this.usersFollowing = files;
        //console.log(JSON.stringify(this.usersFollowing));
        this.usersFollowingUpdated.next(this.usersFollowing); // we return the information trough observable
      });
  }

  /**
   * method reponsible to add user to follow group
   * @param userID
   */
  followUser(userIdToFolow) {
    console.log(`followUser(${userIdToFolow}) `)
    const request = this.http
      .post<{ post: Post }>(this.hostApiFollow+ 'follow/', { objId: userIdToFolow })
      .pipe(
        // tap(console.log),
        map((serverResponse) => serverResponse)
      )
      .subscribe((data: any) => {
        //console.log('Received Data:' + data);
        //console.dir(data);
        //this.users.unshift(data);
        const index = this.usersListAllButMe.findIndex((e) => e.id === data.objId);
        this.usersListAllButMe[index] = data;
        this.usersUpdated.next([...this.usersListAllButMe]);
        //console.dir(this.users);
      });
  }

  /**
   * method responsible to unflollow spesific user.
   * @param userID
   */
  unFollowUser(userID) {
    const request = this.http
      .post<{ post: Post }>(this.hostApiFollow+ 'unfollow/', { objId: userID })
      .pipe(
        // tap(console.log),
        map((serverResponse) => serverResponse)
      )
      .subscribe((data: any) => {
        // console.log('Received Data:' + data);
        // console.dir(data);
        const index = this.usersListAllButMe.findIndex((e) => e.id === data.objId);
        this.usersListAllButMe[index] = data;
        this.usersUpdated.next([...this.usersListAllButMe]);
        // console.dir(this.users);
      });
  }
}
