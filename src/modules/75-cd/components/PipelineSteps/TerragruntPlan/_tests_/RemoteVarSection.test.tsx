/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import TgPlanRemoteSection from '../InputSteps/RemoteVarSection'

const defaultProps = {
  remoteVar: {
    varFile: {
      identifier: 'plan var id',
      type: 'Remote',
      spec: {
        store: {
          type: 'Git',
          spec: {
            gitFetchType: 'Branch',
            repoName: 'test',
            branch: RUNTIME_INPUT_VALUE,
            paths: RUNTIME_INPUT_VALUE,
            connectorRef: RUNTIME_INPUT_VALUE
          }
        }
      }
    }
  },
  initialValues: {
    spec: {
      configuration: {
        varFiles: [
          {
            varFile: {
              identifier: 'plan var id',
              type: 'Remote',
              spec: {
                store: {
                  type: 'Git',
                  spec: {
                    gitFetchType: '',
                    repoName: '',
                    branch: '',
                    paths: '',
                    connectorRef: ''
                  }
                }
              }
            }
          }
        ]
      }
    }
  },
  formik: {
    values: {
      stages: [
        {
          stage: {
            spec: {
              execution: {
                steps: [
                  {
                    step: {
                      identifier: 'tfApply',
                      type: 'TerragruntPlan',
                      spec: {
                        configuration: {
                          varFiles: [
                            {
                              varFile: {
                                identifier: 'plan var id',
                                type: 'Remote',
                                spec: {
                                  store: {
                                    type: 'Git',
                                    spec: {
                                      gitFetchType: '',
                                      repoName: '',
                                      branch: '',
                                      paths: '',
                                      connectorRef: ''
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
                ]
              }
            }
          }
        }
      ]
    }
  },
  inputSetData: {
    template: {
      spec: {
        configuration: {
          varFile: {
            identifier: 'plan var id',
            type: 'Remote',
            spec: {
              store: {
                type: 'Git',
                spec: {
                  gitFetchType: 'Branch',
                  repoName: 'test',
                  branch: RUNTIME_INPUT_VALUE,
                  paths: RUNTIME_INPUT_VALUE,
                  connectorRef: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      }
    }
  },
  path: 'stages[0].stage.spec.execution.steps[0].step',
  index: 0,
  readonly: false,
  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
}

describe('Config section tests', () => {
  test('initial render with basic data', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <TgPlanRemoteSection {...(defaultProps as any)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
