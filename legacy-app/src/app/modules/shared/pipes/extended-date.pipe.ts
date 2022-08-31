import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateTime } from 'luxon';

@Pipe({
  name: 'date',
})
export class ExtendDatePipe implements PipeTransform {
  readonly customFormats: { [type: string]: string } = {
    medium: 'EEEE, d MMM y, HH:mm',
    short: 'EE, d MMM, HH:mm',
    shortDate: 'EE, d MMM',
    shortTime: 'HH:mm',
    mediumTime: 'HH:mm',
    longDate: 'EEEE, d LLLL',
  };

  constructor(private datePipe: DatePipe) {}

  transform(value: any, format = 'medium') {
    format = this.customFormats[format] || format;
    return this.datePipe.transform(
      value,
      format,
      DateTime.local().offsetNameShort
    );
  }
}
