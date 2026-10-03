#!/usr/bin/env python3
"""Snapshot consistente de rsvp.sqlite para el respaldo a Backblaze B2.

Por que hace falta esto
-----------------------
El servicio `backup` sube el directorio `data/` con `rclone sync`, lo que copia
`rsvp.sqlite`, `rsvp.sqlite-wal` y `rsvp.sqlite-shm` como archivos independientes.
Si una escritura de SQLite cae entre medio de esos archivos, la copia puede quedar
inconsistente. Este script produce un unico archivo `.sqlite` ya consolidado
mientras la base sigue recibiendo escrituras, y es ese archivo el que se sube.

Como lo hace
------------
Usa la API `Connection.backup()` de SQLite (copia en caliente): a diferencia de
copiar el archivo a mano, coordina con el escritor y garantiza una copia consistente.
Luego renombra con `os.replace()`, que es atomico, para que el contenedor de
backup nunca llegue a leer un snapshot a medio escribir.

Se ejecuta en bucle (cada SNAPSHOT_INTERVAL segundos) dentro del contenedor
`db-snapshot`. Escribe en SNAPSHOT_DIR, que el contenedor `backup` lee en :ro.
"""

import os
import sqlite3
import sys
import time

DB_PATH = os.environ.get("KA_DB", "/data/rsvp.sqlite")
SNAPSHOT_DIR = os.environ.get("SNAPSHOT_DIR", "/snapshot")
INTERVAL = int(os.environ.get("SNAPSHOT_INTERVAL", "3600"))


def snapshot() -> None:
    """Toma un snapshot consistente y lo publica de forma atomica."""
    final = os.path.join(SNAPSHOT_DIR, "rsvp.sqlite")
    tmp = final + ".tmp"

    # backup() falla si el destino ya existe: limpiar primero.
    for path in (tmp, final):
        if os.path.exists(path):
            os.remove(path)

    src = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    try:
        dst = sqlite3.connect(tmp)
        try:
            src.backup(dst)
            # El snapshot hereda el modo WAL del origen. Forzarlo a DELETE evita
            # que queden acompanantes -wal/-shm: debe ser un unico archivo
            # autocontenido, que es lo que se sube a B2.
            dst.execute("PRAGMA journal_mode=DELETE")
        finally:
            dst.close()
    finally:
        src.close()

    # Atomico: el lector ve el snapshot anterior o el nuevo, nunca uno a medias.
    os.replace(tmp, final)

    # Por si quedara algun transitorio de una corrida previa.
    for suffix in ("-wal", "-shm"):
        if os.path.exists(final + suffix):
            os.remove(final + suffix)

    size = os.path.getsize(final)
    check = sqlite3.connect(f"file:{final}?mode=ro", uri=True)
    try:
        integrity = check.execute("PRAGMA integrity_check").fetchone()[0]
    finally:
        check.close()

    print(
        f"snapshot ok {time.strftime('%Y-%m-%d %H:%M:%S')} "
        f"{size}B integrity={integrity}",
        flush=True,
    )


def main() -> int:
    os.makedirs(SNAPSHOT_DIR, exist_ok=True)
    print(f"vigilando {DB_PATH} -> {SNAPSHOT_DIR} cada {INTERVAL}s", flush=True)
    while True:
        try:
            snapshot()
        except Exception as exc:  # un fallo puntual no debe matar el ciclo
            print(f"snapshot ERROR {type(exc).__name__}: {exc}", flush=True)
        time.sleep(INTERVAL)
    return 0


if __name__ == "__main__":
    sys.exit(main())