import { Component, EventEmitter, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'c-checkbox',
  templateUrl: './CCheckbox.pug',
  styleUrls: ['CCheckbox.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class CCheckbox {
  @Input() text?: string;
  @Input() checked?: boolean;

  public change = new EventEmitter();
}
