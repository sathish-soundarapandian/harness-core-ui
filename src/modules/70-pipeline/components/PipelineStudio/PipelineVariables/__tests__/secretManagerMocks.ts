/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const secretManager = {
  executionTarget: {
    workingDirectory: 'RPDKLY-_QeCLWEEusuCt-A',
    host: 'MoboQU7QSKWK2bRO3l72_Q',
    __uuid: '2jMBz6x7SxiogwZXlPp2ug'
  },
  shell: 'uXO-0JQ-SJq78aTuLWTcOg',
  source: {
    spec: { script: 'DKHp2KKJTwqvx4kuxcUUFw', type: 'Inline', __uuid: 'Ht2YXMCzR3yj1Ip-ARnwLg' },
    __uuid: 'REk2EyGGRcGBHpXXWEgKfQ'
  },
  onDelegate: 'SxciQfmXS5azRh0Y3_Bieg',
  environmentVariables: [
    { name: 'key', type: 'String', value: 'S8aBdrH8SnmkH1Iy6pdb4g', __uuid: 'yTKA2GzQTAO-JIdtRVhQbA' },
    { name: 'url', type: 'String', value: 'oSRdZjZlTCaK32s9yr6exg', __uuid: 'aanHLkPHQ0CPmh0Tcay7LQ' },
    { name: 'namespace', type: 'String', value: '4vAp5TI7R6O0_myCaJvAmQ', __uuid: 'x14d2R_wS42ON_vmb1opYg' }
  ],
  __uuid: 'nztbzpt9QuaUhBRhRb0YqQ'
}

export const originalSecretManager = {
  executionTarget: { workingDirectory: 'hjgjj', host: '<+input>' },
  shell: 'Bash',
  source: {
    spec: {
      script:
        'curl -o secret.json -X GET <+spec.environmentVariables.url>/<+spec.environmentVariables.engineName>/<+spec.environmentVariables.namespace> -H \'X-Vault-Token: <+secrets.getValue("vaulttoken")>\'\nsecret=$(jq -r \'.data."<+spec.environmentVariables.key>"\' secret.json)',
      type: 'Inline'
    }
  },
  onDelegate: true,
  environmentVariables: [
    { name: 'key', type: 'String', value: '<+input>' },
    { name: 'url', type: 'String', value: '<+input>' },
    { name: 'namespace', type: 'String', value: '<+input>' }
  ],
  identifier: 'stage_name'
}
export const metaMap = {
  'uXO-0JQ-SJq78aTuLWTcOg': {
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  SxciQfmXS5azRh0Y3_Bieg: {
    yamlProperties: {
      fqn: 'secretManager.onDelegate',
      localName: '',
      variableName: 'onDelegate',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  MoboQU7QSKWK2bRO3l72_Q: {
    yamlProperties: {
      fqn: 'secretManager.executionTarget.host',
      localName: '',
      variableName: 'host',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  oSRdZjZlTCaK32s9yr6exg: {
    yamlProperties: {
      fqn: 'secretManager.environmentVariables.url',
      localName: '',
      variableName: 'url',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  DKHp2KKJTwqvx4kuxcUUFw: {
    yamlProperties: {
      fqn: 'secretManager.source.spec.script',
      localName: '',
      variableName: 'script',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  '4vAp5TI7R6O0_myCaJvAmQ': {
    yamlProperties: {
      fqn: 'secretManager.environmentVariables.namespace',
      localName: '',
      variableName: 'namespace',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  'RPDKLY-_QeCLWEEusuCt-A': {
    yamlProperties: {
      fqn: 'secretManager.executionTarget.workingDirectory',
      localName: '',
      variableName: 'workingDirectory',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  S8aBdrH8SnmkH1Iy6pdb4g: {
    yamlProperties: {
      fqn: 'secretManager.environmentVariables.key',
      localName: '',
      variableName: 'key',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  }
}
