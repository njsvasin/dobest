import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { HammerConfig } from './common/ts/hammer-config';

import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Assista } from './Assista';
import { Calendar } from './components/Calendar/Calendar';
import { CalendarDates } from "./components/CalendarDates/CalendarDates";
import { CalendarDate } from "./components/CalendarDates/CalendarDate/CalendarDate";
import { TaskGroup } from './components/TaskGroup/TaskGroup';
import { Task } from './components/Task/Task';
import { TaskAdder } from "./components/TaskAdder/TaskAdder";
import { FormsModule } from '@angular/forms';
import { CCheckbox } from "./common/components/CCheckbox/CCheckbox";
import { DeviceDetectorModule } from "ngx-device-detector";
import { Footer } from "./components/Footer/Footer";
import { MainGoal } from "./components/MainGoal/MainGoal";
import { UserLists } from "./components/UserLists/UserLists";
import { UserList } from "./components/UserLists/UserList/UserList";
import { ListAdder } from "./components/ListAdder/ListAdder";

@NgModule({
  declarations: [
    Assista,
    Calendar,
    CalendarDates,
    CalendarDate,
    TaskGroup,
    Task,
    TaskAdder,
    CCheckbox,
    Footer,
    MainGoal,
    UserLists,
    UserList,
    ListAdder,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    DeviceDetectorModule.forRoot(),
  ],
  providers: [
    {provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig}
  ],
  bootstrap: [Assista],
})
export class AssistaModule {
}
