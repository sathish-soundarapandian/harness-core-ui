/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const PipelineGraphDataMock = {
  data: [
    {
      step: {
        type: 'Run',
        name: 'run unit tests',
        identifier: 'run_unit_tests',
        spec: {
          connectorRef: 'new_docker_test',
          image: 'golang:1.15',
          shell: 'Sh',
          command:
            'go get gotest.tools/gotestsum\ngotestsum --format=standard-verbose --junitfile unit-tests.xml\nCGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -tags netgo',
          reports: {
            type: 'JUnit',
            spec: {
              paths: ['*.xml']
            }
          }
        }
      }
    }
  ],
  serviceDependencies: [
    {
      identifier: 'sql',
      name: 'sql',
      description: 'sql',
      type: 'Service' as const,
      spec: {
        connectorRef: 'test',
        image: 'mysql:5'
      }
    }
  ]
}

export default PipelineGraphDataMock
