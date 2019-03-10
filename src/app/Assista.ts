import {Component, HostBinding, ViewEncapsulation} from '@angular/core';
import {config} from "src/config";

@Component({
  selector: 'assist-a',
  templateUrl: './Assista.pug',
  styleUrls: ['./Assista.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class Assista {
  @HostBinding('class.assist-a') cssClass = true;

  public title = 'Do Best!';
  public version = config.version;
}
