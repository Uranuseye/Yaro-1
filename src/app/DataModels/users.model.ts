export interface Users {
  id: string;
  avatar: string;
  firstName: string;
  lastName: string;
  email: string | null;
  userName: string | null;
  isFollowed: boolean | null;
  isFollowing: boolean | null;
}
