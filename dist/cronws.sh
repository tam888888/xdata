cd /home/hungsex/server/dist
NODE_HOME=/home/hungtv/.nvm/versions/node/v22.6.0
PATH=$NODE_HOME/bin:$PATH
export PATH
/home/hungtv/.nvm/versions/node/v22.6.0/bin/pm2 restart websocket  >> /home/hungsex/server/dist/dist/cron.log 2>&1
