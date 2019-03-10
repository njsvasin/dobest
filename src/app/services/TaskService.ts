import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { IOffset } from "../common/ts/interface";

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  public taskMoving = new Subject<IOffset>();
}
