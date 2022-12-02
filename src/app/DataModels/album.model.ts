/**
 * interface of Album Data
 */
export interface AlbumModel {
  albumId: string;
  name: string;
  creator?: string;
  info: string;
  dateCreated: string;
  isSharedAlbum?:boolean; 
  //files: string[];
}
