# Copyright 2022 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.

# ------ from Commit List => extract JIRA Tickets
. scripts/ci/read-jira-projects.sh
if [ "$?" -ne 0 ]
then
  exit 1
fi
VERSION=$(cat package.json | grep version | cut -d: -f2 | cut -d\" -f2)
echo $VERSION
KEYS=`git log --pretty=oneline --abbrev-commit | awk "1;/Branching to release\//{exit}" | grep -o -iE '('${PROJECTS}')-[0-9]+' | sort | uniq`
echo --- List of JIRA ---
echo $KEYS
echo --- End

# status id 151 is for Dev complete
STATUS_ID=151

if [ ! -z "$STATUS_ID_TO_MOVE" ]
then
      STATUS_ID=$STATUS_ID_TO_MOVE
fi

if [ "${PURPOSE}" = "ui" ]
then
    FIELD_ID="customfield_10787"
elif [ "${PURPOSE}" = "ui-on-prem" ]
then
    # ** POTENTIAL BUG ALERT **
    # 10647 is Release_UI_OnPrem
    # I believe this script should be setting
    # Release_NG_UI_OnPrem (customfield_10926)
    # MB - 2022-07-19
    FIELD_ID="customfield_10647"
else
   echo "Unknown purpose ${PURPOSE}"
   exit 1
fi
# => add a field to those tickets
for KEY in ${KEYS}
do
    echo Updating JIRA: $KEY
    curl \
       -X PUT \
       --data "{ \"fields\" : { \"${FIELD_ID}\" : \"${VERSION}\" }}" \
       -H "Content-Type: application/json" \
       https://harness.atlassian.net/rest/api/2/issue/${KEY} \
       --user $JIRA_USERNAME:$JIRA_PASSWORD

    status=`curl -X GET -H "Content-Type: application/json" https://harness.atlassian.net/rest/api/2/issue/${KEY}?fields=status --user $JIRA_USERNAME:$JIRA_PASSWORD | jq ".fields.status.name" | tr -d '"'`
    if [[ "${status}" = "QA Test" || "${status}" = "Done" || "${status}" = "Under investigation" ]]
            then
               echo " ${KEY}  is in Done or QA-Test status, Hence no update"
            else
               echo " ${KEY}  is in  ${status} , Hence moving to QA-Test status"
               curl \
                 -X POST \
                --data "{\"transition\":{\"id\":\"${STATUS_ID}\"}}" \
                -H "Content-Type: application/json" \
                https://harness.atlassian.net/rest/api/2/issue/${KEY}/transitions \
                --user $JIRA_USERNAME:$JIRA_PASSWORD
    fi
done
# Note - $EXECUTE_NEW_VERSION_CODE should be added to the appropriate ci Jobs for this to work
# Also, once this is rolled out for good, then this code needs to be integrated into the loop above instead
# of having two loops over the same jira cases.

if [ "${EXECUTE_NEW_VERSION_CODE}" == "true" ]; then
  # Set the next version number - this will be something like 0.325.0
  NEXT_VERSION="$VERSION"

  echo "Setting Fix Version to $NEXT_VERSION on issues in this release"
  EXCLUDE_PROJECTS=",ART,OENG,OPS,SWAT,"
  for KEY in ${KEYS}
  do
    echo "$KEY"
    # Extract Jira project from Jira key
    IFS="-" read -ra PROJNUM <<< "$KEY"
    PROJ="${PROJNUM[0]}"
    # If it is in the exclude projects list, then do not attempt to set the fix version
    if [[ "$EXCLUDE_PROJECTS" == *",$PROJ,"* ]]; then
      echo "Skipping $KEY - project is archived or not relevant to versions."
    else
      response=$(curl -q -X PUT https://harness.atlassian.net/rest/api/2/issue/${KEY} --write-out '%{http_code}' --user ${JIRA_USERNAME}:${JIRA_PASSWORD} -H "Content-Type: application/json" -d '{
        "update": {
          "fixVersions": [
            {"add":
              {"name": "'"$NEXT_VERSION"'" }
            }
          ]
        }
      }')
      if [[ "$response" -eq 204 ]] ; then
        echo "$KEY fixVersion set to $NEXT_VERSION"
      elif [[ "$response" -eq 400 ]] ; then
        echo "Could not set fixVersion on $KEY - field hidden for the issue type"
      fi
    fi
  done
fi
