git init

touch deleteme.txt
git add .
git commit -m "Initial dummy commit"

git remote add -f imitato-serverless https://github.com/Imitato/imitato-serverless 

git merge imitato-serverless/master --allow-unrelated-histories

git rm deleteme.txt
git commit -m "Clean up initial file"
