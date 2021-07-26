CITF_LOCAL_REPO=/home/scadmin/citf-public
VAXAPP_PATH=/home/scadmin/vaxapp/loader
PYTHON_PATH=/home/scadmin/python3/bin/python3.6
echo "Run this in WSL2"

echo "[INFO]    Git pull latest data from CITF public"
cd $CITF_LOCAL_REPO
git pull

echo "[INFO]    Run loader script.."
$PYTHON_PATH "$VAXAPP_PATH/script.py"

echo "[INFO]    Commit data.json and git push to master branch.."
cd $VAXAPP_PATH
git add ../data/data.json
git commit -m "citf update for 25 Jul"
git push

echo "[INFO]    Complete!"