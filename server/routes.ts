import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoSchema, updateTodoSchema, insertTimerSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Todo routes
  app.get("/api/todos", async (req, res) => {
    try {
      const todos = await storage.getTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", async (req, res) => {
    try {
      const validatedData = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(validatedData);
      res.status(201).json(todo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid todo data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create todo" });
      }
    }
  });

  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateTodoSchema.parse(req.body);
      const todo = await storage.updateTodo(id, validatedData);
      
      if (!todo) {
        res.status(404).json({ message: "Todo not found" });
        return;
      }
      
      res.json(todo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update todo" });
      }
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTodo(id);
      
      if (!success) {
        res.status(404).json({ message: "Todo not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // Timer session routes
  app.get("/api/timer-sessions", async (req, res) => {
    try {
      const sessions = await storage.getTimerSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timer sessions" });
    }
  });

  app.post("/api/timer-sessions", async (req, res) => {
    try {
      const validatedData = insertTimerSessionSchema.parse(req.body);
      const session = await storage.createTimerSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create timer session" });
      }
    }
  });

  app.patch("/api/timer-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.updateTimerSession(id, req.body);
      
      if (!session) {
        res.status(404).json({ message: "Timer session not found" });
        return;
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update timer session" });
    }
  });

  // Quotes from database
  app.get("/api/quotes", async (req, res) => {
    try {
      const quote = await storage.getRandomQuote();
      res.json(quote);
    } catch (error) {
      console.error("Failed to get quote:", error);
      res.status(500).json({
        message: "Failed to get quote",
        fallback: {
          content: "The way to get started is to quit talking and begin doing.",
          author: "Walt Disney"
        }
      });
    }
  });

  // Exercises from database
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercise = await storage.getRandomExercise();
      res.json(exercise);
    } catch (error) {
      console.error("Failed to get exercise:", error);
      res.status(500).json({
        message: "Failed to get exercise",
        fallback: {
          name: "Deep Breathing",
          description: "Take 10 deep breaths",
          duration: 60
        }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
