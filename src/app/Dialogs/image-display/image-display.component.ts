import { HttpEventType, HttpResponse } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FileObject, ExifObject } from "src/app/DataModels/fileObject.model";
import { hostApi } from "src/app/globals";
import { DownloadServiceService } from "src/app/Services/download-service.service";
import { log } from "util";
//import * as ol from 'ol';
// --------
import { saveAs } from "file-saver";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { FileService } from "src/app/Services/files.service";
// import Map from 'ol/Map';
// import View from 'ol/View';
// import VectorLayer from 'ol/layer/Vector';
// import Style from 'ol/style/Style';
// import Icon from 'ol/style/Icon';
// import OSM from 'ol/source/OSM';
// import * as olProj from 'ol/proj';
// import TileLayer from 'ol/layer/Tile';

let map: any;
declare var ol: any;
const videoExt = ".mp4";
const imgExt = ".webp";

@Component({
  templateUrl: "./image-display.component.html",
  styleUrls: ["./image-display.component.scss"],
})
export class ImageDisplayComponent implements OnInit {
  public dataImages: FileObject[];
  public currentImage: FileObject;
  public currentIndex: number;
  public exif: ExifObject;
  public exifPresent = false;
  public isGPS = false;
  public displayGpsLocation = false;
  public latitude: any;
  public longitude: any;
  public downloadMessage = "Nothing Yet";
  map: any;
  message: string;
  private src: string;
  imageURL: SafeUrl;
  image: Blob;

  constructor(
    private domSanitizer: DomSanitizer,
    private filesService: FileService,
    private downladService: DownloadServiceService,
    @Inject(MAT_DIALOG_DATA)
    public data: { imageData: FileObject[]; currentImage: FileObject }
  ) {
    this.initData(data);
  }

  /**
   * method responsible to init image data for preview
   * @param data
   */
  initData(data: { imageData: FileObject[]; currentImage: FileObject }) {
    this.dataImages = data.imageData;
    this.currentImage = data.currentImage;
    // console.dir(this.dataImages);
    //console.log('this data' + this.currentImage);
    this.currentIndex = this.dataImages.findIndex(
      (x) => x === this.currentImage
    );
    // console.log('The Index is:' + this.currentIndex);
    this.exif = this.dataImages[this.currentIndex].exifData;
    console.dir(this.exif);
    this.handleGpsDisplay();
  }

  /**
   * method responsible to init component and gps map data
   */
  ngOnInit(): void {
    this.setCurrentView();
    this.handleGpsDisplay();
  }

  handleGpsDisplay() {
    console.log("Handling Gps Display");
    if (this.exif != null && this.exif.gpsLatitude) {
      this.SetDdCoordinates();

      console.log("!!! this is GPS:  " + this.latitude + ":" + this.longitude);

      if (this.latitude > 0) {
        this.displayGpsLocation = true;
        console.log("there are cordinates" + this.displayGpsLocation);

        const mousePositionControl = new ol.control.MousePosition({
          coordinateFormat: ol.coordinate.createStringXY(4),
          projection: "EPSG:4326",
          // comment the following two lines to have the mouse position
          // be placed within the map.
          className: "custom-mouse-position",
          target: document.getElementById("mouse-position"),
          undefinedHTML: "&nbsp;",
        });

        this.map = new ol.Map({
          target: "map",
          controls: ol.control
            .defaults({
              attributionOptions: {
                collapsible: true,
              },
            })
            .extend([mousePositionControl]),
          layers: [
            new ol.layer.Tile({
              source: new ol.source.OSM(),
            }),
          ],
          view: new ol.View({
            center: ol.proj.fromLonLat([this.longitude, this.latitude]),
            zoom: 8,
          }),
        });
      }
    } else {
      console.log("No this.exif");
    }
  }
  SetDdCoordinates(): any {
    this.latitude = this.SetDdCoordinate(
      this.exif.gpsLatitude,
      this.exif.gpsLatitudeRef
    );
    this.longitude = this.SetDdCoordinate(
      this.exif.gpsLongitude,
      this.exif.gpsLongitudeRef
    );
  }

  SetDdCoordinate(DMScoordinat: string, DMSref: string) {
    const coorNumStr = DMScoordinat.replace(/[^\d.-]/g, " ");
    const cdd = this.parseToLat(coorNumStr, DMSref);
    return cdd;
  }

  goToNextItem(n: number) {
    //this.hideGPSDisplay();
    // next / previous logic
    if (this.currentIndex + n >= this.dataImages.length) {
      this.currentIndex = 0;
    } else if (this.currentIndex + n < 0) {
      this.currentIndex = this.dataImages.length - 1;
    } else {
      this.currentIndex += n;
    }
    this.setCurrentView();
    this.setCurrentExif();
    this.handleGpsDisplay();
  }
  setCurrentView() {
    this.showPreview2(this.dataImages[this.currentIndex].objId);
  }

