import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { analyzeContent, matchSolutions } from "./openai";
import { insertUserSchema, insertTopicSchema, insertIssueSchema, insertSolutionSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express) {
  // Session setup
  app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport config
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Topics
  app.get("/api/topics", async (req, res) => {
    const topics = await storage.getTopics();
    res.json(topics);
  });

  app.post("/api/topics", async (req, res) => {
    const topic = insertTopicSchema.parse(req.body);
    const newTopic = await storage.createTopic(topic);
    res.json(newTopic);
  });

  // Issues
  app.get("/api/issues", async (req, res) => {
    const topicId = req.query.topicId ? Number(req.query.topicId) : undefined;
    const issues = await storage.getIssues(topicId);
    res.json(issues);
  });

  app.get("/api/issues/:id", async (req, res) => {
    const issue = await storage.getIssue(Number(req.params.id));
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json(issue);
  });

  app.post("/api/issues", async (req, res) => {
    const issue = insertIssueSchema.parse(req.body);
    const analysis = await analyzeContent(issue.content);
    const newIssue = await storage.createIssue({
      ...issue,
      keyFacts: analysis.keyFacts
    });
    res.json(newIssue);
  });

  app.post("/api/issues/:id/approve", async (req, res) => {
    const issue = await storage.approveIssue(Number(req.params.id));
    res.json(issue);
  });

  // Solutions
  app.get("/api/issues/:issueId/solutions", async (req, res) => {
    const solutions = await storage.getSolutions(Number(req.params.issueId));
    res.json(solutions);
  });

  app.post("/api/solutions", async (req, res) => {
    const solution = insertSolutionSchema.parse(req.body);
    const newSolution = await storage.createSolution(solution);
    res.json(newSolution);
  });

  app.post("/api/solutions/:id/approve", async (req, res) => {
    const solution = await storage.approveSolution(Number(req.params.id));
    res.json(solution);
  });

  // AI matching
  app.post("/api/match-solutions", async (req, res) => {
    const { description } = req.body;
    const matches = await matchSolutions(description);
    res.json(matches);
  });

  const httpServer = createServer(app);
  return httpServer;
}
