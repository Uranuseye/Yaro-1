import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Users} from '../../DataModels/users.model';
import {FollowService} from '../../Services/follow.service';


@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss']
})
export class FollowingComponent implements OnInit {
  private users: Observable<Users[]>;
  users2Show: Users[];

  constructor(private followService: FollowService) {
  }

  ngOnInit() {
    this.followService.getUsers();
    this.users = this.followService.getUsersUpdateListener();
    this.users
      .subscribe(
        data => {
          this.users2Show = data;
          debugger;
          this.users2Show = this.users2Show.filter(user => user.isFollowing);
        });
  }

  unfollow(user) {
    console.log(user);
    this.followService.unFollowUser(user.objId);
  }

}
