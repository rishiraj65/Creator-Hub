import sqlite3
import os

db_path = "sql_app.db"
log_path = "db_dump_v2.txt"

if not os.path.exists(db_path):
    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"Database file {db_path} not found.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

with open(log_path, "w", encoding="utf-8") as f:
    f.write(f"Tables in {db_path}:\n")
    for table in tables:
        table_name = table[0]
        f.write(f"\n--- Table: {table_name} ---\n")
        
        # Get schema
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        f.write("Columns:\n")
        for col in columns:
            f.write(f"  {col[1]} ({col[2]})\n")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        f.write(f"Row count: {count}\n")
        
        # Get sample data (first 3 rows)
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3;")
            rows = cursor.fetchall()
            f.write("Sample Data:\n")
            for row in rows:
                f.write(f"  {row}\n")

conn.close()
