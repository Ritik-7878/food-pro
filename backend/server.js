const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const { z } = require('zod');
const { Pool } = require('pg');
const pgConnectionString = require('pg-connection-string');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// BigInt serialization helper for Express JSON responses
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// CORS configuration (limit only to frontend origin in production)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'production') {
      if (origin === FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiting for sensitive authentication endpoints (max 5 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per 15 minutes
  message: {
    error: "Too many login/registration attempts from this IP, please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Session middleware (required by Passport.js for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'foodpro-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization (minimal — we use JWTs, not sessions for auth state)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================================
// Zod Validation Schemas
// ============================================================

const registerSchema = z.object({
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  password: z.string().min(1, "Password is required."),
});

const productionLineSchema = z.object({
  name: z.string().min(1, "Name must be a non-empty string."),
  status: z.enum(["Running", "Paused", "Stopped"], {
    errorMap: () => ({ message: "Status must be one of: Running, Paused, Stopped." }),
  }),
  progress: z.coerce.number().min(0, "Progress must be at least 0.").max(100, "Progress must be at most 100."),
  temp: z.string().min(1, "Temperature must be a non-empty value."),
});

const productionLinePartialSchema = productionLineSchema.partial();

/**
 * Zod validation middleware factory.
 * @param {z.ZodSchema} schema - The Zod schema to validate against.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(e => e.message);
    return res.status(400).json({ error: "Validation Failed", details: errors });
  }
  req.body = result.data; // Use parsed/cleaned data
  next();
};

// Initialize Prisma Client with PostgreSQL Driver Adapter (Prisma 7 standard)
const databaseUrl = process.env.DATABASE_URL;
let prisma = null;
let useDatabase = false;

if (databaseUrl && databaseUrl.trim() !== '' && !databaseUrl.includes('[your-password]') && !databaseUrl.includes('[your-project-id]')) {
  try {
    // Parse connection string and override SSL setting for secure connection to Supabase
    const poolConfig = pgConnectionString.parse(databaseUrl);
    poolConfig.ssl = { rejectUnauthorized: false };

    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    console.log("Prisma Client initialized successfully with PostgreSQL driver adapter.");
    useDatabase = true;
  } catch (error) {
    console.error("Failed to initialize Prisma Client:", error.message);
  }
} else {
  console.warn("WARNING: DATABASE_URL is missing, empty, or using placeholders. Falling back to local in-memory storage mode.");
}

// Local Seed / Fallback Data
let productionLines = [
  { id: "1", name: "Line 1 — Dairy Processing", status: "Running", progress: 78, temp: "4.2°C" },
  { id: "2", name: "Line 3 — Beverage Mixing", status: "Paused", progress: 45, temp: "22.1°C" },
  { id: "3", name: "Line 7 — Grain Milling", status: "Running", progress: 92, temp: "28.5°C" },
  { id: "4", name: "Line 9 — Meat Packaging", status: "Running", progress: 61, temp: "-2.1°C" },
  { id: "5", name: "Line 12 — Snack Production", status: "Running", progress: 34, temp: "35.0°C" },
];

let nextId = 6;

const defaultPasswordHash = bcrypt.hashSync("password123", 10);
let users = [
  { id: "1", name: "Ritik Choudhary", email: "ritik@foodpro.com", role: "Plant Manager", company: "FoodPro Industries", password: defaultPasswordHash },
  { id: "2", name: "Vineet Choudhary", email: "vineet@foodpro.com", role: "Operator", company: "FoodPro Industries", password: defaultPasswordHash },
  { id: "3", name: "Priya Sharma", email: "priya@foodpro.com", role: "Quality Analyst", company: "FoodPro Industries", password: defaultPasswordHash }
];
let nextUserId = 4;

// Validation helpers
const VALID_STATUSES = ["Running", "Paused", "Stopped"];

function validateProductionLine(data, isPartial = false) {
  const errors = [];

  // Name validation
  if (!isPartial || data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push("Name must be a non-empty string.");
    }
  }

  // Status validation
  if (!isPartial || data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
    }
  }

  // Progress validation
  if (!isPartial || data.progress !== undefined) {
    const progressNum = Number(data.progress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      errors.push("Progress must be a number between 0 and 100.");
    }
  }

  // Temperature validation
  if (!isPartial || data.temp !== undefined) {
    if (data.temp === undefined || data.temp === null || String(data.temp).trim() === '') {
      errors.push("Temperature must be a non-empty value (e.g., '22.1°C' or '10').");
    }
  }

  return errors;
}

// Authentication Middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No authorization header provided." });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: "Access denied. Invalid authorization header format. Use 'Bearer <token>'." });
  }

  const token = parts[1];
  const jwtSecret = process.env.JWT_SECRET || 'fallback-super-secret-key-123';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Access denied. Token has expired." });
    }
    return res.status(401).json({ error: "Access denied. Invalid token." });
  }
};

// 1. GET /api/production-lines/search — Search production lines
app.get('/api/production-lines/search', requireAuth, async (req, res) => {
  try {
    const query = req.query.q;

    if (useDatabase) {
      let lines;
      if (query) {
        lines = await prisma.productionLine.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { status: { contains: query, mode: 'insensitive' } },
              { temp: { contains: query, mode: 'insensitive' } }
            ]
          },
          orderBy: {
            id: 'asc'
          }
        });
      } else {
        lines = await prisma.productionLine.findMany({
          orderBy: {
            id: 'asc'
          }
        });
      }
      return res.status(200).json(lines);
    }

    // In-memory fallback
    if (!query) {
      return res.status(200).json(productionLines);
    }

    const lowerQuery = query.toLowerCase();
    const filtered = productionLines.filter(line => 
      line.name.toLowerCase().includes(lowerQuery) ||
      line.status.toLowerCase().includes(lowerQuery) ||
      line.temp.toLowerCase().includes(lowerQuery)
    );

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. GET /api/production-lines — List all production lines
app.get('/api/production-lines', requireAuth, async (req, res) => {
  try {
    if (useDatabase) {
      const lines = await prisma.productionLine.findMany({
        orderBy: {
          id: 'asc'
        }
      });
      return res.status(200).json(lines);
    }

    // In-memory fallback
    res.status(200).json(productionLines);
  } catch (error) {
    console.error("List Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 3. GET /api/production-lines/:id — Get a single production line
app.get('/api/production-lines/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format. ID must be an integer." });
    }

    if (useDatabase) {
      const line = await prisma.productionLine.findUnique({
        where: { id: BigInt(id) }
      });
      if (!line) {
        return res.status(404).json({ error: `Production line with ID ${id} not found.` });
      }
      return res.status(200).json(line);
    }

    // In-memory fallback
    const line = productionLines.find(l => String(l.id) === String(id));
    if (!line) {
      return res.status(404).json({ error: `Production line with ID ${id} not found.` });
    }

    res.status(200).json(line);
  } catch (error) {
    console.error("Get Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/production-lines', requireAuth, validate(productionLineSchema), async (req, res) => {
  try {
    const { name, status, progress, temp } = req.body;

    if (useDatabase) {
      const newLine = await prisma.productionLine.create({
        data: {
          name: name.trim(),
          status,
          progress: Number(progress),
          temp: String(temp).trim()
        }
      });
      return res.status(201).json(newLine);
    }

    // In-memory fallback
    const newLine = {
      id: String(nextId++),
      name: name.trim(),
      status,
      progress: Number(progress),
      temp: String(temp).trim()
    };

    productionLines.push(newLine);
    res.status(201).json(newLine);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 5. PUT /api/production-lines/:id — Replace/update an existing production line
app.put('/api/production-lines/:id', requireAuth, validate(productionLineSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format. ID must be an integer." });
    }

    const { name, status, progress, temp } = req.body;

    if (useDatabase) {
      try {
        const updatedLine = await prisma.productionLine.update({
          where: { id: BigInt(id) },
          data: {
            name: name.trim(),
            status,
            progress: Number(progress),
            temp: String(temp).trim()
          }
        });
        return res.status(200).json(updatedLine);
      } catch (error) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: `Production line with ID ${id} not found.` });
        }
        throw error;
      }
    }

    // In-memory fallback
    const lineIndex = productionLines.findIndex(l => String(l.id) === String(id));
    if (lineIndex === -1) {
      return res.status(404).json({ error: `Production line with ID ${id} not found.` });
    }

    const updatedLine = {
      id: String(id),
      name: name.trim(),
      status,
      progress: Number(progress),
      temp: String(temp).trim()
    };

    productionLines[lineIndex] = updatedLine;
    res.status(200).json(updatedLine);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 6. PATCH /api/production-lines/:id — Partially update a production line
app.patch('/api/production-lines/:id', requireAuth, validate(productionLinePartialSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format. ID must be an integer." });
    }

    const { name, status, progress, temp } = req.body;

    if (useDatabase) {
      const data = {};
      if (name !== undefined) data.name = name.trim();
      if (status !== undefined) data.status = status;
      if (progress !== undefined) data.progress = Number(progress);
      if (temp !== undefined) data.temp = String(temp).trim();

      try {
        const updatedLine = await prisma.productionLine.update({
          where: { id: BigInt(id) },
          data
        });
        return res.status(200).json(updatedLine);
      } catch (error) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: `Production line with ID ${id} not found.` });
        }
        throw error;
      }
    }

    // In-memory fallback
    const lineIndex = productionLines.findIndex(l => String(l.id) === String(id));
    if (lineIndex === -1) {
      return res.status(404).json({ error: `Production line with ID ${id} not found.` });
    }

    const currentLine = productionLines[lineIndex];
    const updatedLine = {
      ...currentLine,
      ...(name !== undefined && { name: name.trim() }),
      ...(status !== undefined && { status }),
      ...(progress !== undefined && { progress: Number(progress) }),
      ...(temp !== undefined && { temp: String(temp).trim() })
    };

    productionLines[lineIndex] = updatedLine;
    res.status(200).json(updatedLine);
  } catch (error) {
    console.error("Partial Update Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 7. DELETE /api/production-lines/:id — Delete a production line
app.delete('/api/production-lines/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format. ID must be an integer." });
    }

    if (useDatabase) {
      try {
        await prisma.productionLine.delete({
          where: { id: BigInt(id) }
        });
        return res.status(204).end();
      } catch (error) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: `Production line with ID ${id} not found.` });
        }
        throw error;
      }
    }

    // In-memory fallback
    const lineIndex = productionLines.findIndex(l => String(l.id) === String(id));
    if (lineIndex === -1) {
      return res.status(404).json({ error: `Production line with ID ${id} not found.` });
    }

    productionLines.splice(lineIndex, 1);
    res.status(204).end();
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 8. POST /api/auth/register — User Registration (Rate limited)
app.post('/api/auth/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name, role, company } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    if (useDatabase) {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered." });
      }
    } else {
      const existingUser = users.find(u => u.email.toLowerCase().trim() === normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered." });
      }
    }

    // Hash the password using bcrypt with 10 salt rounds (10–12 requested)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let newUser;
    const userName = (name || email.split('@')[0]).trim();
    const userRole = role || "Operator";
    const userCompany = company || "";

    if (useDatabase) {
      try {
        newUser = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: userName,
            role: userRole,
            company: userCompany,
            password: hashedPassword
          }
        });
      } catch (dbError) {
        if (dbError.code === 'P2002') {
          return res.status(400).json({ error: "Email is already registered." });
        }
        throw dbError;
      }
    } else {
      newUser = {
        id: String(nextUserId++),
        email: normalizedEmail,
        name: userName,
        role: userRole,
        company: userCompany,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
    }

    // Never return the password (plain or hashed) anywhere in the response
    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 9. POST /api/auth/login — User Login (Rate limited)
app.post('/api/auth/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    let user;

    if (useDatabase) {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    } else {
      user = users.find(u => u.email.toLowerCase().trim() === normalizedEmail);
    }

    // Generic error to prevent user enumeration
    const invalidCredentialsError = "Invalid email or password.";

    if (!user || !user.password) {
      return res.status(401).json({ error: invalidCredentialsError });
    }

    // Compare bcrypt passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: invalidCredentialsError });
    }

    // Sign JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback-super-secret-key-123';
    if (!process.env.JWT_SECRET) {
      console.warn("WARNING: JWT_SECRET environment variable is missing, using fallback secret.");
    }

    // Serialize BigInt id to String safely for the payload
    const token = jwt.sign(
      {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        company: user.company
      },
      jwtSecret,
      { expiresIn: '7d' } // Expires in 7 days
    );

    // Return the token and sanitized user details (excluding password)
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(200).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ============================================================
// GitHub OAuth Strategy (Passport.js)
// ============================================================

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (GITHUB_CLIENT_ID && GITHUB_CLIENT_ID !== 'your_github_client_id' && GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: `http://localhost:${PORT}/api/auth/github/callback`,
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Extract email (GitHub may return multiple emails)
      const email = (profile.emails && profile.emails.length > 0)
        ? profile.emails[0].value.toLowerCase().trim()
        : `${profile.username}@github.com`;
      const name = profile.displayName || profile.username || email.split('@')[0];

      let user;

      if (useDatabase) {
        // Find or create the user in the database
        user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name,
              role: 'Operator',
              company: '',
              password: null // OAuth users don't have a password
            }
          });
        }
      } else {
        // In-memory fallback
        user = users.find(u => u.email.toLowerCase() === email);
        if (!user) {
          user = {
            id: String(nextUserId++),
            email,
            name,
            role: 'Operator',
            company: '',
            password: null,
            createdAt: new Date().toISOString()
          };
          users.push(user);
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // 10. GET /api/auth/github — Trigger GitHub OAuth flow
  app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

  // 11. GET /api/auth/github/callback — Handle GitHub OAuth callback
  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
    (req, res) => {
      // Generate JWT for the authenticated user
      const jwtSecret = process.env.JWT_SECRET || 'fallback-super-secret-key-123';
      const token = jwt.sign(
        {
          id: req.user.id.toString(),
          email: req.user.email,
          role: req.user.role,
          company: req.user.company
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token in query params
      res.redirect(`${FRONTEND_URL}/login?token=${token}`);
    }
  );

  console.log("GitHub OAuth strategy configured successfully.");
} else {
  console.warn("WARNING: GitHub OAuth credentials not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env to enable GitHub login.");
}

// ============================================================
// AI Quality & Compliance Inspector (Google Gemini API)
// ============================================================

app.post('/api/ai/inspect-batch', requireAuth, async (req, res) => {
  try {
    const { product, stage, temp, notes } = req.body;

    if (!product || !stage || temp === undefined) {
      return res.status(400).json({ error: "Missing required parameters: product, stage, and temp are required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.status(400).json({ 
        error: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY in the backend .env file." 
      });
    }

    const prompt = `You are a food safety expert and a HACCP (Hazard Analysis Critical Control Point) Auditor.
Your task is to perform an audit on a food processing batch using the parameters provided below:
- Product Category/Name: ${product}
- Current Process Stage: ${stage}
- Operating Temperature: ${temp}
- Operator Notes/Observations: ${notes || "No notes provided."}

CRITICAL AUDITING CRITERIA:
1. Dairy Products (e.g. Milk, Yogurt, Cheese):
   - Pasteurization stage must be at least 72°C (161°F) for safe treatment.
   - Fermentation stage (e.g. Yogurt) temperature should be between 38°C and 45°C.
   - Finished product storage/packaging must be chilled (below 4°C / 40°F).
2. Meat/Poultry Products:
   - Processing must occur in chilled environments (below 10°C).
   - Storage/Packaging must be under refrigeration (below 4°C) or freezing (below -18°C).
3. Beverages / Juices:
   - Thermal processing/Pasteurization requires at least 85°C.
   - Storage must be below 4°C unless shelf-stable vacuum sealed.
4. Bakery / Grains:
   - Milling/Mixing must be dry (under 30°C to avoid moisture accumulation and mold).
   - Baking must be high temperature (internal crumb temp > 90°C).
5. Quality and Contamination Check (Notes Analysis):
   - Any notes indicating foreign objects (hair, glass, metal, plastic), mold, chemical smell, off-color, or pest traces MUST immediately result in a "failed" status with defects > 0.
   - Minor issues (e.g., "minor shape irregularity", "speed fluctuation") should flag a "warning".

Determine:
- "status": "failed" if there is any biological, physical, or temperature safety breach. "warning" if parameters are sub-optimal but not immediately hazardous. "passed" if completely compliant.
- "confidence": Your assessment confidence (0-100).
- "defects": Number of compliance/quality issues detected.
- "details": Concise, professional summary of the assessment.
- "hazards": Specific safety threats identified (e.g., pathogen growth risk, physical contaminant). Empty array if none.
- "recommendations": Immediate actionable corrective steps (e.g., "Halt line and re-pasteurize", "Adjust chiller thermostat").

You must return a single JSON object matching this schema. No preamble, no markdown formatting blocks, just the JSON text.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for thinking models

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error status:", response.status, errorData);
      return res.status(response.status).json({ 
        error: errorData.error?.message || "Error calling Google Gemini API",
        details: errorData.error
      });
    }

    const responseData = await response.json();
    const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: "Empty response from Gemini AI service." });
    }

    try {
      const result = JSON.parse(text.trim());
      return res.status(200).json(result);
    } catch (parseError) {
      console.error("JSON Parse error on Gemini output:", text, parseError);
      return res.status(500).json({ 
        error: "AI service response could not be parsed as valid JSON.", 
        rawOutput: text 
      });
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: "AI service request timed out after 60 seconds." });
    }
    console.error("AI Inspect Endpoint Error:", error);
    return res.status(500).json({ error: "Internal Server Error during AI analysis." });
  }
});

// Basic Root Endpoint to check API status and DB integration mode
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "FoodPro API is running.", 
    storageMode: useDatabase ? "PostgreSQL Database (Prisma ORM)" : "In-Memory Fallback Storage"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error captured in middleware:", err.stack);
  res.status(500).json({ error: "Something went wrong! Internal Server Error." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
