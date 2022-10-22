/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import {
  isEditEnvironment,
  isEditEnvironmentOrEnvGroup,
  isEditInfrastructure,
  processNonGitOpsInitialValues,
  processGitOpsEnvironmentInitialValues,
  processGitOpsEnvGroupInitialValues,
  processNonGitOpsFormValues,
  processGitOpsEnvironmentFormValues,
  processGitOpsEnvGroupFormValues,
  processInputSetInitialValues,
  CustomStepProps
} from '../utils'

const getString = (key: any): any => {
  return key
}

describe('deploy environment or group pipeline utils', () => {
  test('isEditEnvironment returns the right values', () => {
    expect(isEditEnvironment()).toEqual(false)
    expect(isEditEnvironment({})).toEqual(false)
    expect(isEditEnvironment({ identifier: '' })).toEqual(false)
    expect(isEditEnvironment({ identifier: 'returnsTrue' })).toEqual(true)
  })

  test('isEditEnvironmentOrEnvGroup returns the right values', () => {
    expect(isEditEnvironmentOrEnvGroup()).toEqual(false)
    expect(isEditEnvironmentOrEnvGroup({})).toEqual(false)
    expect(isEditEnvironmentOrEnvGroup({ identifier: '' })).toEqual(false)
    expect(isEditEnvironmentOrEnvGroup({ identifier: 'returnsTrue' })).toEqual(true)
  })

  test('isEditInfrastructure returns the right values', () => {
    expect(isEditInfrastructure()).toEqual(false)
    expect(isEditInfrastructure('')).toEqual(false)
    expect(isEditInfrastructure('returnsTrue')).toEqual(true)
  })
})

