# Fastest Way to Get Running (5 minutes)

## Step 1: Get a FREE Cloud Database (2 minutes)

**Go to: https://neon.tech**

1. Click "Sign Up" (use GitHub login - fastest)
2. Create a new project
3. Copy the connection string (looks like this):
   ```
   postgresql://neondb_owner:password@ep-xxx.us-east-1.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Update .env File

In the file `.env` in your project root, replace:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whiskey_bent
```

With the Neon connection string you copied. It should look like:

```
DATABASE_URL=postgresql://neondb_owner:password@ep-xxx.us-east-1.neon.tech/neondb?sslmode=require
```

**Save the file.**

---

## Step 3: Run Migrations

```powershell
npm run db:migrate
```

This sets up all database tables.

---

## Step 4: Start the Application

```powershell
npm run start
```

You should see:
```
API running on port 3000
```

---

## Step 5: Test It

Open browser: **http://localhost:3000/health**

You should see:
```json
{
  "statusCode": 200,
  "message": "OK"
}
```

---

## 🎉 Done! Your App is Running

- **API**: http://localhost:3000
- **Test signup**: POST to http://localhost:3000/auth/signup
- **Database**: Connected to Neon cloud

---

## Alternative: Use Railway Instead of Neon

If Neon doesn't work, try **Railway.app**:

1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Provision PostgreSQL
4. Copy database URL
5. Paste into .env same as above
6. Done!

Both are free and ready in 2 minutes.
