import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../Services/files.service';
import { AlbumService } from '../../Services/album.service';
import { AlbumModel } from '../../DataModels/album.model';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ImageDisplayComponent } from '../../Dialogs/image-display/image-display.component';
import { FileObject } from '../../DataModels/fileObject.model';
import { DomSanitizer } from '@angular/platform-browser';
import { DeleteAlbumDialogComponent } from '../../Dialogs/delete-album-dialog/delete-album-dialog.component';
import { ErrorComponent } from '../../Dialogs/error/error.component';
import { ShareSelectedDialogComponent } from '../../Dialogs/share-selected-dialog/share-selected-dialog.component';
import { element } from 'protractor';
import { MoveCopySelectedDialogComponent } from '../../Dialogs/move-selected-dialog/move-selected-dialog.component';
import { NewAlbumDialogComponent } from '../../Dialogs/new-album-dialog/new-album-dialog.component';
import { OptionButtonsService } from 'src/app/Services/tool-bar-buttons.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/*@Injectable()*/
export class AlbumComponent implements OnInit, OnDestroy {
  @ViewChild('tabGroup') tabGroup; // child tabGroup of html init for changing value of the tab
  selectedIndex = 0; // init if the tab index
  album_id: string; // album id will hold string data
  albumInfo: AlbumModel; // album information will hold the object Album
  albums: Observable<AlbumModel[]>;

  startDateSelected;
  endDateSelected;
  filtered = false;

  files: Observable<FileObject[]>; // Observable for the files array
  selectedItems: FileObject[] = [];
  selectAll = false;
  selectStr = 'Select All';
  isLoading = true;
  isLoadingSpinner = false;
  uploading = false;

  filesToUpload: Subscription;
  filesToUploadNumber = 0;
  numberFilesTotal = 1;
  progress;

  public file_name = '';
  public filterStr = '';
  public filterKey = 'name';

  private albumButtons = [
    {
      buttonName: 'My Albums',
      buttonLink: '/albums',
    },
    {
      buttonName: 'Add Album',
      buttonLink: '/album/create',
    },
  ];

  /**
   * we init the class with next modules
   * @param {ActivatedRoute} route
   * @param {FileService} filesService
   * @param {AlbumService} albumService
   * @param {MatDialog} dialog
   */
  constructor(
    public route: ActivatedRoute,
    private filesService: FileService,
    private albumService: AlbumService,
    private dialog: MatDialog,
    public sanitizer: DomSanitizer,
    private optionButtons: OptionButtonsService
  ) {}

  /**
   * method we use once the components init to fetch
   * in order to present files
   */
  ngOnInit() {
    this.optionButtons.setButtons(this.albumButtons);
    this.album_id = this.route.snapshot.paramMap.get('id'); // name we get trough param
    // console.log('this albums is' + this.album_Name);
    var currentAlbum = `albumInfo_`;
    if (this.albumService.getAlbumSize()) {
      // ?
      // Sets album size in memory
      currentAlbum = `albumInfo_${this.album_id}`;
      localStorage.setItem(
        currentAlbum,
        JSON.stringify(this.albumService.getAlbumInfo(this.album_id))
      );
    }
    this.albumInfo = JSON.parse(localStorage.getItem(currentAlbum));

    this.files = this.filesService.getFileUpdateListener();
    this.filesToUpload = this.filesService
      .getFileUpdateListener()
      .subscribe((listOfFiles) => {
        if (listOfFiles && this.filesToUploadNumber > 0) {
          this.filesToUploadNumber--;
          console.log('FILES INSIDE' + this.filesToUploadNumber);
          this.SetUploadProgress();
          console.log('FILES PROGRESS ' + this.progress);
        }
      }); // we init the files array with listenerdebugger;
    //// NEEED TO CHANGE TO getFiles2(this.album. LIST OF IMAGES)
    //this.filesService.getFiles2(this.album_id); // we fetch first information from the album trough file service
    this.filesService.getFiles(this.album_id);
    this.isLoading = false;
  }

 
  /**
   * method that gothers all files selected creates formData and sends it to server
   * file by file
   * @param event
   */
  onImageSelectedForUpload(event: { target: { files: any } }) {
    this.uploading = true;
    this.tabGroup.selectedIndex = 0; // in order to return to the gallery tab
    const files = event.target.files;
    if (files) {
      this.filesToUploadNumber = files.length;
      this.numberFilesTotal = this.filesToUploadNumber;
      for (const file of files) {
        console.dir(file);
        const fd = new FormData();
        fd.append('AlbumId', this.albumInfo.albumId); // we append the album name to the file
        fd.append('File', file);
        this.filesService.uploadFile(/* this.albumInfo.objId, */ fd); // every file in files array is send one by one
      }
    }
  }

