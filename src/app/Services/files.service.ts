import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileObject } from '../DataModels/fileObject.model';
//import { AlbumModel } from '../DataModels/album.model';
import { hostApi } from '../globals';
import { NewAlbumDialogComponent } from '../Dialogs/new-album-dialog/new-album-dialog.component';
import { AlbumModel } from '../DataModels/album.model';
//import { forEachComment } from 'tslint';

// we declare that this service should be created
// by the root application injector.
@Injectable({ providedIn: 'root' })
export class FileService {
  private hostApiData: string = hostApi + '/data/';

  color = 'primary';
  mode = 'determinate';
  // value:any=0


  private files: FileObject[] = []; // files array of type FileObject (interface)
  private sortedFiles: FileObject[] = [];
  //private filesTodelete: string[] = [];
  private filesUpdatedList = new BehaviorSubject<FileObject[]>(this.files); // filesUpdated is the subject with BehaviorSubject returns files
  progress: number;
  value: any;
  ip: string;
  // Should be in config
  //public currentlocalhost = "https://localhost:5001";

  /**
   * constructor that inits Http client protocol
   * @param {HttpClient} http
   */
  constructor(private http: HttpClient) {}

  /**
   * we return filesUpdated asObservable trough
   * getter for security measures we want it to be encapsulated
   * @returns {Observable<FileObject[]>} as data that couldn't not be changed
   */
  getFileUpdateListener(): Observable<FileObject[]> {
    return this.filesUpdatedList.asObservable();
  }

  clearFiles() {
    this.filesUpdatedList.next(null);
  }


  uploadFile2(/* albumobjId: string, */ formData: FormData) {
    console.warn(formData); // log for debug will be removed in the future

    const request$ = this.http
      .post(this.hostApiData + 'uploadfile', formData, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe(
        (event) => {
          //send success response
          debugger;
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round((100 * event.loaded) / event.total);
            this.value = this.progress;
          } else if (event.type == HttpEventType.Response) {
            console.log(`HttpEventType.Response ${event.body}`);
          }
        }
        /*
        , (err) => {
        //send error response
      }
        */
      );
  }

  /**
   * method responsible to upload files to the server
   *
   * @param {FormData} formData - form data information
   */
  uploadFile(/* albumobjId: string, */ formData: FormData) {
    //formData.append("AlbumId", albumId); // we append the album name to the file
    console.log(formData); // log for debug will be removed in the future

    const request$ = this.http
      .post(this.hostApiData + 'upload_file', formData, { reportProgress: true })
      // the server returns the file object that was entered the db
      .pipe(
        tap(console.log),
        map((serverResponse) => serverResponse.file)
      )
      .subscribe(
        (file) => {
          console.log('Received Data:');
          const index = this.files.findIndex((e) => e.url === file.url);
          if (index === -1) {
            this.files.push(file);
          } else {
            this.files[index] = file;
          }
          // this.files.push(file); // we push the received file to the fleUpdated list
          this.filesUpdatedList.next([...this.files]); // and notification to the Subject to return the new files list.
        },
        (error) => {
          console.log(error);
        }
      );
  }

  uploadAvatar(formData: FormData) {
    // console.log(formData); // log for debug will be removed in the future
    return this.http.post<{ url: string }>(
      this.hostApiData + 'avatar',
      formData,
      { reportProgress: true }
    );
  }

  /**
   * this method pushes a FileObject to list of Files
   * and to filesUpdated list
   * @param tmp
   */
  insertFile(tmp: FileObject) {
    this.files.push(tmp);
    this.filesUpdatedList.next([...this.files]);
  }

  /**
   * method responsible to retrieve files list from the server
   * by album id
   * @param {string} albumId
   * @returns {Subscription}
   */
  getFiles(albumId: string) {
    const getFileSubs = this.http
      .get<{ message: string; files: any }>(
        this.hostApiData + 'getAlbumFiles/' + albumId
      )
      .pipe(
        tap(console.log),
        map((serverResponse) => serverResponse.files)
      ); // we re-edit the information to remove the  messages

    return getFileSubs.subscribe((files) => {
      this.files = files;
      //console.log(JSON.stringify(this.files));
      //console.dir(files);
      this.filesUpdatedList.next(this.files); // we return the information trough observable
    });
  }

  loadThumbnail(src: string) {
    return this.http.get(this.hostApiData + 'thumbnail/' + src, {
      responseType: 'blob',
    });
  }

  loadPreview(src: string) {
    return this.http.get(this.hostApiData + 'preview/' + src, {
      responseType: 'blob',
    });
  }

  /**
   *
   * @param fileObject This method filters out failed upload files?
   */
  filterOutLocalFilesList(fileObject: FileObject) {
    this.files = this.files.filter((obj) => obj !== fileObject);
    this.filesUpdatedList.next(this.files);
  }

  getCurrentFiles() {
    if (this.sortedFiles.length > 0) {
      return this.sortedFiles;
    }
    return this.files;
  }

  delFromAllUserDb(
    listOfFilesToDelete: string[],
    looseOwnership: boolean = false
  ) {
    const fileToDelete = {
      ListOfFilesToDelete: listOfFilesToDelete,
      //Album: null,
      LooseOwnership: looseOwnership,
    };
    this.http
      .post(this.hostApiData + 'deleteFileFromAllMyAlbums/', fileToDelete)
      .subscribe(() => {
        console.log('delFromAllUserDb - deleted!');

        listOfFilesToDelete.forEach((fileId) => {
          this.files.splice(
            this.files.findIndex((val) => val.objId === fileId),
            1
          );
        });
        this.filesUpdatedList.next([...this.files]); // return new list as observable
      });
  }

  shareFileWithUser(currentAlbum: string, userId: string, files: string[]) {
    const fileToShare = {
      SourceAlbumId: currentAlbum,
      UserToShareWithObjId: userId,
      ListFileIds: files,
    };
    this.http
      .post(this.hostApiData + 'share_selected/', fileToShare)
      .subscribe(() => {
        console.log('files Shared!');
      });
  }

  setOwnership(userId: string, newAlbum: AlbumModel, listOfFiles: string[]) {
    const ownership = {
      NewOwnerId: userId,
      Album: newAlbum,
      ListFileIds: listOfFiles,
    };
    this.http
      .post(this.hostApiData + 'setOwner_selected/', ownership)
      .subscribe(() => {
        console.log('setOwnership - done!');
      });
  }

  /**
   * method responsible to delete file by id
   * @param id
   */
  /*   addRemoveDelete(objId: string) {
    this.filesTodelete.push(objId);
    console.log(this.filesTodelete);
  }

 */
  filterFilesByDate(startDate, endDate) {
    const dataNew = this.files.filter((product) => {
      new Date(
        product.exifData.dateTimeOriginal
          .toString()
          .split(' ')[0]
          .replace(':', '-')
      ) >= new Date(startDate) &&
        new Date(
          product.exifData.dateTimeOriginal
            .toString()
            .split(' ')[0]
            .replace(':', '-')
        ) <= new Date(endDate);
    });
    this.filesUpdatedList.next([...dataNew]);
    this.sortedFiles = dataNew;
  }

  resetFilter() {
    this.filesUpdatedList.next([...this.files]);
  }

  ngOnDestroy() {
    this.filesUpdatedList.unsubscribe();
  }
}
