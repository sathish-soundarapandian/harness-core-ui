# Copyright 2023 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.

# Run Jest and store the output in a variable

yarn test --json "$@" > jest_output.json

tail -n +3 jest_output.json > temp_file.json && mv temp_file.json jest_output.json

jest_output=$(cat jest_output.json)


# Extract the failed tests from the Jest output
failed_tests=$(cat jest_output.json | jq -r '.testResults[] | select(.status == "failed") | .name')

echo "$failed_tests"

# If there are no failed tests, exit
if [ -z "$failed_tests" ]; then
  echo "All tests passed!"
  exit 0
fi

# Re-run the failed tests
echo "Re-running failed tests..."
echo "$failed_tests" | while read -r test; do
  yarn jest "$test" --silent "$@"
done

rm jest_output.json
rm temp_file.json