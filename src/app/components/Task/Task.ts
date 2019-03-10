import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnInit,
  Output,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import { IOffset, IPoint, ITaskPattern, ITaskWithId } from "../../common/ts/interface";
import { animate, keyframes, transition, trigger } from "@angular/animations";
import * as kf from '../../common/ts/keyframes';
import { DeviceDetectorService } from "ngx-device-detector";
import { DomSanitizer } from "@angular/platform-browser";
import { TaskService } from "../../services/TaskService";
import { Hammer } from 'hammerjs';
import { UserLists } from "../UserLists/UserLists";

const duration = 300;

@Component({
  selector: 'task',
  templateUrl: 'Task.pug',
  styleUrls: ['Task.styl'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('taskAnimator', [
      transition('* => wobble', animate(duration, keyframes(kf.wobble))),
      transition('* => swing', animate(duration, keyframes(kf.swing))),
      transition('* => jello', animate(duration, keyframes(kf.jello))),
      transition('* => zoomOutRight', animate(duration, keyframes(kf.zoomOutRight))),
      transition('* => slideOutLeft', animate(duration, keyframes(kf.slideOutLeft))),
      transition('* => rotateOutUpRight', animate(duration, keyframes(kf.rotateOutUpRight))),
      transition('* => flipOutY', animate(duration, keyframes(kf.flipOutY))),
    ])
  ],
})
export class Task implements OnInit, AfterViewInit{
  @Input() task: ITaskWithId;
  @Input() listIndex?: number;
  @Input() disableMoving: boolean;
  @Input() userLists?: UserLists;
  @Output() taskChange = new EventEmitter();
  @Output() taskRemove = new EventEmitter();
  @Output() taskMoved = new EventEmitter();

  @HostBinding('class.task') cssClass = true;
  @HostBinding('class.task--fire') get taskFire() {return this.task.pattern === 'fire'};
  @HostBinding('class.task--progress') get taskProgress() {return this.task.pattern === 'progress'};
  @HostBinding('class.task--regress') get taskRed() {return this.task.pattern === 'regress'};
  @HostBinding('class.task--done') get taskDone() {return this.task.done};

  @HostBinding('@taskAnimator') animationState;

  public taskHeight: number;

  private taskPatterns: ITaskPattern[] = ['default', 'fire', 'progress', 'regress'];
  private taskPatternIndex: number;
  private documentScrollTop = 0;
  private styleLeft = 0;
  private styleTop = 0;
  private offsetTop = 0;
  private taskOffsetLeft = 0;
  private filterGhostClick = false;
  private offsetParams: IOffset;
  private touchStartPoint: IPoint;
  private isDrugging: boolean;
  private isTouchMove: boolean;
  private readonly touchMoveAccuracy = 10;
  private viewportHeight = 0;
  private touchY: number;

  constructor(
    private deviceService: DeviceDetectorService,
    private taskService: TaskService,
    public elementRef: ElementRef<HTMLElement>,
    private _sanitizer: DomSanitizer,
    private zone: NgZone,
  ) {
  }

  @HostListener('click', ['$event'])
  onClickBtn(){
    if (!this.filterGhostClick) {
      this.changePattern();
    }
    this.filterGhostClick = false;
  }

