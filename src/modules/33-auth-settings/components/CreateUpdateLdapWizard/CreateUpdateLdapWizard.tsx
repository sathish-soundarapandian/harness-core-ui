/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, StepWizard } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  LdapConnectionSettings,
  LdapGroupSettings,
  LDAPSettings,
  LDAPSettingsRequestBody,
  LdapUserSettings,
  useCreateLdapSettings,
  useUpdateLdapSettings
} from 'services/cd-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import StepOverview, { LdapOverview } from './views/StepOverview'
import StepConnectionSettings from './views/StepConnectionSettings'
import StepUserQueries from './views/StepUserQueries'
import StepGroupQueries from './views/StepGroupQueries'
import { getErrorMessageFromException } from './utils'
import css from './CreateUpdateLdapWizard.module.scss'

export interface CreateUpdateLdapWizardProps {
  /**
   * Following flag is to be used by steps to render in edit form
   */
  isEdit: boolean
  /**
   * Existing LDAP settings if any to be used
   */
  ldapSettings: LDAPSettings | undefined
  /**
   * To dismiss the wizard
   */
  closeWizard: () => void
  /**
   * To be called after final step is concluded
   */
  onSuccess: () => void
}

interface CreateUpdateSettingsActionProps {
  /**
   * Contains error message from previous update attempt
   */
  createUpdateError?: ReactElement
  /**
   * Create/Update action in progress
   */
  isUpdateInProgress: boolean
  /**
   * Triggers the back end API call to save data populated in wizard; concludes the wizard flow
   * */
  triggerSaveData: () => void
}

export interface LdapWizardStepProps<T> {
  stepData?: T
  updateStepData: (val: T) => void
  closeWizard?: () => void
  /**
   * Following is to be provided to final step
   */
  createUpdateActionProps?: CreateUpdateSettingsActionProps
  auxilliaryData?: Partial<LDAPSettings>
}

const CreateUpdateLdapWizard: React.FC<CreateUpdateLdapWizardProps> = props => {
  const { getString } = useStrings()
  const { ldapSettings, isEdit } = props
  const { connectionSettings, displayName, identifier, userSettingsList, groupSettingsList } = ldapSettings || {}
  const [ldapOverviewState, setLdapOverviewState] = useState<LdapOverview>({ displayName })
  const [connectionSettingsState, setConnectionSettingsState] = useState<LdapConnectionSettings | undefined>(
    connectionSettings
  )
  const [userSettingsListState, setUserSettingsListState] = useState<LdapUserSettings[] | undefined>(userSettingsList)
  const [groupSettingsListState, setGroupSettingsListState] = useState<LdapGroupSettings[] | undefined>(
    groupSettingsList
  )
  const [triggerSaveData, setTriggerSaveData] = useState<boolean>(false)
  const [wiardUpdateError, setWizardUpdateError] = useState<ReactElement>()
  const [isUpdateInProgress, setIsUpdateInProgress] = useState<boolean>(false)
  const { accountId } = useParams<AccountPathProps>()
  const { mutate: updateLdapSettings } = useUpdateLdapSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { mutate: createLdapSettings } = useCreateLdapSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const getAddEditRequestParams = (): LDAPSettingsRequestBody =>
    ({
      ...ldapOverviewState,
      connectionSettings: connectionSettingsState,
      userSettingsList: userSettingsListState,
      groupSettingsList: groupSettingsListState,
      settingsType: 'LDAP'
    } as LDAPSettings)

  const saveStepsData = async (): Promise<void> => {
    let saved
    setIsUpdateInProgress(true)
    setWizardUpdateError(undefined)

    try {
      if (isEdit) {
        saved = await updateLdapSettings(getAddEditRequestParams())
      } else {
        saved = await createLdapSettings(getAddEditRequestParams())
      }

      if (saved) {
        props.onSuccess()
      }
    } catch (e) /* istanbul ignore next */ {
      setWizardUpdateError(
        <Layout.Vertical margin={{ bottom: 'medium' }}>
          <ErrorHandler
            responseMessages={getErrorMessageFromException(e, getString('authSettings.ldap.updateStepFailMessage'))}
          />
        </Layout.Vertical>
      )
      setTriggerSaveData(false)
      setIsUpdateInProgress(false)
    }
  }

  useEffect(() => {
    triggerSaveData && saveStepsData()
  }, [triggerSaveData])

  return (
    <StepWizard
      icon="user-groups"
      iconProps={{ size: 56, color: Color.GREY_0 }}
      title={isEdit ? displayName : getString('authSettings.ldap.addLdap')}
      key={identifier}
      className={css.wizardContainer}
    >
      <StepOverview
        name={getString('overview')}
        stepData={ldapOverviewState}
        updateStepData={(val: LdapOverview) => setLdapOverviewState(val)}
        closeWizard={props.closeWizard}
      />
      <StepConnectionSettings
        name={getString('authSettings.ldap.connectionSettings')}
        stepData={connectionSettingsState}
        displayName={ldapOverviewState.displayName || ''}
        identifier={identifier || ''}
        isEdit={isEdit}
        updateStepData={(val: LdapConnectionSettings) => setConnectionSettingsState(val)}
      />
      <StepUserQueries
        name={getString('authSettings.ldap.userQueries')}
        subTitle={getString('titleOptional')}
        stepData={userSettingsListState}
        updateStepData={(val: LdapUserSettings[]) => setUserSettingsListState(val)}
        auxilliaryData={{ ...ldapOverviewState, connectionSettings: connectionSettingsState, identifier }}
      />
      <StepGroupQueries
        name={getString('authSettings.ldap.groupQueries')}
        subTitle={getString('titleOptional')}
        stepData={groupSettingsListState}
        updateStepData={(val: LdapGroupSettings[]) => setGroupSettingsListState(val)}
        auxilliaryData={{ ...ldapOverviewState, connectionSettings: connectionSettingsState, identifier }}
        createUpdateActionProps={{
          isUpdateInProgress,
          createUpdateError: wiardUpdateError,
          triggerSaveData: () => setTriggerSaveData(true)
        }}
      />
    </StepWizard>
  )
}

export default CreateUpdateLdapWizard
