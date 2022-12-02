import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {Post} from '../DataModels/post.model';
import {map, tap} from 'rxjs/operators';
import {hostApi} from '../globals';

@Injectable({providedIn: 'root'})
export class PostService {
  private hostApiPost = hostApi + '/post/';
  private posts: Post[] = []; // albums array
  private post: Post;
  private postUpdated = new Subject<Post[]>(); // is subject we want to observe


  constructor(private http: HttpClient) {
  }

  /**
   * method responsible to add post
   * @param userName
   * @param post
   */
  addPost(userName, post) {
    const request = this.http.post<{ post: Post }>(this.hostApiPost + 'post/', {UserName: userName, Post: post})
      .pipe(tap(console.log), map((serverResponse => serverResponse)))
      .subscribe((data) => {
        console.log('Received Data:' + data);
        console.dir(data);
        this.posts.unshift(data);
        this.postUpdated.next([...this.posts]);
        console.dir(this.posts);
      });
  }

  /**
   * method responsible to return postUpdate observable
   */
  getPostUpdateListener() {
    return this.postUpdated.asObservable();
  }

  /**
   * method responsible to retrieve all posts.
   */
  getAllPosts() {
    return this.http.get(this.hostApiPost + 'posts/')
      .pipe(tap(console.log), map(serverResponse => serverResponse)) // we re-edit the information to remove the  messages
      .subscribe(files => {
          this.posts = files;
          console.log(JSON.stringify(this.posts));
          this.postUpdated.next(this.posts); // we return the information trough observable
        }
      );
  }

  /**
   * method responsible to like a spesific post.
   * @param postId
   */
  likePost(postId) {
    return this.http.post(this.hostApiPost + 'like/', {UserName: 'NONE!', Post: postId})
      .pipe(tap(console.log), map((serverResponse => serverResponse)))
      .subscribe((data) => {
          console.log('Received Data:' + data);
          console.dir(data);
          /*          this.posts.unshift(data);
                    this.postUpdated.next([...this.posts]);
                    console.dir(this.posts);*/
        }
      );
  }

  /**
   * method responsible to comment on spesific post
   * @param comment
   * @param postId
   */
  postComment(comment, postId) {
    return this.http.post(this.hostApiPost + 'comment/', {Comment: comment, PostobjId: postId})
      .pipe(tap(console.log), map((serverResponse => serverResponse)))
      .subscribe((data) => {
          console.log('Received Data:' + data);
          console.dir(data);
          /*          this.posts.unshift(data);
                    this.postUpdated.next([...this.posts]);
                    console.dir(this.posts);*/
        }
      );
  }

  /**
   * method responsible to delete spesific post.
   * @param postID
   */
  public deletePost(postID: string) {
    this.http.delete(this.hostApiPost + 'delete_post/' + postID) // pass album id as parameter
      .subscribe(() => {
        console.log('deleted!');
        const updatePosts = this.posts.filter(post => post.id !== postID); // we remove the album from our list
        this.posts = updatePosts; // init the album list with the filtered list
        this.postUpdated.next([...this.posts]); // and we inform the subject and return new copy of albums array
      });
  }
}
