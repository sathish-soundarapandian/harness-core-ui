#!/bin/bash
# Copyright 2022 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
set +e
. scripts/ci/read-jira-projects.sh
if [ "$?" -ne 0 ]
then
  exit 1
fi
COMMIT_CONTENT="\[feat]|\[fix]|\[techdebt]|\[refactor]|feat|fix|techdebt|refactor"
PR_MESSAGE=`echo "${ghprbPullTitle}" | grep -iE "^(${COMMIT_CONTENT}[\ ]*):[\ ]*\[(${PROJECTS})-[0-9]+][:\ ]*"`
echo "PR message is : ${PR_MESSAGE}"

if [ -z "$PR_MESSAGE" ]
then
    echo The PR title \"${ghprbPullTitle}\"
    echo "does not match the expectations"
    echo "Make sure that your commit message is in format -> ${COMMIT_CONTENT}: [${PROJECTS}-<number>]: <description>"
    echo "Example -> \"feat: [BT-100]: Commit Message\""
    exit 1
fi
