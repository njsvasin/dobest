import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import * as moment from "moment";
import { Moment } from "moment";

moment.locale('ru');

@Component({
  selector: 'calendar-date',
  templateUrl: 'CalendarDate.pug',
  styleUrls: ['CalendarDate.styl'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDate implements OnChanges {
  @Input() moment: Moment;
  @Input() active: boolean;
  @Input() today: boolean;
  @HostBinding('class.calendar-date') cssClass = true;
  @HostBinding('class.calendar-date--active') cssClassActive: boolean;
  @HostBinding('class.calendar-date--today') cssClassToday: boolean;
  @HostBinding('class.calendar-date--weekend') cssClassWeekend: boolean;
  @HostBinding('attr.data-list') attrDataList: string;

  public weekday: string;
  public dayMonth: string;

  constructor(public elementRef: ElementRef<HTMLElement>) {
  }

  ngOnChanges({moment}: SimpleChanges) {
    this.weekday = this.moment.format ? this.moment.format('dd').toUpperCase() : (this.moment as any);
    this.dayMonth = this.moment.format ? this.moment.format('D MMMM') : '';
    this.cssClassActive = this.active;
    this.cssClassToday = this.today;
    this.cssClassWeekend = this.weekday === 'СБ' || this.weekday === 'ВС';

    if (moment && this.moment) {
      this.attrDataList = typeof this.moment === "string" ? this.moment : this.moment.format('YYYY-MM-DD');
    }
  }
}
