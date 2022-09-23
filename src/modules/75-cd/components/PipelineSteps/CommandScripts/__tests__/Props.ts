/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const name = 'command-step'
export const timeout = '10s'
export const environmentVariables = [
  {
    name: 'iv1',
    type: 'String',
    value: 'test iv1'
  },
  {
    name: 'iv2',
    type: 'String',
    value: '<+input>'
  }
]
export const commandUnits = [
  {
    identifier: 'Copy_Cmd_1',
    name: 'Copy Cmd 1',
    type: 'Copy',
    spec: {
      sourceType: 'Artifact',
      destinationPath: 'abc'
    }
  },
  {
    identifier: 'Script_Cmd_1',
    name: 'Script Cmd 1',
    type: 'Script',
    spec: {
      workingDirectory: 'def',
      shell: 'Bash',
      source: {
        type: 'Inline',
        spec: {
          script: "echo 'def'"
        }
      }
    }
  }
]
export const outputVariables = [
  {
    name: 'ov3',
    type: 'String',
    value: '<+input>'
  },
  {
    name: 'ov4',
    type: 'String',
    value: '<+input>'
  }
]
