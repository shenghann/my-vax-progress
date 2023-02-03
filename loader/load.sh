CITF_LOCAL_REPO=/opt/citf-public
VAXAPP_PATH=/opt/vaxapp-prod/loader
PYTHON_ENV=/opt/vaxapp-prod/env/bin/activate

now=$(date)
echo "*******************************************"
echo "[START RUN]: $now"

echo "[INFO]    Checking CITF public..."
cd $CITF_LOCAL_REPO
git fetch
HEADHASH=$(git rev-parse HEAD)
REMOTEHASH=$(git rev-parse main@{upstream})
echo "[INFO]    Local:  $HEADHASH"
echo "[INFO]    Remote: $REMOTEHASH"


if [ "$HEADHASH" != "$REMOTEHASH" ]
then
    echo "[INFO]   New changes in CITF remote. Pulling latest"
    git pull

    echo "[INFO]    Run loader script.."
    cd $VAXAPP_PATH
    git pull
    source $PYTHON_ENV
    python "$VAXAPP_PATH/scriptv2.py"
    deactivate

    echo "[INFO]    Commit data.json and git push to master branch.."
    cd $VAXAPP_PATH
    git add ../data/data3.json
    git commit -m "citf update for today"
    git push

    echo "[INFO]    Complete!"

else
    echo "[INFO]   No new changes. Exiting..."
    exit 0
fi

