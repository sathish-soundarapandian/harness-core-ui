/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '../../../PipelineStepInterface'
import { POLICY_OPTIONS, SyncStepDeploymentModeProps, SyncStepStepModeProps } from '../types'

export const getSyncStepInputVariableModeProps = () => ({
  customStepProps: {
    variablesData: {
      type: 'GitOpsSync',
      identifier: 'ss',
      name: '2EXRf9wXQ_WL9VaEGz1ziw',
      description: '-mBOU7zZSayg6MphoFJswQ',
      timeout: 'OX8p-G6UTLW9FHeYrwzctw',
      __uuid: 'HT0VrFaASNGWFBsFZX6NYQ',
      spec: {
        __uuid: '8Vgl2WAESmW2UrFeVGmbCw',
        prune: false,
        dryRun: false,
        applyOnly: false,
        forceApply: false,
        applicationsList: [],
        retryStrategy: {
          limit: 2,
          baseBackoffDuration: '5s',
          increaseBackoffByFactor: 2,
          maxBackoffDuration: '3m5s'
        },
        syncOptions: {
          skipSchemaValidation: false,
          autoCreateNamespace: false,
          pruneResourcesAtLast: false,
          applyOutOfSyncOnly: false,
          replaceResources: false,
          prunePropagationPolicy: POLICY_OPTIONS.FOREGROUND
        }
      }
    },
    metadataMap: {}
  },
  initialValues: {
    type: 'GitOpsSync',
    name: 'ss',
    identifier: 'ss',
    spec: {
      prune: false,
      dryRun: false,
      applyOnly: false,
      forceApply: false,
      applicationsList: [],
      retryStrategy: {
        limit: 2,
        baseBackoffDuration: '5s',
        increaseBackoffByFactor: 2,
        maxBackoffDuration: '3m5s'
      },
      syncOptions: {
        skipSchemaValidation: false,
        autoCreateNamespace: false,
        pruneResourcesAtLast: false,
        applyOutOfSyncOnly: false,
        replaceResources: false,
        prunePropagationPolicy: POLICY_OPTIONS.FOREGROUND
      }
    },
    timeout: '10m'
  },
  onUpdate: jest.fn()
})

export const mockApplicationResponse = {
  content: [
    {
      accountIdentifier: 'accountId',
      orgIdentifier: 'default',
      projectIdentifier: 'Harness_Argo',
      agentIdentifier: 'agent1',
      name: 'autosyncapp',
      clusterIdentifier: 'testappcluster01',
      repoIdentifier: 'anshulrepo',
      app: {
        metadata: {
          name: 'autosyncapp',
          namespace: 'gitops-demo'
        },
        spec: {
          source: {
            repoURL: 'https://github.com/wings-software/anshul-local-gitsync.git',
            path: 'single',
            targetRevision: 'sales-demo'
          },
          destination: {
            server: 'https://35.223.22.178',
            namespace: 'default'
          },
          syncPolicy: {
            syncOptions: ['PruneLast=true']
          }
        },
        status: {
          resources: [
            {
              version: 'v1',
              kind: 'ConfigMap',
              namespace: 'default',
              name: 'demo-config-map',
              status: 'OutOfSync',
              requiresPruning: true
            },
            {
              version: 'v1',
              kind: 'ConfigMap1',
              namespace: 'default',
              name: 'demo-config-mapA',
              status: 'Unknown',
              health: {
                status: 'Missing'
              }
            }
          ],
          sync: {
            status: 'OutOfSync',
            comparedTo: {
              source: {
                repoURL: 'https://github.com/wings-software/anshul-local-gitsync.git',
                path: 'single',
                targetRevision: 'sales-demo'
              },
              destination: {
                server: 'https://35.223.22.178',
                namespace: 'default'
              }
            },
            revision: 'd40b0bc1c48b644a3d913515528f269a2348df9f'
          },
          health: {
            status: 'Healthy'
          },
          history: [
            {
              revision: '1669ff014caaf262b100f6161c22d6ae5b840db3',

              source: {
                repoURL: 'https://github.com/wings-software/anshul-local-gitsync.git',
                path: 'single',
                targetRevision: 'sales-demo'
              }
            },
            {
              revision: '9abd4de755a528579f133667d218fd121fcc0591',
              id: '1',
              source: {
                repoURL: 'https://github.com/wings-software/anshul-local-gitsync.git',
                path: 'single',
                targetRevision: 'sales-demo'
              }
            },
            {
              revision: '18f996969d8af8a507946248c72906d07d6720c4',
              id: '2',
              source: {
                repoURL: 'https://github.com/wings-software/anshul-local-gitsync.git',
                path: 'single',
                targetRevision: 'sales-demo'
              }
            },
            {
              revision: '18f996969d8af8a507946248c72906d07d6720c4',
              id: '3',
              source: {
                repoURL: 'https://github.com/wings-software/anshul-local-gitsync.git',
                path: 'single',
                targetRevision: 'sales-demo'
              }
            }
          ],
          operationState: {
            operation: {
              sync: {
                revision: 'd40b0bc1c48b644a3d913515528f269a2348df9f',
                syncStrategy: {
                  hook: {
                    syncStrategyApply: {}
                  }
                },
                syncOptions: ['PruneLast=true']
              },
              initiatedBy: {},
              retry: {}
            },
            phase: 'Failed',
            message: 'one or more synchronization tasks are not valid',
            syncResult: {
              resources: [
                {
                  version: 'v1',
                  kind: 'ConfigMap1',
                  namespace: 'default',
                  name: 'demo-config-mapA',
                  status: 'SyncFailed',
                  message: 'ConfigMap1 "" not found',
                  syncPhase: 'Sync'
                }
              ],
              revision: 'd40b0bc1c48b644a3d913515528f269a2348df9f',
              source: {
                repoURL: 'https://github.com/wings-software/anshul-local-gitsync.git',
                path: 'single',
                targetRevision: 'sales-demo'
              }
            }
          },
          sourceType: 'Directory',
          summary: {}
        }
      },
      createdAt: '2022-03-23T01:07:04.163815835Z',
      lastModifiedAt: '2022-03-23T16:23:48.738259639Z'
    }
  ]
}

