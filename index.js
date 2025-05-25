import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://job-platform-blue.vercel.app' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));
app.use(express.json()); 

// GET / (API health check)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// GET /jobs
app.get('/jobs', (req, res) => {
  const filePath = path.join(__dirname, 'jobs.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read jobs data' });
    }
    try {
      const jobs = JSON.parse(data);
      res.json(jobs);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(500).json({ error: 'Invalid JSON format in jobs.json' });
    }
  });
});

// POST /jobs (Create a new job)
app.post('/jobs', (req, res) => {
  const newJob = req.body;
  const filePath = path.join(__dirname, 'jobs.json');

  // Read existing jobs
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading jobs file:', err);
      return res.status(500).json({ error: 'Failed to read jobs file' });
    }

    let jobs = [];
    try {
      jobs = JSON.parse(data);
    } catch (parseError) {
      return res.status(500).json({ error: 'Invalid JSON in jobs file' });
    }

    // Assign a unique ID
    newJob.id = Date.now().toString(); 

    // Add new job
    jobs.push(newJob);

    // Save updated jobs
    fs.writeFile(filePath, JSON.stringify(jobs, null, 2), (err) => {
      if (err) {
        console.error('Error writing to jobs file:', err);
        return res.status(500).json({ error: 'Failed to save new job' });
      }

      res.status(201).json(newJob); 
    });
  });
});
// GET /jobs/:id (Fetch single job by ID)
app.get('/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  const filePath = path.join(__dirname, 'jobs.json');

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read jobs file' });

    try {
      const parsed = JSON.parse(data);
      const jobs = parsed.jobs || parsed; 

      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(job);
    } catch (parseError) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// update job
app.put('/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  const updatedJob = req.body;
  const filePath = path.join(__dirname, 'jobs.json');

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read jobs file' });

    try {
      let jobs = JSON.parse(data);
      const index = jobs.findIndex((j) => j.id === jobId);

      if (index === -1) {
        return res.status(404).json({ error: 'Job not found' });
      }


      updatedJob.id = jobId;
      jobs[index] = updatedJob;

      fs.writeFile(filePath, JSON.stringify(jobs, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update job' });

        res.json(updatedJob);
      });
    } catch (parseError) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
