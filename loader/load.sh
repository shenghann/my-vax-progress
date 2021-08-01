CITF_LOCAL_REPO=/home/scadmin/citf-public
VAXAPP_PATH=/home/scadmin/vaxapp/loader
PYTHON_PATH=/home/scadmin/python3/bin/python3.6
now=$(date)
echo "[START RUN]: $now"

echo "[INFO]    Git pull latest data from CITF public"
cd $CITF_LOCAL_REPO
git pull

echo "[INFO]    Run loader script.."
$PYTHON_PATH "$VAXAPP_PATH/scriptv2.py"

echo "[INFO]    Commit data.json and git push to master branch.."
cd $VAXAPP_PATH
git add ../data/data.json
git commit -m "citf update for 28 Jul"
git push

echo "[INFO]    Complete!"