  // *****************

  private SetUploadProgress() {
    this.progress = Math.round(
      100 - (100.0 * this.filesToUploadNumber) / this.numberFilesTotal
    );
    if (this.progress === 100) {
      this.uploading = false;
    }
  }

  /**
   * Image display component by MatDialog will be deleted in the future.
   * @param URL
   */
  displayImage(URL) {
    this.dialog.open(ImageDisplayComponent, { data: { url: URL } });
  }

  

  /**
   * this function useses the file service to del file
   * from the database
   * @param hash64
   */
  /* ser */
  deleteSelected() {
    const dialogRef = this.dialog.open(DeleteAlbumDialogComponent, {
      // we init dialog to ask user if he sure he want to delete
      // and pass the album name to the dialog
      data: {
        message: this.selectedItems.length + ' files selected ',
      },
    });
    // we subscribe to the album of Dialog close
    dialogRef.afterClosed().subscribe((album) => {
      if (!album) {
        console.log(album);
        return;
      } else {
        const itemsToDelete: Array<string> = [];

        this.selectedItems.forEach((selectedItem) => {
          itemsToDelete.push(selectedItem.objId);
          this.filesService.filterOutLocalFilesList(selectedItem);
        });
        console.dir('this selected' + itemsToDelete);

        this.albumService.delFileFromAlbum(this.albumInfo.albumId, itemsToDelete);
        this.selectedItems = [];
      }
      this.disselectAll();
    });
  }

  deleteSelectedFromResBin() {
    const dialogRef = this.dialog.open(DeleteAlbumDialogComponent, {
      // we init dialog to ask user if he sure he want to delete
      // and pass the album name to the dialog
      data: {
        message: this.selectedItems.length + ' files selected ',
      },
    });
    // we subscribe to the album of Dialog close
    dialogRef.afterClosed().subscribe((album) => {
      if (!album) {
        console.log(album);
        return;
      } else {
        const itemsToDelete: Array<string> = [];

        this.selectedItems.forEach((selectedItem) => {
          itemsToDelete.push(selectedItem.objId);
          this.filesService.filterOutLocalFilesList(selectedItem);
        });
        console.dir('this selected' + itemsToDelete);

        this.albumService.delFileFromRecycleOnly(itemsToDelete);
        this.selectedItems = [];
      }
      this.disselectAll();
    });
  }

