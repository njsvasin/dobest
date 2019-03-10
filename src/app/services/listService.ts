import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import * as moment from "moment";
import { IDate, IList } from "../common/ts/interface";
import { LocalStorageService } from "./LocalStorageService";

moment.locale('ru');

@Injectable({
  providedIn: 'root',
})
export class ListService {
  public currentDate = new Subject<string>();
  public currentList = new Subject<string>();
  public addListSubject = new BehaviorSubject<boolean>(false);

  public dates: IDate[] = [0, 1, 2, 3, 4, 5, 6].map((i: number) => {
    return {
      moment: moment().add(i, 'days'),
      active: i === 0,
      today: i === 0,
    }
  });

  public lists: IList[] = [
    {
      id: 0,
      name: 'Входящие',
      active: false,
    },
  ];

  public listsOfLists: string[];

  constructor(private localStorageService: LocalStorageService) {
    this.lists.push(...this.localStorageService.get('user-lists'));
    this.setListOfLists();
  }

  public deactivateDates() {
    this.dates.forEach((date)=> date.active = false);
  }

  public setActiveDate(i: number) {
    this.dates.forEach((date, j)=> date.active = j === i);
    this.currentDate.next((this.dates[i] as any).moment.format('YYYY-MM-DD'));
  }

  public deactivateLists() {
    this.lists.forEach((list)=> list.active = false);
  }

  public setActiveList(i: number) {
    this.lists.forEach((list, j)=> list.active = j === i);
    this.currentList.next(`${this.lists[i].id}`);
  }

  public addList(list: string) {
    this.lists.push({
      id: this.lists[this.lists.length - 1]. id + 1,
      name: list,
      active: false,
    });

    this.localStorageService.set('user-lists', this.lists.slice(1));
    this.setListOfLists();
  }

  public removeList(list: IList) {
    const removeIndex = this.findListIndex(list);
    if (removeIndex > 0) {
      this.lists.splice(removeIndex,1);

      this.localStorageService.set('user-lists', this.lists.slice(1));
      this.setListOfLists();
    }
  }

  private setListOfLists() {
    this.listsOfLists = this.lists.map( list => `${list.id}`);
  }

  private findListIndex(list: IList): number {
    return this.listsOfLists.indexOf(`${list.id}`);
  }
}
