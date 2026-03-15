const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

function loadConfig() {
  const defaultConfigPath = path.join(__dirname, 'config.json');
  const configArg = process.argv.find((arg) => arg.startsWith('--config='));
  const rawConfigPath = configArg ? configArg.slice('--config='.length) : defaultConfigPath;
  const configPath = path.isAbsolute(rawConfigPath) ? rawConfigPath : path.resolve(__dirname, rawConfigPath);

  let fileConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
      throw new Error(`Failed to parse config file: ${configPath} (${err.message})`);
    }
  }

  return {
    port: process.env.PORT ?? fileConfig.port ?? 17890,
    apiKey: process.env.API_KEY ?? fileConfig.apiKey ?? 'claw-skill-nest-secret-key',
    dataDir: path.resolve(__dirname, process.env.DATA_DIR ?? fileConfig.dataDir ?? 'data')
  };
}

const config = loadConfig();
const PORT = config.port;
const API_KEY = config.apiKey;
const DATA_DIR = config.dataDir;
const SKILLS_FILE = path.join(DATA_DIR, 'skills.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure directories exist
[DATA_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize skills.json if not exists
let skills = [];
if (fs.existsSync(SKILLS_FILE)) {
  skills = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
} else {
  fs.writeFileSync(SKILLS_FILE, JSON.stringify([], null, 2));
}

function saveSkills() {
  fs.writeFileSync(SKILLS_FILE, JSON.stringify(skills, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Key auth middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
};

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.skill' || ext === '.zip') {
      cb(null, true);
    } else {
      cb(new Error('Only .skill or .zip files are allowed'));
    }
  }
});

// API Endpoints
app.get('/api/auth/verify', apiKeyAuth, (req, res) => {
  res.json({
    ok: true,
    appName: '虾滑',
    description: 'OpenClaw 私有 Skill 管理中心'
  });
});

app.get('/api/skills', apiKeyAuth, (req, res) => {
  res.json(skills);
});

app.post('/api/skills/upload', apiKeyAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const newSkill = {
    id: uuidv4(),
    name: req.body.name || path.basename(req.file.originalname, path.extname(req.file.originalname)),
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
    description: req.body.description || ''
  };

  skills.push(newSkill);
  saveSkills();

  res.json(newSkill);
});

app.get('/api/skills/:id', apiKeyAuth, (req, res) => {
  const skill = skills.find(s => s.id === req.params.id);
  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' });
  }
  res.json(skill);
});

app.delete('/api/skills/:id', apiKeyAuth, (req, res) => {
  const index = skills.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  const skill = skills[index];
  const filePath = path.join(UPLOADS_DIR, skill.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  skills.splice(index, 1);
  saveSkills();

  res.json({ message: 'Skill deleted successfully' });
});

app.get('/api/skills/:id/download', apiKeyAuth, (req, res) => {
  const skill = skills.find(s => s.id === req.params.id);
  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  const filePath = path.join(UPLOADS_DIR, skill.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath, skill.originalName);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Skill Hub server running on port ${PORT}`);
  });
}

module.exports = { app };
