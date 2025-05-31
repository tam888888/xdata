cd /home/hungsex/server/dist/dist
NODE_HOME=/home/hungsex/micromamba
PATH=$NODE_HOME/bin:$PATH
export PATH
FORCE=T /home/hungsex/micromamba/bin/node investor.js >> /home/hungsex/server/dist/dist/cron.log 2>&1;
unset FORCE; 
/home/hungsex/micromamba/bin/pm2 restart app
