import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Users} from '../../DataModels/users.model';
import {FollowService} from '../../Services/follow.service';


@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.scss']
})
export class FollowersComponent implements OnInit {
  private users: Observable<Users[]>;
  users2Show: Users[];

  constructor(private followService: FollowService) {
  }

  ngOnInit() {
    this.followService.getFollowingUsers();
    this.users = this.followService.getUsersFollowingUpdateListener();


    this.users
      .subscribe(
        data => {
          this.users2Show = data;
          debugger;
          this.users2Show = this.users2Show.filter(user => user.isFollowing);
        });
  }



}
