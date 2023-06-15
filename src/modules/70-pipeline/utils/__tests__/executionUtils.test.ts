/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { InterruptEffectDTO, GraphLayoutNode } from 'services/pipeline-ng'
import * as utils from '../executionUtils'

import stageGraph from './stage-graph.json'
import success from './successful-execution.json'
import interruptHistories from './mockJson/interruptHistories.json'
import {
  cdStagePipelineExecutionDetails,
  ciStagePipelineExecutionDetails,
  nodeLayoutForCDStage,
  nodeLayoutForCIStage,
  nodeLayoutForPMS
} from './mockJson/mockExecutionContext'

jest.mock('@pipeline/components/PipelineSteps/PipelineStepFactory', () => ({}))

describe('ExecutionUtils tests', () => {
  describe('getRunningStep tests', () => {
    test('gives current running step from stage graph', () => {
      const result = utils.getActiveStep(stageGraph as unknown as any)

      expect(result?.node).toBe('WOLUCzOCQDWyjJyOLN_9TQ')
    })

    test('gives successful step', () => {
      const result = utils.getActiveStep(success.executionGraph as any, success.pipelineExecutionSummary as any)

      expect(result?.node).toBe('Jt0IeteUS7i6aJ4-4jY-UQ')
    })

    test('handles empty objects', () => {
      expect(utils.getActiveStep({})).toBe(null)
      expect(utils.getActiveStep({ nodeMap: {} })).toBe(null)
      expect(utils.getActiveStep({ nodeAdjacencyListMap: {} })).toBe(null)
      expect(utils.getActiveStep({ nodeMap: {}, nodeAdjacencyListMap: {} })).toBe(null)
    })
  })

  describe('getRunningStageForPipeline tests', () => {
    test('gives current running stage', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['stage2']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            stage2: {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Running',
              nodeUuid: 'stage2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'NotStarted',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Running'
      )

      expect(stage).toBe('stage2')
    })

    test('gives current running stage - parallel', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['parallel']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            parallel: {
              nodeType: 'parallel',
              edgeLayoutList: {
                currentNodeChildren: ['stage2.1', 'stage2.2'],
                nextIds: ['stage3']
              }
            },
            'stage2.1': {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Running',
              nodeUuid: 'stage2.1'
            },
            'stage2.2': {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Running',
              nodeUuid: 'stage2.2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'NotStarted',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Running'
      )

      expect(stage).toBe('stage2.1')
    })

    test('handles empty objects', () => {
      const stage = utils.getActiveStageForPipeline({
        layoutNodeMap: {}
      })

      expect(stage).toBe(null)
    })

    test('gives correct stage for completed process', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['stage2']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            stage2: {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Success',
              nodeUuid: 'stage2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Success',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Success'
      )

      expect(stage).toBe('stage3')
    })

    test('gives correct stage for completed process - parallel', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['parallel']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            parallel: {
              nodeType: 'parallel',
              edgeLayoutList: {
                currentNodeChildren: ['stage2.1', 'stage2.2'],
                nextIds: ['stage3']
              }
            },
            'stage2.1': {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Running',
              nodeUuid: 'stage2.1'
            },
            'stage2.2': {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Running',
              nodeUuid: 'stage2.2'
            }
          },
          startingNodeId: 'stage1'
        },
        'Success'
      )

      expect(stage).toBe('stage2.2')
    })

    test('gives correct stage for completed process where last stage is skipped', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['stage2']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            stage2: {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Success',
              nodeUuid: 'stage2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'Skipped',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Success'
      )

      expect(stage).toBe('stage2')
    })

    test('gives correct stage for errored process', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['stage2']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            stage2: {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Failed',
              nodeUuid: 'stage2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'NotStarted',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Failed'
      )

      expect(stage).toBe('stage2')
    })

    test('gives correct stage for errored process - parallel', () => {
      const stage = utils.getActiveStageForPipeline(
        {
          layoutNodeMap: {
            stage1: {
              edgeLayoutList: {
                nextIds: ['parallel']
              },
              status: 'Success',
              nodeUuid: 'stage1'
            },
            parallel: {
              nodeType: 'parallel',
              edgeLayoutList: {
                currentNodeChildren: ['stage2.1', 'stage2.2'],
                nextIds: ['stage3']
              }
            },
            'stage2.1': {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Failed',
              nodeUuid: 'stage2.1'
            },
            'stage2.2': {
              edgeLayoutList: {
                nextIds: ['stage3']
              },
              status: 'Success',
              nodeUuid: 'stage2.2'
            },
            stage3: {
              edgeLayoutList: {
                nextIds: []
              },
              status: 'NotStarted',
              nodeUuid: 'stage3'
            }
          },
          startingNodeId: 'stage1'
        },
        'Failed'
      )

      expect(stage).toBe('stage2.1')
    })
  })
  test('filter interruptHistories data based on type', () => {
    const filteredInterruptHistories = utils.getInterruptHistoriesFromType(
      interruptHistories as InterruptEffectDTO[],
      utils.Interrupt.RETRY
    )

    expect(filteredInterruptHistories.length).toBe(1)
  })

  describe('sortNodeIdsByStatus', () => {
    test('sortNodeIdsByStatus sorts based on the priority of status', () => {
      const unsortedIds = ['s1', 's2', 's3']
      const sortedIds = utils.sortNodeIdsByStatus(unsortedIds, {
        s1: {
          status: 'Success'
        },
        s2: {
          status: 'Failed'
        },
        s3: {
          status: 'Failed'
        }
      })

      expect(sortedIds).toEqual(['s2', 's3', 's1'])
    })

    test('sorts ids with falsy status to the end', () => {
      const unsortedIds = ['s1', 's2', 's3']

      expect(
        utils.sortNodeIdsByStatus(unsortedIds, {
          s1: {
            status: 'Success'
          },
          s2: {
            status: 'Failed'
          },
          s3: {
            status: undefined
          }
        })
      ).toEqual(['s2', 's1', 's3'])
      expect(
        utils.sortNodeIdsByStatus(unsortedIds, {
          s1: {
            status: 'Success'
          },
          s3: {
            status: 'Failed'
          }
        })
      ).toEqual(['s3', 's1', 's2'])
    })
  })

  describe('Utils for copilot integration', () => {
    test('Test showHarnessCoPilot method', () => {
      const args = {
        pipelineStagesMap: new Map<string, GraphLayoutNode>([['', {}]]),
        selectedStageId: 'CI_stage_1'
      }
      /* Testing for modules CI and CD */
      expect(utils.showHarnessCoPilot(args)).toBe(false)
      // for CI
      expect(
        utils.showHarnessCoPilot({
          ...args,
          pipelineStagesMap: new Map<string, GraphLayoutNode>([['CI_stage_1', nodeLayoutForCIStage]]),
          enableForCI: true
        })
      ).toBe(true)
      expect(
        utils.showHarnessCoPilot({
          ...args,
          pipelineStagesMap: new Map<string, GraphLayoutNode>([['CI_stage_2', nodeLayoutForCIStage]])
        })
      ).toBe(false)

      // for CD
      expect(
        utils.showHarnessCoPilot({
          pipelineStagesMap: new Map<string, GraphLayoutNode>([['CD_stage_1', nodeLayoutForCDStage]]),
          selectedStageId: 'CD_stage_1',
          enableForCD: true
        })
      ).toBe(true)
      expect(
        utils.showHarnessCoPilot({
          ...args,
          pipelineStagesMap: new Map<string, GraphLayoutNode>([['CD_stage_2', nodeLayoutForCDStage]])
        })
      ).toBe(false)

      // for Pipeline PMS
      expect(
        utils.showHarnessCoPilot({
          selectedStageId: 'PMS_Stage_1',
          pipelineStagesMap: new Map<string, GraphLayoutNode>([['PMS_Stage_1', nodeLayoutForPMS]])
        })
      ).toBe(false)

      // for both CI and CD
      expect(
        utils.showHarnessCoPilot({
          selectedStageId: 'CI_Stage_2',
          pipelineStagesMap: new Map<string, GraphLayoutNode>([
            ['CI_Stage_2', nodeLayoutForCIStage],
            ['CD_Stage_2', nodeLayoutForCDStage]
          ]),
          enableForCI: true,
          enableForCD: true
        })
      ).toBe(true)
    })

    test('Test resolveCurrentStep method', () => {
      expect(utils.resolveCurrentStep('step_id_2', { retryStep: 'step_id_1' })).toBe('step_id_1')
      expect(utils.resolveCurrentStep('step_id_2', {})).toBe('step_id_2')
    })

    test('Test getSelectedStageModule method', () => {
      expect(
        utils.getSelectedStageModule(new Map<string, GraphLayoutNode>([['CD_stage', nodeLayoutForCDStage]]), 'CD_stage')
      ).toBe('cd')
      expect(
        utils.getSelectedStageModule(new Map<string, GraphLayoutNode>([['CI_stage', nodeLayoutForCIStage]]), 'CI_stage')
      ).toBe('ci')
      expect(
        utils.getSelectedStageModule(new Map<string, GraphLayoutNode>([['PMS_stage', nodeLayoutForPMS]]), 'PMS_stage')
      ).toBe('pms')
      expect(utils.getSelectedStageModule(new Map<string, GraphLayoutNode>([]), 'PMS_stage_1')).toBe(undefined)
    })

    test('Test getInfraTypeFromStageForCurrentStep method', () => {
      expect(
        utils.getInfraTypeFromStageForCurrentStep({
          pipelineStagesMap: new Map<string, GraphLayoutNode>([['CD_stage', nodeLayoutForCDStage]]),
          selectedStageId: 'CD_stage',
          pipelineExecutionDetail: {}
        })
      ).toBeUndefined()

      // for CD

      expect(
        utils.getInfraTypeFromStageForCurrentStep({
          pipelineStagesMap: new Map<string, GraphLayoutNode>([['CD_stage', nodeLayoutForCDStage]]),
          selectedStageId: 'CD_stage',
          pipelineExecutionDetail: cdStagePipelineExecutionDetails
        })
      ).toBe('KUBERNETES')

      // for CI

      expect(
        utils.getInfraTypeFromStageForCurrentStep({
          pipelineStagesMap: new Map<string, GraphLayoutNode>([['CI_stage', nodeLayoutForCIStage]]),
          selectedStageId: 'CI_stage',
          pipelineExecutionDetail: ciStagePipelineExecutionDetails
        })
      ).toBe('HostedVm')
    })
  })
})
