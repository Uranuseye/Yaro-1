/**
 * Imports of used components and modules
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlbumListComponent } from './RoutComponents/album-list/album-list.component';
import { AddAlbumComponent } from './RoutComponents/add-album/add-album.component';
import { AlbumComponent } from './RoutComponents/album/album.component';
import { LoginComponent } from './Login-Register/login/login.component';
import { SignUpComponent } from './Login-Register/sign-up/sign-up.component';
import { AuthGuard } from './Interceptors/auth.guard';
import { PostComponent } from './RoutComponents/post/post.component';
import { UsersComponent } from './RoutComponents/users/users.component';
import { ChatFormComponent } from './RoutComponents/chat-form/chat-form.component';
import { RegisterComponent } from './Login-Register/register/register.component';
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';
import { SettingsComponent } from './RoutComponents/settings/settings.component';
import { FollowingComponent } from './RoutComponents/following/following.component';
import { FollowersComponent } from './RoutComponents/followers/followers.component';
import { NotificationsComponent } from './RoutComponents/notifications/notifications.component';
import { VideoChatComponent } from './RoutComponents/video-chat/video-chat.component';
import {GroupsComponent} from './RoutComponents/groups/groups.component';
import {AGroupComponent} from './RoutComponents/a-group/a-group.component';
import {AddGroupComponent} from './RoutComponents/add-group/add-group.component';
import { AdminControllsComponent } from './RoutComponents/admin-controlls/admin-controlls.component';
import { AdminBackupComponent } from './RoutComponents/admin-backup/admin-backup.component';
import { AdminRestoreComponent } from './RoutComponents/admin-restore/admin-restore.component';
/**
 * the routes for the different components
 * @type {(
 * {path: string; component: AlbumListComponent; canActivate: AuthGuard[]} |
 * {path: string; component: AddAlbumComponent; canActivate: AuthGuard[]} |
 * {path: string; component: AddAlbumComponent; canActivate: AuthGuard[]} |
 * {path: string; component: AlbumComponent; canActivate: AuthGuard[]} |
 * {path: string; component: LoginComponent} |
 * {path: string; component: SignUpComponent}
 * )[]}
 */
const routes: Routes = [
  {
    path: 'admin',
    component: AdminControllsComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'admin/backup',
    component: AdminBackupComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'admin/restore',
    component: AdminRestoreComponent,
    canActivate:[AuthGuard],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'album',
    component: AlbumListComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  }, // on all routers activated AuthGourd
  {
    path: 'album/create',
    component: AddAlbumComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'edit/:albumId',
    component: AddAlbumComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'album/:id',
    component: AlbumComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'post',
    component: PostComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
 {
    path: 'groups',
    component: GroupsComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'group/create',
    component: AddGroupComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'group/:id',
    component: AGroupComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'message/:id',
    component: ChatFormComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'following',
    component: FollowingComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'followers',
    component: FollowersComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'videochat',
    component: VideoChatComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
  },

  {
    // default
    path: '',
    redirectTo: 'album',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'signUp',
        component: SignUpComponent,
      },
    ],
  },

  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
