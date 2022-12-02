import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { BackupModel } from "../DataModels/backup.model";
import { RestoreModel } from "../DataModels/restore.model";
import { hostApi } from "../globals";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private hostApiAdmin = hostApi + "/admin/";
  constructor(private http: HttpClient, public router: Router) {}

  runBackup() {
    console.log("Sending request");
    // this.http.get<{ message: string, albums: any }>(host + '/album/getAlbums')
    return this.http.get<BackupModel>(this.hostApiAdmin + "backup").pipe(
      map((responce) => {
        console.log(responce);
        return {
          bacupResult: responce.bacupResult,
          bacupName: responce.bacupName,
          backupMessage: responce.backupMessage,
        };
      })
    );
  }

  getRestoreList() {
    console.log("Getting Restors list");
    return this.http.get<RestoreModel>(this.hostApiAdmin + "get_restores").pipe(
      map((responce) => {
        console.log(responce);
        return {
          restoreResult: responce.restoreResult,
          restoreName: responce.restoreName,
          restoreList: responce.restoreList,
          restoreMessage: responce.restoreMessage,
        };
      })
    );
  }

  runRestore(itemId: string) {
    console.log(itemId);
    const restoreId = { restoreId: itemId };
    return this.http
      .post<RestoreModel>(this.hostApiAdmin + "runrestore", restoreId)
      .pipe(
        map((responce) => {
          console.log(responce);
          return {
            restoreResult: responce.restoreResult,
            restoreName: responce.restoreName,
            restoreList: responce.restoreList,
            restoreMessage: responce.restoreMessage,
          };
        })
      );

    // .pipe(map(responce =>{
    //   console.log(responce);
    //   return {
    //     restoreResult: responce.restoreResult,
    //     restoreName: responce.restoreName,
    //     restoreList: responce.restoreList,
    //     restoreMessage: responce.restoreMessage,
    //   };
    // }));
  }
}
