const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Seed Data
let productionLines = [
  { id: 1, name: "Line 1 — Dairy Processing", status: "Running", progress: 78, temp: "4.2°C" },
  { id: 2, name: "Line 3 — Beverage Mixing", status: "Paused", progress: 45, temp: "22.1°C" },
  { id: 3, name: "Line 7 — Grain Milling", status: "Running", progress: 92, temp: "28.5°C" },
  { id: 4, name: "Line 9 — Meat Packaging", status: "Running", progress: 61, temp: "-2.1°C" },
  { id: 5, name: "Line 12 — Snack Production", status: "Running", progress: 34, temp: "35.0°C" },
];

let nextId = 6;

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

// 1. GET /api/production-lines/search — Search production lines
// NOTE: Defined before :id to prevent 'search' from being treated as an ID parameter.
app.get('/api/production-lines/search', (req, res) => {
  try {
    const query = req.query.q;
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
app.get('/api/production-lines', (req, res) => {
  try {
    res.status(200).json(productionLines);
  } catch (error) {
    console.error("List Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 3. GET /api/production-lines/:id — Get a single production line
app.get('/api/production-lines/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format. ID must be an integer." });
    }

    const line = productionLines.find(l => l.id === id);
    if (!line) {
      return res.status(404).json({ error: `Production line with ID ${id} not found.` });
    }

    res.status(200).json(line);
  } catch (error) {
    console.error("Get Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. POST /api/production-lines — Create a new production line
app.post('/api/production-lines', (req, res) => {
  try {
    const errors = validateProductionLine(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Failed", details: errors });
    }

    const { name, status, progress, temp } = req.body;
    const newLine = {
      id: nextId++,
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
app.put('/api/production-lines/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format. ID must be an integer." });
    }

    const lineIndex = productionLines.findIndex(l => l.id === id);
    if (lineIndex === -1) {
      return res.status(404).json({ error: `Production line with ID ${id} not found.` });
    }

    const errors = validateProductionLine(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Failed", details: errors });
    }

    const { name, status, progress, temp } = req.body;
    const updatedLine = {
      id,
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
app.patch('/api/production-lines/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format. ID must be an integer." });
    }

    const lineIndex = productionLines.findIndex(l => l.id === id);
    if (lineIndex === -1) {
      return res.status(404).json({ error: `Production line with ID ${id} not found.` });
    }

    const errors = validateProductionLine(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Failed", details: errors });
    }

    const currentLine = productionLines[lineIndex];
    const { name, status, progress, temp } = req.body;

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
app.delete('/api/production-lines/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format. ID must be an integer." });
    }

    const lineIndex = productionLines.findIndex(l => l.id === id);
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

// Basic Root Endpoint to check API status
app.get('/', (req, res) => {
  res.status(200).json({ status: "ok", message: "FoodPro API is running." });
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
