/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { defaultTo } from 'lodash-es'
import { Color } from '@harness/design-system'
import { Button, ButtonVariation, IconName, IconProps, Layout, Text } from '@harness/uicore'
import { UseStringsReturn, useStrings } from 'framework/strings'
import type { TriggerStatus } from 'services/pipeline-ng'
import { TriggerStatusEnum } from '../../utils/TriggersListUtils'
import TriggerStatusErrorModal from './TriggerStatusErrorModal/TriggerStatusErrorModal'
import css from '../TriggersListSection.module.scss'

export interface TriggerStatusProps {
  triggerStatus: TriggerStatus
}

const getTriggerStatusMessagesMap = (getString: UseStringsReturn['getString']): Map<TriggerStatus['status'], string> =>
  new Map([
    ['SUCCESS', getString('success')],
    ['FAILED', getString('failed')],
    ['UNKNOWN', getString('common.unknown')]
  ])

const triggerStatusIconMap = new Map<TriggerStatus['status'], { icon?: IconName; iconProps?: Partial<IconProps> }>([
  ['SUCCESS', { icon: 'full-circle' as IconName, iconProps: { size: 6, color: Color.GREEN_500 } }],
  ['FAILED', { icon: 'warning-sign' as IconName, iconProps: { size: 12, color: Color.RED_500 } }],
  ['UNKNOWN', {}]
])

export default function TriggerStatusCell({ triggerStatus }: TriggerStatusProps): React.ReactElement {
  const { status, detailMessages } = triggerStatus
  const { getString } = useStrings()
  const [modalOpen, setModalOpen] = useState(false)

  const triggerStatusMessagesMap = getTriggerStatusMessagesMap(getString)
  const statusMsg = defaultTo(triggerStatusMessagesMap.get(status), '')
  const statusIcon = defaultTo(triggerStatusIconMap.get(status), {})

  const handleErrorDetailsClick = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    setModalOpen(true)
  }

  const renderTooltip = useCallback(() => {
    if (status === TriggerStatusEnum.SUCCESS) return

    return (
      <Layout.Vertical font={{ size: 'small' }} spacing="small" padding="small">
        {detailMessages?.map((error, idx) => (
          <Text key={idx} font={{ size: 'small' }} color={Color.WHITE} lineClamp={2} tooltipProps={{ disabled: true }}>
            {error}
          </Text>
        ))}
        <Button
          minimal
          text={getString('common.viewErrorDetails')}
          onClick={handleErrorDetailsClick}
          variation={ButtonVariation.LINK}
        />
      </Layout.Vertical>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, detailMessages, triggerStatus])

  return (
    <div onClick={e => e.stopPropagation()}>
      <Text
        inline
        icon={statusIcon.icon}
        iconProps={statusIcon.iconProps}
        tooltip={renderTooltip()}
        tooltipProps={{
          isDark: true,
          position: 'bottom',
          popoverClassName: css.tooltip,
          className: css.tooltipWrapper
        }}
      >
        {statusMsg}
      </Text>
      <TriggerStatusErrorModal
        closeDialog={() => setModalOpen(false)}
        isOpen={modalOpen}
        triggerStatus={triggerStatus}
      />
    </div>
  )
}
