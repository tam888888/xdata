git config --global push.default matching
git config --global user.email "trinhvan.tam.group.8@gmail.com"
git config --global user.name "tam888888"
cd /home/hungsex/server/xdata
/usr/bin/find . -size +50M -printf '%P\n' > 50M.txt
/bin/cat gitignore 50M.txt  > .gitignore
/usr/bin/git add .
/usr/bin/git commit -m "add"
/usr/bin/git push

