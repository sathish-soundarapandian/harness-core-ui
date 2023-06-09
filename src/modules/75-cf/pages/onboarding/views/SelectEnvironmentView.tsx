/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Button, ButtonVariation, Container, Icon, Layout, Text, TextInput } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings, String } from 'framework/strings'
import EnvironmentDialog from '@cf/components/CreateEnvironmentDialog/EnvironmentDialog'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import { EnvironmentSDKKeyType, getErrorMessage } from '@cf/utils/CFUtils'
import { useToaster } from '@common/exports'
import AddKeyDialog from '@cf/components/AddKeyDialog/AddKeyDialog'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'
import type { ApiKey } from 'services/cf'
import { EnvironmentResponseDTO, useGetEnvironmentListForProject } from 'services/cd-ng'
import { PlatformEntry, PlatformEntryType } from '@cf/components/LanguageSelection/LanguageSelection'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import css from './SelectEnvironmentView.module.scss'
export interface SelectEnvironmentViewProps {
  language: PlatformEntry
  apiKey?: ApiKey
  setApiKey: (key: ApiKey | undefined) => void
  selectedEnvironment?: EnvironmentResponseDTO
  setSelectedEnvironment: (env: EnvironmentResponseDTO | undefined) => void
}

export const SelectEnvironmentView: React.FC<SelectEnvironmentViewProps> = ({
  language,
  setApiKey,
  apiKey,
  selectedEnvironment,
  setSelectedEnvironment
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { trackEvent } = useTelemetry()
  const [environmentCreated, setEnvironmentCreated] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createEnvName, setCreateEnvName] = useState<string>('')
  const [newEnvName, setNewEnvName] = useState<string>('')
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()

  const { EnvironmentSelect, loading, error, refetch } = useEnvironmentSelectV2({
    selectedEnvironmentIdentifier: selectedEnvironment?.identifier,
    allowCreatingNewItems: true,
    noDefault: true,
    onChange: (_value, _environment, userEvent) => {
      if (!_environment) {
        setCreateEnvName(_value.label)
        setDialogOpen(true)
      } else {
        trackEvent(FeatureActions.EnvSelect, {
          category: Category.FEATUREFLAG,
          environment: _environment
        })
        setSelectedEnvironment(_environment)
        if (userEvent) {
          setApiKey(undefined)
        }
      }
    }
  })

  if (error) {
    showError(getErrorMessage(error), 0, 'cf.get.env.list.error')
  }

  const { data: environmentList } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier }
  })

  const noExistingEnvs = useMemo<boolean>(
    () => environmentList?.data?.totalItems === 0 && !selectedEnvironment,
    [environmentList?.data?.totalItems, selectedEnvironment]
  )
  const serverSide = language.type === PlatformEntryType.SERVER

  const onCloseEnvDialog = (): void => {
    setDialogOpen(false)
    setCreateEnvName('')
  }

  return (
    <>
      {loading && <Icon name="spinner" size={16} color="blue500" />}
      <Layout.Vertical className={css.gridDisplay} padding={{ top: 'xsmall' }}>
        <Text font={{ variation: FontVariation.BODY1 }} color={Color.GREY_800} padding={{ bottom: 'medium' }}>
          {getString('cf.onboarding.selectOrCreateEnvironment')}
        </Text>
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} padding={{ bottom: 'medium' }}>
          {getString('cf.onboarding.environmentDescription')}
        </Text>
      </Layout.Vertical>
      {!loading && (
        <>
          {noExistingEnvs ? (
            <>
              <Layout.Horizontal spacing="small">
                <TextInput
                  wrapperClassName={css.newEnvInput}
                  intent="primary"
                  aria-label={getString('cf.onboarding.typeNewEnvName')}
                  placeholder={getString('cf.onboarding.typeNewEnvName')}
                  value={newEnvName}
                  onChange={e => setNewEnvName((e?.target as HTMLInputElement)?.value)}
                />
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('cf.onboarding.createEnv')}
                  onClick={() => {
                    setCreateEnvName(newEnvName)
                    setDialogOpen(true)
                  }}
                />
              </Layout.Horizontal>
            </>
          ) : (
            <>
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} padding={{ bottom: 'xsmall' }}>
                {getString('cf.onboarding.selectOrTypeEnv')}
              </Text>
              <Container width={400}>
                <EnvironmentSelect />
              </Container>
            </>
          )}
          {createEnvName && dialogOpen && (
            <EnvironmentDialog
              createEnvFromInput={true}
              createEnvName={createEnvName}
              onCreate={newEnv => {
                setSelectedEnvironment(newEnv?.data)
                setEnvironmentCreated(true)
                refetch()
                setApiKey(undefined)
                onCloseEnvDialog()
              }}
              buttonProps={{
                text: getString('cf.onboarding.createEnv')
              }}
              onCloseDialog={onCloseEnvDialog}
            />
          )}
          {environmentCreated && (
            <Text
              margin={{ top: 'medium' }}
              padding={{ top: 'small', bottom: 'small' }}
              icon="tick-circle"
              color={Color.GREEN_700}
              iconProps={{ color: Color.GREEN_700, size: 16 }}
            >
              {getString('cf.onboarding.envCreated')}
            </Text>
          )}
        </>
      )}

      {selectedEnvironment && (
        <>
          <Layout.Vertical className={css.gridDisplay}>
            <Text
              font={{ variation: FontVariation.BODY1 }}
              color={Color.GREY_800}
              padding={{ top: 'large', bottom: 'xsmall' }}
            >
              {getString('cf.onboarding.createSdkKey')}
            </Text>
            {!apiKey ? (
              <Text
                font={{ variation: FontVariation.BODY }}
                color={Color.GREY_600}
                padding={{ top: 'xsmall', bottom: 'xsmall' }}
              >
                {getString('cf.onboarding.sdkKeyDescription')}
              </Text>
            ) : (
              <String
                useRichText
                stringID={serverSide ? 'cf.onboarding.keyDescriptionServer' : 'cf.onboarding.keyDescriptionClient'}
                vars={{ env: selectedEnvironment.name }}
              />
            )}
          </Layout.Vertical>
          <Layout.Horizontal flex={{ alignItems: 'baseline' }} padding={{ top: 'small' }}>
            {apiKey ? (
              <IdentifierText identifier={apiKey.apiKey} allowCopy hideLabel />
            ) : (
              <AddKeyDialog
                keyType={
                  language.type === PlatformEntryType.CLIENT
                    ? EnvironmentSDKKeyType.CLIENT
                    : EnvironmentSDKKeyType.SERVER
                }
                environment={selectedEnvironment as EnvironmentResponseDTO}
                onCreate={(newKey: ApiKey, hideCreate) => {
                  setApiKey(newKey)
                  hideCreate()
                }}
                buttonProps={{
                  intent: 'none',
                  variation: ButtonVariation.SECONDARY,
                  minimal: false,
                  text: getString('cf.environments.apiKeys.addKeyTitle')
                }}
              />
            )}
          </Layout.Horizontal>
        </>
      )}
    </>
  )
}
