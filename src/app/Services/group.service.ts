import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from '../DataModels/post.model';
import { map, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
// import {Users} from '../DataModules/users.model';
import { GroupModel } from '../DataModels/group-model';
import { hostApi } from '../globals';
import { Router } from '@angular/router';

import { AlbumModel } from '../DataModels/album.model';
import { Users } from '../DataModels/users.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  public groups: GroupModel[] = []; // groups array
  private group: GroupModel;

  model = 'group';

  constructor(private http: HttpClient, public router: Router) {}

  all(): Observable<GroupModel[]> {
    console.log('GroupService.all:  invoked ' + this.getUrl() + '/groups');
    return this.http.get<GroupModel[]>(this.getUrl() + '/groups');
  }

  find(objId: string) {
    console.log('GroupService.find:  invoked: ' + this.getUrlWithId(objId));
    const ret = this.http.get<GroupModel>(this.getUrlWithId(objId));
    console.dir(ret);
    return ret;
  }

  create(group: GroupModel) {
    console.log('GroupService.create:  invoked : '+ this.getUrl() + '/create');
    return this.http.post<GroupModel>(this.getUrl() + '/create', group);
  }

  update(group: GroupModel) {
    console.log('GroupService.update:  invoked' + this.getUrl() + '/update');
    return this.http.put(this.getUrl() + '/update', group);
  }

  delete(group: GroupModel) {
    console.log('GroupService.delete:  invoked');
    return this.http.delete(this.getUrlWithId(group.id));
  }
  

  private getUrl() {
    return `${hostApi}/${this.model}`;
  }

  private getUrlWithId(objId: string) {
    return `${this.getUrl()}/${objId}`;
  }
}