  private setCurrentExif() {
    this.exif = this.dataImages[this.currentIndex].exifData;
  }

  private hideGPSDisplay() {
    this.displayGpsLocation = !this.displayGpsLocation;

    // if (this.displayGpsLocation) {
    //   this.map = new Map({
    //     target: 'thisImageLocation',
    //     layers: [
    //       new TileLayer({
    //         source: new OSM()
    //       })
    //     ],
    //     view: new View({
    //       center: olProj.fromLonLat([7.0785, 51.4614]),
    //       zoom: 5
    //     })
    //   });
    // }
  }

  /**
   * show hide exif toggle
   */
  toggleExif() {
    this.exifPresent = !this.exifPresent;
    this.hideGPSDisplay();
  }

  showPreview2(fileId: string) {
    this.src = fileId;
    console.warn("----- This file Id: " + fileId);

    if (false) {
      //|| this.isBase64(fileId)) {
      this.imageURL = fileId;
    } else {
      this.filesService.loadPreview(fileId).subscribe((i) => {
        this.image = i;
        this.imageURL = this.domSanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(this.image)
        );
      });
    }
  }

  // /**
  //  * method responsible to change the url distanation request
  //  * @param url - thumbnail URL
  //  */
  // showPreviw(file: FileObject) {
  //   let url = '';
  //   if (file.url.startsWith('data:image/webp;base64,')) {
  //     url = this.makeServerUrl(file);
  //   } else if (file.url.startsWith('data:image/svg+xml;')) {
  //     url = file.url;
  //   } else {
  //     url = file.url.replace('.TH', '.PR');
  //   }

  //   url = this.setVideoUrl(file, url);
  //   return url;
  // }

  private setVideoUrl(file: FileObject, url: string) {
    console.log("setVideoUrl(file: FileObject, url: string)");
    console.warn(file);
    if (file.processingType === 2) {
      url = url.replace(`.PR${imgExt}`, videoExt);
    }
    return url;
  }

  /**
   * method responsible to parse DMS to DD gps coordinates
   * @param gpsCordinates
   * @param direction
   */
  parseToLat(gpsCordinates, direction) {
    const gps = gpsCordinates.split("  ");
    console.dir(gps);

    const d = +gps[0]; // 60 ** 0
    const m = +gps[1] / 60;
    const s = +gps[2] / 3600;

    const $decimal = s + m + d;

    console.log($decimal);
    return $decimal;
  }

  makeServerUrl(file: FileObject) {
    console.log("makeServerUrl(file: FileObject)");
    console.warn(file);
    let url = `${hostApi}/SERVER/${this.getSlashedId(file.objId)}.PR${imgExt}`;
    url = this.setVideoUrl(file, url);
    console.warn(url);
    return url;
    }

  getSlashedId(hash64: string) {
    let tmp = "";

    for (let i = 0; i < hash64.length; i = i + 2) {
      tmp += hash64.slice(i, i + 2) + "/";
    }

    // remove last "\" and return
    tmp = tmp.slice(0, tmp.length - 1);
    console.warn(tmp);
    return tmp;
  }

  download() {
    //const id:string ="";
    this.downladService
      .downloadFile(this.dataImages[this.currentIndex].objId)
      .subscribe((response) => {
        if (response.type === HttpEventType.Response) {
          console.log("response");
          console.warn(response);
          this.message = "Download success.";
          const downloadedFile = new Blob([response.body], {
            type: response.body.type,
          });
          // console.log("downloadedFile");
          // console.warn(downloadedFile);
          // const url = URL.createObjectURL(downloadedFile);
          // console.log("url");
          // console.warn(url);
          saveAs(
            downloadedFile,
            this.dataImages[this.currentIndex].fileName +
              this.dataImages[this.currentIndex].fileExtension
          );

          //window.open(response.url);
          //this.downloadFile(response);
          // window.location.href = response.url;
          // this.downloadMessage = response['message'];
        }
      }),
      (error: any) => console.log("Error downloading the file"),
      () => console.info("File downloaded successfully");
  }

  // private downloadFile = (data: HttpResponse<Blob>) => {
  //   const downloadedFile = new Blob([data.body], { type: data.body.type });
  //   const url = URL.createObjectURL(downloadedFile);
  //   window.open(url);
  // 	// fileSaver.saveAs(downloadedFile,
  //   //    this.dataImages[this.currentIndex].FileName + this.dataImages[this.currentIndex].FileExtension);

  //   //window.open(url);

  //   // const a = document.createElement('a');
  //   // a.setAttribute('style', 'display:none;');
  //   // document.body.appendChild(a);
  //   // a.download = this.dataImages[this.currentIndex].objId;
  //   // a.href = URL.createObjectURL(downloadedFile);
  //   // a.target = '_blank';
  //   // a.click();
  //   // document.body.removeChild(a);
  // }
}
