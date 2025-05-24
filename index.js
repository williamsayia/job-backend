import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());

app.get('/', (req, res) => {
  res.send('API is running...');
});

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
