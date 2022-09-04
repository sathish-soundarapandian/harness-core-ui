/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const deploymentTemplate = {
  infrastructure: {
    variables: [
      {
        name: 'clusterUrl',
        type: 'String',
        value: 'O7G6BMS0TrizeHP_B8tzlw',
        __uuid: 'QwycFjj_Qn6RawWwpRxZqQ'
      },
      {
        name: 'port',
        type: 'String',
        value: 'Q4z8nsxrTJygXCacnUBk7A',
        __uuid: 'FKQctPE8TCWEGf7twsqCzA'
      },
      {
        name: 'pwd',
        type: 'Secret',
        value: '9J7LGiynRUy2zD3DoWkyyg',
        description: 'VTMnh4JaTDSoiQfx0fsdPA',
        __uuid: 'I0TBJynaTGeyrgdhuh8O1g'
      },
      {
        name: 'image',
        type: 'Connector',
        value: 'wPaPG-QbSQihukxDVKN7aw',
        description: 'p4TEQdoRTWKsnsVj0TaWsg',
        __uuid: 'Y--btOhdRnSe6xk7_dxqog'
      }
    ],
    fetchInstancesScript: {
      store: {
        type: 'Inline',
        spec: {
          content: 'bcQiuXwURT6ipT0oc8gxSA',
          __uuid: '6Cf1aABQR_O2k6L8Op_LDg'
        },
        __uuid: '1KH4W5QuSNuVpu4uE0bNkQ'
      },
      __uuid: 'UBMJw5j8Sf2Gyaj-qT2Zog'
    },
    instancesListPath: 'LY3q8ZGuR7WlXI7LtEozJw',
    instanceAttributes: [
      {
        name: 'hostName',
        jsonPath: 'hKjlvRelRdeQsy-DOBsAuA',
        description: 'ie9TyUcVQWC2uxtSC000Pg',
        __uuid: '6rLTeEtOR-6q3MY7CrlK2Q'
      },
      {
        name: 'appName',
        jsonPath: 'XGB6p1xtQxCNOhD4eIRqHg',
        description: 'Tlb8WjrKT7KnhIO5tR4Vhw',
        __uuid: 'xmwQUoNTRF-BS0iP5IRQrg'
      }
    ],
    __uuid: 'R1theP-YSBehx9UAZ9JNbg'
  },
  execution: {
    steps: [
      {
        step: {
          name: 'gC-UUYsfSd27TfX8clXg4A',
          identifier: 'shell1',
          type: 'ShellScript',
          timeout: 'XbhjkkJBRkua1MvVL99w3w',
          spec: {
            shell: '6HnkL0w1R5CBl-OaJzhC3g',
            onDelegate: 'L5LXJHDkR3e4RgvS8ZOoeA',
            source: {
              type: 'Inline',
              spec: {
                script: 'Z8NfnhHWS2mTma22nLh4gg',
                __uuid: 'A1puNW8STay5JbEpwKjmdg'
              },
              __uuid: 'yg38l5O-RC-LV2y0tsRW2A'
            },
            environmentVariables: [],
            outputVariables: [],
            __uuid: '8VY5UuTuRwiw_leJbehO5A'
          },
          __uuid: '21_pERLdTMmklndUJrZjbA'
        },
        __uuid: '7I1_DAaSTISa7K99w62YIA'
      }
    ],
    __uuid: '--mrqOa-SaeNOvJT6uv1qw'
  },
  identifier: 'templateInputs',
  name: 'siqWk0dzTGu_O0Dicx2bRQ',
  __uuid: 'AHZOv3wLTkSnVIwlzKy0Zg'
}

export const originalDeploymentTemplate = {
  infrastructure: {
    variables: [
      {
        name: 'clusterUrl',
        type: 'String',
        value: '<+input>'
      },
      {
        name: 'port',
        type: 'String',
        value: '100'
      },
      {
        name: 'pwd',
        type: 'Secret',
        value: '<+input>',
        description: 'IP address of the host'
      },
      {
        name: 'image',
        type: 'Connector',
        value: 'account.harnessImage',
        description: 'IP address of the host'
      }
    ],
    fetchInstancesScript: {
      store: {
        type: 'Inline',
        spec: {
          content: 'echo test'
        }
      }
    },
    instancesListPath: '<+input>',
    instanceAttributes: [
      {
        name: 'hostName',
        jsonPath: '<+input>',
        description: 'IP address of the host'
      },
      {
        name: 'appName',
        jsonPath: '<+input>',
        description: 'Application Name'
      }
    ]
  },
  execution: {
    steps: [
      {
        step: {
          name: 'shell1',
          identifier: 'shell1',
          type: 'ShellScript',
          timeout: '10m',
          spec: {
            shell: 'Bash',
            onDelegate: true,
            source: {
              type: 'Inline',
              spec: {
                script: 'efdf'
              }
            },
            environmentVariables: [],
            outputVariables: []
          }
        }
      }
    ]
  },
  identifier: 'stage_name'
}
export const metaMap = {
  '9J7LGiynRUy2zD3DoWkyyg': {
    yamlProperties: {
      fqn: 'customDeployment.infrastructure.variables.pwd',
      localName: 'infra.variables.pwd',
      variableName: 'pwd',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  O7G6BMS0TrizeHP_B8tzlw: {
    yamlProperties: {
      fqn: 'customDeployment.infrastructure.variables.clusterUrl',
      localName: 'infra.variables.clusterUrl',
      variableName: 'clusterUrl',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  'wPaPG-QbSQihukxDVKN7aw': {
    yamlProperties: {
      fqn: 'customDeployment.infrastructure.variables.image',
      localName: 'infra.variables.image',
      variableName: 'image',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  bcQiuXwURT6ipT0oc8gxSA: {
    yamlProperties: {
      fqn: 'customDeployment.infrastructure.fetchInstancesScript.store.spec.content',
      localName: 'infra.fetchInstancesScript.store.spec.content',
      variableName: 'content',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  LY3q8ZGuR7WlXI7LtEozJw: {
    yamlProperties: {
      fqn: 'customDeployment.infrastructure.instancesListPath',
      localName: 'infra.instancesListPath',
      variableName: 'instancesListPath',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  Q4z8nsxrTJygXCacnUBk7A: {
    yamlProperties: {
      fqn: 'customDeployment.infrastructure.variables.port',
      localName: 'infra.variables.port',
      variableName: 'port',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  siqWk0dzTGu_O0Dicx2bRQ: {
    yamlProperties: {
      fqn: 'customDeployment.name',
      localName: 'name',
      variableName: 'name',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  }
}
