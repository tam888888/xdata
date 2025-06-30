cd /home/hungsex/server/dist/dist
NODE_HOME=/home/hungtv/.nvm/versions/node/v22.6.0/
PATH=$NODE_HOME/bin:$PATH
export PATH
FORCE=T /home/hungtv/.nvm/versions/node/v22.6.0/bin/node investor.js >> /home/hungsex/server/dist/dist/cron.log 2>&1;
unset FORCE; 
/home/hungtv/.nvm/versions/node/v22.6.0/bin/pm2 restart app
