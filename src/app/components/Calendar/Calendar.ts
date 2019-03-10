import {
  AfterViewInit,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { IOffset, IOptions, ITask, ITaskWithId } from "../../common/ts/interface";
import { LocalStorageService } from "../../services/LocalStorageService";
import { ListService } from "../../services/listService";
import * as moment from "moment";
import { Task } from "../Task/Task";
import { CalendarDates } from "../CalendarDates/CalendarDates";
import { TaskService } from "../../services/TaskService";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { UserLists } from "../UserLists/UserLists";

@Component({
  selector: 'calendar',
  templateUrl: 'Calendar.pug',
  styleUrls: ['Calendar.styl', 'TasksBlock.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class Calendar implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class.calendar') cssClass = true;
  @ViewChildren('sortableTask') tasksQueryList: QueryList<Task>;
  @ViewChildren('calendarDates') calendarDates: QueryList<CalendarDates>;
  @ViewChildren('userLists') userLists: QueryList<UserLists>;

  public tasks: ITask[];
  public tasksToDo: ITaskWithId[];
  public tasksDone: ITaskWithId[];
  public options: IOptions;

  private currentList: string;
  private tasksToDoLength: number;
  private taskHeight = 40;
  private taskMargin = 4;

  private destroy = new Subject();

  constructor(
    private localStorageService: LocalStorageService,
    private listService: ListService,
    private taskService: TaskService,
  ) {
  }

  ngOnInit() {
    this.options = this.localStorageService.get('options') || {};
    this.tasks = this.localStorageService.get('tasks') || [];

    this.listService.currentDate.subscribe(list => {
      this.listService.deactivateLists();
      this.currentList = list;
      this.setCurrentListTasks();
    });

    this.listService.currentList.subscribe(list => {
      this.listService.deactivateDates();
      this.currentList = list;
      this.setCurrentListTasks();
    });

    this.taskService.taskMoving.pipe(
      takeUntil(this.destroy),
    ).subscribe(offset => {
      this.onTaskMoving(offset);
    });
  }

  ngAfterViewInit() {
    if (this.tasksQueryList.first) {
      this.taskHeight = this.tasksQueryList.first.taskHeight;
    }
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  addTask(task: ITask) {
    this.tasks.push(task);
    this.setCurrentListTasks();
    this.saveToStorage();
  }

  changeTaskPatternAndDone(task: ITaskWithId) {
    this.tasks[task.tasksId].pattern = task.pattern;
    this.tasks[task.tasksId].done = task.done;
    this.setCurrentListTasks();
    this.saveToStorage();
  }

  removeTask(task: ITaskWithId) {
    this.tasks.splice(task.tasksId, 1);
    this.setCurrentListTasks();
    this.saveToStorage();
  }

  showHideRemoved() {
    this.options.showRemovedTasks = !this.options.showRemovedTasks;
    this.localStorageService.set('options', this.options);
  }

  onTaskMoving(offset: IOffset) {
    const taskIndex = offset.listIndex;
    const insertTaskIndex = Math.max(0, Math.round(offset.y / (this.taskHeight + this.taskMargin)));

    if (offset.movingAbove) {
      this.removeCalendarDatesCSSClass();

      const targetEl = this.detectCalendarDateElement(offset, taskIndex);

      if (targetEl && targetEl.dataset && targetEl.dataset.list) {
        targetEl.classList.add('calendar-date--ready-for-drop');
      }
    } else if (offset.movingBelow) {
      this.removeUserListsCSSClass();

      const targetEl = this.detectCalendarDateElement(offset, taskIndex);

      if (targetEl && targetEl.dataset && targetEl.dataset.list) {
       targetEl.classList.add('user-list--ready-for-drop');
      }
    } else if (insertTaskIndex < taskIndex) {
      this.tasksQueryList.forEach((task, i) => {
        task.elementRef.nativeElement.classList.add('task--transition');

        task.elementRef.nativeElement.classList.remove('task--shifted-up');

        if (i >= insertTaskIndex && i < taskIndex) {
          task.elementRef.nativeElement.classList.add('task--shifted-down');
        } else {
          task.elementRef.nativeElement.classList.remove('task--shifted-down');
        }
      });
    } else if (insertTaskIndex > taskIndex) {
      this.tasksQueryList.forEach((task, i) => {
        task.elementRef.nativeElement.classList.add('task--transition');

        task.elementRef.nativeElement.classList.remove('task--shifted-down');

        if (i <= insertTaskIndex && i > taskIndex) {
          task.elementRef.nativeElement.classList.add('task--shifted-up');
        } else {
          task.elementRef.nativeElement.classList.remove('task--shifted-up');
        }
      });
    } else {
      this.tasksQueryList.forEach(task => {
        task.elementRef.nativeElement.classList.remove('task--shifted-down', 'task--shifted-up');
      });
    }
  }

  onTaskMoved(offset: IOffset, taskIndex: number, tasksId: number) {
    const insertTaskIndex = Math.max(0, Math.min(this.tasksToDoLength - 1,
      Math.round(offset.y / (this.taskHeight + this.taskMargin)) ) );

    this.tasksQueryList.forEach(task => {
      task.elementRef.nativeElement.classList.remove('task--transition', 'task--shifted-up',
        'task--shifted-down');
    });

    if (offset.movingAbove) {
      this.removeCalendarDatesCSSClass();

      const targetEl = this.detectCalendarDateElement(offset, taskIndex);

      if (targetEl && targetEl.dataset && targetEl.dataset.list) {
        this.tasks[tasksId].list = targetEl.dataset.list;
        this.setCurrentListTasks();
        this.saveToStorage();
      }
    } else if (offset.movingBelow) {
      this.removeUserListsCSSClass();

      const targetEl = this.detectCalendarDateElement(offset, taskIndex);

      if (targetEl && targetEl.dataset && targetEl.dataset.list) {
        this.tasks[tasksId].list = targetEl.dataset.list;
        this.setCurrentListTasks();
        this.saveToStorage();
      }
    } else if (insertTaskIndex !== taskIndex) {
      this.tasks.splice(this.tasksToDo[insertTaskIndex].tasksId, 0, this.tasks.splice(tasksId, 1)[0]);
      this.setCurrentListTasks();
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    this.localStorageService.set('tasks', this.tasks);
  }

  private setCurrentListTasks() {
    this.tasksToDo = [];
    this.tasksDone = [];

    this.tasks.forEach((task, i) => {
      if (this.isShowTaskInCurrentList(task)) {
        const taskWithId: ITaskWithId = {...task, tasksId: i};
        if (task.done) {
          this.tasksDone.push(taskWithId);
        } else {
          this.tasksToDo.push(taskWithId);
        }
      }
    });

    this.tasksToDoLength = this.tasksToDo.length;
  }

  private isShowTaskInCurrentList(task: ITask) {
    if (this.currentList === '0') {
      return (!task.list || task.list === '0' ||
        (/^\d\d\d\d-\d\d-\d\d$/.test(task.list) ?
          moment(task.list, 'YYYY-MM-DD').isBefore(moment().format('YYYY-MM-DD')) :
          this.listService.listsOfLists.indexOf(task.list) === -1) );
    } else {
      return task.list === this.currentList;
    }
  }

  private hideTask(i: number) {
    this.findTask(i).classList.add('task--hidden');
  }

  private showTask(i: number) {
    this.findTask(i).classList.remove('task--hidden');
  }

  private findTask(index: number) {
    return this.tasksQueryList.find((task, i) => i === index).elementRef.nativeElement;
  }

  private removeCalendarDatesCSSClass() {
    this.calendarDates.first.calendarDateList.forEach(calendarDate => {
      calendarDate.elementRef.nativeElement.classList.remove('calendar-date--ready-for-drop');
    });
  }

  private removeUserListsCSSClass() {
    this.userLists.first.calendarDateList.forEach(userList => {
      userList.elementRef.nativeElement.classList.remove('user-list--ready-for-drop');
    });
  }

  private detectCalendarDateElement(offset: IOffset, taskIndex: number) {
    this.hideTask(taskIndex);
    const el: HTMLElement = document.elementFromPoint(offset.touchX, offset.touchY) &&
      document.elementFromPoint(offset.touchX, offset.touchY).closest('calendar-date, user-list') as HTMLElement;
    this.showTask(taskIndex);

    return el;
  }
}
