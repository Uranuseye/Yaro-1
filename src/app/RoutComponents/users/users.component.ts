import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../Services/auth.service';
import {Observable} from 'rxjs';
import {Users} from '../../DataModels/users.model';
import {FollowService} from '../../Services/follow.service';
import {FilterModuleModule} from '../../ComponentModuleDependencies/filter-module.module';






@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: Observable<Users[]>;
  users2Show: Users[];

  
  filterStr: string = '';
  filterKey: string = 'first';

//new changes
  constructor(private followService: FollowService) {
  }

  ngOnInit() {
    this.followService.getUsers();
    this.users = this.followService.getUsersUpdateListener();


    this.users
      .subscribe(
        usersList => {
          this.users2Show = usersList;
          // this.users2Show = data.sort(( l, r ) => {
          //   const left = l.LastName + l.FirstName;
          //   const right = r.LastName + r.FirstName;
          //   return left < right ? -1 : 1;
          // });

        });
  }

  followUser(user) {
    console.log(user);
    this.followService.followUser(user.objId);
  }

  unfollow(user) {
    console.log(user);
    this.followService.unFollowUser(user.objId);
  }

  changeKey(key) {
    this.filterKey = key;
  }

}
