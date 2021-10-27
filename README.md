# postgres-plv8

`docker-compose.yml` example:

```yml
version: "3.9"
services:
  psql:
    image: lip8up/postgres-plv8
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: 111111
      POSTGRES_DB: demo
    volumes:
      - ./.data:/var/lib/postgresql/data
      - ./addplv8.sh:/docker-entrypoint-initdb.d/addplv8.sh
    ports:
      - 5432:5432
postgres:
  image: lip8up/postgres-plv8
```

`addplv8.sh` must be executable (use `chmod +x addplv8.sh`):

```bash
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'EOSQL'
  CREATE EXTENSION plv8;
  DO LANGUAGE plv8 $$ plv8.elog(INFO, plv8.version) $$;
EOSQL
```
