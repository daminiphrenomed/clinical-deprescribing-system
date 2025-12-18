# Deployment Guide

## Quick Deploy to Vercel (Recommended for Prototype)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- OpenAI API key (optional, for AI insights)

### Steps

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/daminiphrenomed/clinical-deprescribing-system.git
   cd clinical-deprescribing-system
   ```

2. **Deploy to Vercel**
   
   **Option A: Using Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

   **Option B: Using Vercel Dashboard**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     OPENAI_API_KEY=sk-your-key-here (optional)
     JWT_SECRET=your-random-secret-key
     NODE_ENV=production
     ```

4. **Access Your App**
   - Your app will be live at: `https://your-project.vercel.app`
   - Login with demo credentials:
     - Email: demo@clinician.com
     - Password: demo123

## Local Development

### Setup
```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## Production Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel)**
- Deploy client folder to Vercel
- Set API_URL environment variable

**Backend (Railway)**
- Deploy server folder to Railway
- Add PostgreSQL database
- Set environment variables

### Option 2: AWS

**Frontend (S3 + CloudFront)**
```bash
cd client
npm run build
aws s3 sync build/ s3://your-bucket
```

**Backend (Elastic Beanstalk or Lambda)**
- Package server code
- Deploy to EB or Lambda
- Configure RDS for database

### Option 3: Docker

```bash
# Build images
docker build -t deprescribing-client ./client
docker build -t deprescribing-server ./server

# Run containers
docker-compose up
```

## Database Setup (Production)

For production, replace in-memory storage with PostgreSQL:

```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  age INTEGER,
  weight DECIMAL,
  renal_function DECIMAL,
  conditions JSONB,
  fall_history BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medications (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  name VARCHAR(255),
  dose VARCHAR(100),
  frequency VARCHAR(100),
  indication VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analyses (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Checklist

- [ ] Enable HTTPS
- [ ] Set strong JWT_SECRET
- [ ] Implement proper authentication
- [ ] Add rate limiting
- [ ] Enable CORS properly
- [ ] Sanitize user inputs
- [ ] Add audit logging
- [ ] Implement HIPAA compliance measures

## Monitoring

- Set up error tracking (Sentry)
- Configure uptime monitoring
- Enable application logs
- Track API usage
- Monitor AI API costs

## Support

For issues or questions:
- GitHub Issues: https://github.com/daminiphrenomed/clinical-deprescribing-system/issues
- Email: support@example.com