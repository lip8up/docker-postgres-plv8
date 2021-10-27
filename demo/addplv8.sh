#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'EOSQL'
  CREATE EXTENSION plv8;
  DO LANGUAGE plv8 $$ plv8.elog(INFO, plv8.version) $$;
EOSQL
