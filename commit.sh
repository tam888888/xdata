cd /home/hungsex/server/xdata
/usr/bin/find . -size +50M -printf '%P\n' >> 50M.txt
/bin/cat gitignore 50M.txt  > .gitignore
/usr/bin/git add .
/bin/sleep 5
/usr/bin/git commit -m "add"
/bin/sleep 5
/usr/bin/git push

