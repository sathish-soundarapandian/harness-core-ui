/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { LogTypes } from '../../useLogContentHook.types'
import { getInfoText } from '../../useLogContentHook.utils'
import type { LogContentToolbarProps } from './LogContentToolbar.types'

const LogContentToolbar: React.FC<LogContentToolbarProps> = ({
  logType,
  data,
  searchInput,
  isFullScreen,
  setIsFullScreen,
  isVerifyStep,
  timeRange,
  isMonitoredService,
  handleDownloadLogs
}) => {
  const { getString } = useStrings()

  return (
    <Container
      flex
      padding="small"
      background={logType === LogTypes.ExecutionLog ? Color.PRIMARY_10 : Color.GREY_100}
      border={{ bottom: true, color: logType === LogTypes.ExecutionLog ? Color.GREY_700 : Color.GREY_200 }}
    >
      <Container padding={{ left: 'medium' }}>
        {!isVerifyStep && !isMonitoredService && (
          <Text
            icon="info"
            color={Color.GREY_400}
            font={{ variation: FontVariation.BODY }}
            iconProps={{ color: Color.GREY_400, size: 15 }}
            lineClamp={1}
          >
            {getInfoText(getString, timeRange)}
          </Text>
        )}
      </Container>
      <Layout.Horizontal spacing="medium">
        {searchInput}
        <Button
          withoutCurrentColor
          variation={ButtonVariation.ICON}
          icon={isFullScreen ? 'full-screen-exit' : 'full-screen'}
          iconProps={{ size: 22, color: logType === LogTypes.ExecutionLog ? Color.GREY_200 : Color.GREY_400 }}
          onClick={() => setIsFullScreen(/* istanbul ignore next */ _isFullScreen => !_isFullScreen)}
        />
        <Container
          border={{ left: true, color: logType === LogTypes.ExecutionLog ? Color.GREY_700 : Color.GREY_200 }}
        />
        <Button
          text={getString('cv.download')}
          icon="command-install"
          variation={ButtonVariation.LINK}
          disabled={!data?.length}
          onClick={handleDownloadLogs}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export default LogContentToolbar
