

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Post} from '../../DataModels/post.model';
import {PostService} from '../../Services/post.service';
import {HubConnection, HubConnectionBuilder} from '@aspnet/signalr';
import {AuthenticationService} from '../../Services/auth.service';
import { hostApi } from 'src/app/globals';

@Component({
  selector: 'app-posts-container',
  templateUrl: './posts-container.component.html',
  styleUrls: ['./posts-container.component.scss']
})
export class PostsContainerComponent implements OnInit, OnDestroy {
  private hostApiNotification = `${hostApi}/notiffication`;
  posts: Observable<Post[]>;
  creator;
  hubConnection: HubConnection;
  comment = '';
  panelOpenState = true;

  trackByIndex = (index: any) => index;

  constructor(private postService: PostService, private authService: AuthenticationService) {
  }

  ngOnInit() {
    this.creator = this.authService.getUserID();
    this.postService.getAllPosts();
    this.posts = this.postService.getPostUpdateListener();
    this.startConnection();
  }

  public startConnection = () => {
    console.log('The User that is on signalR is');
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hostApiNotification)
      .build();

    this.hubConnection.start().then(() => {
      console.log('Connection started with SignalR');
    }).catch(err => console.log('Error' + err));

    this.hubConnection.on('Send', (data) => {
      console.log(data);
      if (data === 'refreshPost') {
        this.postService.getAllPosts();
      }
    });
  };




  ngOnDestroy() {
    console.log('----------------------------------->');
    this.stopConnection();
  }

  public likePost(post: Post) {
    console.log('The liked post - ');
    console.log(post.id);
    this.postService.likePost(post.id);
  }

  public checkInLikesArray(postArray: any): String {
    const isLiked = postArray.find(x => x.objId === (localStorage.getItem('userID') || 'null'));
    if (isLiked) {
      return 'unlike';
    } else {
      return 'like';
    }
  }

  public postComment(postID) {
    console.log(this.comment);
    console.log(postID);
    this.postService.postComment(this.comment, postID);
    this.comment = '';

  }

  

  public stopConnection() {
    console.log('Stopping connection');
    this.hubConnection.stop();
  }

  public firstWords(postContent: string): string {
    let words = postContent.split(/\s+/);
    words = words.slice(0, 5);
    return words.join(' ');
  }

  public deletePost(postId: string) {
    this.postService.deletePost(postId);
  }
}