describe('deploy environment or group initial values utils', () => {
  test('processNonGitOpsInitialValues returns the right values', () => {
    expect(processNonGitOpsInitialValues({})).toEqual({
      environment: { deployToAll: false, environmentRef: '' },
      infrastructureRef: ''
    })

    expect(
      processNonGitOpsInitialValues({
        environment: {
          environmentRef: 'env_1',
          deployToAll: false
        }
      })
    ).toEqual({ environment: { deployToAll: false, environmentRef: 'env_1' }, infrastructureRef: '' })

    expect(
      processNonGitOpsInitialValues({
        environment: {
          environmentRef: 'env_1',
          deployToAll: false,
          infrastructureDefinitions: []
        }
      })
    ).toEqual({ environment: { deployToAll: false, environmentRef: 'env_1' }, infrastructureRef: [] })

    expect(
      processNonGitOpsInitialValues({
        environment: {
          environmentRef: 'env_1',
          deployToAll: false,
          infrastructureDefinitions: RUNTIME_INPUT_VALUE as any
        }
      })
    ).toEqual({ environment: { deployToAll: false, environmentRef: 'env_1' }, infrastructureRef: RUNTIME_INPUT_VALUE })

    expect(
      processNonGitOpsInitialValues({
        environment: {
          environmentRef: 'env_1',
          deployToAll: false,
          infrastructureDefinitions: [
            {
              identifier: 'infra_1'
            }
          ]
        }
      })
    ).toEqual({ environment: { deployToAll: false, environmentRef: 'env_1' }, infrastructureRef: 'infra_1' })
  })

  test('processGitOpsEnvironmentInitialValues returns the right values', () => {
    expect(processGitOpsEnvironmentInitialValues({}, getString)).toEqual({
      clusterRef: [],
      deployToAll: false,
      environmentOrEnvGroupAsRuntime: 'Environment',
      environmentOrEnvGroupRef: '',
      isEnvGroup: false
    })

    expect(
      processGitOpsEnvironmentInitialValues(
        {
          environment: {
            environmentRef: 'env_2',
            deployToAll: true
          }
        },
        getString
      )
    ).toEqual({
      clusterRef: [{ label: 'cd.pipelineSteps.environmentTab.allClustersSelected', value: 'all' }],
      deployToAll: true,
      environmentOrEnvGroupAsRuntime: 'Environment',
      environmentOrEnvGroupRef: 'env_2',
      isEnvGroup: false
    })

    expect(
      processGitOpsEnvironmentInitialValues(
        {
          environment: {
            environmentRef: 'env_2',
            deployToAll: true,
            gitOpsClusters: RUNTIME_INPUT_VALUE as any
          }
        },
        getString
      )
    ).toEqual({
      clusterRef: RUNTIME_INPUT_VALUE,
      deployToAll: true,
      environmentOrEnvGroupAsRuntime: 'Environment',
      environmentOrEnvGroupRef: 'env_2',
      isEnvGroup: false
    })

    expect(
      processGitOpsEnvironmentInitialValues(
        {
          environment: {
            environmentRef: 'env_2',
            deployToAll: false,
            gitOpsClusters: [
              {
                identifier: 'cluster_1'
              },
              {
                identifier: 'cluster_2'
              }
            ]
          }
        },
        getString
      )
    ).toEqual({
      clusterRef: [
        { label: 'cluster_1', value: 'cluster_1' },
        { label: 'cluster_2', value: 'cluster_2' }
      ],
      deployToAll: false,
      environmentOrEnvGroupAsRuntime: 'Environment',
      environmentOrEnvGroupRef: 'env_2',
      isEnvGroup: false
    })
  })

  test('processGitOpsEnvGroupInitialValues returns the right values', () => {
    expect(processGitOpsEnvGroupInitialValues({}, getString)).toEqual({
      clusterRef: undefined,
      deployToAll: false,
      environmentOrEnvGroupAsRuntime: 'Environment Group',
      environmentOrEnvGroupRef: '',
      environmentsInEnvGroup: [],
      isEnvGroup: true
    })

    expect(
      processGitOpsEnvGroupInitialValues(
        {
          environmentGroup: {
            envGroupRef: RUNTIME_INPUT_VALUE,
            deployToAll: true
          }
        },
        getString
      )
    ).toEqual({
      clusterRef: undefined,
      deployToAll: true,
      environmentOrEnvGroupAsRuntime: 'Environment Group',
      environmentOrEnvGroupRef: RUNTIME_INPUT_VALUE,
      environmentsInEnvGroup: RUNTIME_INPUT_VALUE,
      isEnvGroup: true
    })

    expect(
      processGitOpsEnvGroupInitialValues(
        {
          environmentGroup: {
            envGroupRef: 'env_group_1',
            deployToAll: true
          }
        },
        getString
      )
    ).toEqual({
      clusterRef: undefined,
      deployToAll: true,
      environmentOrEnvGroupAsRuntime: 'Environment Group',
      environmentOrEnvGroupRef: 'env_group_1',
      environmentsInEnvGroup: [{ name: 'all' }],
      isEnvGroup: true
    })

    expect(
      processGitOpsEnvGroupInitialValues(
        {
          environmentGroup: {
            envGroupRef: 'env_group_2',
            deployToAll: false,
            environments: [
              {
                environmentRef: 'env_3',
                deployToAll: true
              },
              {
                environmentRef: 'env_4',
                deployToAll: false,
                gitOpsClusters: [
                  {
                    identifier: 'cluster_3'
                  },
                  {
                    identifier: 'cluster_4'
                  }
                ]
              }
            ]
          }
        },
        getString
      )
    ).toEqual({
      clusterRef: [
        { label: 'all', parentLabel: 'env_3', parentValue: 'env_3', value: 'all' },
        { label: 'cluster_3', parentLabel: 'env_4', parentValue: 'env_4', value: 'cluster_3' },
        { label: 'cluster_4', parentLabel: 'env_4', parentValue: 'env_4', value: 'cluster_4' }
      ],
      deployToAll: false,
      environmentOrEnvGroupAsRuntime: 'Environment Group',
      environmentOrEnvGroupRef: 'env_group_2',
      environmentsInEnvGroup: [
        { deployToAll: true, name: 'env_3' },
        { clusters: [{ identifier: 'cluster_3' }, { identifier: 'cluster_4' }], deployToAll: false, name: 'env_4' }
      ],
      isEnvGroup: true
    })
  })
})

