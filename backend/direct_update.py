import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def update_prices():
    if not DATABASE_URL:
        print("DATABASE_URL not found!")
        return

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        cur.execute("UPDATE products SET price = '₹1'")
        print(f"Updated {cur.rowcount} products to ₹1.")
        
        conn.commit()
        cur.close()
        conn.close()
        print("Prices updated successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_prices()
