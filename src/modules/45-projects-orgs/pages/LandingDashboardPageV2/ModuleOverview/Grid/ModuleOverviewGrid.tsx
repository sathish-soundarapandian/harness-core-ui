/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container } from '@harness/uicore'
import React, { useState } from 'react'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import { ModuleName } from 'framework/types/ModuleName'
import type { TimeRangeFilterType } from '@common/types'
import ModuleOverview from '../ModuleOverview'
import css from './ModuleOverviewGrid.module.scss'

const modulesOrder: NavModuleName[] = [
  ModuleName.CD,
  ModuleName.CI,
  ModuleName.CF,
  ModuleName.STO,
  ModuleName.CV,
  ModuleName.CE,
  ModuleName.CHAOS
]

export interface ModuleOverviewBaseProps {
  isExpanded: boolean
  isEmptyState: boolean
  timeRange: TimeRangeFilterType
}

interface ModuleOverviewGridProps {
  timeRange: TimeRangeFilterType
}

const GRID_SIZE = 3
const ModuleOverviewGrid: React.FC<ModuleOverviewGridProps> = ({ timeRange }) => {
  const [selectedModule, setSelectedModule] = useState<NavModuleName | undefined>()

  return (
    <Container className={css.container}>
      {modulesOrder.map((module, index) => {
        const isExpanded = selectedModule === module
        const startRow = Math.floor(index / GRID_SIZE + 1)
        let startColumn = Math.floor((index % GRID_SIZE) + 1)

        if (startColumn === GRID_SIZE) {
          startColumn = startColumn - 1
        }

        return (
          <ModuleOverview
            className={css.module}
            key={module}
            module={module}
            timeRange={timeRange}
            isExpanded={isExpanded}
            onClick={() => {
              if (isExpanded) {
                setSelectedModule(undefined)
              } else {
                setSelectedModule(module)
              }
            }}
            style={
              selectedModule === module
                ? {
                    gridRowStart: startRow,
                    gridColumnStart: startColumn,
                    gridRowEnd: 'span 2',
                    gridColumnEnd: 'span 2',
                    height: '316px',
                    width: '392px'
                  }
                : undefined
            }
          />
        )
      })}
    </Container>
  )
}

export default ModuleOverviewGrid
