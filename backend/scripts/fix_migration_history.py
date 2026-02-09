import os
import sys
import time
from urllib.parse import urlparse

AUTH_CHAIN = [
    "0001_initial",
    "0002_alter_permission_name_max_length",
    "0003_alter_user_email_max_length",
    "0004_alter_user_username_opts",
    "0005_alter_user_last_login_null",
    "0006_require_contenttypes_0002",
    "0007_alter_validators_add_error_messages",
    "0008_alter_user_username_max_length",
    "0009_alter_user_last_name_max_length",
    "0010_alter_group_name_max_length",
    "0011_update_proxy_permissions",
    "0012_alter_user_first_name_max_length",
]

CONTENTTYPES_CHAIN = [
    "0001_initial",
    "0002_remove_content_type_name",
]

AUTH_REQUIRES_CONTENTTYPES_FROM = "0006_require_contenttypes_0002"


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


def _max_index(applied: set[tuple[str, str]], app: str, chain: list[str]) -> int | None:
    indices = [idx for idx, name in enumerate(chain) if (app, name) in applied]
    return max(indices) if indices else None


def _ensure_chain_postgres(
    cur,
    applied: set[tuple[str, str]],
    app: str,
    chain: list[str],
    max_index: int | None,
) -> None:
    if max_index is None:
        return
    for idx in range(max_index + 1):
        name = chain[idx]
        key = (app, name)
        if key in applied:
            continue
        cur.execute(
            "INSERT INTO django_migrations(app, name, applied) VALUES (%s, %s, NOW())",
            (app, name),
        )
        applied.add(key)
        log(f"Inserted missing {app}.{name} migration to fix history.")


def _ensure_chain_sqlite(
    cur,
    applied: set[tuple[str, str]],
    app: str,
    chain: list[str],
    max_index: int | None,
) -> None:
    if max_index is None:
        return
    for idx in range(max_index + 1):
        name = chain[idx]
        key = (app, name)
        if key in applied:
            continue
        cur.execute(
            "INSERT INTO django_migrations(app, name, applied) VALUES(?, ?, datetime('now'))",
            (app, name),
        )
        applied.add(key)
        log(f"Inserted missing {app}.{name} migration to fix history.")


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

                cur.execute("SELECT app, name FROM django_migrations")
                applied = {(row[0], row[1]) for row in cur.fetchall()}

                user_applied = ("user", "0001_initial") in applied

                auth_max = _max_index(applied, "auth", AUTH_CHAIN)
                if auth_max is None and user_applied:
                    auth_max = len(AUTH_CHAIN) - 1

                contenttypes_max = _max_index(applied, "contenttypes", CONTENTTYPES_CHAIN)
                if contenttypes_max is None and auth_max is not None:
                    auth_requires_idx = AUTH_CHAIN.index(AUTH_REQUIRES_CONTENTTYPES_FROM)
                    if auth_max >= auth_requires_idx:
                        contenttypes_max = len(CONTENTTYPES_CHAIN) - 1

                _ensure_chain_postgres(cur, applied, "contenttypes", CONTENTTYPES_CHAIN, contenttypes_max)
                _ensure_chain_postgres(cur, applied, "auth", AUTH_CHAIN, auth_max)
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
        cur.execute("SELECT app, name FROM django_migrations")
        applied = {(row[0], row[1]) for row in cur.fetchall()}

        user_applied = ("user", "0001_initial") in applied

        auth_max = _max_index(applied, "auth", AUTH_CHAIN)
        if auth_max is None and user_applied:
            auth_max = len(AUTH_CHAIN) - 1

        contenttypes_max = _max_index(applied, "contenttypes", CONTENTTYPES_CHAIN)
        if contenttypes_max is None and auth_max is not None:
            auth_requires_idx = AUTH_CHAIN.index(AUTH_REQUIRES_CONTENTTYPES_FROM)
            if auth_max >= auth_requires_idx:
                contenttypes_max = len(CONTENTTYPES_CHAIN) - 1

        _ensure_chain_sqlite(cur, applied, "contenttypes", CONTENTTYPES_CHAIN, contenttypes_max)
        _ensure_chain_sqlite(cur, applied, "auth", AUTH_CHAIN, auth_max)
        conn.commit()
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
