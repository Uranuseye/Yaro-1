import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Users} from '../../DataModels/users.model';
import {FollowService} from '../../Services/follow.service';

@Component({
  selector: 'app-message-recipient',
  templateUrl: './message-recipient.component.html',
  styleUrls: ['./message-recipient.component.scss']
})
export class MessageRecipientComponent implements OnInit {
  public recipients: Observable<Users[]>;

  constructor(private followService: FollowService) {
  }

  ngOnInit() {
    this.followService.getUsers();
    this.recipients = this.followService.getUsersUpdateListener();
    debugger;
  }

}