export const getSyncStepDeploymentModeProps = (): SyncStepDeploymentModeProps => ({
  stepViewType: StepViewType.InputSet,
  initialValues: {
    identifier: 'ss',
    type: StepType.GitOpsSync,
    spec: {
      prune: false,
      dryRun: false,
      applyOnly: false,
      forceApply: false,
      applicationsList: [],
      retryStrategy: {
        limit: 2,
        baseBackoffDuration: '5s',
        increaseBackoffByFactor: 2,
        maxBackoffDuration: '3m5s'
      },
      syncOptions: {
        skipSchemaValidation: false,
        autoCreateNamespace: false,
        pruneResourcesAtLast: false,
        applyOutOfSyncOnly: false,
        replaceResources: false,
        prunePropagationPolicy: POLICY_OPTIONS.FOREGROUND
      }
    }
  },
  inputSetData: {
    template: {
      identifier: 'ss',
      type: StepType.GitOpsSync,
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        prune: RUNTIME_INPUT_VALUE,
        dryRun: RUNTIME_INPUT_VALUE,
        applyOnly: RUNTIME_INPUT_VALUE,
        forceApply: RUNTIME_INPUT_VALUE,
        applicationsList: RUNTIME_INPUT_VALUE,
        retryStrategy: {
          limit: RUNTIME_INPUT_VALUE,
          baseBackoffDuration: RUNTIME_INPUT_VALUE,
          increaseBackoffByFactor: RUNTIME_INPUT_VALUE,
          maxBackoffDuration: RUNTIME_INPUT_VALUE
        },
        syncOptions: {
          skipSchemaValidation: RUNTIME_INPUT_VALUE,
          autoCreateNamespace: RUNTIME_INPUT_VALUE,
          pruneResourcesAtLast: RUNTIME_INPUT_VALUE,
          applyOutOfSyncOnly: RUNTIME_INPUT_VALUE,
          replaceResources: RUNTIME_INPUT_VALUE,
          prunePropagationPolicy: POLICY_OPTIONS.FOREGROUND
        }
      }
    },
    allValues: {
      type: StepType.GitOpsSync,
      name: 'ss',
      identifier: 'ss',
      spec: {
        prune: false,
        dryRun: false,
        applyOnly: false,
        forceApply: false,
        applicationsList: [],
        retryStrategy: {
          limit: 2,
          baseBackoffDuration: '5s',
          increaseBackoffByFactor: 2,
          maxBackoffDuration: '3m5s'
        },
        syncOptions: {
          skipSchemaValidation: false,
          autoCreateNamespace: false,
          pruneResourcesAtLast: false,
          applyOutOfSyncOnly: false,
          replaceResources: false,
          prunePropagationPolicy: POLICY_OPTIONS.FOREGROUND
        }
      },
      timeout: '10m'
    },
    path: 'stages[0].stage.spec.execution.steps[0].step'
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getSyncStepEditModeProps = (): SyncStepStepModeProps => ({
  initialValues: {
    identifier: 'gitopssync',
    type: StepType.GitOpsSync,
    spec: {
      prune: false,
      dryRun: false,
      applyOnly: false,
      forceApply: false,
      applicationsList: [],
      retry: true,
      retryStrategy: {
        limit: 2,
        baseBackoffDuration: '5s',
        increaseBackoffByFactor: 2,
        maxBackoffDuration: '3m5s'
      },
      syncOptions: {
        skipSchemaValidation: false,
        autoCreateNamespace: false,
        pruneResourcesAtLast: false,
        applyOutOfSyncOnly: false,
        replaceResources: false,
        prunePropagationPolicy: POLICY_OPTIONS.FOREGROUND
      }
    }
  },
  onUpdate: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getSyncStepEditModePropsEmptySpec = (): SyncStepStepModeProps => ({
  initialValues: {
    identifier: 'ss',
    type: StepType.GitOpsSync,
    spec: {}
  },
  onUpdate: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getSyncStepEditModePropsWithRuntimeValues = (): SyncStepStepModeProps => ({
  initialValues: {
    identifier: 'ss',
    type: StepType.GitOpsSync,
    spec: {
      prune: RUNTIME_INPUT_VALUE,
      dryRun: RUNTIME_INPUT_VALUE,
      applyOnly: RUNTIME_INPUT_VALUE,
      forceApply: RUNTIME_INPUT_VALUE,
      applicationsList: RUNTIME_INPUT_VALUE,
      retry: true,
      retryStrategy: {
        limit: RUNTIME_INPUT_VALUE,
        baseBackoffDuration: RUNTIME_INPUT_VALUE,
        increaseBackoffByFactor: RUNTIME_INPUT_VALUE,
        maxBackoffDuration: RUNTIME_INPUT_VALUE
      },
      syncOptions: {
        skipSchemaValidation: RUNTIME_INPUT_VALUE,
        autoCreateNamespace: RUNTIME_INPUT_VALUE,
        pruneResourcesAtLast: RUNTIME_INPUT_VALUE,
        applyOutOfSyncOnly: RUNTIME_INPUT_VALUE,
        replaceResources: RUNTIME_INPUT_VALUE,
        prunePropagationPolicy: POLICY_OPTIONS.FOREGROUND
      }
    }
  },
  onUpdate: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})
