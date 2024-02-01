d=`date +'%Y%m%d'`
cd /home/hungsex/server/xdata/dist/websocket
NODE_HOME=/home/hungsex/.nvm/versions/node/v16.20.2
PATH=$NODE_HOME/bin:$PATH
export PATH
/home/hungsex/.nvm/versions/node/v16.20.2/bin/pm2 stop 0  >> /home/hungsex/server/dist/dist/cron.log 2>&1
/usr/bin/7z a data3$d".7z" data3$d".txt"
/home/hungsex/.nvm/versions/node/v16.20.2/bin/pm2 start 0  >> /home/hungsex/server/dist/dist/cron.log 2>&1
/usr/bin/git add *.7z
/bin/sleep 5
/usr/bin/git commit -m "add"
/bin/sleep 5
/usr/bin/git push
