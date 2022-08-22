/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Icon, Layout, Popover, Text, Toggle, useToaster } from '@harness/uicore'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Utils } from '@ce/common/Utils'
import type { Service } from 'services/lw'
import { useStrings } from 'framework/strings'
import useToggleRuleState from '../COGatewayList/useToggleRuleState'

interface RuleStatusToggleSwitchProps {
  serviceData: Service
  onSuccess?: (data: Service) => void
}

const RuleStatusToggleSwitch: React.FC<RuleStatusToggleSwitchProps> = ({ serviceData, onSuccess }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()

  const [loading, setLoading] = useState(false)

  const { triggerToggle } = useToggleRuleState({
    accountId,
    serviceData,
    onSuccess: /* istanbul ignore next */ (updatedServiceData: Service) => {
      setLoading(false)
      onSuccess?.(updatedServiceData)
      showSuccess(
        `${getString('ce.common.rule')} ${updatedServiceData.name} ${Utils.getConditionalResult(
          !updatedServiceData.disabled,
          'enabled',
          'disabled'
        )}`
      )
    },
    onFailure: /* istanbul ignore next */ error => {
      setLoading(false)
      showError(defaultTo(error.data?.errors?.join(', '), ''))
    },
    onCancel: /* istanbul ignore next */ () => {
      setLoading(false)
    }
  })

  const handleToggleClick = () => {
    setLoading(true)
    triggerToggle()
  }

  return (
    <Layout.Horizontal>
      <Popover
        position={Position.TOP}
        content={<Text padding={'small'}>{getString('ce.common.toggleLabel')}</Text>}
        interactionKind={PopoverInteractionKind.HOVER}
      >
        <Toggle
          disabled={loading}
          checked={loading ? serviceData.disabled : !serviceData.disabled}
          onToggle={handleToggleClick}
        />
      </Popover>
      {loading && <Icon name="spinner" />}
    </Layout.Horizontal>
  )
}

export default RuleStatusToggleSwitch
