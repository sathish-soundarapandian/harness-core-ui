import React from 'react'
import cx from 'classnames'
import { Card, Container } from '@harness/uicore'
import { ModuleName } from 'framework/types/ModuleName'
import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import ModuleTile from '../ModuleTile/ModuleTile'
import css from './ModuleTiles.module.scss'

export default function ModuleTiles(): React.ReactElement {
  const modules: NavModuleName[] = [
    ModuleName.CD
    // ModuleName.CI,
    // ModuleName.CF,
    // ModuleName.STO,
    // ModuleName.CV,
    // ModuleName.CE,
    // ModuleName.CHAOS
  ]

  const [selectedModule, setSelectedModule] = React.useState<ModuleName>()
  const numOfColumns = 3

  return (
    <Container className={css.moduleTiles}>
      {modules.map((harnessModule, index) => {
        const isExpanded = harnessModule === selectedModule
        const expandOnRow = Math.floor(index / numOfColumns) + 1
        const expandOnColumn = index % 3 < numOfColumns - 1 ? (index % 3) + 1 : index % 3

        return <ModuleTile key={harnessModule} module={harnessModule} />
        return (
          <Card
            className={cx(css.tile, { [css.expanded]: isExpanded })}
            key={harnessModule}
            onClick={() => {
              setSelectedModule(isExpanded ? undefined : harnessModule)
            }}
            style={isExpanded ? { gridRowStart: expandOnRow, gridColumnStart: expandOnColumn } : {}}
          >
            {moduleToCardMap[harnessModule]}
          </Card>
        )
      })}
    </Container>
  )
}
