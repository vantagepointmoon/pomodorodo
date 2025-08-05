import { randomUUID } from "crypto";
import { database } from "./database";
import type { Todo, TimerSession, InsertTodo, UpdateTodo, InsertTimerSession } from "@shared/schema";

export interface IStorage {
  getTodos(): Promise<Todo[]>;
  getTodo(id: string): Promise<Todo | undefined>;
  createTodo(insertTodo: InsertTodo): Promise<Todo>;
  updateTodo(id: string, updates: UpdateTodo): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<boolean>;

  getTimerSessions(): Promise<TimerSession[]>;
  createTimerSession(insertSession: InsertTimerSession): Promise<TimerSession>;
  updateTimerSession(id: string, updates: Partial<TimerSession>): Promise<TimerSession | undefined>;

  getRandomQuote(): Promise<{ content: string; author: string }>;
  getRandomExercise(): Promise<{ name: string; description: string; duration: number }>;
}

class SQLiteStorage implements IStorage {
  async getTodos(): Promise<Todo[]> {
    const rows = await database.all(`
      SELECT id, title, completed, status, priority, is_current as isCurrent, 
             created_at as createdAt, completed_at as completedAt, time_spent as timeSpent
      FROM todos 
      ORDER BY created_at DESC
    `);
    
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed),
      isCurrent: Boolean(row.isCurrent),
      createdAt: new Date(row.createdAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
    }));
  }

  async getTodo(id: string): Promise<Todo | undefined> {
    const row = await database.get(`
      SELECT id, title, completed, status, priority, is_current as isCurrent, 
             created_at as createdAt, completed_at as completedAt, time_spent as timeSpent
      FROM todos WHERE id = ?
    `, [id]);
    
    if (!row) return undefined;
    
    return {
      ...row,
      completed: Boolean(row.completed),
      isCurrent: Boolean(row.isCurrent),
      createdAt: new Date(row.createdAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
    };
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await database.run(`
      INSERT INTO todos (id, title, completed, status, priority, is_current, created_at, time_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, insertTodo.title, insertTodo.completed ? 1 : 0, insertTodo.status, insertTodo.priority, 0, now, 0]);
    
    const todo = await this.getTodo(id);
    return todo!;
  }

  async updateTodo(id: string, updates: UpdateTodo): Promise<Todo | undefined> {
    const existingTodo = await this.getTodo(id);
    if (!existingTodo) return undefined;

    // If setting this todo as current, unset all other todos as current
    if (updates.isCurrent === true) {
      await database.run('UPDATE todos SET is_current = 0 WHERE id != ?', [id]);
    }

    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.title !== undefined) {
      setClause.push('title = ?');
      params.push(updates.title);
    }
    if (updates.completed !== undefined) {
      setClause.push('completed = ?');
      params.push(updates.completed ? 1 : 0);
      
      // Set completed_at timestamp
      if (updates.completed && !existingTodo.completed) {
        setClause.push('completed_at = ?');
        params.push(new Date().toISOString());
      } else if (updates.completed === false) {
        setClause.push('completed_at = ?');
        params.push(null);
      }
    }
    if (updates.status !== undefined) {
      setClause.push('status = ?');
      params.push(updates.status);
    }
    if (updates.priority !== undefined) {
      setClause.push('priority = ?');
      params.push(updates.priority);
    }
    if (updates.isCurrent !== undefined) {
      setClause.push('is_current = ?');
      params.push(updates.isCurrent ? 1 : 0);
    }
    if (updates.timeSpent !== undefined) {
      setClause.push('time_spent = ?');
      params.push(updates.timeSpent);
    }

    if (setClause.length > 0) {
      params.push(id);
      await database.run(`UPDATE todos SET ${setClause.join(', ')} WHERE id = ?`, params);
    }

    return await this.getTodo(id);
  }

  async deleteTodo(id: string): Promise<boolean> {
    const result = await database.run('DELETE FROM todos WHERE id = ?', [id]);
    return result.changes > 0;
  }

  async getTimerSessions(): Promise<TimerSession[]> {
    const rows = await database.all(`
      SELECT id, type, duration, completed, started_at as startedAt, 
             completed_at as completedAt, todo_id as todoId
      FROM timer_sessions 
      ORDER BY started_at DESC
    `);
    
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed),
      startedAt: new Date(row.startedAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
    }));
  }

  async createTimerSession(insertSession: InsertTimerSession): Promise<TimerSession> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await database.run(`
      INSERT INTO timer_sessions (id, type, duration, completed, started_at, todo_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, insertSession.type, insertSession.duration, insertSession.completed ? 1 : 0, now, insertSession.todoId || null]);
    
    const session = await database.get(`
      SELECT id, type, duration, completed, started_at as startedAt, 
             completed_at as completedAt, todo_id as todoId
      FROM timer_sessions WHERE id = ?
    `, [id]);
    
    return {
      ...session,
      completed: Boolean(session.completed),
      startedAt: new Date(session.startedAt),
      completedAt: session.completedAt ? new Date(session.completedAt) : null,
    };
  }

  async updateTimerSession(id: string, updates: Partial<TimerSession>): Promise<TimerSession | undefined> {
    const existing = await database.get('SELECT * FROM timer_sessions WHERE id = ?', [id]);
    if (!existing) return undefined;

    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.completed !== undefined) {
      setClause.push('completed = ?');
      params.push(updates.completed ? 1 : 0);
      
      if (updates.completed && !existing.completed) {
        setClause.push('completed_at = ?');
        params.push(new Date().toISOString());
      }
    }

    if (setClause.length > 0) {
      params.push(id);
      await database.run(`UPDATE timer_sessions SET ${setClause.join(', ')} WHERE id = ?`, params);
    }

    const session = await database.get(`
      SELECT id, type, duration, completed, started_at as startedAt, 
             completed_at as completedAt, todo_id as todoId
      FROM timer_sessions WHERE id = ?
    `, [id]);
    
    return {
      ...session,
      completed: Boolean(session.completed),
      startedAt: new Date(session.startedAt),
      completedAt: session.completedAt ? new Date(session.completedAt) : null,
    };
  }

  async getRandomQuote(): Promise<{ content: string; author: string }> {
    const quote = await database.get('SELECT content, author FROM quotes ORDER BY RANDOM() LIMIT 1');
    return quote || { content: "Focus on progress, not perfection.", author: "Unknown" };
  }

  async getRandomExercise(): Promise<{ name: string; description: string; duration: number }> {
    const exercise = await database.get('SELECT name, description, duration FROM exercises ORDER BY RANDOM() LIMIT 1');
    return exercise || { name: "Deep Breathing", description: "Take 10 deep breaths", duration: 60 };
  }
}

export const storage = new SQLiteStorage();