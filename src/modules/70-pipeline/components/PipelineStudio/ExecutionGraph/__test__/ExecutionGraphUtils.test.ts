/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DependencyElement } from 'services/ci'
import {
  addService,
  DependenciesWrapper,
  getDependenciesState,
  getDependencyFromNode,
  getStepsState,
  StepState,
  StepStateMap
} from '../ExecutionGraphUtil'

describe('ExecutionGraphUtils', () => {
  test('getDependencyFromNode()', () => {
    const servicesData: DependencyElement[] = [
      {
        identifier: 'id1',
        type: 'Service'
      }
    ]

    const nodeModel = {
      getIdentifier: () => 'id1'
    } as any

    const ret = getDependencyFromNode(servicesData, nodeModel)
    expect(ret.node).toEqual(servicesData[0])
  })

  test('getDependenciesState()', () => {
    const servicesData: DependenciesWrapper[] = [
      {
        identifier: 'id1'
      }
    ]
    const mapState: StepStateMap = new Map<string, StepState>()

    getDependenciesState(servicesData, mapState)

    expect(mapState.has('id1'))
  })

  test('getStepsState()', () => {
    const node = {
      steps: [
        {
          step: {
            identifier: 'id1'
          }
        }
      ],
      rollbackSteps: [
        {
          step: {
            identifier: 'id2'
          }
        }
      ],
      parallel: [
        {
          steps: [
            {
              step: {
                identifier: 'id3'
              }
            }
          ]
        }
      ],
      stepGroup: {
        steps: [
          {
            step: {
              identifier: 'id4'
            }
          }
        ],
        rollbackSteps: [
          {
            step: {
              identifier: 'id5'
            }
          }
        ]
      }
    }
    const mapState: StepStateMap = new Map<string, StepState>()

    getStepsState(node, mapState)

    expect(mapState.has('id1'))
    expect(mapState.has('id2'))
    expect(mapState.has('id3'))
    expect(mapState.has('id4'))
    expect(mapState.has('id5'))
  })

  test('addService()', () => {
    const data: any = []
    const service: any = {}

    addService(data, service)

    expect(data.length).toBe(1)
  })
})
