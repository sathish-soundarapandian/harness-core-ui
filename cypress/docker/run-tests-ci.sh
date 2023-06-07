#!/bin/bash
set -e

# Copyright 2022 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.

# load variables from COMMIT_INFO
export COMMIT_INFO_BRANCH=$(cat /opt/nextgenui/commit_info.json | jq -r .COMMIT_INFO_BRANCH)
export COMMIT_INFO_SHA=$(cat /opt/nextgenui/commit_info.json | jq -r .COMMIT_INFO_SHA)
export COMMIT_INFO_REMOTE=$(cat /opt/nextgenui/commit_info.json | jq -r .COMMIT_INFO_REMOTE)
export COMMIT_INFO_MESSAGE="$(cat /opt/nextgenui/commit_info.json | jq -r .COMMIT_INFO_MESSAGE)"
export COMMIT_INFO_AUTHOR="$(cat /opt/nextgenui/commit_info.json | jq -r .COMMIT_INFO_AUTHOR)"
export COMMIT_INFO_EMAIL=$(cat /opt/nextgenui/commit_info.json | jq -r .COMMIT_INFO_EMAIL)

# required for Xfvb
export DISPLAY=:8099

# export CYPRESS_CACHE_FOLDER=/opt/cypress_cache
# ls -lh /opt/cypress_cache
cd /opt/cypress
npx cypress install
npx cypress run --browser chrome --record --key $CYPRESS_KEY --parallel --group chrome --ci-build-id $SEQUENCE_ID

# export JOB_FAILED='false'

# DIR="./screenshots"

# NUM_SCREEN_SHOTS=$(find $DIR -type f | wc -l)

# if [ "$NUM_SCREEN_SHOTS" -gt 0 ]; then
#     echo "$DIR is not Empty"
#     JOB_FAILED='true'
# else
#     echo "$DIR is Empty"
# fi

# echo $JOB_FAILED

# exitError=0

# if $JOB_FAILED is 'true'; then
#     exitError=1
# fi

# exit $exitError
