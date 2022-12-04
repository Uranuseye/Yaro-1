import {AlbumModel} from '../DataModels/album.model';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {Router} from '@angular/router';
import {hostApi} from '../globals';

@Injectable({ providedIn: 'root' }) // we inject services to the service
/**
 * Album service module
 */
export class AlbumService {
  private hostApiAlbum: string = hostApi + '/Album/';
  private hostApiData: string = hostApi + '/Data/';

  private albums: AlbumModel[] = []; // albums array
  private album: AlbumModel;
  private albumsUpdated = new Subject<AlbumModel[]>(); // albumsUpdated is subject we want to observe

  private albumsCopy: AlbumModel[];

  // public currentlocalhost = 'https://localhost:5001';

  /**
   *
   * we inject HttpClient service and Router service
   * @param {HttpClient} http
   * @param {Router} router
   */
  constructor(private http: HttpClient, public router: Router) {}

  filterAlbums(filter_string) {
    this.albumsCopy = this.albums.filter(
      (item) =>
        item.name.toLowerCase().indexOf(filter_string.toLowerCase()) > -1
    );
    this.albumsUpdated.next(this.albumsCopy);
    /*    //this.getAlbums();
        this.albums=this.albums.filter(customer => customer.AlbumName.toLowerCase().indexOf(args[0].toLowerCase()) !== -1);
        this.albums = this.albums.filter(
          album => album.AlbumName.toLo === filter_string);
        this.albumsUpdated.next([...this.albums]);*/
  }

  filterAlbumsByDate(startDate: Date, endDate: Date) {
    this.albumsCopy = this.albums.filter((album) => {
      return new Date(album.dateCreated) >= startDate;
    });
    console.dir(this.albumsCopy);
    this.albumsUpdated.next([...this.albumsCopy]);
  }

  resetFilter() {
    this.albumsUpdated.next([...this.albums]);
  }

  /**
   * getAlbum method gets album id,
   * search trough the album array to find id
   * if id in albums == album id given
   * we return the album Object
   * @param albumId
   * @returns {AlbumModel}
   */
  getAlbumInfo(albumId) {
    console.log('size of alubums ' + this.albums.length);
    console.dir(this.albums);
    const albumObject: AlbumModel = this.albums.find((o) => o.albumId === albumId);
    console.log(albumObject);
    return albumObject;
  }

  /**
   * getAlbums service sends get request to the server,
   * and retrieve all the albums of the user
   */
  getAlbums() {
    this.http
      .get<{ message: string; albums: AlbumModel[] }>(
        this.hostApiAlbum+ 'getAlbums'
      )
      .pipe(
        map((albumData) => {
          // the server response holds not the exact object we want so we map the object
          console.log(albumData);

          return albumData.albums;
          //   albumData.albums.map(album => { // for each album inside the array we get we remap the object
          //   debugger;
          //   return { // and then return it
          //     name: album.name,
          //     info: album.info,
          //     id: album.albumId,
          //     creator: album.creator,
          //     dateCreated: album.dateCreated
          //   };
          // });
        })
      )
      .subscribe((transformedAlbums) => {
        // after we got all the transformed albums
        console.log(transformedAlbums);
        this.albums = transformedAlbums; // we assign in to our album array
        console.log(
          'getAlbums - subscribe - Sucsesfully fethesd ' + this.albums.length
        );
        //console.log(this.albums);
        this.albumsUpdated.next([...this.albums]); // and we inform the subject and return new copy of albums array
      });
  }

  getAlbum(albumId: string) {
    // id passed as param
    // tslint:disable-next-line:max-line-length
    return this.http
      .get<AlbumModel>(this.hostApiAlbum+ 'getAlbumContent/' + albumId)
      .pipe(
        map((albumData) => {
          console.log(albumData);
          return {
            name: albumData.name,
            info: albumData.info,
            albumId: albumData.albumId,
            creator: albumData.creator,
            dateCreated: albumData.dateCreated.toString(),
            //files: albumData.files,
          };
        })
      );
  }

  getAlbumUpdateListener() {
    return this.albumsUpdated.asObservable();
  }

  /**
   * addAlbum service responsibel to add album to the server data base
   * it recieves the album object
   * @param {Album} albumObj
   */
  addAlbum(albumObj: AlbumModel) {
    debugger;
    const album: AlbumModel = albumObj;
    album.info = album.info ?? 'null';

    this.http
      .post<{ message: string; albumId: string }>(
        this.hostApiAlbum+ 'create_album',
        album
      )
      .subscribe((responseData) => {
        console.warn('responseData');
        console.warn(responseData);
        console.warn(responseData);
        // we receive back from the server the album id that was just added
        album.albumId = responseData.albumId; // init the album id with the id we received from server
        console.log(
          `addAlbum(albumObj: AlbumModel) responded with: ${responseData.message}`
        );
        this.albums.push(album); // push the album to the array of albums
        this.albumsUpdated.next([...this.albums]); // and we inform the subject and return new copy of albums array
        this.router.navigate(['/album']); // and navigate back to album page
      });
  }

