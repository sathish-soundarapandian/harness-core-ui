/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { TerragruntVariableStepProps } from '../TerragruntInterface'

export const initialValues = {
  timeout: '10m',
  spec: {
    provisionerIdentifier: '',
    configuration: {
      type: 'Inline',
      spec: {
        moduleConfig: {
          path: ''
        },
        workspace: '',
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: 'Branch',
              branch: '',
              folderPath: '',
              connectorRef: 'test'
            }
          }
        },
        backendConfig: {
          type: 'Inline',
          spec: {
            content: ''
          }
        },
        varFiles: [
          {
            varFile: {
              type: 'Inline',
              identifier: 'file_id_1',
              spec: {
                content: ''
              }
            }
          },
          {
            varFile: {
              type: 'Remote',
              identifier: 'file_id_2',
              spec: {
                store: {
                  type: 'Git',
                  spec: {
                    connectorRef: '',
                    branch: '',
                    paths: ''
                  }
                }
              }
            }
          }
        ]
      }
    },

    targets: ''
  }
}

export const template: any = {
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    provisionerIdentifier: RUNTIME_INPUT_VALUE,
    configuration: {
      type: 'Inline',
      spec: {
        moduleConfig: {
          path: RUNTIME_INPUT_VALUE
        },
        workspace: RUNTIME_INPUT_VALUE,
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              folderPath: RUNTIME_INPUT_VALUE,
              connectorRef: 'test'
            }
          }
        },
        backendConfig: {
          type: 'Inline',
          spec: {
            content: RUNTIME_INPUT_VALUE
          }
        },
        targets: RUNTIME_INPUT_VALUE,
        varFiles: [
          {
            varFile: {
              type: 'Inline',
              identifier: 'file_id_1',
              spec: {
                type: 'inline_type_spec',
                content: RUNTIME_INPUT_VALUE
              }
            }
          },
          {
            varFile: {
              type: 'Remote',
              identifier: 'file_id_2',
              spec: {
                store: {
                  type: 'Git',
                  spec: {
                    connectorRef: RUNTIME_INPUT_VALUE,
                    branch: RUNTIME_INPUT_VALUE,
                    paths: RUNTIME_INPUT_VALUE
                  }
                }
              }
            }
          }
        ]
      }
    }
  }
}

