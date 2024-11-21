import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  OnDestroy,
} from '@angular/core';
import {
  AddEsnCardGQL,
  GetProfileUploadKeyGQL,
  MembershipStatus,
  SubmitEventFeedbackGQL,
  UpdateUserPictureGQL,
  UserProfileEventsGQL,
  UserProfileEventsQuery,
  UserProfileGQL,
  UserProfileQuery,
} from '@tumi/legacy-app/generated/generated';
import { BehaviorSubject, first, firstValueFrom, map, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClaimEventDialogComponent } from '../../components/claim-event-dialog/claim-event-dialog.component';
import { AuthService } from '@auth0/auth0-angular';
import {
  AsyncPipe,
  DatePipe,
  DOCUMENT,
  NgFor,
  NgIf,
  UpperCasePipe,
} from '@angular/common';
import { BlobServiceClient } from '@azure/storage-blob';
import {
  MatProgressBarModule,
  ProgressBarMode,
} from '@angular/material/progress-bar';
import { DateTime } from 'luxon';
import { ExtendDatePipe } from '@tumi/legacy-app/modules/shared/pipes/extended-date.pipe';
import { EventListComponent } from '../../components/event-list/event-list.component';
import { RateEventComponent } from '../../../shared/components/rate-event/rate-event.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProfileCardComponent } from '../../components/profile-card/profile-card.component';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatSlideToggle,
  MatSlideToggleChange,
} from '@angular/material/slide-toggle';
import { ConfigService } from '@tumi/legacy-app/services/config.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatProgressBarModule,
    ProfileCardComponent,
    MatIconModule,
    MatButtonModule,
    NgFor,
    RateEventComponent,
    EventListComponent,
    RouterLink,
    AsyncPipe,
    UpperCasePipe,
    DatePipe,
    ExtendDatePipe,
    MatInputModule,
    ReactiveFormsModule,
    MatSlideToggle,
  ],
})
export class ProfilePageComponent implements OnDestroy {
  public profile$: Observable<UserProfileQuery['currentUser']>;
  public profileEvents$: Observable<UserProfileEventsQuery['currentUser']>;
  public esnCardLink$: Observable<string | undefined>;
  public eventsToRate$: Observable<any[]>;
  public profileQueryRef;
  public profileEventsQueryRef;
  public MembershipStatus = MembershipStatus;
  public uploadProgress$ = new BehaviorSubject(0);
  public uploadMode$ = new BehaviorSubject<ProgressBarMode>('indeterminate');
  public uploading$ = new BehaviorSubject(false);
  public hostName;
  public esnCardNumberControl = new FormControl('');
  public esnCardErrorMessage$ = new BehaviorSubject<string | undefined>(
    undefined,
  );
  protected newUI = !!localStorage.getItem('evorto_new_ui');
  protected allowNewUI = inject(ConfigService).uiPreview;

  constructor(
    private profileQuery: UserProfileGQL,
    private profileEventsQuery: UserProfileEventsGQL,
    private submitEventFeedbackGQL: SubmitEventFeedbackGQL,
    private addEsnCardGQL: AddEsnCardGQL,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public auth: AuthService,
    private getProfileUploadKeyGQL: GetProfileUploadKeyGQL,
    private updateUserPictureGQL: UpdateUserPictureGQL,
    @Inject(DOCUMENT) public document: Document,
  ) {
    this.hostName = this.document.location.hostname;
    this.profileQueryRef = this.profileQuery.watch();
    this.profileQueryRef.startPolling(30000);
    this.profile$ = this.profileQueryRef.valueChanges.pipe(
      map(({ data }) => data.currentUser),
    );
    this.esnCardLink$ = this.profileQueryRef.valueChanges.pipe(
      map(({ data }) => data.currentTenant.settings.esnCardLink ?? undefined),
    );

    this.profileEventsQueryRef = this.profileEventsQuery.watch();
    this.profileEvents$ = this.profileEventsQueryRef.valueChanges.pipe(
      map(({ data }) => data.currentUser),
    );

    this.eventsToRate$ = this.profileEvents$.pipe(
      map((profile) => [
        ...(profile?.participatedEvents.filter(
          (event) => event?.ratingPending,
        ) ?? []),
        ...(profile?.organizedEvents.filter((event) => event?.ratingPending) ??
          []),
      ]),
      map((events) =>
        events.filter(
          (event) =>
            DateTime.fromISO(event?.end)
              .plus({ days: 7 })
              .toJSDate() > new Date(),
        ),
      ),
    );

    this.route.queryParamMap.pipe(first()).subscribe((queryMap) => {
      const status = queryMap.get('stripe');
      if (status === 'success') {
        this.snackBar.open('✔️ We are processing your payment method...');
      }
      if (status === 'fail') {
        this.snackBar.open('❌ The process was cancelled');
      }
      const claimCode = queryMap.get('code');
      if (claimCode) {
        this.claimEvent(claimCode);
      }
    });
  }

