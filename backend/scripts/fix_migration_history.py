import os
import sys
import time
from urllib.parse import urlparse


def env_bool(name: str, default: str = "False") -> bool:
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes", "on")


def log(message: str) -> None:
    print(f"[fix_migration_history] {message}", file=sys.stderr)


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


def fix_postgres(database_url: str) -> None:
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
                cur.execute("SELECT to_regclass('public.django_migrations')")
                exists = cur.fetchone()[0] is not None
                if not exists:
                    log("django_migrations table not found; skipping.")
                    return

                cur.execute(
                    "SELECT 1 FROM django_migrations WHERE app=%s AND name=%s",
                    ("user", "0001_initial"),
                )
                user_applied = cur.fetchone() is not None

                cur.execute(
                    "SELECT 1 FROM django_migrations WHERE app=%s AND name=%s",
                    ("auth", "0011_update_proxy_permissions"),
                )
                auth_0011_applied = cur.fetchone() is not None

                cur.execute(
                    "SELECT 1 FROM django_migrations WHERE app=%s AND name=%s",
                    ("auth", "0012_alter_user_first_name_max_length"),
                )
                auth_0012_applied = cur.fetchone() is not None

                if auth_0012_applied and not auth_0011_applied:
                    cur.execute(
                        "INSERT INTO django_migrations(app, name, applied) VALUES (%s, %s, NOW())",
                        ("auth", "0011_update_proxy_permissions"),
                    )
                    log("Inserted missing auth.0011 migration to fix history.")

                if user_applied and not auth_0012_applied:
                    if not auth_0011_applied:
                        cur.execute(
                            "INSERT INTO django_migrations(app, name, applied) VALUES (%s, %s, NOW())",
                            ("auth", "0011_update_proxy_permissions"),
                        )
                        log("Inserted missing auth.0011 migration to fix history.")
                    cur.execute(
                        "INSERT INTO django_migrations(app, name, applied) VALUES (%s, %s, NOW())",
                        ("auth", "0012_alter_user_first_name_max_length"),
                    )
                    log("Inserted missing auth.0012 migration to fix history.")
            conn.close()
            return
        except Exception as exc:
            if attempt == 2:
                log(f"Failed to fix migration history in Postgres: {exc}")
            else:
                time.sleep(1)


def fix_sqlite(db_path: str) -> None:
    if not os.path.exists(db_path):
        return

    try:
        import sqlite3
    except Exception as exc:
        log(f"sqlite3 is not available: {exc}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='django_migrations'"
        )
        if cur.fetchone() is None:
            return

        cur.execute(
            "SELECT 1 FROM django_migrations WHERE app=? AND name=?",
            ("user", "0001_initial"),
        )
        user_applied = cur.fetchone() is not None

        cur.execute(
            "SELECT 1 FROM django_migrations WHERE app=? AND name=?",
            ("auth", "0011_update_proxy_permissions"),
        )
        auth_0011_applied = cur.fetchone() is not None

        cur.execute(
            "SELECT 1 FROM django_migrations WHERE app=? AND name=?",
            ("auth", "0012_alter_user_first_name_max_length"),
        )
        auth_0012_applied = cur.fetchone() is not None

        if auth_0012_applied and not auth_0011_applied:
            cur.execute(
                "INSERT INTO django_migrations(app, name, applied) VALUES(?, ?, datetime('now'))",
                ("auth", "0011_update_proxy_permissions"),
            )
            conn.commit()
            log("Inserted missing auth.0011 migration to fix history.")

        if user_applied and not auth_0012_applied:
            if not auth_0011_applied:
                cur.execute(
                    "INSERT INTO django_migrations(app, name, applied) VALUES(?, ?, datetime('now'))",
                    ("auth", "0011_update_proxy_permissions"),
                )
                conn.commit()
                log("Inserted missing auth.0011 migration to fix history.")
            cur.execute(
                "INSERT INTO django_migrations(app, name, applied) VALUES(?, ?, datetime('now'))",
                ("auth", "0012_alter_user_first_name_max_length"),
            )
            conn.commit()
            log("Inserted missing auth.0012 migration to fix history.")
    except Exception as exc:
        log(f"Failed to fix migration history in SQLite: {exc}")
    finally:
        conn.close()


def main() -> None:
    if env_bool("USE_SQLITE", "False"):
        fix_sqlite("/app/db.sqlite3")
        return

    database_url = build_database_url()
    if not database_url:
        return

    scheme = urlparse(database_url).scheme
    if scheme.startswith("postgres"):
        fix_postgres(database_url)


if __name__ == "__main__":
    main()
