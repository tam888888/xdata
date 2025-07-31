
cd /home/hungtv/server; pm2 start "http-server -p 8888 -g true -b true . --cors" --name http8888
pm2 start "cloudflared tunnel run stock-tunnel" --name cloudflared
pm2 start "cloudflared tunnel --url http://localhost:8888" --name tunnellocalhost8888
cd /home/hungtv/server/dist; pm2 start websocket3.js --name websocket
cd /home/hungtv/server/dist/dist; export PORT=8080; pm2 start app.js --name app  --max-memory-restart 5G
