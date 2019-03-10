import {
  Component,
  ElementRef,
  HostBinding,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import * as moment from "moment";
import { UserList } from "./UserList/UserList";
import { ListService } from "../../services/listService";
import { ListAdder } from "../ListAdder/ListAdder";

moment.locale('ru');

@Component({
  selector: 'user-lists',
  templateUrl: 'UserLists.pug',
  styleUrls: ['UserLists.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class UserLists {
  @HostBinding('class.user-lists') cssClass = true;
  @ViewChildren(UserList) calendarDateList: QueryList<UserList>;
  @ViewChild(ListAdder) listAdder: ListAdder;

  constructor(public listService: ListService, public elementRef: ElementRef<HTMLElement>) {}

  onClick(i: number) {
    this.listService.setActiveList(i);
  }

  addList() {
    this.listService.addListSubject.next(true);
  }
}
