DIRNAME=`dirname "$0"`
cd $DIRNAME
git pull
git add .
git commit -m "Adding files."
git push -u origin master
echo "Save done."
