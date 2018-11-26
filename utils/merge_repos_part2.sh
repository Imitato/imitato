git commit -m "Move imitato server files into subdir"

git remote add -f imitato-client https://github.com/Imitato/imitato-client 
git merge imitato-client/master --allow-unrelated-histories

git commit -m "merge in views as well"
