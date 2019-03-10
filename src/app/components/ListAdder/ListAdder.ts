import { Component, ElementRef, HostBinding, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ListService } from "../../services/listService";

@Component({
  selector: 'list-adder',
  templateUrl: 'ListAdder.pug',
  styleUrls: ['ListAdder.styl'],
  encapsulation: ViewEncapsulation.None,
})
export class ListAdder implements OnInit {
  @HostBinding('class.list-adder--active') active: boolean;
  @HostBinding('class.list-adder') cssClass = true;

  @ViewChild('input') input: ElementRef;

  public text: string;

  constructor(private listService: ListService) {
  }

  ngOnInit(): void {
    this.listService.addListSubject.subscribe(active => {
      this.active = active;

      if (active) {
        this.input.nativeElement.focus();
      }
    });
  }

  addList(e: Event) {
    e.preventDefault();
    const list = this.text.trim();

    if (list) {
      this.listService.addList(list);
    }

    this.text= '';

    this.input.nativeElement.focus();
  }

  onBlur() {
    this.listService.addListSubject.next(false);
  }
}
