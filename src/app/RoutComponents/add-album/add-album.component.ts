import {Component, OnInit} from '@angular/core';
import {AlbumModel} from '../../DataModels/album.model';
import {NgForm} from '@angular/forms';
import {AlbumService} from '../../Services/album.service';
import {ActivatedRoute} from '@angular/router';
import { OptionButtonsService } from 'src/app/Services/tool-bar-buttons.service';

@Component({
  templateUrl: './add-album.component.html',
  styleUrls: ['./add-album.component.scss'],
})

export class AddAlbumComponent implements OnInit {
  albumInformation = ''; // hold the information about the album for the template
  private mode = 'create'; // init the mode at startup as create new album
  private albumId: string; // we know that the type if albumId will be string
  albumEdit: AlbumModel; // information about the edited album in case in edit mode

  /**
   * constructor inits the class with albumService and router
   * @param {AlbumService} albumsService
   * @param {ActivatedRoute} route
   */
  constructor(
    public albumsService: AlbumService,
    public route: ActivatedRoute,
    private toolBarButtonsService: OptionButtonsService,) {
  }

  /**
   * initialization on init.
   * if albumId parameter is passed by the router paramMap we are in edit album name
   * else this mode is create
   */
  ngOnInit() {
    this.toolBarButtonsService.setButtons('albumButtons');
    this.albumId = this.route.snapshot.paramMap.get('albumId'); // first of all we check if param was passed as argument via Map
    console.log('the album we edit: ' + this.albumId);
    if (this.albumId != null) { // in case we have param that means we trying to edit existing album
      this.mode = 'edit'; // mode is changed to 'edit'
      // then we subscribe to the getAlbum service that recieves the albumData from the server in init albumEdit
      this.albumsService.getAlbum(this.albumId).subscribe(albumData => this.albumEdit = albumData);
    } else { // else we in mode of creating new album
      this.mode = 'create';
    }
  }

  /**
   * method for saving the album into the MongoDb
   * @param {NgForm} form
   */
  onSaveAlbum(form: NgForm) {
    if (form.invalid) { // in case form is invalid we return
      return;
    }
    if (this.mode === 'create') { // if we are creating new album
      const album: AlbumModel = {
        albumId: null,
        name: form.value.album,
        info: form.value.info,
        dateCreated: '',
        creator: '',
       // files: []
      };
      this.albumsService.addAlbum(album); // we pass the album to the album service module method add album

    } else { // in case its album that exist on mongoDB and we want to edit it
      // we use the update service module and pass the parameters
      console.log('Saving albumId: ' + this.albumId);
      this.albumsService.updateAlbum(this.albumId, form.value.album, form.value.info, this.albumEdit.dateCreated);
    }
    form.resetForm(); // we reset the form.
  }
}
