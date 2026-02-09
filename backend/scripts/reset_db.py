import os
import sys
import time
from urllib.parse import urlparse


def env_bool(name: str, default: str = "False") -> bool:
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes", "on")


def log(message: str) -> None:
    print(f"[reset_db] {message}", file=sys.stderr)


def build_database_url() -> str | None:
    database_url = os.getenv("DATABASE_URL", "").strip().strip('"').strip("'")
    if database_url:
        return database_url

    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    if not (db_name and db_user):
        return None

    db_password = os.getenv("DB_PASSWORD", "")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    return f"postgres://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


def reset_postgres(database_url: str) -> None:
    try:
        import psycopg2
    except Exception as exc:
        log(f"psycopg2 is not available: {exc}")
        return

    for attempt in range(3):
        try:
            conn = psycopg2.connect(database_url, connect_timeout=5)
            conn.autocommit = True
            with conn.cursor() as cur:
                cur.execute("SELECT current_database()")
                dbname = cur.fetchone()[0]
                log(f"Dropping schema public in database '{dbname}'...")
                cur.execute("DROP SCHEMA public CASCADE")
                cur.execute("CREATE SCHEMA public")
                cur.execute("GRANT ALL ON SCHEMA public TO PUBLIC")
                cur.execute("GRANT ALL ON SCHEMA public TO CURRENT_USER")
                log("Schema public recreated.")
            conn.close()
            return
        except Exception as exc:
            if attempt == 2:
                log(f"Failed to reset Postgres database: {exc}")
            else:
                time.sleep(1)


def reset_sqlite(db_path: str) -> None:
    for suffix in ("", "-wal", "-shm"):
        path = f"{db_path}{suffix}"
        if os.path.exists(path):
            try:
                os.remove(path)
                log(f"Removed {path}.")
            except Exception as exc:
                log(f"Failed to remove {path}: {exc}")


def main() -> None:
    if not env_bool("RESET_DB", "False"):
        return

    if env_bool("USE_SQLITE", "False"):
        reset_sqlite("/app/db.sqlite3")
        return

    database_url = build_database_url()
    if not database_url:
        log("DATABASE_URL/DB_* not set; skipping reset.")
        return

    scheme = urlparse(database_url).scheme
    if scheme.startswith("postgres"):
        reset_postgres(database_url)


if __name__ == "__main__":
    main()
