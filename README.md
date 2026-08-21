# ✨ Tasks — Beautiful Todo App

Minimal, fast todo app with JWT auth. Express + Mongoose + Vanilla JS frontend with glassmorphism UI.

Frontend lives at `http://localhost:3000` when the server is running — no separate dev server needed.

---

## Features

- **Auth** — Signup / Signin with JWT (`token` header)
- **Todos** — Create, list (per-user), delete with ownership check
- **Beautiful UI** — Dark mesh gradient, glass cards, responsive, Inter + Plus Jakarta Sans
- **Secure** — `authMiddleware` verifies JWT, `userId` isolation on all todo queries

## Tech Stack

`Node.js` `Express 5` `Mongoose 9` `jsonwebtoken` `dotenv` — Frontend: `HTML / CSS / Vanilla JS` (no build)

## Project Structure

```
todo/
├── index.js          # Express app + routes + static serving
├── models.js         # userModel, todoModel (Mongoose)
├── middleware.js     # authMiddleware (JWT verify)
├── public/
│   ├── index.html    # Auth + App SPA
│   ├── style.css     # Glass UI, gradients, responsive
│   └── app.js        # Fetch API, localStorage, render
├── .env              # PORT, MONGODB_URL, JWT_SECRET (gitignored)
├── .env.example      # Template
└── README.md
```

## Setup

### 1. Clone & install

```bash
npm install
```

### 2. Configure `.env`

Copy `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/todo
JWT_SECRET=your-super-secret-jwt-key-change-me
```

> `.env` is gitignored. Never commit `MONGODB_URL` or `JWT_SECRET`.

### 3. Run

```bash
npm start        # node index.js
# or
npm run dev      # node --watch index.js (auto-reload, Node 18+)
```

Server: `http://localhost:3000` — Frontend and API same origin (no CORS needed).

Verify:

```bash
curl http://localhost:3000/
```

## API Endpoints

Base: `http://localhost:3000`

Auth uses header: `token: <JWT>` (not `Authorization: Bearer`). The frontend stores the token from `POST /signin` in `localStorage`.

| Method | Path | Auth | Body | Success | Error |
|--------|------|------|------|---------|-------|
| **POST** | `/signup` | No | `{ username, password }` | `200 { id, message: "user has been created" }` | `409 { message: "user already exists" }` |
| **POST** | `/signin` | No | `{ username, password }` | `200 { token, userId, message: "signed in" }` | `404 username does not exist` <br> `401 incorrect password` |
| **POST** | `/todo` | Yes (`token`) | `{ title*, desc }` | `200 { todoId, message: "todo has been added" }` | `403 Token invalid` <br> `400 title required` |
| **GET** | `/todos` | Yes | — | `200 { todos: [...] , todo: [...] }` sorted newest first | `401 Token missing` <br> `403 jwt malformed` |
| **DELETE** | `/todo/:todoId` | Yes | — | `200 { message: "todo deleted", todoId }` | `404 todo does not exist` |

`*` required.

### Examples (curl)

**Signup:**
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'
```

**Signin:**
```bash
curl -X POST http://localhost:3000/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'
# -> { "token":"eyJhbGc...", "userId":"65f..." }
```

**Create todo:**
```bash
TOKEN=eyJhbGc...
curl -X POST http://localhost:3000/todo \
  -H "Content-Type: application/json" \
  -H "token: $TOKEN" \
  -d '{"title":"Buy milk","desc":"2 liters"}'
```

**List todos:**
```bash
curl http://localhost:3000/todos -H "token: $TOKEN"
```

**Delete todo:**
```bash
curl -X DELETE http://localhost:3000/todo/<todoId> -H "token: $TOKEN"
```

### Postman / Thunder Client

- `POST http://localhost:3000/todo` → Headers: `token: eyJhbGc...` (no `"` quotes) → Body JSON
- If you see `403 { error: "jwt malformed" }`, you copied `"` surrounding the token from `{"token":"eyJ..."}` — remove `"` . The middleware now auto-strips them but copy clean next time.

## Models

**`userModel` — collection `users`:**
```js
{
  username: String,
  password: String
}
```

**`todoModel` — collection `todos`:**
```js
{
  title: String,
  desc: String,
  userId: { type: ObjectId, ref: "users", required: true, index: true }
}
```

All todo queries are scoped: `find({ userId: req.userId })`, `findOneAndDelete({ _id: todoId, userId })` — user can only see/delete own todos.

## Frontend

`public/` is served via `express.static`. Open `http://localhost:3000`:

1. **Auth** — Toggle Sign in / Sign up, form calls `/signup` or `/signin`, stores `token` + `username` in `localStorage`.
2. **App** — `GET /todos` on load, `POST /todo` on Add, `DELETE /todo/:id` on ✕, greeting + count pill.
3. **Session** — If `token` exists on load, app jumps to todo view. Logout clears storage.

No build step — just vanilla JS `fetch`.

## Middleware

`middleware.js:authMiddleware`:
- Reads `req.headers.token`, strips surrounding `"` and trims.
- `jwt.verify(token, JWT_SECRET)` with `try/catch` → `401` missing, `403` invalid/malformed (prevents `500`).
- Sets `req.userId = decoded.userId`, calls `next()`.

## Env Variables

| Var | Description | Default |
|-----|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URL` | MongoDB Atlas connection string | — (required) |
| `JWT_SECRET` | Secret for `jwt.sign`/`verify` | `key` |

Change `JWT_SECRET` before production — invalidates old tokens.

## Troubleshooting

- `ERR_REQUIRE_ASYNC_MODULE` → you put `await` at top-level in a `require()`’d file. `await mongoose.connect` must be inside `async start()` in `index.js`, not in `models.js`.
- `500` on `/todos` or `/todo` → invalid token without `try/catch`. Fixed in `middleware.js`.
- `[]` always empty → you queried `find({ _id: userId })` instead of `find({ userId })`.

## License

MIT
