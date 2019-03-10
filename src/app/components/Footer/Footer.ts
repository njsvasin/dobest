import { Component, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'footer',
  templateUrl: './Footer.pug',
  styleUrls: ['./Footer.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class Footer {
  @HostBinding('class.footer') cssClass = true;

  public year = new Date().getFullYear();
}
