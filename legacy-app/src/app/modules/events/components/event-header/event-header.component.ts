import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { LoadEventQuery, Role } from '@tumi/legacy-app/generated/generated';
import { Price } from '../../../../../../../shared/data-types';

@Component({
  selector: 'app-event-header',
  templateUrl: './event-header.component.html',
  styleUrls: ['./event-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventHeaderComponent {
  public Role = Role;
  @Input() public event: LoadEventQuery['event'] | null = null;
  @Input() public bestPrice: Price | null = null;
  isSingleDayEvent() {
    return (
      this.event &&
      new Date(this.event.start).getDay() === new Date(this.event.end).getDay()
    );
  }
  get canShare() {
    return this.event && !!navigator.share;
  }

  shareEvent() {
    navigator.share({
      title: this.event?.title,
      text: `Check out this event on TUMi: ${this.event?.title}`,
      url: 'https://tumi.esn.world/events/' + this.event?.id,
    });
  }
}
