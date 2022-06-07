import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-select-location-dialog',
  templateUrl: './select-location-dialog.component.html',
  styleUrls: ['./select-location-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectLocationDialogComponent implements OnInit {
  public locationControl = new UntypedFormControl(null, Validators.required);
  constructor() {}

  ngOnInit(): void {}
}
