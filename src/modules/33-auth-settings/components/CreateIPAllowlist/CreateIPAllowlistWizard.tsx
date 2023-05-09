/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { pick, defaultTo } from 'lodash-es'

import { StepWizard } from '@harness/uicore'
import type { IpAllowlistConfigResponse } from '@harnessio/react-ng-manager-client'

import { useStrings } from 'framework/strings'
import { SourceType, IIPAllowlistForm } from '@auth-settings/interfaces/IPAllowlistInterface'
import StepOverview from './StepOverview/StepOverview'
import StepDefineRange from './StepDefineRange/StepDefineRange'
import StepTestIP from './StepTestIP/StepTestIP'

interface CreateIPAllowlistProps {
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  onClose: () => void
  data?: IpAllowlistConfigResponse
}

export const mapIPAllowlistConfigDTOToFormData = (data: IpAllowlistConfigResponse): IIPAllowlistForm => {
  return {
    allowSourceTypeUI: defaultTo(data.ip_allowlist_config.allowed_source_type?.includes(SourceType.UI), false),
    allowSourceTypeAPI: defaultTo(data.ip_allowlist_config.allowed_source_type?.includes(SourceType.API), false),
    description: defaultTo(data.ip_allowlist_config.description, ''),
    enabled: defaultTo(data.ip_allowlist_config.enabled, false),
    identifier: defaultTo(data.ip_allowlist_config.identifier, ''),
    ipAddress: defaultTo(data.ip_allowlist_config.ip_address, ''),
    name: defaultTo(data.ip_allowlist_config.name, ''),
    tags: defaultTo(data.ip_allowlist_config.tags, {})
  }
}

const defaultData: IpAllowlistConfigResponse = {
  created: 0,
  ip_allowlist_config: {
    name: '',
    identifier: '',
    enabled: false,
    allowed_source_type: [],
    ip_address: '',
    description: ''
  },
  updated: 0
}

const CreateIPAllowlistWizard: React.FC<CreateIPAllowlistProps> = props => {
  const { isEditMode, data = defaultData } = props
  const { getString } = useStrings()

  const commonProps = pick(props, ['isEditMode', 'setIsEditMode', 'onClose'])

  let ipAllowlistData: IIPAllowlistForm = {
    name: '',
    identifier: '',
    enabled: false,
    allowSourceTypeUI: false,
    allowSourceTypeAPI: false,
    ipAddress: ''
  }

  if (isEditMode) {
    ipAllowlistData = mapIPAllowlistConfigDTOToFormData(data)
  }

  return (
    <StepWizard title={getString('authSettings.ipAllowlist')}>
      <StepOverview name={getString('overview')} data={ipAllowlistData} {...commonProps} />
      <StepDefineRange name={getString('authSettings.ipAddress.defineRange')} data={ipAllowlistData} {...commonProps} />
      <StepTestIP name={getString('authSettings.ipAddress.testIP')} data={ipAllowlistData} {...commonProps} />
    </StepWizard>
  )
}

export default CreateIPAllowlistWizard
