# xdata

30 23 * * *  /home/hungsex/server/xdata/commit.sh
20 9 * * *  /home/hungsex/server/xdata/dist/websocket/compress.sh
30 13 * * * /home/hungsex/server/dist/dist/investor.sh
0 14 * * * /home/hungsex/server/dist/dist/investor.sh
30 14 * * * /home/hungsex/server/dist/dist/investor.sh
0 15 * * * /home/hungsex/server/dist/dist/investor.sh
55 9 * * * /home/hungsex/server/dist/dist/indicator2.sh
30 9 * * *  /home/hungsex/server/dist/dist/indicator.sh

40 9 * * * /home/hungsex/server/dist/dist/app.sh
15 10 * * * /home/hungsex/server/dist/dist/app.sh

10 1 * * * /home/hungsex/server/dist/dist/app.sh
5 1 * * * /home/hungsex/server/dist/cronws.sh



30 23 * * *  /home/hungsex/server/xdata/commit.sh
20 22 * * *  /home/hungsex/server/xdata/dist/websocket/compress.sh
20 15 * * *  /home/hungsex/server/xdata/dist/websocket/compress.sh
30 19 * * * /home/hungsex/server/dist/dist/investor.sh
0 18 * * * /home/hungsex/server/dist/dist/investor.sh
30 17 * * * /home/hungsex/server/dist/dist/investor.sh
0 16 * * * /home/hungsex/server/dist/dist/investor.sh
55 7 * * * /home/hungsex/server/dist/dist/indicator2.sh
30 7 * * *  /home/hungsex/server/dist/dist/indicator.sh

#40 8 * * * /home/hungsex/server/dist/dist/app.sh
15 8 * * * /home/hungsex/server/dist/dist/app.sh

10 1 * * * /home/hungsex/server/dist/dist/app.sh
5 1 * * * /home/hungsex/server/dist/cronws.sh

  pm2 start "http-server -p 8888 -g true -b true . --cors" --name http8888
  pm2 start "cloudflared tunnel --url http://localhost:8888" --name tunnellocalhost8888
  pm2 start "cloudflared tunnel run stock-tunnel" --name cloudflared
  pm2 start websocket3.js --name websocket
  pm2 start app.js --name app
