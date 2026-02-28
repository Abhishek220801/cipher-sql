# API Documentation

Base URL: `/api/v1/query`  
Auth required: `Authorization: Bearer <token>` header **or** auth cookie set by server .

---

## 1) Load Database

**Endpoint**: `POST /api/v1/query/load`  
**Request Body**: none

### Success (`201`)
```json
{
  "success": true,
  "message": "Database created successfully",
  "data": {
    "_id": "69a2fd0099b13b88a525ec84",
    "schema": [
      {
        "name": "users",
        "columns": {
          "id": "INTEGER",
          "name": "TEXT",
          "email": "TEXT",
          "created_at": "DATETIME"
        }
      },
      {
        "name": "products",
        "columns": {
          "id": "INTEGER",
          "name": "TEXT",
          "price": "REAL",
          "stock": "INTEGER",
          "created_at": "DATETIME"
        }
      },
      {
        "name": "categories",
        "columns": {
          "id": "INTEGER",
          "name": "TEXT"
        }
      },
      {
        "name": "product_categories",
        "columns": {
          "product_id": "INTEGER",
          "category_id": "INTEGER"
        }
      },
      {
        "name": "orders",
        "columns": {
          "id": "INTEGER",
          "user_id": "INTEGER",
          "total": "REAL",
          "status": "TEXT",
          "created_at": "DATETIME"
        }
      },
      {
        "name": "order_items",
        "columns": {
          "id": "INTEGER",
          "order_id": "INTEGER",
          "product_id": "INTEGER",
          "quantity": "INTEGER",
          "price": "REAL"
        }
      }
    ],
    "expires": "2026-02-28T14:35:40.530Z"
  },
  "statusCode": 201
}
```

### Errors
- `401` Unauthorized (invalid/expired token)

---

## 2) Execute Query

**Endpoint**: `POST /api/v1/query/exec`  
**Request Body**:

```json
{
  "query": "SELECT * FROM users;"
}
```

### Success (`200`)
```json
{
  "success": true,
  "message": "Query executed successfully",
  "data": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "created_at": "2026-02-28 14:31:17"
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "email": "bob@example.com",
      "created_at": "2026-02-28 14:31:17"
    },
    {
      "id": 3,
      "name": "Charlie Brown",
      "email": "charlie@example.com",
      "created_at": "2026-02-28 14:31:17"
    }
  ],
  "statusCode": 200
}
```

> `data` changes based on SQL in `query`.

### Errors
- `400` Bad query
- `401` Unauthorized (invalid/expired token)
- `408` Data/database session closed

---

## Common Error Format

(From `ApiError.toJSON()`)

```json
{
  "success": false,
  "data": null,
  "statusCode": 400,
  "message": "Error message",
  "errors": []
}
```