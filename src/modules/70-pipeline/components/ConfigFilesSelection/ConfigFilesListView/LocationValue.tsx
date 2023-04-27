/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Icon, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'

import { getScope } from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import css from '../ConfigFilesSelection.module.scss'

interface ILocationValueItem {
  locations: string[]
  isHarnessStore: boolean
  onClick: (path: string, scope: string) => void
  isFileStore?: boolean
  isTooltip?: boolean
}

export function LocationValue(props: ILocationValueItem): React.ReactElement {
  const { locations, isHarnessStore, onClick, isFileStore = true, isTooltip = false } = props

  const isHarnessFileStore = React.useMemo(() => {
    return isHarnessStore && isFileStore
  }, [isHarnessStore, isFileStore])

  const handleClick = (value: string): void => {
    const { scope, path } = getScope(value)

    if (isHarnessFileStore) {
      onClick(path, scope)
    }
  }

  return (
    <>
      {locations.map((locationValue: string, i: number) => {
        if (isTooltip) {
          return (
            <Text
              color={Color.BLACK}
              padding="small"
              className={isHarnessFileStore ? css.locationLink : ''}
              key={`${locationValue}${i}`}
              onClick={() => handleClick(locationValue)}
              lineClamp={1}
            >
              {isHarnessFileStore && <Icon name="edit" margin={{ right: 'xsmall' }} />}
              {locationValue}
            </Text>
          )
        }

        return (
          <Container key={`${locationValue}${i}`} onClick={() => handleClick(locationValue)}>
            {isHarnessFileStore && <Icon name="edit" margin={{ right: 'xsmall' }} />}
            <Text color={Color.BLACK} className={isHarnessFileStore ? css.locationLink : ''} lineClamp={1}>
              {locationValue}
              {!isTooltip && locations.length !== i + 1 ? ` ,` : null}
            </Text>
          </Container>
        )
      })}
    </>
  )
}
