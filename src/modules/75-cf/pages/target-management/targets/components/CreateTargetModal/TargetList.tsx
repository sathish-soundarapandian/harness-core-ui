/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ChangeEvent, FC, Fragment, useCallback } from 'react'
import { Button, FontVariation, Text, TextInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { TargetData } from './types'
import css from './TargetList.module.scss'

interface TargetListProps {
  targets: TargetData[]
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, newData: TargetData) => void
}

const TargetList: FC<TargetListProps> = ({ targets, onAdd, onRemove, onChange }) => {
  const { getString } = useStrings()

  const handleChange = useCallback(
    (index: number, attr: keyof TargetData) => (e: ChangeEvent<HTMLInputElement>) => {
      onChange(index, { ...targets[index], [attr]: e.target.value })
    },
    [targets, onChange]
  )

  return (
    <div className={css.table}>
      <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.col1}>
        {getString('name')}
      </Text>
      <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.col2}>
        {getString('identifier')}
      </Text>

      {targets.map((target: TargetData, index: number) => {
        const lastItem = index === targets.length - 1

        return (
          <Fragment key={index}>
            <TextInput
              placeholder={getString('cf.targets.enterName')}
              value={target.name}
              onChange={handleChange(index, 'name')}
              wrapperClassName={css.col1}
            />
            <TextInput
              placeholder={getString('cf.targets.enterValue')}
              value={target.identifier}
              onChange={handleChange(index, 'identifier')}
              wrapperClassName={css.col2}
            />
            {targets.length > 1 && (
              <Button
                minimal
                intent="primary"
                icon="minus"
                iconProps={{ size: 16 }}
                onClick={() => onRemove(index)}
                aria-label={getString('cf.targets.removeRow')}
              />
            )}
            {lastItem && (
              <Button
                minimal
                intent="primary"
                icon="plus"
                iconProps={{ size: 16 }}
                onClick={onAdd}
                aria-label={getString('cf.targets.addRow')}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export default TargetList
