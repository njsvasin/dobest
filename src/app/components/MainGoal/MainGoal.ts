import { Component, ElementRef, HostBinding, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LocalStorageService } from "../../services/LocalStorageService";

@Component({
  selector: 'main-goal',
  templateUrl: './MainGoal.pug',
  styleUrls: ['./MainGoal.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class MainGoal implements OnInit {
  @HostBinding('class.main-goal') cssClass = true;
  @ViewChild('input') input: ElementRef;

  public showInput = false;
  public mainGoal: string;

  public mainGoalDefault = "Запиши ТВОЮ цель здесь!";

  constructor(
    private localStorageService: LocalStorageService,
  ) {

  }

  ngOnInit() {
    this.mainGoal = this.localStorageService.get('mainGoal') || this.mainGoalDefault;
  }

  onTextClick(){
    this.showInput = true;
    this.mainGoal = this.mainGoal === this.mainGoalDefault ? '' : this.mainGoal;

    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 0);
  }

  onInputBlur(){
    this.mainGoal = this.mainGoal.trim() || this.mainGoalDefault;
    this.localStorageService.set('mainGoal', this.mainGoal);
    this.showInput = false;
  }
}
