-- Add to your existing schema.sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will hash in backend
    name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Demo users (passwords are hashed)
INSERT INTO users (email, password, name, role) VALUES 
('demo@MoodMirror.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'user'),
('admin@moodmirror.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Update moods table to include user_id
ALTER TABLE moods ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE moods ADD FOREIGN KEY (user_id) REFERENCES users(id);
