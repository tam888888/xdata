cd /home/hungsex/server/dist/dist
NODE_HOME=/home/hungsex/micromamba
PATH=$NODE_HOME/bin:$PATH
export PATH
FORCE=T /home/hungsex/micromamba/bin/node --max-old-space-size=4096 indicatorV2.js  >> /home/hungsex/server/dist/dist/cron.log 2>&1
