import {Component, HostBinding, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'task-group',
  templateUrl: 'TaskGroup.pug',
  styleUrls: ['TaskGroup.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class TaskGroup {
  @HostBinding('class.task-group') cssClass = true;
}
