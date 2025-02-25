import { 
  User, InsertUser, Topic, InsertTopic,
  Issue, InsertIssue, Solution, InsertSolution 
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Topics
  getTopics(): Promise<Topic[]>;
  getTopic(id: number): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;

  // Issues
  getIssues(topicId?: number): Promise<Issue[]>;
  getIssue(id: number): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  approveIssue(id: number): Promise<Issue>;

  // Solutions
  getSolutions(issueId: number): Promise<Solution[]>;
  createSolution(solution: InsertSolution): Promise<Solution>;
  approveSolution(id: number): Promise<Solution>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private topics: Map<number, Topic>;
  private issues: Map<number, Issue>;
  private solutions: Map<number, Solution>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.topics = new Map();
    this.issues = new Map();
    this.solutions = new Map();
    this.currentIds = { users: 1, topics: 1, issues: 1, solutions: 1 };

    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true
    } as InsertUser);

    // Create default topics focused on Indonesia
    [
      { name: "Politics & Governance", description: "Political issues and governance challenges in Indonesia" },
      { name: "Economic Development", description: "Economic challenges and opportunities in Indonesian market" },
      { name: "Environmental Sustainability", description: "Environmental issues and conservation in Indonesian archipelago" },
      { name: "Social Development", description: "Social issues and community development across Indonesian regions" },
      { name: "Technology & Innovation", description: "Digital transformation and tech adoption in Indonesia" }
    ].forEach(topic => this.createTopic(topic));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Topics
  async getTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async getTopic(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const id = this.currentIds.topics++;
    const newTopic = { ...topic, id };
    this.topics.set(id, newTopic);
    return newTopic;
  }

  // Issues
  async getIssues(topicId?: number): Promise<Issue[]> {
    const issues = Array.from(this.issues.values());
    return topicId ? issues.filter(i => i.topicId === topicId) : issues;
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    return this.issues.get(id);
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const id = this.currentIds.issues++;
    const newIssue = { 
      ...issue, 
      id,
      approved: false,
      createdAt: new Date()
    };
    this.issues.set(id, newIssue);
    return newIssue;
  }

  async approveIssue(id: number): Promise<Issue> {
    const issue = this.issues.get(id);
    if (!issue) throw new Error("Issue not found");
    const updatedIssue = { ...issue, approved: true };
    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  // Solutions
  async getSolutions(issueId: number): Promise<Solution[]> {
    return Array.from(this.solutions.values()).filter(
      s => s.issueId === issueId
    );
  }

  async createSolution(solution: InsertSolution): Promise<Solution> {
    const id = this.currentIds.solutions++;
    const newSolution = { 
      ...solution, 
      id, 
      approved: false,
      rejected: false 
    };
    this.solutions.set(id, newSolution);
    console.log("Created solution:", newSolution);
    return newSolution;
  }

  async approveSolution(id: number): Promise<Solution> {
    const solution = this.solutions.get(id);
    if (!solution) throw new Error(`Solution ${id} not found`);
    const updatedSolution = { 
      ...solution, 
      approved: true,
      rejected: false
    };
    this.solutions.set(id, updatedSolution);
    console.log("Approved solution:", updatedSolution);
    return updatedSolution;
  }

  async rejectSolution(id: number): Promise<Solution> {
    const solution = this.solutions.get(id);
    if (!solution) {
      throw new Error(`Solution ${id} not found`);
    }
    const updatedSolution = { 
      ...solution, 
      approved: false,
      rejected: true 
    };
    this.solutions.set(id, updatedSolution);
    console.log("Rejected solution:", updatedSolution);
    return updatedSolution;
  }

  async deleteSolution(id: number): Promise<{ success: boolean; message?: string }> {
    if (!this.solutions.has(id)) {
      console.log(`Solution ${id} not found for deletion`);
      return { success: false, message: `Solution ${id} not found` };
    }
    
    try {
      const deleted = this.solutions.delete(id);
      console.log(`Solution ${id} deletion result:`, deleted);
      if (!deleted) {
        throw new Error(`Failed to delete solution ${id}`);
      }
      return { success: true };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Delete error for solution ${id}:`, errorMessage);
      return { success: false, message: errorMessage };
    }
  }
}

export const storage = new MemStorage();
export async function seedSampleData() {
  // Add sample topics
  const webDevTopic = await storage.createTopic({
    name: "Web Development",
    description: "Issues and solutions related to web development"
  });

  const aiTopic = await storage.createTopic({
    name: "AI & Machine Learning",
    description: "Problems and solutions in AI/ML implementations"
  });

  // Add sample issues
  await storage.createIssue({
    title: "React Component Re-rendering Issue",
    content: "My React components are re-rendering too frequently, causing performance issues. I've noticed this especially in a large list component with multiple state updates.",
    topicId: webDevTopic.id,
    keyFacts: [
      "Components re-render on every state change",
      "Performance degrades with large lists",
      "Multiple setState calls in useEffect"
    ]
  });

  await storage.createIssue({
    title: "GPT API Token Usage Optimization",
    content: "Our application is consuming too many tokens in GPT API calls. We need to optimize the prompts and response handling to reduce costs while maintaining quality.",
    topicId: aiTopic.id,
    keyFacts: [
      "High token consumption in API calls",
      "Need to optimize prompt engineering",
      "Cost reduction while maintaining quality"
    ]
  });
}