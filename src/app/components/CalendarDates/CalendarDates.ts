import { Component, HostBinding, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import * as moment from "moment";
import { ListService } from "../../services/listService";
import { CalendarDate } from "./CalendarDate/CalendarDate";

moment.locale('ru');

@Component({
  selector: 'calendar-dates',
  templateUrl: 'CalendarDates.pug',
  styleUrls: ['CalendarDates.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarDates implements OnInit {
  @HostBinding('class.calendar-dates') cssClass = true;
  @ViewChildren(CalendarDate) calendarDateList: QueryList<CalendarDate>;

  constructor(public listService: ListService) {}

  ngOnInit() {
    this.listService.setActiveDate(0);
  }

  onClick(i) {
    this.listService.setActiveDate(i);
  }
}
