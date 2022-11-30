import {Component, Inject, OnInit} from '@angular/core';
//import {AlbumService} from '../../Services/album.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlbumModel } from 'src/app/DataModels/album.model';
import {FileObject} from '../../DataModels/fileObject.model';

@Component({
  selector: 'app-new-album-dialog',
  templateUrl: './new-album-dialog.component.html',
  styleUrls: ['./new-album-dialog.component.css']
})
export class NewAlbumDialogComponent implements OnInit {
  public Name = '';
  public AlbumInfo = '';

  constructor(//private albumService: AlbumService,
              public dialogRef: MatDialogRef<NewAlbumDialogComponent>,
              //@Inject(MAT_DIALOG_DATA) public data: FileObject[]
              ) {
  }

  ngOnInit() {
  }

  submitAlbum() {
    const album: AlbumModel = {
        albumId: null,
        name: this.Name,
        info: this.AlbumInfo,
        dateCreated: '',
        creator: '',
       // files: []
      };
    // const album = {name: this.Name, info: this.AlbumInfo};
    return album;
  }

}
