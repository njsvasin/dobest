import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding, HostListener,
  Input, NgZone,
  OnChanges, SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { IList, IPoint } from "../../../common/ts/interface";
import { ListService } from "../../../services/listService";

@Component({
  selector: 'user-list',
  templateUrl: 'UserList.pug',
  styleUrls: ['UserList.styl'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnChanges {
  @Input() list: IList;
  @Input() active: boolean;
  @Input() disableMoving: boolean;
  @HostBinding('class.user-list') cssClass = true;
  @HostBinding('class.user-list--active') cssClassActive: boolean;
  @HostBinding('attr.data-list') attrDataList: string;

  private touchStartPoint: IPoint;
  private isTouchMove: boolean;
  private isDrugging: boolean;
  private readonly touchUpDelta = 20;
  private styleTop = 0;

  constructor(
    public elementRef: ElementRef<HTMLElement>,
    private zone: NgZone,
    private listService: ListService,
  ) {
  }

  ngOnChanges({list}: SimpleChanges) {
    this.cssClassActive = this.active;

    if (list && this.list) {
      this.attrDataList = `${this.list.id}`;
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent){
    if (!this.disableMoving){
      this.touchStartPoint = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };

      this.zone.runOutsideAngular(() => {
        this.isTouchMove = false;
        this.elementRef.nativeElement.addEventListener('touchmove', this.moveList.bind(this));
      });
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(){
    if (!this.disableMoving){
      this.zone.run(() => {
        this.elementRef.nativeElement.removeEventListener('touchmove', this.moveList);

        if (this.isTouchMove) {
          this.moveEndList();
        }

        // this.removeCssClasses();
        // this.resetStyles();
      });
    }
  }

  private moveList(e: TouchEvent) {
    this.detectMove(e);

    if (this.isTouchMove) {
      if (!this.isDrugging) {
        this.isDrugging = true;
        // this.addDruggingClass();
      }
      // this.addCssClasses();
      this.setStyleTop();
    }
  }

  private moveEndList() {
    this.isDrugging = false;

    if (this.isTouchMove) {
      this.listService.removeList(this.list);
    }
  }

  private detectMove(e: TouchEvent) {
    const currentY = e.targetTouches[0].clientY;
    const deltaY = currentY - this.touchStartPoint.y;

    if (!this.isTouchMove) {
      if (deltaY < -this.touchUpDelta || deltaY > this.touchUpDelta) {         // filter click, tap
        this.isTouchMove = true;
      }
    }

    if (this.isTouchMove) {
      this.styleTop = deltaY;
    }
  }

  private setStyleTop() {
    this.elementRef.nativeElement.style.transform =`translateY(${this.styleTop}px)`;
  };
}
