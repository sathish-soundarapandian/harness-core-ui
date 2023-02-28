/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { Button, ButtonVariation, Container, ExpandingSearchInput, Label, Layout, Select } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { getAddDowntimeButton, getMonitoredServicesOptions } from '../../SLODowntimePage.utils'
import { defaultOption } from '../../SLODowntimePage.constants'
import { FiltersContext } from '../../FiltersContext'
import css from '../../SLODowntimePage.module.scss'

export const onChange = (
  text: string,
  setPageNumber: React.Dispatch<React.SetStateAction<number>>,
  setFilter: React.Dispatch<React.SetStateAction<string>>
): void => {
  setPageNumber(0)
  setFilter(text.trim())
}

const DowntimeFilters = ({ listView = false }): JSX.Element => {
  const { getString } = useStrings()

  const {
    monitoredServicesData,
    monitoredServicesLoading,
    monitoredServiceOption,
    setMonitoredServiceOption,
    setPageNumber,
    hideResetFilterButton,
    handleCreateButton,
    setFilter
  } = useContext(FiltersContext)

  const onOptionChange = (option = defaultOption): void => {
    setMonitoredServiceOption(option)
    setPageNumber(0)
  }

  return (
    <Layout.Horizontal flex={{ alignItems: 'flex-end' }}>
      <Layout.Horizontal flex={{ alignItems: 'flex-end' }} spacing={'xxlarge'}>
        {listView && (
          <>
            {getAddDowntimeButton(handleCreateButton, getString)}
            <Divider className={css.divider} />
          </>
        )}
        <Container width={250}>
          <Label>{getString('common.monitoredServices')}</Label>
          <Select
            value={monitoredServiceOption}
            items={getMonitoredServicesOptions(monitoredServicesData, monitoredServicesLoading, getString)}
            onChange={onOptionChange}
            data-testid="monitoredServices-filter"
          />
        </Container>
        {!hideResetFilterButton && (
          <Button
            variation={ButtonVariation.LINK}
            onClick={() => onOptionChange()}
            text={getString('common.filters.clearFilter')}
          />
        )}
      </Layout.Horizontal>
      <ExpandingSearchInput
        alwaysExpanded
        width={220}
        throttle={500}
        onChange={text => onChange(text, setPageNumber, setFilter)}
        autoFocus={false}
        placeholder={getString('search')}
      />
    </Layout.Horizontal>
  )
}

export default DowntimeFilters