  ngOnDestroy(): void {
    this.profileQueryRef.stopPolling();
    this.profileEventsQueryRef.stopPolling();
  }

  async addEsnCard() {
    const esnCardNumber = this.esnCardNumberControl.value;
    if (esnCardNumber) {
      try {
        await firstValueFrom(this.addEsnCardGQL.mutate({ esnCardNumber }));
        this.esnCardErrorMessage$.next(undefined);
        this.esnCardNumberControl.reset();
      } catch (e: any) {
        this.esnCardErrorMessage$.next(e.message);
      }
    }
  }

  getEntries(obj: any) {
    return Object.entries(obj);
  }

  claimEvent(code?: string): void {
    this.dialog.open(ClaimEventDialogComponent, {
      data: { code },
    });
  }

  async saveRating(
    $event: { rating: number; comment: string; anonymousRating: boolean },
    id: string,
  ) {
    await firstValueFrom(
      this.submitEventFeedbackGQL.mutate({
        id,
        anonymousRating: $event.anonymousRating,
        rating: $event.rating,
        comment: $event.comment,
      }),
    );
  }

  async addFile(fileEvent: Event) {
    this.uploading$.next(true);
    this.uploadMode$.next('indeterminate');
    const target = fileEvent.target as HTMLInputElement;
    const user = await firstValueFrom(this.profile$);
    if (target && target.files && target.files.length && user) {
      const files = Array.from(target.files).filter((file) =>
        file.type.startsWith('image/'),
      );
      if (!files.length) {
        this.uploadProgress$.next(0);
        this.uploading$.next(false);
        return;
      }
      const file = files[0];
      const { data } = await firstValueFrom(
        this.getProfileUploadKeyGQL.fetch(),
      );
      this.uploadMode$.next('determinate');
      this.uploadProgress$.next(0);
      const reader = new FileReader();
      const image = new Image();
      const imagePromise = new Promise<void>((resolve) => {
        reader.onload = () => {
          image.onload = () => resolve();
          image.src = reader.result as string;
        };
      });
      const blobServiceClient = new BlobServiceClient(data.profileUploadKey);
      const container = user.id;
      const blob = this.randomId() + '|' + file.name;
      const containerClient = blobServiceClient.getContainerClient(container);
      const blockBlobClient = containerClient.getBlockBlobClient(blob);
      await blockBlobClient.uploadBrowserData(file, {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
        onProgress: (event) => {
          this.uploadProgress$.next((event.loadedBytes / file.size) * 100);
        },
      });
      reader.readAsDataURL(file);
      await imagePromise;
      await firstValueFrom(
        this.updateUserPictureGQL.mutate({ userId: user.id, file: blob }),
      );
    }
    this.uploadProgress$.next(0);
    this.uploading$.next(false);
  }

  private randomId(): string {
    const uint32 = crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(16);
  }

  uiEnableChange(change: MatSlideToggleChange) {
    if (change.checked) {
      localStorage.setItem('evorto_new_ui', 'enabled');
    } else {
      localStorage.removeItem('evorto_new_ui');
    }
    location.reload();
  }
}
