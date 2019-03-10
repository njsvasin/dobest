import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class dbService {
  constructor(private httpClient: HttpClient) {

  }

  getAllTasks() {
    return this.httpClient.request('GET', 'http://localhost:3000/tasks');
  }

  saveTasksToDB(tasks) {
    return this.httpClient.request('POST', 'http://localhost:3000/tasks', {body: tasks});
  }
}
