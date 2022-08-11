#!/bin/bash
# Copyright 2022 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
. scripts/ci/read-jira-projects.sh
if [ "$?" -ne 0 ]
then
  exit 1
fi
# Get affected projects by this release
KEYPROJS=$(git log --pretty=oneline --abbrev-commit | awk "1;/Branching to release\//{exit}" | grep -o -iE '('${PROJECTS}')' | tr '[:lower:]' '[:upper:]' | sort | uniq)
# Set the release date of the version to the date that the build is being done.
RELDATE=$(date +'%Y-%m-%d')
# Set the next version number - this will be something like 0.335.0
export NEXT_VERSION=$(cat package.json | grep version | cut -d: -f2 | cut -d\" -f2)
echo "Creating $NEXT_VERSION in product Jira projects"
# Exclude projects that have been archived, replaced, deleted, or non-product
EXCLUDE_PROJECTS=",ART,OENG,OPS,SWAT,"
# Iterate over projects
for PROJ in "${KEYPROJS}"
 do
    if [[ "$EXCLUDE_PROJECTS" == *",$PROJ,"* ]]; then
      echo "Skipping $PROJ - it has been archived or is not applicable"
    else
      # Call CURL and store http response code into $response
      response=$(curl -X POST https://harness.atlassian.net/rest/api/2/version/ --write-out '%{http_code}' --output /dev/null --silent --user ${JIRA_USERNAME}:${JIRA_PASSWORD} -H "Content-Type: application/json" -d '{
        "project":"'"$PROJ"'",
        "name": "'"$NEXT_VERSION"'",
        "releaseDate": "'"$RELDATE"'",
        "archived": false,
        "released": true }')
      # http status code 201 is "Created" - anything else is a failure
      if  [[ "$response" -ne 201 ]] ; then
        echo "Failed to create version $NEXT_VERSION in $PROJ - Response code: $response"
        if [[ "$response" -eq 404 ]] ; then
          echo "404 response indicates that user $JIRA_USERNAME does not have permissions to create versions in project $PROJ"
        fi
      else
        echo "Successfully created version $NEXT_VERSION in $PROJ"
      fi
    fi
 done
