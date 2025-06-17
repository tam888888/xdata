cd /home/hungtv/server/dist/
docker run -it -p 4214:4213 -v "$PWD":/datax   8888888888020385/duckdb:1.1 /data/duck4214.db -ui
