import Database from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');

export class SQLiteDB {
  private db: Database.Database;

  constructor() {
    this.db = new Database.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
    
    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');
    
    this.initTables();
  }

  private async initTables() {
    const run = promisify(this.db.run.bind(this.db));
    
    try {
      // Create todos table
      await run(`
        CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          completed BOOLEAN DEFAULT 0,
          status TEXT DEFAULT 'todo',
          priority TEXT DEFAULT 'medium',
          is_current BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          time_spent INTEGER DEFAULT 0
        )
      `);

      // Create timer_sessions table
      await run(`
        CREATE TABLE IF NOT EXISTS timer_sessions (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          duration INTEGER NOT NULL,
          completed BOOLEAN DEFAULT 0,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          todo_id TEXT,
          FOREIGN KEY (todo_id) REFERENCES todos (id)
        )
      `);

      // Create quotes table
      await run(`
        CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          author TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create exercises table
      await run(`
        CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          duration INTEGER NOT NULL,
          type TEXT DEFAULT 'stretch',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default quotes if table is empty
      const quotesCount = await this.get('SELECT COUNT(*) as count FROM quotes');
      if (quotesCount.count === 0) {
        await this.insertDefaultQuotes();
      }

      // Insert default exercises if table is empty
      const exercisesCount = await this.get('SELECT COUNT(*) as count FROM exercises');
      if (exercisesCount.count === 0) {
        await this.insertDefaultExercises();
      }

      console.log('Database tables initialized');
    } catch (error) {
      console.error('Error initializing database tables:', error);
    }
  }

  private async insertDefaultQuotes() {
    const quotes = [
      { content: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { content: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
      { content: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
      { content: "Time is what we want most, but what we use worst.", author: "William Penn" },
      { content: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
      { content: "Your limitation—it's only your imagination.", author: "Unknown" },
      { content: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
      { content: "Great things never come from comfort zones.", author: "Unknown" },
      { content: "Dream it. Wish it. Do it.", author: "Unknown" },
      { content: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" }
    ];

    for (const quote of quotes) {
      await this.run('INSERT INTO quotes (content, author) VALUES (?, ?)', [quote.content, quote.author]);
    }
  }

  private async insertDefaultExercises() {
    const exercises = [
      { name: "Desk Stretch", description: "Stretch your arms above your head and lean side to side", duration: 30, type: "stretch" },
      { name: "Neck Rolls", description: "Slowly roll your neck in circles to release tension", duration: 30, type: "stretch" },
      { name: "Eye Break", description: "Look away from screen and focus on distant objects", duration: 20, type: "eye" },
      { name: "Shoulder Shrugs", description: "Lift shoulders up to ears, hold, then release", duration: 30, type: "stretch" },
      { name: "Deep Breathing", description: "Take 10 deep breaths, in through nose, out through mouth", duration: 60, type: "breathing" },
      { name: "Wrist Circles", description: "Make circles with your wrists to prevent strain", duration: 30, type: "stretch" },
      { name: "Calf Raises", description: "Rise up on toes, hold briefly, then lower", duration: 30, type: "movement" },
      { name: "Spinal Twist", description: "Sit tall and gently twist your torso left and right", duration: 30, type: "stretch" }
    ];

    for (const exercise of exercises) {
      await this.run('INSERT INTO exercises (name, description, duration, type) VALUES (?, ?, ?, ?)', 
        [exercise.name, exercise.description, exercise.duration, exercise.type]);
    }
  }

  public async run(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(this: Database.RunResult, err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  public async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  public async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export const database = new SQLiteDB();