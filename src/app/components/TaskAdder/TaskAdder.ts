import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ITask } from "../../common/ts/interface";
import { ListService } from "../../services/listService";

@Component({
  selector: 'task-adder',
  templateUrl: 'TaskAdder.pug',
  styleUrls: ['TaskAdder.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class TaskAdder implements OnInit {
  @Output() taskAdd = new EventEmitter<ITask>();
  @HostBinding('class.task-adder') cssClass = true;
  @ViewChild('input') input: ElementRef;

  public text: string;

  private currentList: string;

  constructor(private listService: ListService) {}

  ngOnInit() {
    this.listService.currentDate.subscribe(list => {
      this.currentList = list;
    });
    this.listService.currentList.subscribe(list => this.currentList = list);
  }

  addTask(e: Event) {
    e.preventDefault();
    const tasks = this.text.split('\n');

    if (tasks.length > 0) {
      tasks.forEach(task => {
        task = task.trim();
        if (task) {
          this.taskAdd.next({
            text: task,
            pattern: 'default',
            done: false,
            list: this.currentList,
          });
        }
      });

      this.text= '';
    }

    this.input.nativeElement.focus();
  }

  onFormEnterKey(e: KeyboardEvent) {
    if (!e.shiftKey) {
      this.addTask(e);
      return false;
    }
  }
}
