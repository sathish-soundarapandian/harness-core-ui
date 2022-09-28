/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Button, ButtonSize, ButtonVariation, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
// import templateIllustration from '@templates-library/pages/TemplatesPage/images/templates-illustration.svg'
// import noTemplatesFoundIllustration from '@templates-library/pages/TemplatesPage/images/no-templates-found.svg'
import { useStrings } from 'framework/strings'
// import { NewTemplatePopover } from '../NewTemplatePopover/NewTemplatePopover'
import css from './NoResultsView.module.scss'

export interface NoResultsViewProps {
  hasSearchParam?: boolean
  onReset?: () => void
  text: string
  minimal?: boolean
  customImgSrc?: string
}

export function NoResultsView({
  hasSearchParam = false,
  onReset,
  text,
  minimal = false,
  customImgSrc
}: NoResultsViewProps): React.ReactElement {
  const { getString } = useStrings()
  const imgSrc = defaultTo(customImgSrc, customImgSrc) // templateIllustration
  return hasSearchParam ? (
    <Layout.Vertical className={css.mainContainer} spacing={'large'} flex={{ align: 'center-center' }}>
      {/*<img src={noTemplatesFoundIllustration} width={'275px'} />*/}
      <Text font={{ size: 'normal' }} color={Color.GREY_400}>
        {getString('common.filters.noResultsFound')}
      </Text>
      <Button
        variation={ButtonVariation.LINK}
        size={ButtonSize.LARGE}
        onClick={onReset}
        text={getString('common.filters.clearFilters')}
      />
    </Layout.Vertical>
  ) : (
    <Layout.Vertical
      className={css.mainContainer}
      spacing={minimal ? 'large' : 'xxxlarge'}
      flex={{ align: 'center-center' }}
    >
      <img src={imgSrc} width={minimal ? '117px' : '220px'} />
      <Text font={{ size: minimal ? 'small' : 'normal' }} color={Color.GREY_700}>
        {text}
      </Text>
      {/*{!minimal && <NewTemplatePopover />}*/}
    </Layout.Vertical>
  )
}
