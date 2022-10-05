/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Button, ButtonVariation, Layout, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import freezeWindowsIllustration from '../../images/freeze-windows-illustration.svg'
import { NewFreezeWindowButton } from '../NewFreezeWindowButton/NewFreezeWindowButton'
import css from './FreezeWindowListEmpty.module.scss'

interface FreezeWindowListEmptyProps {
  hasFilter: boolean
  resetFilter: () => void
  scope: string
}

export const FreezeWindowListEmpty: FC<FreezeWindowListEmptyProps> = ({ hasFilter = false, resetFilter, scope }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={css.mainContainer} spacing="large" flex={{ align: 'center-center' }}>
      <img src={freezeWindowsIllustration} />

      <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_600}>
        {hasFilter
          ? getString('common.filters.noResultsFound')
          : getString('freezeWindows.freezeWindowsPage.noFreezeWindowsTitle')}
      </Text>

      <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
        {hasFilter
          ? getString('common.filters.noMatchingFilterData')
          : getString('freezeWindows.freezeWindowsPage.noFreezeWindowsText', { scope })}
      </Text>

      {!hasFilter && (
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
          {getString('freezeWindows.freezeWindowsPage.aboutFeezeWindows')}
        </Text>
      )}

      {hasFilter ? (
        <Button
          variation={ButtonVariation.LINK}
          onClick={resetFilter}
          text={getString('common.filters.clearFilters')}
        />
      ) : (
        <NewFreezeWindowButton text={getString('freezeWindows.freezeWindowsPage.createFreezeWindow')} />
      )}
    </Layout.Vertical>
  )
}
