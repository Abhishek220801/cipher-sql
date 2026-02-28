import Database from "better-sqlite3";
import asyncHandler from "../lib/asyncHandler.js";
import ApiSuccess from "../lib/ApiSuccess.js";
import Instance from "../models/instance.model.js";
import User from "../models/user.model.js";
import fs from "fs/promises";
import ApiError from "../lib/ApiError.js";

const initDB = async (filePath) => {
  const db = new Database(filePath);

  db.exec(`PRAGMA foreign_keys = ON;`);

  const seed = db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS product_categories (
        product_id INTEGER,
        category_id INTEGER,
        PRIMARY KEY (product_id, category_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    db.exec(`
      DELETE FROM order_items;
      DELETE FROM orders;
      DELETE FROM product_categories;
      DELETE FROM categories;
      DELETE FROM products;
      DELETE FROM users;
    `);

    // ---------- SEED DATA ----------

    db.exec(`
      INSERT INTO users (name, email) VALUES
      ('Alice Johnson', 'alice@example.com'),
      ('Bob Smith', 'bob@example.com'),
      ('Charlie Brown', 'charlie@example.com');

      INSERT INTO categories (name) VALUES
      ('Electronics'),
      ('Books'),
      ('Clothing');

      INSERT INTO products (name, price, stock) VALUES
      ('Laptop', 999.99, 10),
      ('Headphones', 199.99, 25),
      ('T-Shirt', 29.99, 100),
      ('Programming Book', 49.99, 50);

      INSERT INTO product_categories (product_id, category_id) VALUES
      (1, 1),
      (2, 1),
      (3, 3),
      (4, 2);

      INSERT INTO orders (user_id, total, status) VALUES
      (1, 1199.98, 'completed'),
      (2, 29.99, 'pending');

      INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
      (1, 1, 1, 999.99),
      (1, 2, 1, 199.99),
      (2, 3, 1, 29.99);
    `);
  });

  seed();
  db.close();

  return (dbInstance) => {
    setTimeout(async () => {
      try {
        const path = dbInstance.path;
        dbInstance.isClosed = true;
        dbInstance.expires = null;
        await dbInstance.save();

        if (path) {
          fs.rm(path)
            .then(() => {
              Instance.findByIdAndDelete(dbInstance._id)
                .then(() => {
                  User.findByIdAndUpdate(dbInstance.userId, {
                    $set: { db: null },
                  }).catch((err) => {
                    console.error("Error updating user database reference:", err);
                  });
                })
                .catch((err) => {
                  console.error("Error deleting database instance:", err);
                });
            })
            .catch((err) => {
              if (err) {
                console.error("Error deleting database file:", err);
              }
            });
        }
      } catch (error) {
        console.error("Error saving db instance:", error);
      }
    }, parseInt(process.env.DB_EXPIRES_MS));
  };
};

const getDBSchema = (filePath) => {
  const db = new Database(filePath, {
    timeout: 5000,
  });

  try {
    const raw_tables = db
      .prepare(
        `
      SELECT json_group_array(
        json_object(
          'name', m.name,
          'columns', (
            SELECT json_group_object(p.name, p.type)
            FROM pragma_table_info(m.name) p
          )
        )
      ) AS result
      FROM sqlite_master m
      WHERE m.type = 'table'
      AND m.name != 'sqlite_sequence';
      `,
      )
      .get();

    return raw_tables?.result ? JSON.parse(raw_tables.result) : [];
  } catch (err) {
    console.error("Error getting DB schema:", err);
    return null;
  } finally {
    db.close();
  }
};

const loadDB = asyncHandler(async (req, res) => {
  const db = await Instance.findById(req.user.db);

  if (db && !db.isClosed) {
    return res.json(
      new ApiSuccess(200, "Database loaded successfully", {
        _id: db._id,
        schema: getDBSchema(db.path),
        expires: db.expires,
      }),
    );
  }

  const filePath = `${process.env.DB_PATH}/${req.user._id}.db`;
  let initDbTimeout;
  try {
    await fs.writeFile(filePath, "");
    initDbTimeout = await initDB(filePath);
  } catch (error) {
    throw new ApiError(500, "DB creation failed");
  }

  const newInstance = await Instance.create({
    path: filePath,
    userId: req.user._id,
    expires: new Date(Date.now() + parseInt(process.env.DB_EXPIRES_MS)), 
  });

  req.user.db = newInstance._id;
  await req.user.save();

  initDbTimeout(newInstance); 

  return res.json(
    new ApiSuccess(201, "Database created successfully", {
      _id: newInstance._id,
      schema: getDBSchema(filePath),
      expires: newInstance.expires,
    }),
  );
});

const execQuery = asyncHandler(async (req, res) => {
  let { query } = req.body;

  if (!query || !query.trim() || typeof query !== "string") {
    throw new ApiError(400, "Invalid query");
  }

  const dbInfo = await Instance.findById(req.user.db);

  if (!dbInfo || dbInfo.isClosed) {
    throw new ApiError(408, "Database is closed load a new one");
  }

  const db = new Database(dbInfo.path, {
    timeout: 5000,
  });

  try {
    const stmt = db.prepare(query.trim());
    const result = stmt.reader ? stmt.all() : stmt.run();

    return res.json(new ApiSuccess(200, "Query executed successfully", result));
  } catch (error) {
    throw new ApiError(400, error.message || "Query execution failed");
  } finally {
    db.close();
  }
});

export { loadDB, execQuery };