export const variableProps = {
  initialValues: {
    type: 'TerragruntDestroy',
    name: 'sdec',
    identifier: 'sdec',
    spec: {
      provisionerIdentifier: 'igh',
      configuration: {
        type: 'Inline',
        spec: {
          configFiles: {
            store: {
              type: 'GitLab',
              spec: {
                gitFetchType: 'Branch',
                connectorRef: 'account.test',
                branch: 'master',
                folderPath: './abc'
              }
            }
          },
          backendConfig: {
            type: 'Inline',
            spec: {
              content: 'test'
            }
          },
          targets: ['test1', 'test2'],
          environmentVariables: [
            { key: 'test', value: 'abc' },
            { key: 'test2', value: 'abc2' }
          ],
          varFiles: [
            {
              varFile: {
                type: 'Inline',
                identifier: 'file_id_1',
                spec: {
                  type: 'inline_type_spec'
                }
              }
            },
            {
              varFile: {
                type: 'Remote',
                identifier: 'file_id_2',
                spec: {
                  type: 'remote_type_spec'
                }
              }
            }
          ]
        }
      }
    }
  },
  originalData: {
    type: 'TerragruntDestroy',
    name: 'sdec',
    identifier: 'sdec',
    spec: {
      provisionerIdentifier: 'igh',
      configuration: {
        type: 'Inline',
        spec: {
          configFiles: {
            store: {
              type: 'Git',
              spec: {
                gitFetchType: 'Branch',
                connectorRef: 'account.test',
                branch: 'master',
                folderPath: './abc'
              }
            }
          },
          backendConfig: {
            type: 'Inline',
            spec: {
              content: 'test'
            }
          },
          targets: ['test1', 'test2'],
          environmentVariables: [
            { key: 'test', value: 'abc' },
            { key: 'test2', value: 'abc2' }
          ]
        }
      }
    }
  },
  stageIdentifier: 'qaStage',
  onUpdate: jest.fn(),
  metadataMap: {
    'step-name': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.terragruntDestroy.name',
        localName: 'execution.steps.terragruntDestroy.name'
      }
    },

    'step-timeout': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.terragruntDestroy.timeout',
        localName: 'execution.steps.terragruntDestroy.timeout'
      }
    },
    'step-delegateSelectors': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.terragruntDestroy.delegateSelectors',
        localName: 'execution.steps.terragruntDestroy.delegateSelectors'
      }
    },
    'step-provisionerIdentifier': {
      yamlProperties: {
        fqn: 'pipeline.stages.qaStage.spec.execution.steps.terragruntDestroy.provisionerIdentifier',
        localName: 'execution.steps.terragruntDestroy.provisionerIdentifier'
      },
      'step-configFiles-connectorRef': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.spec.execution.steps.terragruntDestroy.spec.configuration.spec.configFiles.store.spec.connectorRef',
          localName: 'execution.steps.terragruntDestroy.spec.configuration.spec.configFiles.store.spec.connectorRef'
        }
      },
      'step-configFiles-branch': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.spec.execution.steps.terragruntDestroy.spec.configuration.spec.configFiles.store.spec.branch',
          localName: 'execution.steps.terragruntDestroy.spec.configuration.spec.configFiles.store.spec.branch'
        }
      },
      'step-configFiles-folderPath': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.spec.execution.steps.terragruntDestroy.spec.configuration.spec.configFiles.store.spec.folderPath',
          localName: 'execution.steps.terragruntDestroy.spec.configuration.spec.configFiles.store.spec.folderPath'
        }
      },
      'step-backend-content': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.spec.execution.steps.terragruntDestroy.spec.configuration.spec.backendConfig.content',
          localName: 'execution.steps.terragruntDestroy.spec.configuration.spec.backendConfig.content'
        }
      },
      'step-envVariables': {
        yamlProperties: {
          fqn: 'pipeline.stages.hotfix.spec.execution.steps.terragruntDestroy.spec.configuration.spec.environmentVariables.key',
          localName: 'execution.steps.terragruntDestroy.spec.configuration.spec.environmentVariables.key'
        }
      },
      'step-targets': {
        yamlProperties: {
          fqn: 'pipeline.stages.hotfix.spec.execution.steps.terragruntDestroy.spec.configuration.spec.targets',
          localName: 'execution.steps.terragruntDestroy.spec.configuration.spec.targets'
        }
      }
    }
  },
  variablesData: {
    type: 'TerragruntDestroy',
    name: 'step-name',
    identifier: 'Test_A',
    timeout: 'step-timeout',
    spec: {
      provisionerIdentifier: 'step-provisionerIdentifier',
      configuration: {
        type: 'Inline',
        spec: {
          configFiles: {
            store: {
              type: 'Git',
              spec: {
                gitFetchType: 'Branch',
                connectorRef: 'step-configFiles-connectorRef',
                branch: 'step-configFiles-branch',
                folderPath: 'step-configFiles-folderPath'
              }
            }
          },
          backendConfig: {
            type: 'Inline',
            spec: {
              content: 'step-backend-content'
            }
          },
          targets: 'step-targets',
          environmentVariables: [{ key: 'step-envVariables', value: '' }],
          varFiles: [
            {
              varFile: {
                type: 'Inline',
                identifier: 'file_id_1',
                spec: {
                  type: 'inline_type_spec'
                }
              }
            },
            {
              varFile: {
                type: 'Remote',
                identifier: 'file_id_2',
                spec: {
                  type: 'remote_type_spec'
                }
              }
            }
          ]
        }
      }
    }
  },
  stepType: StepType.TerragruntDestroy
} as TerragruntVariableStepProps

export const formikValues = {
  values: {
    spec: {
      configuration: {
        spec: {
          varFiles: [
            {
              varFile: {
                identifier: 'plan var id',
                type: 'Remote',
                spec: {
                  type: 'Git',
                  store: {
                    spec: {
                      gitFetchType: 'Branch',
                      branch: '',
                      connectorRef: '',
                      paths: ''
                    }
                  }
                }
              }
            },
            {
              varFile: {
                identifier: 'plan id',
                type: 'Inline',
                spec: {
                  content: 'test'
                }
              }
            }
          ]
        }
      }
    }
  }
}
