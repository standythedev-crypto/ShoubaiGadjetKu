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
    specs TEXT,
    stock INTEGER DEFAULT 0,
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
    const products = db.prepare("SELECT * FROM products ORDER BY name").all() as any[];
    res.json(products.map(p => ({
      ...p,
      specs: p.specs ? JSON.parse(p.specs) : undefined,
      isFeatured: !!p.isFeatured
    })));
  });

  app.post("/api/products/seed", (req, res) => {
    const products = req.body;
    const insert = db.prepare(`
      INSERT OR REPLACE INTO products (id, name, price, category, image, condition, description, specs, stock, isFeatured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          item.id, 
          item.name, 
          item.price, 
          item.category, 
          item.image, 
          item.condition, 
          item.description, 
          item.specs ? JSON.stringify(item.specs) : null,
          item.stock || 0,
          item.isFeatured ? 1 : 0
        );
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
    const id = req.params.id;
    
    const transaction = db.transaction(() => {
      const result = db.prepare("UPDATE sellRequests SET status = ? WHERE id = ?").run(status, id);
      
      if (result.changes === 0) {
        throw new Error("Sell request not found");
      }

      if (status === 'Approved') {
        const request = db.prepare("SELECT * FROM sellRequests WHERE id = ?").get(id) as any;
        if (request) {
          // Create a product from the approved sell request
          db.prepare(`
            INSERT OR REPLACE INTO products (id, name, price, category, image, condition, description, specs, stock, isFeatured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            `p-${request.id}`,
            request.deviceName,
            request.estimatedPrice,
            request.category,
            request.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
            request.condition,
            `Certified pre-owned ${request.deviceName} in ${request.condition} condition. Verified by our experts.`,
            null,
            1,
            0
          );
        }
      }
    });

    try {
      transaction();
      res.json({ status: "ok" });
    } catch (error: any) {
      if (error.message === "Sell request not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
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
