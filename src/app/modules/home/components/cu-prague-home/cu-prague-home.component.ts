import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  GetHomePageDataGQL,
  GetHomePageDataQuery,
} from '@tumi/legacy-app/generated/generated';
import { Title } from '@angular/platform-browser';
import { IconURLPipe } from '@tumi/legacy-app/modules/shared/pipes/icon-url.pipe';
import { ExtendDatePipe } from '@tumi/legacy-app/modules/shared/pipes/extended-date.pipe';
import { TechnicalSupportComponent } from '../technical-support/technical-support.component';
import { GridComponent } from '../../../shared/components/grid/grid.component';
import { NgFor, AsyncPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cu-prague-home',
  templateUrl: './cu-prague-home.component.html',
  styleUrls: ['./cu-prague-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink,
    MatIconModule,
    NgFor,
    GridComponent,
    TechnicalSupportComponent,
    AsyncPipe,
    DatePipe,
    ExtendDatePipe,
    IconURLPipe,
    NgOptimizedImage,
  ],
})
export class CuPragueHomeComponent {
  public events$: Observable<GetHomePageDataQuery['events']>;
  public loggedIn$: Observable<boolean>;

  constructor(
    private q: GetHomePageDataGQL,
    private title: Title,
  ) {
    this.title.setTitle('Home - CU Prague');

    this.events$ = this.q
      .watch()
      .valueChanges.pipe(map(({ data }) => data.events));
    this.loggedIn$ = this.q
      .watch()
      .valueChanges.pipe(map(({ data }) => !!data.currentUser?.id));
  }
}