describe('deploy environment or group form values utils', () => {
  test('processNonGitOpsFormValues returns the right values', () => {
    expect(processNonGitOpsFormValues({})).toEqual({ environment: { deployToAll: false, environmentRef: undefined } })

    expect(
      processNonGitOpsFormValues({
        environment: {
          environmentRef: RUNTIME_INPUT_VALUE,
          deployToAll: false
        }
      })
    ).toEqual({
      environment: {
        deployToAll: false,
        environmentInputs: RUNTIME_INPUT_VALUE,
        environmentRef: RUNTIME_INPUT_VALUE,
        infrastructureDefinitions: RUNTIME_INPUT_VALUE,
        serviceOverrideInputs: RUNTIME_INPUT_VALUE
      }
    })

    expect(
      processNonGitOpsFormValues({
        environment: {
          environmentRef: 'env_6',
          deployToAll: false,
          environmentInputs: {
            variables: [
              {
                name: 'test',
                type: 'String',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          },
          serviceOverrideInputs: {
            variables: [
              {
                name: 'test',
                type: 'String',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          }
        },
        infrastructureRef: RUNTIME_INPUT_VALUE as any
      })
    ).toEqual({
      environment: {
        deployToAll: false,
        environmentInputs: { variables: [{ name: 'test', type: 'String', value: RUNTIME_INPUT_VALUE }] },
        environmentRef: 'env_6',
        infrastructureDefinitions: RUNTIME_INPUT_VALUE,
        serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: RUNTIME_INPUT_VALUE }] }
      }
    })

    expect(
      processNonGitOpsFormValues({
        environment: {
          environmentRef: 'env_7',
          deployToAll: false
        },
        infrastructureRef: 'infra_7'
      })
    ).toEqual({
      environment: {
        deployToAll: false,
        environmentRef: 'env_7',
        infrastructureDefinitions: [{ identifier: 'infra_7' }]
      }
    })

    expect(
      processNonGitOpsFormValues({
        environment: {
          environmentRef: 'env_8',
          deployToAll: false
        },
        infrastructureRef: 'infra_8',
        infrastructureInputs: {
          infrastructureDefinitions: [
            {
              identifier: 'infra_8',
              inputs: {
                identifier: 'infra_8',
                type: 'KubernetesDirect',
                spec: {
                  namespace: RUNTIME_INPUT_VALUE
                }
              }
            }
          ]
        }
      })
    ).toEqual({
      environment: {
        deployToAll: false,
        environmentRef: 'env_8',
        infrastructureDefinitions: [
          {
            identifier: 'infra_8',
            inputs: { identifier: 'infra_8', spec: { namespace: RUNTIME_INPUT_VALUE }, type: 'KubernetesDirect' }
          }
        ]
      }
    })
  })

  test('processGitOpsEnvironmentFormValues returns the right values', () => {
    expect(processGitOpsEnvironmentFormValues({}, getString)).toEqual({
      environment: { deployToAll: false, environmentRef: '' }
    })

    expect(
      processGitOpsEnvironmentFormValues(
        {
          environmentOrEnvGroupRef: RUNTIME_INPUT_VALUE
        },
        getString
      )
    ).toEqual({
      environment: {
        deployToAll: RUNTIME_INPUT_VALUE,
        environmentInputs: RUNTIME_INPUT_VALUE,
        environmentRef: RUNTIME_INPUT_VALUE,
        gitOpsClusters: RUNTIME_INPUT_VALUE,
        serviceOverrideInputs: RUNTIME_INPUT_VALUE
      }
    })

    expect(
      processGitOpsEnvironmentFormValues(
        {
          environmentOrEnvGroupRef: { label: 'env_9', value: 'env_9' },
          clusterRef: RUNTIME_INPUT_VALUE
        },
        getString
      )
    ).toEqual({
      environment: { deployToAll: RUNTIME_INPUT_VALUE, environmentRef: 'env_9', gitOpsClusters: RUNTIME_INPUT_VALUE }
    })

    expect(
      processGitOpsEnvironmentFormValues(
        {
          environmentOrEnvGroupRef: { label: 'env_10', value: 'env_10' },
          environment: {
            environmentRef: 'env_10',
            deployToAll: true,
            environmentInputs: {
              variables: [
                {
                  name: 'test',
                  type: 'String',
                  value: RUNTIME_INPUT_VALUE
                }
              ]
            },
            serviceOverrideInputs: {
              variables: [
                {
                  name: 'test',
                  type: 'String',
                  value: RUNTIME_INPUT_VALUE
                }
              ]
            }
          },
          clusterRef: [
            {
              label: 'cd.pipelineSteps.environmentTab.allClustersSelected',
              value: 'all'
            }
          ]
        },
        getString
      )
    ).toEqual({
      environment: {
        deployToAll: true,
        environmentInputs: { variables: [{ name: 'test', type: 'String', value: RUNTIME_INPUT_VALUE }] },
        environmentRef: 'env_10',
        serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: RUNTIME_INPUT_VALUE }] }
      }
    })

    expect(
      processGitOpsEnvironmentFormValues(
        {
          environmentOrEnvGroupRef: { label: 'env_11', value: 'env_11' },
          environment: {
            environmentRef: 'env_10',
            deployToAll: true
          },
          clusterRef: [
            {
              label: 'cluster_6',
              value: 'cluster_6'
            }
          ]
        },
        getString
      )
    ).toEqual({
      environment: { deployToAll: false, environmentRef: 'env_11', gitOpsClusters: [{ identifier: 'cluster_6' }] }
    })
  })

  test('processGitOpsEnvGroupFormValues returns the right values', () => {
    expect(processGitOpsEnvGroupFormValues({}, getString)).toEqual({
      environmentGroup: { deployToAll: false, envGroupRef: '', environments: undefined }
    })

    expect(processGitOpsEnvGroupFormValues({ environmentOrEnvGroupRef: RUNTIME_INPUT_VALUE }, getString)).toEqual({
      environmentGroup: { deployToAll: true, envGroupRef: RUNTIME_INPUT_VALUE }
    })

    expect(
      processGitOpsEnvGroupFormValues(
        {
          environmentOrEnvGroupRef: {
            label: 'env_group_2',
            value: 'env_group_2'
          },
          environmentInEnvGroupRef: RUNTIME_INPUT_VALUE
        },
        getString
      )
    ).toEqual({
      environmentGroup: { deployToAll: false, envGroupRef: 'env_group_2', environments: RUNTIME_INPUT_VALUE }
    })

    expect(
      processGitOpsEnvGroupFormValues(
        {
          environmentOrEnvGroupRef: {
            label: 'env_group_2',
            value: 'env_group_2'
          },
          environmentInEnvGroupRef: [
            {
              label: 'all',
              value: 'all'
            }
          ]
        },
        getString
      )
    ).toEqual({ environmentGroup: { deployToAll: true, envGroupRef: 'env_group_2' } })

    expect(
      processGitOpsEnvGroupFormValues(
        {
          environmentOrEnvGroupRef: {
            label: 'env_group_3',
            value: 'env_group_3'
          },
          environmentInEnvGroupRef: [
            {
              label: 'env_12',
              value: 'env_12'
            },
            {
              label: 'env_13',
              value: 'env_13'
            }
          ],
          clusterRef: [
            {
              label: 'all',
              value: 'all',
              parentLabel: 'env_11',
              parentValue: 'env_11'
            },
            {
              label: 'cluster_10',
              value: 'cluster_10',
              parentLabel: 'env_12',
              parentValue: 'env_12'
            },
            {
              label: 'cluster_11',
              value: 'cluster_11',
              parentLabel: 'env_13',
              parentValue: 'env_12'
            }
          ] as any
        },
        getString
      )
    ).toEqual({
      environmentGroup: {
        deployToAll: false,
        envGroupRef: 'env_group_3',
        environments: [
          {
            deployToAll: false,
            environmentRef: 'env_12',
            gitOpsClusters: [{ identifier: 'cluster_10' }, { identifier: 'cluster_11' }]
          },
          { deployToAll: true, environmentRef: 'env_13' }
        ]
      }
    })
  })
})

