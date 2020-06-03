FROM node:12 as gen
WORKDIR /app
COPY yarn.lock package.json ./
RUN yarn

COPY . /app
RUN mkdir -p /app/dist/tdata/ && \
    node index.js

FROM lovearuis/postgres-postgis-plv8-mysql_fdw:12
COPY --from=gen /app/dist/tdata/* /usr/share/postgresql/12/tsearch_data/
COPY --from=gen /app/dist/setup.sql /docker-entrypoint-initdb.d/
