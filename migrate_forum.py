import sqlite3
import os

db_path = "backend/sql_app.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Checking for missing columns...")
    
    # Check ForumThread
    cursor.execute("PRAGMA table_info(forum_threads)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "likes" not in columns:
        print("Adding 'likes' to forum_threads...")
        cursor.execute("ALTER TABLE forum_threads ADD COLUMN likes INTEGER DEFAULT 0")
        
    # Check ForumPost
    cursor.execute("PRAGMA table_info(forum_posts)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "likes" not in columns:
        print("Adding 'likes' to forum_posts...")
        cursor.execute("ALTER TABLE forum_posts ADD COLUMN likes INTEGER DEFAULT 0")
        
    conn.commit()
    conn.close()
    print("Migration complete.")
else:
    print("No database found to migrate.")
