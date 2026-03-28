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
    image TEXT,
    specs TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    userId TEXT NOT NULL,
    userName TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id),
    FOREIGN KEY (userId) REFERENCES users(uid)
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    userId TEXT NOT NULL,
    productId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    PRIMARY KEY (userId, productId),
    FOREIGN KEY (userId) REFERENCES users(uid),
    FOREIGN KEY (productId) REFERENCES products(id)
  );
`);

// Migration: Ensure 'userName' and 'specs' columns exist in 'sellRequests' table if it was created earlier without them
try {
  const tableInfo = db.prepare("PRAGMA table_info(sellRequests)").all() as any[];
  const columns = tableInfo.map(col => col.name);
  
  if (!columns.includes('userName')) {
    db.prepare("ALTER TABLE sellRequests ADD COLUMN userName TEXT NOT NULL DEFAULT 'User'").run();
    console.log("Added 'userName' column to 'sellRequests' table");
  }
  
  if (!columns.includes('specs')) {
    db.prepare("ALTER TABLE sellRequests ADD COLUMN specs TEXT").run();
    console.log("Added 'specs' column to 'sellRequests' table");
  }
} catch (error) {
  console.error("Migration error:", error);
}

// Update iPhone 15 Pro Max image if it's the old one
try {
  db.prepare(`
    UPDATE products 
    SET image = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'
    WHERE id = 'iphone-15-pro-max'
  `).run();
} catch (error) {
  console.error("Error updating iPhone 15 Pro Max image:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare(`
      SELECT p.*, 
             AVG(r.rating) as rating, 
             COUNT(r.id) as reviewCount
      FROM products p
      LEFT JOIN reviews r ON p.id = r.productId
      GROUP BY p.id
      ORDER BY p.name
    `).all() as any[];
    res.json(products.map(p => ({
      ...p,
      specs: p.specs ? JSON.parse(p.specs) : undefined,
      isFeatured: !!p.isFeatured,
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0
    })));
  });

  app.get("/api/products/:id", (req, res) => {
    const product = db.prepare(`
      SELECT p.*, 
             AVG(r.rating) as rating, 
             COUNT(r.id) as reviewCount
      FROM products p
      LEFT JOIN reviews r ON p.id = r.productId
      WHERE p.id = ?
      GROUP BY p.id
    `).get(req.params.id) as any;

    if (product) {
      res.json({
        ...product,
        specs: product.specs ? JSON.parse(product.specs) : undefined,
        isFeatured: !!product.isFeatured,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0
      });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.get("/api/reviews/:productId", (req, res) => {
    const reviews = db.prepare("SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC").all(req.params.productId);
    res.json(reviews);
  });

  app.post("/api/reviews", (req, res) => {
    try {
      const { id, productId, userId, userName, rating, comment, createdAt } = req.body;
      db.prepare(`
        INSERT INTO reviews (id, productId, userId, userName, rating, comment, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, productId, userId, userName, rating, comment, createdAt);
      res.json({ status: "ok" });
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Wishlist Endpoints
  app.get("/api/wishlist/:userId", (req, res) => {
    const { userId } = req.params;
    const wishlist = db.prepare(`
      SELECT p.*, 
             (SELECT AVG(rating) FROM reviews WHERE productId = p.id) as rating,
             (SELECT COUNT(*) FROM reviews WHERE productId = p.id) as reviewCount
      FROM products p
      JOIN wishlist w ON p.id = w.productId
      WHERE w.userId = ?
    `).all(userId) as any[];
    res.json(wishlist.map(p => ({
      ...p,
      specs: p.specs ? JSON.parse(p.specs) : undefined,
      isFeatured: !!p.isFeatured
    })));
  });

  app.post("/api/wishlist", (req, res) => {
    const { userId, productId } = req.body;
    const createdAt = new Date().toISOString();
    try {
      db.prepare(`
        INSERT OR IGNORE INTO wishlist (userId, productId, createdAt)
        VALUES (?, ?, ?)
      `).run(userId, productId, createdAt);
      res.json({ status: "ok" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/wishlist/:userId/:productId", (req, res) => {
    const { userId, productId } = req.params;
    try {
      db.prepare("DELETE FROM wishlist WHERE userId = ? AND productId = ?").run(userId, productId);
      res.json({ status: "ok" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
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
    let requests: any[];
    if (userId) {
      requests = db.prepare("SELECT * FROM sellRequests WHERE userId = ? ORDER BY createdAt DESC").all(userId) as any[];
    } else {
      requests = db.prepare("SELECT * FROM sellRequests ORDER BY createdAt DESC").all() as any[];
    }
    res.json(requests.map(r => ({
      ...r,
      specs: r.specs ? JSON.parse(r.specs) : undefined
    })));
  });

  app.post("/api/sell-requests", (req, res) => {
    try {
      const { id, userId, userName, deviceName, category, condition, estimatedPrice, status, createdAt, image, specs } = req.body;
      db.prepare(`
        INSERT INTO sellRequests (id, userId, userName, deviceName, category, condition, estimatedPrice, status, createdAt, image, specs)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, 
        userId, 
        userName, 
        deviceName, 
        category, 
        condition, 
        estimatedPrice, 
        status || 'Pending', 
        createdAt, 
        image || null,
        specs ? JSON.stringify(specs) : null
      );
      res.json({ status: "ok" });
    } catch (error: any) {
      console.error("Error creating sell request:", error);
      res.status(500).json({ error: error.message });
    }
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
            request.specs || null,
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
