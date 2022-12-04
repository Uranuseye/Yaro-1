/**
 * Imports of used components and modules
 */
import { HttpClient } from "@angular/common/http";
import { AuthData, LoginData } from "../DataModels/auth-data.model";

import { UIService } from "./ui.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs/internal/Subject";
import { AlbumModel } from "../DataModels/album.model";
import { Users } from "../DataModels/users.model";
import { map, tap } from "rxjs/operators";
import { SignalrService } from "./signalr.service";
import { hostApi } from "../globals";

// Service is always decorated with @Injectable with providedIn root

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  private hostApiAuthentication = hostApi + "/Auth/";

  private isAuthenticated = JSON.parse(
    localStorage.getItem("loggedIn") || "false"
  ); // init is Authenticated with false
  private token = localStorage.getItem("token") || "null"; // token is of type string
  private userName = localStorage.getItem("userName") || "null";
  private userID = localStorage.getItem("userID") || "null";
  private avatar = localStorage.getItem("avatar") || "/assets/images/man.svg";

  // ?? Coockie

  // public currentlocalhost = 'https://localhost:5001';
  private users: Users[] = []; // albums array
  private album: Users;
  private usersUpdated = new Subject<Users[]>(); // alb
  // authStatusListener is a new Subject() This connecting of observers to an observable with data type "True/False"
  private authStatusListener = new Subject<boolean>();

  /**
   * this Class constructor uses HttpClient and Router
   * @param {HttpClient} http
   * @param {Router} router
   * @param uiService
   */
  constructor(
    private http: HttpClient,
    private router: Router,
    private uiService: UIService
  ) {}

  /**
   * method responsible to return the token of the connection
   * @returns {string}
   */
  getToken() {
    const tmp = localStorage.getItem("token");
    //console.log('Get token ' + tmp);
    return tmp;
  }

  /**
   * method returns the authentication status
   * @returns {boolean}
   */
  getAuthStatus() {
    return JSON.parse(localStorage.getItem("loggedIn") || "false");
  }

  /**
   * method responsible to retrieve users avatar
   */
  getAvatar() {
    return localStorage.getItem("avatar") || "/assets/images/man.svg";
  }

  /**
   * method responsible to retrive userName
   */
  getUserName() {
    return localStorage.getItem("userName");
  }

  /**
   * method responsible to retrive user id
   */
  getUserID() {
    return localStorage.getItem("userID");
  }

  /**
   * get observable listener
   */
  getUsersUpdateListener() {
    return this.usersUpdated.asObservable();
  }

  /**
   * return the authStatusListener as Observable (True/False)
   * @returns {Observable<boolean>}
   */
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  /**
   * method responsible to update listener status
   */
  updateAuthStatusListener() {
    this.authStatusListener.next(true);
  }

  /**
   * method responsible to send post with new user information
   * @param {string} email
   * @param {string} password
   * @param firstName
   * @param lastName
   */
  createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    this.uiService.loadingChanged.next(true);
    const authData: AuthData = {
      email: email,
      userName: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
    };

    this.http.post(this.hostApiAuthentication + "register", authData).subscribe(
      (serverResponse) => {
        console.log(serverResponse); // log in favor of debug
        this.uiService.loadingChanged.next(false);
        this.router.navigate(["/"]); // navigate to root
      },
      (err) => {
        console.log(err); // debug log
        this.authStatusListener.next(false); // trigger the change of listener to false
      }
    );
  }

  /**
   * method responsible to retrieve all registered users
   */
  getRegisteredUser() {
    return this.http
      .get(this.hostApiAuthentication + "users/")
      .pipe(
        tap(console.log),
        map((serverResponse) => serverResponse)
      ) // we re-edit the information to remove the  messages
      .subscribe((deleteRecycleBinReturnDto) => {
        let deleteDto = deleteRecycleBinReturnDto;
        console.log(JSON.stringify(deleteDto));
        //this.usersUpdated.next(this.users); // we return the information trough observable
      });
  }

  /**
   * method responsible to get user by id
   * @param id
   */
  getUserById(id) {
    console.warn(`getUserById ${id}`);
    return this.http
      .get<{ Id: string; FirstName: string; LastName }>(
        this.hostApiAuthentication + "user/" + id
      )
      .pipe(
        tap(console.warn),
        map((serverResponse) => serverResponse)
      );
  }

  /**
   * method responsible to send post to the server with
   * login information
   * @param {string} email
   * @param {string} password
   */
  login(email: string, password: string) {
    // debugger;
    this.uiService.loadingChanged.next(true);
    const authData: LoginData = { email: email, password: password };

    this.http
      .post<{
        token: string;
        userName: string;
        userID: string;
        avatar: string;
      }>(this.hostApiAuthentication + "login", authData)
      .subscribe((serverResponse) => {
        this.onLoginSubscriptionResponce(serverResponse);
        // navigates to the /albums component
      });
  }

  /**
   *
   * @param serverResponse
   */
  private onLoginSubscriptionResponce(serverResponse: {
    token: string;
    userName: string;
    userID: string;
    avatar: string;
  }) {
    // console.log(serverResponse); // log for debug purpose
    this.uiService.loadingChanged.next(false);

    // console.log('LogResponse' + serverResponse.token);
    const { token, userName, userID, avatar } =
      this.SetConstants(serverResponse);

    this.UseConstantsAsThis(token, userName, userID, avatar);

    this.isAuthenticated = true; // status of authentication changed to true
    this.SetStorageWithThis();

    this.authStatusListener.next(this.isAuthenticated); // true); //triggers that authStatusListnere with True value
    this.router.navigate(["/album"]);
  }

  private SetStorageWithThis() {
    localStorage.setItem("loggedIn", this.isAuthenticated);
    localStorage.setItem("token", this.token);
    localStorage.setItem("userName", this.userName);
    localStorage.setItem("userID", this.userID);
    localStorage.setItem("avatar", this.avatar);
  }

  private UseConstantsAsThis(
    token: string,
    userName: string,
    userID: string,
    avatar: string
  ) {
    this.token = token; // init token with the token received from server
    this.userName = userName;
    this.userID = userID;
    this.avatar = avatar;
  }

  private SetConstants(serverResponse: {
    token: string;
    userName: string;
    userID: string;
    avatar: string;
  }) {
    const token = serverResponse.token; // token is the serverResponse information

    // Set User's consts
    const userName = serverResponse.userName;
    const userID = serverResponse.userID;
    const avatar =
      serverResponse.avatar != null
        ? serverResponse.avatar
        : "/assets/images/man.svg";
    return { token, userName, userID, avatar };
  }

  /**
   * method responsible to end the connection
   */
  logout() {
    localStorage.clear();
    this.token = null;
    this.authStatusListener.next(false); // triggers the listener with false status
    this.router.navigate(["/"]); // navigates back to root
    localStorage.clear();
  }
}
