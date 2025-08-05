import { type Todo, type InsertTodo, type UpdateTodo, type TimerSession, type InsertTimerSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Todo operations
  getTodos(): Promise<Todo[]>;
  getTodo(id: string): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: string, updates: UpdateTodo): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<boolean>;
  
  // Timer session operations
  getTimerSessions(): Promise<TimerSession[]>;
  createTimerSession(session: InsertTimerSession): Promise<TimerSession>;
  updateTimerSession(id: string, updates: Partial<TimerSession>): Promise<TimerSession | undefined>;
}

export class MemStorage implements IStorage {
  private todos: Map<string, Todo>;
  private timerSessions: Map<string, TimerSession>;

  constructor() {
    this.todos = new Map();
    this.timerSessions = new Map();
  }

  async getTodos(): Promise<Todo[]> {
    return Array.from(this.todos.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTodo(id: string): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = randomUUID();
    const todo: Todo = {
      ...insertTodo,
      id,
      createdAt: new Date(),
      completedAt: null,
      timeSpent: 0,
    };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: string, updates: UpdateTodo): Promise<Todo | undefined> {
    const todo = this.todos.get(id);
    if (!todo) return undefined;

    const updatedTodo: Todo = {
      ...todo,
      ...updates,
      completedAt: updates.completed && !todo.completed ? new Date() : 
                   updates.completed === false ? null : todo.completedAt,
    };
    
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<boolean> {
    return this.todos.delete(id);
  }

  async getTimerSessions(): Promise<TimerSession[]> {
    return Array.from(this.timerSessions.values()).sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async createTimerSession(insertSession: InsertTimerSession): Promise<TimerSession> {
    const id = randomUUID();
    const session: TimerSession = {
      ...insertSession,
      id,
      startedAt: new Date(),
      completedAt: null,
    };
    this.timerSessions.set(id, session);
    return session;
  }

  async updateTimerSession(id: string, updates: Partial<TimerSession>): Promise<TimerSession | undefined> {
    const session = this.timerSessions.get(id);
    if (!session) return undefined;

    const updatedSession: TimerSession = {
      ...session,
      ...updates,
      completedAt: updates.completed && !session.completed ? new Date() : session.completedAt,
    };
    
    this.timerSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