const getCustomStepProps = (gitOpsEnabled = false): CustomStepProps => ({
  getString,
  stageIdentifier: 'stage_1',
  gitOpsEnabled
})

describe('deploy environment or group input set initial values utils', () => {
  test('processInputSetInitialValues returns the right values', () => {
    expect(processInputSetInitialValues({}, getCustomStepProps())).toEqual({ environment: {}, infrastructureRef: '' })

    expect(
      processInputSetInitialValues(
        {
          environment: {
            environmentRef: 'env_14',
            deployToAll: false,
            environmentInputs: {
              variables: [
                {
                  name: 'test1',
                  type: 'String',
                  value: 'test1'
                }
              ]
            },
            serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] },
            infrastructureDefinitions: [
              {
                identifier: 'infra_8'
              }
            ]
          }
        },
        getCustomStepProps()
      )
    ).toEqual({
      environment: {
        environmentInputs: { variables: [{ name: 'test1', type: 'String', value: 'test1' }] },
        environmentRef: 'env_14',
        infrastructureDefinitions: [{ identifier: 'infra_8' }],
        serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] }
      },
      infrastructureRef: 'infra_8'
    })

    expect(
      processInputSetInitialValues(
        {
          environment: {
            environmentRef: 'env_15',
            deployToAll: false,
            environmentInputs: {
              variables: [
                {
                  name: 'test1',
                  type: 'String',
                  value: 'test1'
                }
              ]
            },
            serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] }
          }
        },
        getCustomStepProps()
      )
    ).toEqual({
      environment: {
        environmentInputs: { variables: [{ name: 'test1', type: 'String', value: 'test1' }] },
        environmentRef: 'env_15',
        serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] }
      },
      infrastructureRef: ''
    })

    expect(
      processInputSetInitialValues(
        {
          environment: {
            environmentRef: 'env_16',
            deployToAll: false,
            environmentInputs: {
              variables: [
                {
                  name: 'test1',
                  type: 'String',
                  value: 'test1'
                }
              ]
            },
            serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] },
            gitOpsClusters: [
              {
                identifier: 'cluster_8'
              },
              {
                identifier: 'cluster_9'
              }
            ]
          }
        },
        getCustomStepProps(true)
      )
    ).toEqual({
      clusterRef: [
        { label: 'cluster_8', value: 'cluster_8' },
        { label: 'cluster_9', value: 'cluster_9' }
      ],
      environment: {
        environmentInputs: { variables: [{ name: 'test1', type: 'String', value: 'test1' }] },
        environmentRef: 'env_16',
        gitOpsClusters: [{ identifier: 'cluster_8' }, { identifier: 'cluster_9' }],
        serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] }
      }
    })

    expect(
      processInputSetInitialValues(
        {
          environment: {
            environmentRef: 'env_17',
            deployToAll: true,
            environmentInputs: {
              variables: [
                {
                  name: 'test1',
                  type: 'String',
                  value: 'test1'
                }
              ]
            },
            serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] }
          }
        },
        getCustomStepProps(true)
      )
    ).toEqual({
      clusterRef: [{ label: 'cd.pipelineSteps.environmentTab.allClustersSelected', value: 'all' }],
      environment: {
        environmentInputs: { variables: [{ name: 'test1', type: 'String', value: 'test1' }] },
        environmentRef: 'env_17',
        serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] }
      }
    })

    expect(
      processInputSetInitialValues(
        {
          environment: {
            environmentRef: 'env_18',
            deployToAll: false,
            environmentInputs: {
              variables: [
                {
                  name: 'test1',
                  type: 'String',
                  value: 'test1'
                }
              ]
            },
            serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] },
            gitOpsClusters: RUNTIME_INPUT_VALUE as any
          }
        },
        getCustomStepProps(true)
      )
    ).toEqual({
      clusterRef: RUNTIME_INPUT_VALUE,
      environment: {
        environmentInputs: { variables: [{ name: 'test1', type: 'String', value: 'test1' }] },
        environmentRef: 'env_18',
        serviceOverrideInputs: { variables: [{ name: 'test', type: 'String', value: 'test' }] }
      }
    })
  })
})
