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
        value: 'Xo3QH4LWSNuXIlO5uN-bxg',
        description: 'u4GGxCKnQwKXjHFFTOHOqg',
        __uuid: 'MykOF3FDQzaxv0OJK6J21g'
      },
      {
        name: 'pageSize',
        type: 'Number',
        value: 'ZzKGFG4gQxyBGWI5PscdwQ',
        description: 'voq_GANrSx2fCA8yWYJ7sg',
        __uuid: 'BPSLLJknTCqSvkarrn7liw'
      },
      {
        name: 'secret',
        type: 'Secret',
        value: 'jijrOEswR_y8epX0TI7GSw',
        description: 'tphA5ZiiQjaVYhraF5XzCA',
        __uuid: 'zA7T5C0jSCO7MB0z0WGjng'
      },
      {
        name: 'image',
        type: 'Connector',
        value: '6tRXMYFrQim_LavrsNSe4Q',
        description: 'hOQgyeijREKuMWQ--1OClQ',
        __uuid: 'aKgqGw7xSE-50jMuoXqUkQ'
      }
    ],
    fetchInstancesScript: {
      store: {
        type: 'Inline',
        spec: {
          content: 'nsAW3WY7Q0mhCNKK9JiZNw',
          __uuid: 'MaduVrIIRk689S2aU3qnog'
        },
        __uuid: '9JR2BFPbQsSn9_S95aGHYA'
      },
      __uuid: 'SesR-wfSSyi3Pld5T_kbOA'
    },
    instanceAttributes: [
      {
        name: 'hostname',
        jsonPath: 'klVcayjvQtyPVldlk2Ercg',
        description: 'y-ZWNcQqSqyhIQm1-4_NEg',
        __uuid: 'p5em0zFlR9eQdsKKpvxUlw'
      },
      {
        name: 'appName',
        jsonPath: 'qxV5nfR5Q8KqIjZRbobv5g',
        description: 'fG8QPFoiSmmQQx4FNtdpWQ',
        __uuid: 'UqnM-q9fQeGVziIKCq4EGQ'
      }
    ],
    instancesListPath: 'YABVRssYQcmrTcNI5-7ZfQ',
    __uuid: 'aj-Pah5BQdygqRkJVAYBVA'
  },
  execution: {
    stepTemplateRefs: [
      {
        templateRef: 'W88MZCAGS7mJlqR6uAf7WQ',
        versionLabel: 'WMb3oiFsR0qLof39eHB91g',
        __uuid: '4QOEW1RLRjmQ_ZiCSAG3yg'
      }
    ],
    __uuid: 'oDWSaDhsRxK0KYsVIrHKVg'
  },
  identifier: 'templateInputs',
  name: '_Z2LtfghQ9q9extkOqJahA',
  __uuid: 'kTVUhM6LRmy1cuUrx7NpFg'
}

export const originalDeploymentTemplate = {
  infrastructure: {
    variables: [
      {
        name: 'clusterUrl',
        type: 'String',
        value: '<+input>',
        description: ''
      },
      {
        name: 'pageSize',
        type: 'Number',
        value: 100,
        description: ''
      },
      {
        name: 'secret',
        type: 'Secret',
        value: '<+input>',
        description: ''
      },
      {
        name: 'image',
        type: 'Connector',
        value: 'test',
        description: 'Sample Connector'
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
    instanceAttributes: [
      {
        name: 'hostname',
        jsonPath: 'ip',
        description: 'IP address of the host'
      },
      {
        name: 'appName',
        jsonPath: 'app',
        description: 'Application name'
      }
    ],
    instancesListPath: 'instances'
  },
  execution: {
    stepTemplateRefs: [
      {
        templateRef: 'org.shell1',
        versionLabel: '1'
      }
    ]
  },
  identifier: 'stage_name'
}
export const metaMap = {
  ZzKGFG4gQxyBGWI5PscdwQ: {
    yamlProperties: {
      fqn: 'stage.spec.infrastructure.output.variables.pageSize',
      localName: 'infra.variables.pageSize',
      variableName: 'pageSize',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  jijrOEswR_y8epX0TI7GSw: {
    yamlProperties: {
      fqn: 'stage.spec.infrastructure.output.variables.secret',
      localName: 'infra.variables.secret',
      variableName: 'secret',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  nsAW3WY7Q0mhCNKK9JiZNw: {
    yamlProperties: {
      fqn: 'stage.spec.infrastructure.output.fetchInstancesScript.store.spec.content',
      localName: 'infra.fetchInstancesScript.store.spec.content',
      variableName: 'content',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  'YABVRssYQcmrTcNI5-7ZfQ': {
    yamlProperties: {
      fqn: 'stage.spec.infrastructure.output.instancesListPath',
      localName: 'infra.instancesListPath',
      variableName: 'instancesListPath',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  _Z2LtfghQ9q9extkOqJahA: {
    yamlProperties: {
      fqn: 'customDeployment.name',
      localName: 'name',
      variableName: 'name',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  'Xo3QH4LWSNuXIlO5uN-bxg': {
    yamlProperties: {
      fqn: 'stage.spec.infrastructure.output.variables.clusterUrl',
      localName: 'infra.variables.clusterUrl',
      variableName: 'clusterUrl',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  },
  '6tRXMYFrQim_LavrsNSe4Q': {
    yamlProperties: {
      fqn: 'stage.spec.infrastructure.output.variables.image',
      localName: 'infra.variables.image',
      variableName: 'image',
      aliasFQN: '',
      visible: true
    },
    yamlOutputProperties: null,
    yamlExtraProperties: null
  }
}
