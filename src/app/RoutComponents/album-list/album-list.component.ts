import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AlbumModel } from '../../DataModels/album.model';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteAlbumDialogComponent } from '../../Dialogs/delete-album-dialog/delete-album-dialog.component';
import { FileService } from '../../Services/files.service';
import { AlbumService } from '../../Services/album.service';
import { IFilterOption } from 'src/app/DataModels/filter-option.model';
// import { OptionsButtonsComponent } from '../options-buttons/options-buttons.component';
// import { OptionsButtonsModule } from 'src/app/ComponentModuleDependencies/options-buttons.module';
import { OptionButtonsService} from 'src/app/Services/tool-bar-buttons.service';



@Component({
  selector: 'app-album-list',
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * AlbumList Component
 */
export class AlbumListComponent implements OnInit, OnDestroy {

  albums: Observable<AlbumModel[]>; // initing the album array as Observable - observer
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  private albumButtons = [
    {
      buttonName: 'My Albums', buttonLink : '/album',
    },
    {
      buttonName: 'Add Album', buttonLink: '/album/create',
    },
  ];

  startDateSelected;
  endDateSelected;
  filtered = false;



  albumsFilterOptions: IFilterOption[] = [
    { value: 'name', label: 'Album Name' },
    { value: 'date', label: 'Creation Date' },
    { value: 'info', label: 'Album Info' },
  ];

  // tslint:disable-next-line: no-inferrable-types
  public album_name: string = '';
  // tslint:disable-next-line: no-inferrable-types
  public filterStr: string = '';
  // tslint:disable-next-line: no-inferrable-types
  public filterKey: string = this.albumsFilterOptions[0].value;

  public filterKeyList: string[] = [];
  private CountFilesSubscription: any;

  /**
   * init the constructor with the moduls we use
   * @param {AlbumService} albumsService
   * @param {ActivatedRoute} route
   */
  constructor(
    private albumsService: AlbumService,
    public route: ActivatedRoute,
    private dialog: MatDialog,
    private fileService: FileService,
    private optionButtonsService: OptionButtonsService,
  ) {
    /*    this.albumsService = albumsService;*/
  }

  /**
   * when we init the component we get the album information from the
   * mongo server by Services
   */
  ngOnInit() {
    this.optionButtonsService.setButtons(this.albumButtons);
    this.filterKey = this.albumsFilterOptions[0].value;
    this.albumsService.getAlbums();
    console.log(this.albumsService);
    this.albums = this.albumsService.getAlbumUpdateListener(); // we init to listen the the album changes in array
  }
  /*
  onInput() {
    this.albumsService.filterAlbums(this.album_name);
  } */

  /**
   * the method get the album id we want to remove from mongoDB
   * @param {string} albumId
   */
  onDelete(albumId: string, albumName: string) {
    console.log('the album Id passed' + albumId);
    this.albumsService.getFilesCount(albumId).subscribe((numberOfFiles) => {
      console.log('files counted' + numberOfFiles);
      if (numberOfFiles > 0) {
        const dialogRef = this.dialog.open(DeleteAlbumDialogComponent, {
          // we init dialog to ask user if he sure he want to delete
          // and pass the album name to the dialog
          data: {
            message: albumName + ' album contains ' + numberOfFiles + ' files.',
          },
        });
        // we subscribe to the result of Dialog close
        dialogRef.afterClosed().subscribe((userResponse) => {
          console.log('the result is:' + userResponse);
          if (!userResponse) {
            return;
          } else {
            this.albumsService.deleteAlbum(albumId);
            return;
          }
        });
      } else {
        this.albumsService.deleteAlbum(albumId);
      }
    })
    ;
  }


  updateFilter(filter: any) {
    console.warn('this.filterStr {0} {1}', filter.filterStr, filter.filterKey);
    this.filterStr = filter.filterStr;
    this.filterKey = filter.filterKey;
    console.warn('this.filterStr {0} {1}', this .filterStr, this.filterKey);
  }


  // changeKey(key: string) {
  //   this.filterKey = key;
  //   console.log(key);
  //   console.dir(key);
  // }

  addKeyList(key: string) {
    this.filterKeyList.push(key);
    console.log(this.filterKeyList);
    console.dir(this.filterKeyList);
  }


  filterByDate(dates) {
    //console.dir(dates);
    console.log(dates.start + ':' + dates.end);
      this.albumsService.filterAlbumsByDate(
        dates.start,
        dates.end
      );
    }

  resetDateFilter() {
    this.filtered = false;
    this.albumsService.resetFilter();
  }

  ngOnDestroy(){
   //this.CountFilesSubscription.unsubscribe();

  }
}
