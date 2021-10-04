import { tasks } from './tasks';
import { Task } from '../types/task';

export function findTask(taskNumber: number): Task {
  const task = tasks.find((task) => task.number === taskNumber);

  return { ...task };
}
