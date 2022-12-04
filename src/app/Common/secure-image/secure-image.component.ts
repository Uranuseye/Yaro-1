import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileService } from '../../Services/files.service';


@Component({
  selector: 'app-secure-image',
  templateUrl: './secure-image.component.html',
  styleUrls: ['./secure-image.component.scss'],
})
export class SecureImageComponent implements OnChanges, OnDestroy {
  @Input() src = '';
  imageURL: SafeUrl = '';
  image: Blob;

  constructor(
    private domSanitizer: DomSanitizer,
    private filesService: FileService
  ) {
    // this.download(this.src);
  }
  ngOnChanges(): void {}

  ngOnInit() {
    if (this.isBase64(this.src)) {
      this.imageURL = this.src;
    } else {
      this.filesService.loadThumbnail(this.src).subscribe((i) => {
        this.image = i;
        this.imageURL = this.domSanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(this.image)
        );
      });
    }
  }

  isBase64(src: string): boolean {
    return src.startsWith('data:image/webp;base64,');
  }

  ngOnDestroy() {
    //URL.revokeObjectURL(this.imageURL.toString());
  }
}
