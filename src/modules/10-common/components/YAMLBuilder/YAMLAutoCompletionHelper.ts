/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const AutoCompletionMap = new Map<string, { autoCompletionYAML: string }>([
  [
    'name: Java with Maven',
    {
      autoCompletionYAML:
        '\nversion: 1\nstages:\n  - name: Build and test Java app\n    type: ci\n    spec:\n      steps:\n        - name: Build\n          type: script\n          spec:\n            run: |-\n              echo "Welcome to Harness CI"\n              mvn install -DskipTests\n        - name: Run Tests\n          type: run_tests\n          spec:\n            language: Java\n            build_tool: Maven\n            build_args: test\n            strategy:\n              parallelism: 3'
    }
  ],
  [
    'name: Java with Gradle',
    {
      autoCompletionYAML:
        '\nversion: 1\nstages:\n  - name: Build and test Java app\n    type: ci\n    spec:\n      steps:\n        - name: Build\n          type: script\n          spec:\n            run: |-\n              echo "Welcome to Harness CI"\n              gradle build -x test\n        - name: Run Tests\n          type: run_tests\n          spec:\n            language: Java\n            build_tool: Gradle\n            build_args: test\n            strategy:\n              parallelism: 3'
    }
  ]
])
