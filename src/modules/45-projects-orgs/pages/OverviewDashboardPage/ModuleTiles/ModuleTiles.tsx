import React from 'react'
import cx from 'classnames'
import { Card, Container } from '@harness/uicore'
import type { Module as ModuleName } from 'framework/types/ModuleName'
import css from './ModuleTiles.module.scss'

export default function ModuleTiles(): React.ReactElement {
  const modules: ModuleName[] = ['cd', 'ci', 'cf', 'sto', 'cv', 'ce', 'chaos']
  const moduleToCardMap: Record<ModuleName, React.ReactElement> = {
    cd: <div>cd</div>,
    ci: <div>ci</div>,
    cf: <div>ff</div>,
    sto: <div>sto</div>,
    cv: <div>srm</div>,
    ce: <div>ccm</div>,
    chaos: <div>chaos</div>,
    scm: <div>scm</div>
  }
  const [selectedModule, setSelectedModule] = React.useState<ModuleName>()
  const numOfColumns = 3

  return (
    <Container className={css.moduleTiles}>
      {modules.map((harnessModule, index) => {
        const isExpanded = harnessModule === selectedModule
        const expandOnRow = Math.floor(index / numOfColumns) + 1
        const expandOnColumn = index % 3 < numOfColumns - 1 ? (index % 3) + 1 : index % 3

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
