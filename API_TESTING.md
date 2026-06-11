# Testing Your API

Once the API is running on http://localhost:3000, you can test it with these commands.

## Health Check

```powershell
curl http://localhost:3000/health
```

Response:
```json
{
  "statusCode": 200,
  "message": "OK"
}
```

---

## Sign Up (Create User)

```powershell
curl -X POST http://localhost:3000/auth/signup `
  -H "Content-Type: application/json" `
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePassword123"
  }'
```

Response:
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "username": "testuser",
    "createdAt": "2026-06-10T12:00:00.000Z",
    "updatedAt": "2026-06-10T12:00:00.000Z",
    "lastLoginAt": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Login

```powershell
curl -X POST http://localhost:3000/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

Response: (same as signup, returns token)

---

## Get User Profile

```powershell
curl http://localhost:3000/users/profile `
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Get Wallet Balance

```powershell
curl http://localhost:3000/users/wallet `
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Claim Daily Bonus

```powershell
curl -X POST http://localhost:3000/bonus/daily-login `
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Check if Can Claim Bonus

```powershell
curl http://localhost:3000/bonus/can-claim `
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Get Bonus History

```powershell
curl http://localhost:3000/bonus/history `
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Using Postman

Instead of curl, you can use Postman (easier for testing):

1. Download Postman: https://www.postman.com/downloads/
2. Create a new collection called "Whiskey Bent API"
3. Add requests:
   - **GET** `/health` (no auth)
   - **POST** `/auth/signup` (no auth)
   - **POST** `/auth/login` (no auth)
   - **GET** `/users/profile` (Bearer token)
   - **POST** `/bonus/daily-login` (Bearer token)

### Postman Setup:

1. In Postman, go to Authorization tab
2. Set Type to "Bearer Token"
3. Paste your JWT token in the "Token" field
4. It automatically adds: `Authorization: Bearer <your_token>`

---

## Common Errors

### 500 Internal Server Error
```
Error: Cannot find module '@whiskey-bent/database'
```
**Solution:** Database package not linked. Run: `npm install`

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** PostgreSQL not running or DATABASE_URL incorrect. Run: `test-database.bat`

### Invalid JWT Token
```
Error: Unauthorized
```
**Solution:** Token expired (7 day expiry) or invalid. Get a new token by logging in again.

### Port 3000 Already in Use
```
Error: EADDRINUSE: address already in use :::3000
```
**Solution:** 
```powershell
# Find process
netstat -ano | findstr :3000

# Kill it (replace XXXX with PID)
taskkill /PID XXXX /F
```

---

## Database Debugging

### View Database with Prisma Studio

```powershell
npm run db:studio
```

Opens http://localhost:5555 - browse your database visually

### Check Database Migrations

```powershell
cd packages/database
npx prisma migrate status
```

### Rollback Database (WARNING: Deletes Data)

```powershell
cd packages/database
npx prisma migrate reset
```

---

## Next Steps

1. Create test users via `/auth/signup`
2. Test bonus system via `/bonus/daily-login`
3. Verify wallet updates
4. Ready for games implementation!

See `GAMES_IMPLEMENTATION_PLAN.md` for next features.
