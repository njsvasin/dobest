import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string) {
    let result: any = null;

    try {
      result = JSON.parse(localStorage.getItem(key));
    } catch (e) {
      console.log(`Can't parse localStorage value by key ${key}`);
    }

    return result;
  }
}
