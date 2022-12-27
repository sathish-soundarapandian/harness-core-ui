# Copyright 2022 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.

export BRANCH=develop
git checkout $BRANCH

# bump minor version (0.1.0 -> 0.2.0)
#yarn version --minor --no-git-tag-version --no-commit-hooks
#git add package.json
export VERSION_FILE="package.json"
# get branch name (0.2.0 -> 0.2.x)
export VERSION=$(cat package.json | grep version | cut -d: -f2 | cut -d\" -f2 | cut -d. -f1,2).x
echo $VERSION

SPLIT_VERSION=`echo "$VERSION" | awk -F'.' '{print $2}'`
NEW_VERSION=$(( ${SPLIT_VERSION}+1 ))
echo $NEW_VERSION

sed -i "s:\"0.${SPLIT_VERSION}.0\":\"0.${NEW_VERSION}.0\":g" ${VERSION_FILE}
git add ${VERSION_FILE}
git commit -m "Branching to release/${VERSION}. New version 0.${NEW_VERSION}.x"
git push origin develop

#update jira
. scripts/ci/jira-tagging-ngui-qa.sh
