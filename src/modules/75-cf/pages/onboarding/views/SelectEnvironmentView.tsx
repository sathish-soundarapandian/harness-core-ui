/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { ButtonVariation, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings, String } from 'framework/strings'
import EnvironmentDialog from '@cf/components/CreateEnvironmentDialog/EnvironmentDialog'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import { EnvironmentSDKKeyType, getErrorMessage } from '@cf/utils/CFUtils'
import { useToaster } from '@common/exports'
import AddKeyDialog from '@cf/components/AddKeyDialog/AddKeyDialog'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'
import type { ApiKey } from 'services/cf'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
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

  const { EnvironmentSelect, loading, error, refetch, environments } = useEnvironmentSelectV2({
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

  const serverSide = language.type === PlatformEntryType.SERVER

  const onCloseEnvDialog = (): void => {
    setDialogOpen(false)
    setCreateEnvName('')
  }

  return (
    <Layout.Vertical spacing="xsmall" margin={{ top: 'xlarge' }} className={css.grid}>
      <Text
        font={{ variation: FontVariation.BODY1 }}
        color={Color.GREY_800}
        margin={{ top: 'medium', bottom: 'medium' }}
      >
        {getString('cf.onboarding.selectOrCreateEnvironment')}
      </Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        {getString('cf.onboarding.environmentDescription')}
      </Text>
      <Container>
        <Layout.Horizontal spacing="small">
          {loading && <Icon name="spinner" size={16} color="blue500" />}
          {!loading && (
            <>
              <Container width={250}>
                <EnvironmentSelect />
              </Container>
              {!!environments?.length && createEnvName && dialogOpen && (
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
            </>
          )}
        </Layout.Horizontal>
        {environmentCreated && (
          <Text
            margin={{ top: 'medium' }}
            icon="tick-circle"
            color={Color.GREEN_700}
            iconProps={{ color: Color.GREEN_700, size: 16 }}
          >
            {getString('cf.onboarding.envCreated')}
          </Text>
        )}

        {!!environments?.length && selectedEnvironment && (
          <>
            <Text
              font={{ variation: FontVariation.BODY1 }}
              color={Color.GREY_800}
              margin={{ top: 'medium', bottom: 'medium' }}
            >
              {getString('cf.onboarding.createSdkKey')}
            </Text>
            {!apiKey ? (
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} margin={{ bottom: 'medium' }}>
                {getString('cf.onboarding.sdkKeyDescription')}
              </Text>
            ) : (
              <String
                useRichText
                stringID={serverSide ? 'cf.onboarding.keyDescriptionServer' : 'cf.onboarding.keyDescriptionClient'}
                vars={{ env: selectedEnvironment.name }}
              />
            )}
            <Layout.Horizontal
              spacing="small"
              flex={{ alignItems: 'baseline' }}
              margin={{ top: 'small', bottom: 'small' }}
            >
              {apiKey ? (
                <IdentifierText identifier={apiKey.apiKey} allowCopy lineClamp={1} hideLabel />
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
      </Container>
    </Layout.Vertical>
  )
}
