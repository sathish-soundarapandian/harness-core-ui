
. scripts/ci/read-jira-projects.sh
if [ "$?" -ne 0 ]
then
  exit 1
fi

git log --remotes=origin/release/* --pretty=oneline --abbrev-commit | grep -iE "\[(${PROJECTS})-[0-9]+]:" -o | sort | uniq | tr '[:lower:]' '[:upper:]' > release.txt
git log --remotes=origin/pre_qa/ng-ui* --pretty=oneline --abbrev-commit | grep -iE "\[(${PROJECTS})-[0-9]+]:" -o | sort | uniq | tr '[:lower:]' '[:upper:]' > pre_qa.txt
NOT_MERGED=`comm -23 release.txt pre_qa.txt | tr '\n' ' '`

if [ -z "$NOT_MERGED" ]
then
      echo "All Hotfix changes are reflected in Develop as well" > envvars
else
      echo NOT_MERGED="${NOT_MERGED}" > envvars
fi