  /**
   *  What is it different from addAlbum ?????
   * @param albumObj
   * @returns
   */
  createNewAlbum(albumObj: AlbumModel) {
    const album: AlbumModel = albumObj;
    return this.http.post<{ albumId: string }>(
      this.hostApiAlbum+ 'create_album',
      album
    );
    // push the album to the array of albums
    // and navigate back to album page
  }

  /**
   * deleteAlbum service responsible to delete,
   * the album from the data base of the server
   * @param {string} albumId
   */
  deleteAlbum(albumId: string) {
    // we send the album id of the album we want to delete
    this.http
      .delete(this.hostApiAlbum+ 'delete_album/' + albumId) // pass album id as parameter
      .subscribe(() => {
        console.log('deleted!');
        // we remove the album from our list
        this.albums = this.albums.filter((album) => album.albumId !== albumId); // init the album list with the filtered list
        this.albumsUpdated.next([...this.albums]); // and we inform the subject and return new copy of albums array
      });
  }

  getLocalAlbumSize() {
    return this.albums.length;
  }

  /**
   * method responsible to get number of files inside spesific album
   * @param albumId
   */
  getFilesCount(albumId: string) {
    return this.http.get<number>(
      this.hostApiAlbum+ 'countItemsInAlbum/' + albumId
    );
  }

  /**
   * updateAlbum Service is responsible to send,
   * album information we want to update on our database
   * @param {string} _id
   * @param {string} album
   * @param {string} info
   * @param date
   */
  updateAlbum(albumId: string, name: string, info: string, date: string) {
    const albumUpdated: AlbumModel = {
      albumId: albumId,
      name: name,
      info: info,
      dateCreated: date,
      //creator: '',
    }; // init the album with the new album changes
    this.http
      .put(this.hostApiAlbum+ 'update_album', albumUpdated) // pass put request to the server by id
      .subscribe(() => {
        const updatedAlbums = [...this.albums]; // we init updated albums with fresh copy of albums
        const oldAlbumIndex = updatedAlbums.findIndex(
          (p) => p.albumId === albumUpdated.albumId
        ); // we find the index of the album updated
        updatedAlbums[oldAlbumIndex] = albumUpdated; // and replace with the new album object
        this.albums = updatedAlbums; // we init the new album list with the updated array of albums
        this.albumsUpdated.next([...this.albums]); // and we inform the subject and return new copy of albums array
        this.router.navigate(['/album']); // navigate to album page
      });
  }

  moveFilesToExistingAlbum(
    currentAlbumId: string,
    newAlbumId: string,
    files: string[]
  ) {
    const albumMoved = {
      albumToMoveTo: newAlbumId,
      currentAlbum: currentAlbumId,
      listOfFiles: files,
    };
    console.dir(albumMoved);
    this.http
      .post(this.hostApiAlbum+ 'move_album/', albumMoved)
      .subscribe(() => {
        console.log('files Moved!');
      });
    console.log('request done');
  }

  copyFilesToExistingAlbum(
    currentAlbum: string,
    newAlbum: string,
    files: string[]
  ) {
    const albumCopy = {
      albumToMoveTo: newAlbum,
      currentAlbum: currentAlbum,
      listOfFiles: files,
    };
    this.http.post(this.hostApiAlbum+ 'copy_album/', albumCopy).subscribe(() => {
      console.log('Files Copied To Existing Album!');
    });
  }

  /**
   * mrthod responsibel to delete file from the server
   * @param {string} fileId
   */
  delFileFromAlbum(currentAlbum: string, files: string[]) {
    const albumDelete = {
      albumId: currentAlbum,
      ListOfFilesToDelete: files,
    };
    this.http
      .post(this.hostApiData + 'deleteFilesFromSingleAlbum/', albumDelete)
      .subscribe(() => {
        console.log('Files Deleted from Album!');
      });
  }

  /**
   * This method responsible to delete items from Recycle Bin only
   * @param {string} fileId
   */
  delFileFromRecycleOnly(files: string[]) {
    const recycleBinFiles = { ListOfFilesToDelete: files, LooseOwnership:false, };
    this.http
      .post(this.hostApiData + 'empty_recycleBin/', recycleBinFiles)
      .pipe(
        tap(console.log),
        map((serverResponse) => serverResponse)
      ) // we re-edit the information to remove the  messages
      .subscribe(() => {
        console.log('Recycle Bin - deleted!');
      });
  }

  getAlbumSize() {
    return this.albums.length;
  }
}
