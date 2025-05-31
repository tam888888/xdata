cd /home/hungsex/server/dist/dist
NODE_HOME=/home/hungsex/micromamba
PATH=$NODE_HOME/bin:$PATH
export PATH
/home/hungsex/micromamba/bin/pm2 restart app  >> /home/hungsex/server/dist/dist/cron.log 2>&1
