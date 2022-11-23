/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, Checkbox, Layout, ButtonVariation, shouldShowError, useToaster, Popover } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'

import { useGetConnectorList, useUpdateAccountSetting } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import css from '../AccountSettings.module.scss'

interface ConnectorSettingProps {
  disableBuiltInSM: boolean
  onChange: (val: boolean) => void
}

const ConnectorSettings: React.FC<ConnectorSettingProps> = props => {
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [disableApply, setDisableApply] = useState<boolean>(true)

  const { mutate: updateConnectorSetting, loading } = useUpdateAccountSetting({
    queryParams: { accountIdentifier: accountId }
  })

  const { data: secretManagersApiResponse, loading: loadingSecretsManagers } = useGetConnectorList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      category: 'SECRET_MANAGER'
    }
  })

  const disabled =
    loading ||
    loadingSecretsManagers ||
    !!(
      !props.disableBuiltInSM &&
      (secretManagersApiResponse?.data?.content?.length ? secretManagersApiResponse.data.content.length < 2 : true)
    )

  const saveConnectorSettings = async () => {
    try {
      await updateConnectorSetting({
        accountIdentifier: accountId,
        orgIdentifier: orgIdentifier,
        projectIdentifier: projectIdentifier,
        type: 'Connector',
        config: {
          builtInSMDisabled: props.disableBuiltInSM
        }
      })
      showSuccess(getString('common.accountSetting.connector.saveSettingSuccess'))
    } catch (e) {
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e))
      }
    }
  }
  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} margin={{ top: 'small', bottom: 'small' }}>
      <Popover
        interactionKind={PopoverInteractionKind.HOVER}
        boundary="viewport"
        disabled={!disabled}
        content={
          <Text padding="medium" font={{ variation: FontVariation.SMALL }} color={Color.GREY_800}>
            {loading || loadingSecretsManagers
              ? getString('common.accountSetting.connector.loading')
              : getString('common.accountSetting.connector.disabledState')}
          </Text>
        }
      >
        <Checkbox
          labelElement={
            <div>
              <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_900}>
                {getString('common.accountSetting.connector.disableBISMHeading')}
              </Text>
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                {getString('common.accountSetting.connector.disableBISMSubHeading')}
              </Text>
            </div>
          }
          data-testid={`checkBox-disable-builtInSM`}
          defaultChecked={props.disableBuiltInSM}
          disabled={disabled}
          checked={props.disableBuiltInSM}
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            props.onChange(event.currentTarget.checked)
            setDisableApply(false)
          }}
          className={css.checkboxBuiltInSm}
        />
      </Popover>
      <RbacButton
        data-testid={'apply-connector-setting'}
        variation={ButtonVariation.PRIMARY}
        padding="none"
        text={getString('common.apply')}
        onClick={saveConnectorSettings}
        disabled={disableApply}
        loading={loading}
        permission={{
          permission: PermissionIdentifier.EDIT_ACCOUNT,
          resource: {
            resourceType: ResourceType.ACCOUNT
          }
        }}
      />
    </Layout.Horizontal>
  )
}

export default ConnectorSettings
