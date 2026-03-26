import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    condition TEXT NOT NULL,
    description TEXT NOT NULL,
    isFeatured INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    photoURL TEXT
  );

  CREATE TABLE IF NOT EXISTS sellRequests (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    userName TEXT NOT NULL,
    deviceName TEXT NOT NULL,
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    estimatedPrice REAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    createdAt TEXT NOT NULL,
    image TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products ORDER BY name").all();
    res.json(products);
  });

  app.post("/api/products/seed", (req, res) => {
    const products = req.body;
    const insert = db.prepare(`
      INSERT OR REPLACE INTO products (id, name, price, category, image, condition, description, isFeatured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(item.id, item.name, item.price, item.category, item.image, item.condition, item.description, item.isFeatured ? 1 : 0);
      }
    });

    transaction(products);
    res.json({ status: "ok", count: products.length });
  });

  app.get("/api/users/:uid", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE uid = ?").get(req.params.uid);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/users", (req, res) => {
    const { uid, name, email, role, photoURL } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO users (uid, name, email, role, photoURL)
      VALUES (?, ?, ?, ?, ?)
    `).run(uid, name, email, role || 'user', photoURL || null);
    res.json({ status: "ok" });
  });

  app.get("/api/sell-requests", (req, res) => {
    const userId = req.query.userId as string;
    let requests;
    if (userId) {
      requests = db.prepare("SELECT * FROM sellRequests WHERE userId = ? ORDER BY createdAt DESC").all(userId);
    } else {
      requests = db.prepare("SELECT * FROM sellRequests ORDER BY createdAt DESC").all();
    }
    res.json(requests);
  });

  app.post("/api/sell-requests", (req, res) => {
    const { id, userId, userName, deviceName, category, condition, estimatedPrice, status, createdAt, image } = req.body;
    db.prepare(`
      INSERT INTO sellRequests (id, userId, userName, deviceName, category, condition, estimatedPrice, status, createdAt, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, userName, deviceName, category, condition, estimatedPrice, status || 'Pending', createdAt, image || null);
    res.json({ status: "ok" });
  });

  app.patch("/api/sell-requests/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE sellRequests SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
