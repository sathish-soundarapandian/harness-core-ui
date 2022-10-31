/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { MouseEvent } from 'react'

import { Text, Layout, IconName } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { IconProps } from '@harness/icons'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ConnectorValidationResult, ErrorDetail } from 'services/cd-ng'
import useTestConnectionErrorModal from '@connectors/common/useTestConnectionErrorModal/useTestConnectionErrorModal'

import css from './ConnectivityStatus.module.scss'

export type ErrorMessage = ConnectorValidationResult & { useErrorHandler?: boolean }

export interface ConnectivityStatusProps {
  identifier: string
  host: string
  error: {
    reason?: string
    code?: number
    message?: string
  }
  tags: string[]
  status: any
  resetError: (status: string) => void
}

interface WarningTooltipProps {
  errorSummary?: string
  errors?: ErrorDetail[]
  onClick: (event: MouseEvent<HTMLDivElement>) => void
  errorDetailsText: string
  noDetailsText: string
}

const WarningTooltip: React.FC<WarningTooltipProps> = ({
  errorSummary,
  errors,
  onClick,
  errorDetailsText,
  noDetailsText
}) => {
  if (errorSummary) {
    return (
      <Layout.Vertical font={{ size: 'small' }} spacing="small" padding="small">
        <Text font={{ size: 'small' }} color={Color.WHITE}>
          {errorSummary}
        </Text>
        {errors ? (
          <Text color={Color.BLUE_400} onClick={onClick} className={css.viewDetails}>
            {errorDetailsText}
          </Text>
        ) : null}
      </Layout.Vertical>
    )
  }
  return (
    <Text padding="small" color={Color.WHITE}>
      {noDetailsText}
    </Text>
  )
}

const ConnectivityStatus: React.FC<ConnectivityStatusProps> = data => {
  const { getString } = useStrings()

  const { openErrorModal } = useTestConnectionErrorModal({})

  const renderStatusText = (
    icon: IconName,
    iconProps: Partial<IconProps>,
    tooltip: JSX.Element | string,
    statusText: string
  ): React.ReactElement => {
    return (
      <Text
        inline
        icon={icon}
        iconProps={iconProps}
        tooltip={tooltip}
        tooltipProps={{ isDark: true, position: 'bottom', popoverClassName: css.tooltip }}
      >
        {statusText}
      </Text>
    )
  }

  const connectorStatus = defaultTo(data.status, 'UNKNOWN')
  const isStatusSuccess = connectorStatus === 'SUCCESS'
  const errorSummary = defaultTo(data?.error?.message, '')

  const renderTooltip = () => {
    return (
      <WarningTooltip
        errorSummary={errorSummary}
        errors={[data.error]}
        onClick={e => {
          e.stopPropagation()
          openErrorModal({
            errorSummary,
            errors: [data.error]
          } as ErrorMessage)
        }}
        errorDetailsText={getString('connectors.testConnectionStep.errorDetails')}
        noDetailsText={getString('noDetails')}
      />
    )
  }

  const renderStatus = () => {
    const statusMessageMap: any = {
      [`SUCCESS`]: getString('success'),
      [`FAILED`]: getString('failed')
    }

    const statusMsg = defaultTo(statusMessageMap[`${connectorStatus}`], getString('na'))
    if (isStatusSuccess) {
      return renderStatusText('full-circle', { size: 6, color: Color.GREEN_500 }, '', statusMsg)
    }

    return renderStatusText('warning-sign', { size: 12, color: Color.RED_500 }, renderTooltip(), statusMsg)
  }

  return (
    <Layout.Horizontal>
      <Layout.Vertical width="100px">
        <Layout.Horizontal spacing="small">{renderStatus()}</Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default ConnectivityStatus
