cd /home/hungsex/server/dist/dist
NODE_HOME=/home/hungsex/.nvm/versions/node/v16.20.2
PATH=$NODE_HOME/bin:$PATH
export PATH
FORCE=T /home/hungsex/.nvm/versions/node/v16.20.2/bin/node investor.js >> /home/hungsex/server/dist/dist/cron.log 2>&1;
unset FORCE; 
/home/hungsex/.nvm/versions/node/v16.20.2/bin/pm2 restart app
