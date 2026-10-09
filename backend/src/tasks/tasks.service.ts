import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  create(dto: CreateTaskDto): Task {
    this.assertUniqueTitle(dto.title);
    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description,
      done: dto.done ?? false,
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    return task;
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    if (dto.title) this.assertUniqueTitle(dto.title, id);
    Object.assign(task, dto);
    return task;
  }

  remove(id: string): void {
    const task = this.findOne(id);
    this.tasks = this.tasks.filter((t) => t.id !== task.id);
  }

  private assertUniqueTitle(title: string, ignoreId?: string) {
    const exists = this.tasks.some(
      (t) => t.id !== ignoreId && t.title.toLowerCase() === title.toLowerCase(),
    );
    if (exists) throw new ConflictException(`Task with title "${title}" already exists`);
  }
}
