/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const originalYaml =
  'infrastructureDefinition:\n  name: testCase\n  identifier: testCase\n  description: ""\n  tags: {}\n  orgIdentifier: default\n  projectIdentifier: pratyushtest\n  environmentRef: testEnv\n  deploymentType: CustomDeployment\n  type: CustomDeployment\n  spec:\n    customDeploymentRef:\n      templateRef: testCase\n      versionLabel: "1"\n    variables:\n      - name: string\n        type: String\n        value: value1\n        description: ""\n      - name: secret\n        type: Secret\n        value: testGit\n        description: ""\n      - name: number\n        type: Number\n        value: <+stage.spec.infrastructure.output.variables.number1>\n        description: ""\n      - name: number1\n        type: Number\n        value: 11\n        description: ""\n  allowSimultaneousDeployments: false\n'

export const refreshedYaml =
  'infrastructureDefinition:\n  name: "testCase"\n  identifier: "testCase"\n  description: ""\n  tags: {}\n  orgIdentifier: "default"\n  projectIdentifier: "pratyushtest"\n  environmentRef: "testEnv"\n  deploymentType: "CustomDeployment"\n  type: "CustomDeployment"\n  spec:\n    customDeploymentRef:\n      templateRef: "testCase"\n      versionLabel: "1"\n    variables:\n    - name: "string"\n      type: "String"\n      value: "value1"\n      description: ""\n    - name: "secret"\n      type: "Secret"\n      value: "testGit"\n      description: ""\n    - name: "number"\n      type: "Number"\n      value: "<+stage.spec.infrastructure.output.variables.number1>"\n      description: ""\n    - name: "number1"\n      type: "Number"\n      value: 11\n      description: ""\n    - name: "test"\n      type: "String"\n      value: ""\n      description: ""\n  allowSimultaneousDeployments: false\n'