  /**
   * Wipe???
   * vs Delete??
   */
  wipeFromAll() {
    const dialogRef = this.dialog.open(DeleteAlbumDialogComponent, {
      // we init dialog to ask user if he sure he want to delete
      // and pass the album name to the dialog
      data: {
        message: this.selectedItems.length + ' files selected ',
      },
    });
    // we subscribe to the result of Dialog close
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        console.log(result);
        return;
      } else {
        const listOfFilesToDelete: string[] = [];
        this.selectedItems.forEach((fileObject) => {
          console.log(fileObject.objId);
          listOfFilesToDelete.push(fileObject.objId);
        });
        this.filesService.delFromAllUserDb(listOfFilesToDelete);
        this.selectedItems = [];
        this.selectAll = false;
      }
    });
  }

  wipeFromAllResBin() {
    console.log(`wipeFromAllResBin`);
    const dialogRef = this.dialog.open(DeleteAlbumDialogComponent, {
      // we init dialog to ask user if he sure he want to delete
      // and pass the album name to the dialog
      data: {
        message: this.selectedItems.length + ' files selected ',
      },
    });
    // we subscribe to the result of Dialog close
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        console.log(result);
        return;
      } else {
        const listOfFilesToDelete: string[] = [];
        this.selectedItems.forEach((fileObject) => {
          console.log(fileObject.objId);
          listOfFilesToDelete.push(fileObject.objId);
        });

        const looseOwnership = true;
        this.filesService.delFromAllUserDb(listOfFilesToDelete, looseOwnership);
        this.selectedItems = [];
        this.selectAll = false;
      }
    });
  }

  deleteForever() {
    console.log(`wipeFromAllResBin`);
    const dialogRef = this.dialog.open(DeleteAlbumDialogComponent, {
      // we init dialog to ask user if he sure he want to delete
      // and pass the album name to the dialog
      data: {
        message: this.selectedItems.length + ' files selected ',
      },
    });
    // we subscribe to the result of Dialog close
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        console.log(result);
        return;
      } else {
        const listOfFilesToDelete: string[] = [];
        this.selectedItems.forEach((fileObject) => {
          console.log(fileObject.objId);
          listOfFilesToDelete.push(fileObject.objId);
        });

        const looseOwnership = true;
        this.filesService.delFromAllUserDb(listOfFilesToDelete, looseOwnership);
        this.selectedItems = [];
        this.selectAll = false;
      }
    });
  }

  /**
   * Shere with other Users??
   */
  shareSelected(): void {
    const sharedFiles: Array<string> = [];
    console.log('this.itemsSelected:');
    console.dir(this.selectedItems);
    this.selectedItems.forEach((e) => {
      sharedFiles.push(e.objId);
    });

    const dialogRef = this.dialog.open(ShareSelectedDialogComponent, {
      width: '250px',
      data: this.selectedItems,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('dialog was closed');
      console.log(result);
      if (result != null) {
        console.dir(this.selectedItems);
        console.dir(sharedFiles);

        this.filesService.shareFileWithUser(
          this.albumInfo.albumId,
          result,
          sharedFiles
        );
        this.selectedItems = [];
        this.selectAll = false;
      }
    });
  }

  /**
   * copy
   */
  copySelectedToNewAlbum(action: string): void {
    const dialogRef = this.openNewAlbumDialog();
    dialogRef.afterClosed().subscribe((retAlbum) => {
      if (retAlbum != null) {
        const album: AlbumModel = retAlbum;//this.setNewAlbumObject(retAlbum);
        const itemsToCopy: Array<string> = [];
        this.selectedItems.forEach((selectedItem) => {
          itemsToCopy.push(selectedItem.objId);
        });

        this.selectedItems = [];
        console.dir('this selected' + itemsToCopy);

        this.albumService.createNewAlbum(album).subscribe((createdAlbum) => {
          this.albumService.copyFilesToExistingAlbum(
            this.albumInfo.albumId,
            createdAlbum.albumId,
            itemsToCopy
          );
        });
      }
    });
  }

  private openNewAlbumDialog() {
    return this.dialog.open(NewAlbumDialogComponent, {
      width: '360px',
      height: '260px',
    });
  }

  /**
   * Cut and create
   */
  moveSelectedToNewAlbum(action: string): void {
    const dialogRef = this.openNewAlbumDialog();
    dialogRef.afterClosed().subscribe((retAlbum) => {
      if (retAlbum != null) {
        const album: AlbumModel = retAlbum;//this.setNewAlbumObject(retAlbum);
        const itemsToMove: Array<string> = [];

        this.selectedItems.forEach((selectedItem) => {
          itemsToMove.push(selectedItem.objId);
          this.filesService.filterOutLocalFilesList(selectedItem);
        });
        this.selectedItems = [];

        //console.dir('this selected' + this.selectedItems);

        this.albumService.createNewAlbum(album).subscribe((createdAlbum) => {

          this.albumService.moveFilesToExistingAlbum(
            this.albumInfo.albumId,
            //null,
            createdAlbum.albumId,
            itemsToMove
          );
          this.disselectAll();
        });
      }
    });
  }

  assignToUser() {
    this.dialog
      .open(ShareSelectedDialogComponent, {
        width: '250px',
        data: this.selectedItems,
      })
      .afterClosed()
      .subscribe((userId) => {
        console.log('assignToUserDialog dialog was closed, Result:');
        console.dir(userId);

        if (userId != null) {
          this.openNewAlbumDialog()
            .afterClosed()
            .subscribe((retAlbum: AlbumModel) => {
              if (retAlbum != null) {
                const album: AlbumModel = retAlbum; //this.setNewAlbumObject(retAlbum);
                const itemsToMove: Array<string> = [];
                this.selectedItems.forEach((selectedItem) => {
                  itemsToMove.push(selectedItem.objId);
                  this.filesService.filterOutLocalFilesList(selectedItem);
                });
                this.filesService.setOwnership(userId, album, itemsToMove);
              }
            });
          //---
        }
      });
  }

  private disselectAll() {
    this.selectAll = true;
    this.selectAll = false;
    this.selectStr = 'Select All';
  }

 /*  private setNewAlbumObject(retAlbum: any): AlbumModel {
    return {
      id: null,
      name: retAlbum.name,
      info: retAlbum.albumInfo,
      dateCreated: '',
      creator: '',
    };
  } */

  /**
   * Cut out
   */
  moveSelectedToExistingAlbum(): void {
    const existingAlbumDialog = this.openExistingAlbumDialog('Move');
    existingAlbumDialog.afterClosed().subscribe((album) => {
      console.log('dialog was closed, Result:');
      console.dir(album);
      if (album != null) {
        const itemsToMove: Array<string> = [];
        this.selectedItems.forEach((selectedItem) => {
          itemsToMove.push(selectedItem.objId);
          this.filesService.filterOutLocalFilesList(selectedItem);
        });
        this.selectedItems = [];
        this.albumService.moveFilesToExistingAlbum(
          this.albumInfo.albumId,
          album.albumId,
          itemsToMove
        );
      }
      this.disselectAll();
    });
  }

  /**
   * Copy to?
   */
  copySelectedToExistingAlbum(): void {
    const existingAlbumDialog = this.openExistingAlbumDialog('Copy');
    existingAlbumDialog.afterClosed().subscribe((album) => {
      console.log('dialog was closed');
      console.log(album);
      if (album != null) {
        const itemsToCopy: Array<string> = [];
        this.selectedItems.forEach((selectedItem) => {
          itemsToCopy.push(selectedItem.objId);
        });
        console.dir('this selected' + itemsToCopy);
        this.albumService.copyFilesToExistingAlbum(
          this.albumInfo.albumId,
          album.albumId,
          itemsToCopy
        );
        this.selectedItems = [];
      }
      this.disselectAll();
    });
  }

  private openExistingAlbumDialog(action: string) {
    return this.dialog.open(MoveCopySelectedDialogComponent, {
      width: '250px',
      data: {
        files: this.selectedItems,
        text: action,
      },
    });
  }

  /**
   * Cut and create
   */
  /*  moveSelectedToNewAlbum(): void {
    const dialogRef = this.dialog.open(NewAlbumDialogComponent, {
      width: '360px',
      height: '260px',
      data: this.selectedItems,
    });
    dialogRef.afterClosed().subscribe((retAlbum) => {
      if (retAlbum != null) {
        const album: AlbumModel = this.setNewAlbumObject(retAlbum);
        const sharedFiles: Array<string> = [];
        this.selectedItems.forEach((e) => {
          sharedFiles.push(e.objId);
          this.filesService.filterOutLocalFilesList(e);
        });
        this.selectedItems = [];
        //console.dir('this selected' + this.selectedItems);
        this.albumService.movePhotosToNewAlbum(album).subscribe((response) => {
/*           console.log('response from server:');
          console.dir(response);
          console.log(response.objId); * /
          this.albumService.moveFilesToExistingAlbum(
            this.albumInfo.objId,
            response.objId,
            sharedFiles
          );
          this.selectAll = false;
        });
      }
    });
  } */

  /**
   *
   * @param file
   */
  addRemoveFiles(file: FileObject) {
    const index = this.selectedItems.findIndex(
      (e: FileObject) => e.objId === file.objId
    );
    if (index === -1) {
      this.selectedItems.push(file);
    } else {
      this.selectedItems.splice(index, 1);
    }
    console.dir(this.selectedItems);
  }

  /**
   * This method selects What to use as src:
   * Base64 or file Id
   * @param file
   * @returns src
   */
  setViewUrl(file: FileObject):string {
    if (file.url != null) {
      console.warn('Setting  thumbnail URL: Base64');
      return file.url;
    }
    console.warn('Setting  thumbnail URL: ID');
    return file.objId;
  }

  openImageDialog(file: FileObject) {
    const dialogRef = this.dialog.open(ImageDisplayComponent, {
      // we init dialog to ask user if he sure he want to delete
      // and pass the album name to the dialog
      data: {
        imageData: this.filesService.getCurrentFiles(),
        currentImage: file,
      },
      panelClass: 'my-custom-dialog-class',
    });
  }

  chooseAll() {
    if (!this.selectAll) {
      this.files.forEach((file) => {
        console.log('Adding all');
        console.dir(file);
        if (file != null) {
          file.forEach((data) => {
            this.selectedItems.push(data);
          });
        }
      });
    } else {
      this.selectedItems = [];
    }
    this.selectAll = !this.selectAll;
    this.selectStr = this.selectAll ? 'Unselect All' : 'Select All';
    // add al files to the deleteData!!!!!!
  }

  ngOnDestroy() {
    this.filesService.clearFiles();
  }

  public isSelected(file: FileObject) {
    return this.selectedItems.includes(file);
  }
  printDates() {
    this.filtered = true;
    console.log(this.startDateSelected + ':' + this.endDateSelected);
    if (
      this.startDateSelected &&
      this.endDateSelected &&
      this.startDateSelected < this.endDateSelected
    ) {
      this.filesService.filterFilesByDate(
        this.startDateSelected,
        this.endDateSelected
      );
    } else {
      if (this.startDateSelected == null && this.endDateSelected == null) {
        this.filesService.resetFilter();
      } else {
        const dialogRef = this.dialog.open(ErrorComponent, {
          // we init dialog to ask user if he sure he want to delete
          // and pass the album name to the dialog
          data: {
            message: 'Wrong date selected',
          },
        });
      }
    }
  }

  resetDateFilter() {
    this.filesService.resetFilter();
    this.startDateSelected = '';
    this.endDateSelected = '';
    this.filtered = false;
  }
}
