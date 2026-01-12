CREATE DATABASE IF NOT EXISTS ehsaas_db;
USE ehsaas_db;

-- Table to store user moods
CREATE TABLE IF NOT EXISTS moods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    mood_text VARCHAR(255) NOT NULL,
    mood_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
