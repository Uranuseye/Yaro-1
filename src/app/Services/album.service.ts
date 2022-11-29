import {AlbumModel} from '../DataModels/album.model';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {host} from '../globals';

@Injectable({ providedIn: 'root' }) // we inject services to the service
/**
 * Album service module
 */
export class AlbumService {
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
    const albumObject: AlbumModel = this.albums.find((o) => o.id === albumId);
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
        host + '/api/album/getAlbums'
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
          //     id: album.id,
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
      .get<AlbumModel>(host + '/api/album/getAlbumContent/' + albumId)
      .pipe(
        map((albumData) => {
          console.log(albumData);
          return {
            name: albumData.name,
            info: albumData.info,
            id: albumData.id,
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
    const album: AlbumModel = albumObj;
    album.info = album.info ?? 'null';

    this.http
      .post<{ message: string; albumId: string }>(
        host + '/api/album/create_album',
        album
      )
      .subscribe((responseData) => {
        console.warn('responseData');
        console.warn(responseData);
        console.debug(responseData);
        // we receive back from the server the album id that was just added
        album.id = responseData.albumId; // init the album id with the id we received from server
        console.log(
          `addAlbum(albumObj: AlbumModel) responded with: ${responseData.message}`
        );
        this.albums.push(album); // push the album to the array of albums
        this.albumsUpdated.next([...this.albums]); // and we inform the subject and return new copy of albums array
        this.router.navigate(['/albums']); // and navigate back to album page
      });
  }

  /**
   *  What is it different from addAlbum ?????
   * @param albumObj
   * @returns
   */
  createNewAlbum(albumObj: AlbumModel) {
    const album: AlbumModel = albumObj;
    return this.http.post<{ id: string }>(
      host + '/api/album/create_album',
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
      .delete(host + '/api/album/delete_album/' + albumId) // pass album id as parameter
      .subscribe(() => {
        console.log('deleted!');
        // we remove the album from our list
        this.albums = this.albums.filter((album) => album.id !== albumId); // init the album list with the filtered list
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
      host + '/api/album/countItemsInAlbum/' + albumId
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
      id: albumId,
      name: name,
      info: info,
      dateCreated: date,
      //creator: '',
    }; // init the album with the new album changes
    this.http
      .put(host + '/api/album/update_album', albumUpdated) // pass put request to the server by id
      .subscribe(() => {
        const updatedAlbums = [...this.albums]; // we init updated albums with fresh copy of albums
        const oldAlbumIndex = updatedAlbums.findIndex(
          (p) => p.id === albumUpdated.id
        ); // we find the index of the album updated
        updatedAlbums[oldAlbumIndex] = albumUpdated; // and replace with the new album object
        this.albums = updatedAlbums; // we init the new album list with the updated array of albums
        this.albumsUpdated.next([...this.albums]); // and we inform the subject and return new copy of albums array
        this.router.navigate(['/albums']); // navigate to album page
      });
  }

  moveFilesToExistingAlbum(
    currentAlbum: string,
    newAlbum: string,
    files: string[]
  ) {
    const albumMoved = {
      albumToMoveTo: newAlbum,
      currentAlbum: currentAlbum,
      listOfFiles: files,
    };
    console.dir(albumMoved);
    this.http
      .post(host + '/api/album/move_album/', albumMoved)
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
    this.http.post(host + '/api/album/copy_album/', albumCopy).subscribe(() => {
      console.log('Files Copied To Existing Album!');
    });
  }

  /**
   * mrthod responsibel to delete file from the server
   * @param {string} fileId
   */
  delFileFromAlbum(currentAlbum: string, files: string[]) {
    const albumDelete = {
      sourceAlbumId: currentAlbum,
      ListOfFilesToDelete: files,
    };
    this.http
      .post(host + '/api/Data/deleteFilesFromSingleAlbum/', albumDelete)
      .subscribe(() => {
        console.log('Files Deleted from Album!');
      });
  }

  /**
   * This method responsible to delete items from Recycle Bin only
   * @param {string} fileId
   */
  delFileFromRecycleOnly(files: string[]) {
    const recycleDelete = { ListOfFilesToDelete: files };
    this.http
      .post(host + '/api/data/empty_recycleBin/', recycleDelete)
      .subscribe(() => {
        console.log('Recycle Bin - deleted!');
      });
  }

  getAlbumSize() {
    return this.albums.length;
  }
}
