# Whiskey Bent Social Poker - Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, ensure the following are completed:

### ✅ Environment Setup
- [ ] Copy `.env.example` to `.env` for each environment
- [ ] Set strong `JWT_SECRET` value (minimum 32 characters)
- [ ] Configure PostgreSQL `DATABASE_URL` with production database
- [ ] Set `NODE_ENV=production`
- [ ] Configure `NEXT_PUBLIC_API_URL` to match production domain
- [ ] Store secrets in a secure secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)

### ✅ Database
- [ ] PostgreSQL server is running and accessible
- [ ] Database user has appropriate permissions
- [ ] Run migrations: `pnpm run db:migrate`
- [ ] Verify database backups are configured

### ✅ Code Quality
- [ ] All tests pass: `pnpm test`
- [ ] Linting passes: `pnpm lint`
- [ ] TypeScript compilation succeeds: `pnpm build`
- [ ] No security vulnerabilities: `pnpm audit`

### ✅ Build Artifacts
- [ ] All packages built: `pnpm build`
- [ ] Verify dist directories exist in:
  - `packages/database/dist`
  - `packages/types/dist`
  - `packages/ui/dist`
  - `apps/api/dist`
  - `apps/realtime/dist`

---

## Deployment Methods

### Method 1: Standalone Servers (Recommended for Single-Region)

#### Prerequisites
- Node.js 20+ installed
- PNPM package manager
- PostgreSQL 14+ running

#### Steps

1. **Clone repository and install dependencies**
   ```bash
   git clone <repository-url>
   cd whiskey-bent-social-poker
   cp .env.example .env
   # Edit .env with production values
   pnpm install --frozen-lockfile
   ```

2. **Build the application**
   ```bash
   pnpm run prepare:deploy
   ```

3. **Start services**
   
   In production, use a process manager like PM2 or systemd:
   
   **Using PM2:**
   ```bash
   npm install -g pm2
   pm2 start apps/api/dist/main.js --name "whiskey-api"
   pm2 start apps/realtime/dist/main.js --name "whiskey-realtime"
   pm2 save
   pm2 startup
   ```

   **Using systemd (Linux):**
   Create `/etc/systemd/system/whiskey-api.service`:
   ```ini
   [Unit]
   Description=Whiskey Bent API
   After=network.target

   [Service]
   Type=simple
   User=whiskey
   WorkingDirectory=/opt/whiskey-bent
   ExecStart=/usr/bin/node apps/api/dist/main.js
   Environment="NODE_ENV=production"
   EnvironmentFile=/opt/whiskey-bent/.env
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

---

### Method 2: Docker Containerization

#### Dockerfile for API

Create `Dockerfile.api`:
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build:prod

# Runtime stage
FROM node:20-alpine
WORKDIR /app

RUN npm install -g pm2
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

Build and run:
```bash
docker build -f Dockerfile.api -t whiskey-api:latest .
docker run -d \
  --env-file .env \
  --network host \
  --name whiskey-api \
  whiskey-api:latest
```

---

### Method 3: Cloud Deployment (AWS Example)

#### Using AWS AppRunner

1. **Create ECR repository**
   ```bash
   aws ecr create-repository --repository-name whiskey-bent-api
   ```

2. **Build and push Docker image**
   ```bash
   docker build -f Dockerfile.api -t whiskey-api:latest .
   docker tag whiskey-api:latest <AWS_ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/whiskey-bent-api:latest
   aws ecr get-login-password | docker login --username AWS --password-stdin <AWS_ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com
   docker push <AWS_ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/whiskey-bent-api:latest
   ```

3. **Deploy to AppRunner**
   ```bash
   aws apprunner create-service \
     --service-name whiskey-api \
     --source-configuration ImageRepository='{RepositoryUrl=<ECR_URL>,ImageIdentifier=latest,ImageRepositoryType=ECR}'
   ```

#### Using AWS RDS for PostgreSQL
```bash
aws rds create-db-instance \
  --db-instance-identifier whiskey-db \
  --db-instance-class db.t4g.small \
  --engine postgres \
  --master-username postgres \
  --master-user-password '<STRONG_PASSWORD>'
```

---

## Scaling Considerations

### Stateless API Design
- ✅ API is stateless and can be scaled horizontally
- ✅ Use a load balancer (AWS ALB, nginx) to distribute traffic
- ✅ Scale based on CPU/memory metrics

### Database Scaling
- Use RDS with read replicas for read-heavy workloads
- Enable automated backups
- Monitor slow queries and optimize

### Real-time Service Scaling
- WebSocket service can be scaled with sticky sessions
- Use AWS NLB for WebSocket load balancing
- Consider Redis for pub/sub if multiple instances

---

## Monitoring & Health Checks

### Health Check Endpoints
Add to API:
```typescript
@Get('/health')
health() {
  return { status: 'ok', timestamp: new Date() };
}
```

### Monitoring
- Monitor application logs (CloudWatch, ELK, etc.)
- Track error rates and response times
- Monitor database performance
- Set up alerts for critical issues

### Log Aggregation
- Centralize logs using ELK Stack, Datadog, or CloudWatch
- Track API request/response patterns
- Monitor authentication and authorization events

---

## Security Hardening

### Before Production
1. **Rotate secrets**
   - Generate new JWT_SECRET
   - Use strong database passwords
   - Rotate credentials every 90 days

2. **Enable HTTPS/TLS**
   - Use AWS Certificate Manager for free certificates
   - Enforce HTTPS redirects

3. **Database Security**
   - Use VPC for database isolation
   - Enable encryption at rest and in transit
   - Restrict database access by IP

4. **API Security**
   - Enable rate limiting
   - Implement CORS properly
   - Add request validation

5. **Infrastructure Security**
   - Run services in VPC
   - Use security groups to restrict ports
   - Enable VPC Flow Logs for monitoring
   - Use NAT gateways for outbound traffic

---

## Rollback Plan

### Version Management
```bash
# Tag releases
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0

# Deploy specific version
git checkout v1.0.0
pnpm install
pnpm build
# Deploy...
```

### Rollback Procedure
1. Identify the issue in current deployment
2. Checkout previous working version
3. Re-run deployment procedure
4. Verify service health
5. Document incident for post-mortem

---

## Troubleshooting

### Database Migration Errors
```bash
# Check migration status
pnpm run db:studio

# Rollback last migration
cd packages/database
pnpm run migrate -- --skip-generate reset
```

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### JWT Authentication Issues
- Verify JWT_SECRET is set correctly
- Check token expiration (default: 7 days)
- Verify Authorization header format: `Bearer <token>`

---

## Success Indicators

- ✅ API responds to requests (check `/health`)
- ✅ Database migrations complete successfully
- ✅ JWT token generation works
- ✅ User signup flow completes with bonus awarded
- ✅ Login flow works and tokens validate
- ✅ Real-time WebSocket connections established
- ✅ No errors in application logs
