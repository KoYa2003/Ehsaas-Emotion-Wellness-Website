const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mood_mirror',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use((req, res, next) => {
    if (!req.headers['x-user-id']) {
        req.userId = uuidv4().slice(0, 8);
        res.set('X-User-ID', req.userId);
    } else {
        req.userId = req.headers['x-user-id'];
    }
    next();
});

app.get('/api/moods', async (req, res) => {
    console.log("Fetching moods for user:", req.userId);
    try {
        const { filter, limit = 50, sort = 'timestamp DESC' } = req.query;
        let whereClause = `LOWER(user_id) = LOWER(?)`;

        let params = [req.userId];

        if (filter && filter !== 'all') {
            whereClause += ` AND mood = ?`;
            params.push(filter);
        }

        const [rows] = await pool.execute(
            `SELECT * FROM moods WHERE ${whereClause} ORDER BY ${sort} LIMIT ?`,
            [...params, parseInt(limit)]
        );

        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

app.post('/api/moods', async (req, res) => {
    try {
        const { mood, text, confidence, tip } = req.body;

        if (!mood || !text || text.length < 5) {
            return res.status(400).json({ success: false, error: 'Invalid mood data' });
        }

        const [result] = await pool.execute(
            `INSERT INTO moods (user_id, mood, text, confidence, tip) VALUES (?, ?, ?, ?, ?)`,
            [req.userId, mood, text, confidence, tip]
        );

        res.json({
            success: true,
            id: result.insertId,
            userId: req.userId,
            message: 'Mood saved successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to save mood' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Mood Mirror Backend running on http://localhost:${PORT}`);
});
