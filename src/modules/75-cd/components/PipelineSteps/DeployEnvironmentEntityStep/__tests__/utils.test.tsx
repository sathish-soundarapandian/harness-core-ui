import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityFormState } from '../types'
import { processInitialValues, processFormValues } from '../utils'

describe('process initial values', () => {
  test('clean slate', () => {
    const output = processInitialValues({}, { gitOpsEnabled: false })

    expect(output).toEqual({})
  })

  test('environment ref selected', () => {
    const output = processInitialValues(
      {
        environment: {
          environmentRef: 'Env_1',
          deployToAll: false,
          infrastructureDefinitions: [
            {
              identifier: 'Infra_1'
            }
          ]
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environment: 'Env_1',
      environmentInputs: {
        Env_1: undefined
      },
      infrastructure: 'Infra_1',
      infrastructureInputs: {
        Env_1: {
          Infra_1: undefined
        }
      }
    } as DeployEnvironmentEntityFormState)
  })

  test('environments selected', () => {
    const output = processInitialValues(
      {
        environments: {
          metadata: {
            parallel: false
          },
          values: [
            {
              environmentRef: 'Env_1',
              deployToAll: true
            }
          ]
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environments: [{ label: 'Env_1', value: 'Env_1' }],
      environmentInputs: {
        Env_1: undefined
      },
      infrastructures: { Env_1: undefined as any },
      parallel: false
    } as DeployEnvironmentEntityFormState)
  })

  test('environment group selected ', () => {
    const output = processInitialValues(
      {
        environmentGroup: {
          envGroupRef: 'Env_Group_1',
          deployToAll: true,
          environments: RUNTIME_INPUT_VALUE as any
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environmentGroup: 'Env_Group_1',
      environmentInputs: {},
      infrastructures: {},
      infrastructureInputs: {}
    } as DeployEnvironmentEntityFormState)
  })
})

describe('process form values', () => {
  test('clean slate', () => {
    const output = processInitialValues({}, { gitOpsEnabled: false })

    expect(output).toEqual({})
  })

  test('environment ref selected', () => {
    const output = processFormValues(
      {
        environment: 'Env_1',
        environmentInputs: {
          Env_1: undefined
        },
        infrastructure: 'Infra_1',
        infrastructureInputs: {
          Env_1: {
            Infra_1: undefined
          }
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environment: {
        environmentRef: 'Env_1',
        deployToAll: false,
        infrastructureDefinitions: [
          {
            identifier: 'Infra_1'
          }
        ]
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('environments selected', () => {
    const output = processFormValues(
      {
        environments: [{ label: 'Env_1', value: 'Env_1' }],
        environmentInputs: {
          Env_1: undefined
        },
        infrastructures: { Env_1: undefined as any },
        parallel: false
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environments: {
        metadata: {
          parallel: false
        },
        values: [
          {
            environmentRef: 'Env_1',
            deployToAll: true
          }
        ]
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('environment group selected ', () => {
    const output = processFormValues(
      {
        environmentGroup: 'Env_Group_1',
        environmentInputs: {},
        infrastructures: {},
        infrastructureInputs: {}
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environmentGroup: {
        envGroupRef: 'Env_Group_1',
        deployToAll: true,
        environments: RUNTIME_INPUT_VALUE as any
      }
    } as DeployEnvironmentEntityConfig)
  })
})
