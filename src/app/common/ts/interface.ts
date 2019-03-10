import { Moment } from "moment";

export interface ITask {
  text: string
  pattern: ITaskPattern
  done: boolean
  list: string
}

export interface ITaskWithId extends ITask {
  tasksId: number
}

export type ITaskPattern = 'default' | 'fire' | 'progress' | 'regress';

export interface IOptions {
  showRemovedTasks: boolean
}

export interface IDate {
  moment: Moment | 'inbox'
  active: boolean
  today: boolean
}

export interface IOffset {
  x: number
  y: number
  touchX?: number
  touchY?: number
  listIndex?: number
  movingAbove: boolean
  movingBelow: boolean
}

export interface IPoint {
  x: number
  y: number
}

export interface IList {
  id: number
  name: string
  active: boolean
  pattern?: ITaskPattern
}
