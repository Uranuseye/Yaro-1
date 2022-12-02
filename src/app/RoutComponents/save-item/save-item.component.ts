import { Component, OnInit } from '@angular/core';
import { hostApi } from 'src/app/globals';
import { DownloadServiceService } from 'src/app/Services/download-service.service';

@Component({
  selector: 'app-save-item',
  templateUrl: './save-item.component.html',
  styleUrls: ['./save-item.component.scss'],
})
export class SaveItemComponent implements OnInit {
  constructor(private fileService: DownloadServiceService) {}

  ngOnInit() {}

  download() {
    console.error("========this is Fake DOwnload Link===========");
    const url:string =`${hostApi}SERVER/7A\\A5\\67\\4A\\BA\\6C\\7D\\5B\\A9\\65\\30\\5B\\D6\\FE\\44\\F7\\0A\\A9\\64\\3B\\59\\96\\BE\\5C\\D3\\BD\\FD\\08\\43\\9D\\E1\\16.PR.webp`;
    this.fileService.downloadFile(url).subscribe((response) => {
      // let blob:any = new Blob([response.blob()], { type: 'text/json; charset=utf-8' });
      // const url= window.URL.createObjectURL(blob);
      // window.open(url);
      window.location.href = response.url;
      // fileSaver.saveAs(blob, 'employees.json');
    }),
      (error: any) => console.log('Error downloading the file'),
      () => console.info('File downloaded successfully');
  }
}
