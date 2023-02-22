import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  GetTenantForEditGQL,
  GetTenantForEditQuery,
  HomePageStrategy,
  UpdateTenantGQL,
} from '@tumi/legacy-app/generated/generated';
import { first, firstValueFrom, map, Observable, shareReplay } from 'rxjs';

@Component({
  selector: 'app-tenant-edit-page',
  templateUrl: './tenant-edit-page.component.html',
  styleUrls: ['./tenant-edit-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantEditPageComponent {
  public editForm: UntypedFormGroup;
  public HomePageStrategy = HomePageStrategy;
  public tenant$: Observable<GetTenantForEditQuery['currentTenant']>;

  constructor(
    private fb: UntypedFormBuilder,
    private updateTenant: UpdateTenantGQL,
    private loadTenant: GetTenantForEditGQL,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      imprintPage: ['', Validators.required],
      privacyPolicyPage: ['', Validators.required],
      aboutPage: ['', Validators.required],
      communicationEmail: ['', Validators.required],
      faqPage: [''],
      tacPage: [''],
      homePageStrategy: ['', Validators.required],
      homePageLink: [''],
      settings: this.fb.group({
        deregistrationOptions: this.fb.group({
          refundFees: [true, Validators.required],
          minimumDays: [5, Validators.required],
        }),
        socialLinks: this.fb.array([]),
        sectionHubLinks: this.fb.array([]),
        showPWAInstall: [false, Validators.required],
        brandIconUrl: [''],
      }),
    });
    this.tenant$ = this.loadTenant.fetch().pipe(
      map(({ data }) => data.currentTenant),
      shareReplay(1)
    );
    this.tenant$.pipe(first()).subscribe((tenant) => {
      this.editForm.patchValue(tenant ?? {});
      if (tenant?.settings?.socialLinks) {
        tenant.settings.socialLinks.forEach((socialLink) => {
          this.addSocialLink();
          this.socialLinks.at(-1).patchValue(socialLink);
        });
      }
      if (tenant?.settings?.sectionHubLinks) {
        tenant.settings.sectionHubLinks.forEach((sectionHubLink) => {
          this.addSectionHubLink();
          this.sectionHubLinks.at(-1).patchValue(sectionHubLink);
        });
      }
    });
  }

  get socialLinks() {
    return this.editForm.get('settings.socialLinks') as FormArray;
  }

  get sectionHubLinks() {
    return this.editForm.get('settings.sectionHubLinks') as FormArray;
  }

  addSocialLink() {
    this.socialLinks.push(
      new FormGroup({
        label: new FormControl('', Validators.required),
        url: new FormControl('', Validators.required),
        icon: new FormControl('', Validators.required),
      })
    );
  }

  addSectionHubLink() {
    this.sectionHubLinks.push(
      new FormGroup({
        label: new FormControl('', Validators.required),
        url: new FormControl('', Validators.required),
        icon: new FormControl('', Validators.required),
      })
    );
  }

  async saveTenant() {
    this.snackBar.open('Saving tenant ⏳', undefined, { duration: 0 });
    const tenant = await firstValueFrom(this.tenant$);
    const formValue = this.editForm.value;
    if (tenant) {
      await this.updateTenant
        .mutate({
          id: tenant.id,
          update: {
            ...formValue,
            faqPage: formValue.faqPage || null,
            tacPage: formValue.tacPage || null,
            homePageLink: formValue.homePageLink || null,
            settings: {
              ...formValue.settings,
              brandIconUrl: formValue.settings.brandIconUrl || undefined,
            },
          },
        })
        .toPromise();
      this.snackBar.open('Tenant saved ✔️');
    }
  }
}
