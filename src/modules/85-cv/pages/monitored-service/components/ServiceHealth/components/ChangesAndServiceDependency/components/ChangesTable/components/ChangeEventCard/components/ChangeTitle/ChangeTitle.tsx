/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useCallback } from 'react'
import { Text, Container, Icon, Layout, Button, ButtonVariation } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getLocationPathName } from 'framework/utils/WindowLocation'
import type { ChangeTitleData } from '../../ChangeEventCard.types'
import { getIconByChangeType } from './ChangeTitle.utils'
import css from './ChangeTitle.module.scss'

export default function ChangeTitle({ changeTitleData }: { changeTitleData: ChangeTitleData }): JSX.Element {
  const { getString } = useStrings()
  const { name, executionId, type, url } = changeTitleData
  const titleOptions = useMemo(
    () =>
      url
        ? {
            tooltip: name,
            className: css.addEllipsis
          }
        : {},
    [url, name]
  )

  const openPipelineInNewTab = useCallback(() => {
    const pipelineURL = `${window.location.origin}${getLocationPathName()}#${url}`
    if (url) {
      window.open(pipelineURL, '_blank')
    }
  }, [url])

  return (
    <Container padding={{ top: 'medium', bottom: 'medium' }} className={css.main}>
      <Icon {...getIconByChangeType(type)} />
      <Layout.Vertical>
        <Text {...titleOptions} font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_800}>
          {name}
        </Text>
        <Text font={{ size: 'xsmall' }} color={Color.GREY_800}>
          {getString('cd.serviceDashboard.executionId')}
          <span>{executionId}</span>
        </Text>
      </Layout.Vertical>
      {url ? (
        <Button
          onClick={openPipelineInNewTab}
          className={css.redirectButton}
          text={getString('cv.changeSource.changeSourceCard.viewDeployment')}
          icon="share"
          iconProps={{ size: 12 }}
          variation={ButtonVariation.SECONDARY}
        />
      ) : null}
    </Container>
  )
}
