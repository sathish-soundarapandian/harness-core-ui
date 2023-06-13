import React, { useEffect } from 'react'
import { Button, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import moment from 'moment'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useCreateToken, useListAggregatedApiKeys, useListAggregatedTokens } from 'services/cd-ng'
import type { ResponseString } from 'services/cd-ng'
import { String } from 'framework/strings'
import { TokenValueRenderer } from '@rbac/modals/TokenModal/views/TokenValueRenderer'
import css from '../../CDOnboardingWizardWithCLI.module.scss'
import { getIdentifierFromName } from '@common/utils/StringUtils'

export interface ApiKeySetupProps {
  onKeyGenerate: (key: string) => void
}
const API_KEY_TYPE = 'USER'
export default function ApiKeySetup({ onKeyGenerate }: ApiKeySetupProps): JSX.Element {
  const { currentUserInfo } = useAppStore()
  const { accountId } = useParams<ProjectPathProps>()
  const [token, setToken] = React.useState<string | undefined>()
  const { mutate: createToken } = useCreateToken({
    queryParams: { accountIdentifier: accountId }
  })
  const {
    data,
    loading
    // refetch ,
    // error
  } = useListAggregatedApiKeys({
    queryParams: {
      accountIdentifier: accountId,
      apiKeyType: API_KEY_TYPE,
      parentIdentifier: currentUserInfo.uuid
    }
  })
  const {
    data: tokenList,
    refetch: refetchToken,
    loading: tokensFetching
  } = useListAggregatedTokens({
    queryParams: {
      accountIdentifier: accountId,

      apiKeyType: API_KEY_TYPE,
      parentIdentifier: currentUserInfo.uuid,
      apiKeyIdentifier: ''
    },
    lazy: true
  })
  const apiKey = React.useMemo(() => {
    return data?.data?.content?.[0].apiKey.identifier
  }, [data])
  useEffect(() => {
    apiKey &&
      refetchToken({
        queryParams: {
          apiKeyIdentifier: apiKey,
          accountIdentifier: accountId,
          apiKeyType: API_KEY_TYPE,
          parentIdentifier: currentUserInfo.uuid
        }
      })
  }, [apiKey])
  const createApiKey = async (): Promise<void> => {
    await createToken({
      accountIdentifier: accountId,
      apiKeyIdentifier: apiKey as string,
      apiKeyType: 'USER',
      name: 'default-token',
      identifier: getIdentifierFromName('default-token'),
      parentIdentifier: currentUserInfo.uuid,
      validTo: moment().add('30', 'd').unix() * 1000
    })
      .then(res => {
        setToken(res?.data as string)
        return res
      })
      .catch(err => {
        setToken('yourtokenhere')
      })
  }
  useEffect(() => {
    onKeyGenerate(token as string)
  }, [token])

  if (tokensFetching) {
    return (
      <Layout.Horizontal padding="large">
        <Icon size={16} name="steps-spinner" color={Color.BLUE_800} style={{ marginRight: '12px' }} />
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.fetchingApiKeys"
        />
      </Layout.Horizontal>
    )
  }
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} padding={{ top: 'large', bottom: 'large' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.title"
        />
      </Text>
      {token ? (
        <TokenValueRenderer token={token} />
      ) : (
        <Button width={250} variation={ButtonVariation.PRIMARY} onClick={createApiKey}>
          <String
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step1.generateButton"
          />
        </Button>
      )}
    </Layout.Vertical>
  )
}