  @HostListener('swipeleft', ['$event'])
  onSwipeLeft(){
    this.startAnimation('slideOutLeft');
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent){
    if (!this.disableMoving){
      this.documentScrollTop = document.documentElement.scrollTop;
      this.touchStartPoint = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };

      this.zone.runOutsideAngular(() => {
        this.isTouchMove = false;
        this.elementRef.nativeElement.addEventListener('touchmove', this.moveTask.bind(this));
      });
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(){
    if (!this.disableMoving){
      this.zone.run(() => {
        this.elementRef.nativeElement.removeEventListener('touchmove', this.moveTask);

        if (this.isTouchMove) {
          this.moveEndTask();
        }

        this.removeCssClasses();
        this.resetStyles();
      });
    }
  }

  @HostListener('@taskAnimator.done', ['$event'])
  startRemovingTask() {
    if (this.animationState) {
      this.animationState = '';
      this.removeTask();
    }
  }

  ngOnInit() {
    this.taskPatternIndex = (this.task.pattern && this.taskPatterns.indexOf(this.task.pattern) !== -1) ?
      this.taskPatterns.indexOf(this.task.pattern) : 0;
    this.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  }

  ngAfterViewInit() {
    this.taskHeight = this.elementRef.nativeElement.offsetHeight;
    this.taskOffsetLeft = this.elementRef.nativeElement.getBoundingClientRect().left;
  }

  changePattern() {
    this.taskPatternIndex = (this.taskPatternIndex + 1) % 4;
    this.task.pattern = this.taskPatterns[this.taskPatternIndex];
    this.taskChange.emit(this.task);
  }

  changeDone(e) {
    e.stopPropagation();
    this.task.done = !this.task.done;
    this.taskChange.emit(this.task);
  }

  startAnimation(state) {
    if (!this.animationState) {
      this.animationState = state;
    }
  }

  removeTask() {
    this.taskRemove.emit(this.task);
  }

  private moveTask(e: TouchEvent) {
    this.setOffsetParams(e);

    if (this.isTouchMove) {
      if (!this.isDrugging) {
        this.isDrugging = true;
        this.addDruggingClass();
      }
      this.addCssClasses();
      this.setStyleTop();
      this.setStyleLeft();

      this.taskService.taskMoving.next(this.offsetParams);
    }
  }

  private moveEndTask() {
    this.isDrugging = false;

    if (this.deviceService.isDesktop()) {
      this.filterGhostClick = true;
    }

    this.taskMoved.emit(this.offsetParams);
  }

  private setOffsetParams(e: TouchEvent) {
    const taskElem = this.elementRef.nativeElement;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const deltaY = currentY - this.touchStartPoint.y;

    if (!this.isTouchMove) {
      if (deltaY < -this.touchMoveAccuracy || deltaY > this.touchMoveAccuracy) {         // filter click, tap
        this.isTouchMove = true;
      }
    }

    if (this.isTouchMove) {
      this.styleLeft = currentX;
      this.touchY = currentY;
      this.styleTop = deltaY;
      this.offsetTop = taskElem.offsetTop + this.styleTop;

      this.offsetParams = {
        x: taskElem.offsetLeft + this.styleLeft,
        y: taskElem.offsetTop + this.styleTop,
        touchX: currentX,
        touchY: this.touchY,
        listIndex: this.listIndex,
        movingAbove: this.isTaskMovingAboveContainer(),
        movingBelow: this.isTaskMovingBelowContainer(),
      };
    }
  }

  private setStyleTop() {
    this.elementRef.nativeElement.style.transform =
      (this.isTaskMovingAboveContainer() || this.isTaskMovingBelowContainer() ?
        `translate(calc(-50% - ${this.taskOffsetLeft}px), ${this.styleTop}px)` :
        `translateY(${this.styleTop}px)`);
  };

  private setStyleLeft() {
    this.elementRef.nativeElement.style.left =
      `${this.isTaskMovingAboveContainer() || this.isTaskMovingBelowContainer() ? this.styleLeft : 0}px`;
  };

  private resetStyles() {
    this.styleLeft = 0;
    this.styleTop = 0;
    this.elementRef.nativeElement.style.left = null;
    this.elementRef.nativeElement.style.transform = null;
  }

  private addCssClasses() {
    if (this.isTaskMovingAboveContainer() || this.isTaskMovingBelowContainer()) {
      this.elementRef.nativeElement.classList.add('task--minified');
    } else {
      this.elementRef.nativeElement.classList.remove('task--minified');
    }
  }

  private addDruggingClass() {
    this.elementRef.nativeElement.classList.add('task--dragging');
  };

  private removeCssClasses() {
    this.elementRef.nativeElement.classList.remove('task--dragging', 'task--minified');
  };

  private isTaskMovingAboveContainer() {
    const scroll = this.documentScrollTop;
    return scroll > 66.5 ? this.offsetTop - scroll + 70 < 0 : this.offsetTop < 0;
  }

  private isTaskMovingBelowContainer() {
    return this.touchY + 22> this.userLists.elementRef.nativeElement.getBoundingClientRect().top;
  }
}
