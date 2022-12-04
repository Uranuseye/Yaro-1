import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FileObject} from '../../DataModels/fileObject.model';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Users} from '../../DataModels/users.model';
import {FollowService} from '../../Services/follow.service';

@Component({
  selector: 'app-share-selected-dialog',
  templateUrl: './share-selected-dialog.component.html',
  styleUrls: ['./share-selected-dialog.component.css']
})
export class ShareSelectedDialogComponent implements OnInit {
  myControl = new FormControl();
  options?: Users[];
  users: Observable<Users[]>;
  something = '';
  public selected;

  constructor(
    private followService: FollowService,
    public dialogRef: MatDialogRef<ShareSelectedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{numberOfItemsToShare:number},
    ) {
  }

  ngOnInit() {
    debugger;
    this.followService.getUsers();
    this.users = this.followService.getUsersUpdateListener();

    this.users
      .subscribe(
        userList => {
          this.options = userList;
        });

    this.users = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): Users[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.firstName.toLowerCase().indexOf(filterValue) === 0);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onShopSelectionChanged(selected: any) {
    this.selected = selected.id;
  }


}
