d=`date +'%Y%m%d'`
cd /home/hungsex/server/xdata/dist/websocket
NODE_HOME=/home/hungsex/micromamba
PATH=$NODE_HOME/bin:$PATH
export PATH
/home/hungtv/.nvm/versions/node/v22.6.0/bin/pm2 stop websocket  >> /home/hungsex/server/dist/dist/cron.log 2>&1
#/usr/bin/7z a data3$d".7z" data3$d".txt"
/usr/bin/zstd -15 --long=27 -f -o data3$d".zst" data3$d".txt" 
/home/hungtv/.nvm/versions/node/v22.6.0/bin/pm2 start websocket  >> /home/hungsex/server/dist/dist/cron.log 2>&1
/usr/bin/git add *.zst
/bin/sleep 5
/usr/bin/git commit -m "add"
/bin/sleep 5
/usr/bin/git push

# Danh sách các file theo định dạng 'data3YYYYMMDD.txt'
files=$(ls data3*.txt | sort)

# Giữ lại 2 file cuối cùng
files_to_delete=$(echo "$files" | head -n -2)

# Xóa những file cũ
for file in $files_to_delete; do
    rm "$file"
done
