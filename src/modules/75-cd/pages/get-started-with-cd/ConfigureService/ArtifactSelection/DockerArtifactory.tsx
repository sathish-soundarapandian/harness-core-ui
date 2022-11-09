/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Layout,
  Button,
  Formik,
  FormInput,
  Text,
  Container,
  SelectOption,
  ButtonVariation,
  ButtonSize,
  Icon
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { Color, FontVariation } from '@harness/design-system'
import type { IOptionProps } from '@blueprintjs/core'
import { get, isEmpty, noop, set } from 'lodash-es'
import type { FormikContextType } from 'formik'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import { DockerProviderType, buildDockerPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import type { ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import { ErrorHandler, ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import useCreateEditConnector, { BuildPayloadProps } from '@connectors/hooks/useCreateEditConnector'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import { DockerFormInterface, getUniqueEntityIdentifier, ServiceDataType } from '../../CDOnboardingUtils'
import { StepStatus } from '../../DeployProvisioningWizard/Constants'
import { useCDOnboardingContext } from '../../CDOnboardingStore'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import moduleCss from './DockerArtifactory.module.scss'
import css from '../../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

const defaultInitialFormData: DockerFormInterface = {
  dockerRegistryUrl: 'https://hub.docker.com/r/',
  authType: AuthTypes.ANNONYMOUS,
  dockerProviderType: DockerProviderType.DOCKERHUB,
  username: undefined,
  password: undefined,
  name: 'sample_docker_connector',
  identifier: '',
  connectivityMode: ConnectivityModeType.Delegate,
  delegateSelectors: []
}
interface DelegateSelectorStepData extends BuildPayloadProps {
  delegateSelectors: Array<string>
  connectivityMode: ConnectivityModeType | undefined
}

const DockerArtifactory = ({ onSuccess }: { onSuccess: (status: StepStatus) => void }): JSX.Element => {
  const { getString } = useStrings()
  const authOptions: SelectOption[] = [
    {
      label: getString('usernamePassword'),
      value: AuthTypes.USER_PASSWORD
    },
    {
      label: getString('anonymous'),
      value: AuthTypes.ANNONYMOUS
    }
  ]

  const dockerProviderTypeOptions: IOptionProps[] = [
    {
      label: getString('connectors.docker.dockerHub'),
      value: DockerProviderType.DOCKERHUB
    },
    {
      label: getString('connectors.docker.harbor'),
      value: DockerProviderType.HARBOR
    },
    {
      label: getString('connectors.docker.quay'),
      value: DockerProviderType.QUAY
    },
    {
      label: getString('connectors.docker.other'),
      value: DockerProviderType.OTHER
    }
  ]

  const scope: ScopedObjectDTO | undefined = undefined
  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()

  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(
    get(serviceData, 'data.artifactData.connectorResponse.status') === 'SUCCESS'
      ? TestStatus.SUCCESS
      : TestStatus.NOT_INITIATED
  )
  const [testConnectionErrors, setTestConnectionErrors] = useState<ResponseMessage[]>()
  const [editMode, setIsEditMode] = useState(false) // connector edit mode

  const scrollRef = useRef<Element>()
  const formikRef = useRef<FormikContextType<any>>()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  useEffect(() => {
    if (scrollRef) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [testConnectionErrors?.length])

  const TestConnection = (): React.ReactElement => {
    switch (testConnectionStatus) {
      case TestStatus.FAILED:
      case TestStatus.NOT_INITIATED:
        return (
          <Layout.Vertical>
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('common.smtp.testConnection')}
              size={ButtonSize.SMALL}
              type="submit"
              onClick={() => {
                validateDockerAuthentication()
              }}
              className={css.testConnectionBtn}
              id="test-connection-btn"
            />
            {testConnectionStatus === TestStatus.FAILED &&
            Array.isArray(testConnectionErrors) &&
            testConnectionErrors.length > 0 ? (
              <Container padding={{ top: 'medium' }} ref={scrollRef}>
                <ErrorHandler responseMessages={testConnectionErrors || []} />
              </Container>
            ) : null}
          </Layout.Vertical>
        )
      case TestStatus.IN_PROGRESS:
        return (
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name="steps-spinner" color={Color.PRIMARY_7} />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_7}>
              {getString('common.test.inProgress')}
            </Text>
          </Layout.Horizontal>
        )
      case TestStatus.SUCCESS:
        return (
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name="success-tick" />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREEN_700}>
              {getString('common.test.connectionSuccessful')}
            </Text>
          </Layout.Horizontal>
        )
      default:
        return <></>
    }
  }

  const onErrorHandler = (_response: ResponseMessage): void => {
    setTestConnectionStatus(TestStatus.FAILED)
  }
  const { onInitiate, connectorResponse } = useCreateEditConnector<DelegateSelectorStepData>({
    accountId,
    isEditMode: editMode,
    isGitSyncEnabled: false,
    afterSuccessHandler: noop,
    onErrorHandler,
    skipGoveranceCheck: true
  })

  useEffect(() => {
    // reset test connection
    if (isEmpty(connectorResponse)) {
      setTestConnectionStatus(TestStatus.NOT_INITIATED)
    }
    // save data to context
    const updatedContextService = produce(serviceData as ServiceDataType, draft => {
      set(draft, 'data.artifactData', { ...formikRef?.current?.values, connectorResponse })
    })

    saveServiceData(updatedContextService)
    if (connectorResponse?.status === 'SUCCESS') {
      setIsEditMode(true)
      onSuccess(StepStatus.Success)
      setTestConnectionStatus(TestStatus.SUCCESS)
    } else {
      setTestConnectionStatus(TestStatus.FAILED)
    }
  }, [connectorResponse])

  const validateDockerAuthentication = React.useCallback(async (): Promise<void> => {
    await formikRef?.current?.submitForm()
    if (isEmpty(formikRef?.current?.errors)) {
      setTestConnectionStatus(TestStatus.IN_PROGRESS)
      setTestConnectionErrors([])
      const connectorData: DelegateSelectorStepData = {
        ...formikRef?.current?.values,
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier
      }

      await onInitiate({
        connectorFormData: connectorData,
        buildPayload: buildDockerPayload
      })
    }

    // TODO: save data in context
  }, [onInitiate, orgIdentifier, projectIdentifier])

  const getArtifactInitialValues = (): DockerFormInterface => {
    const contextArtifactData = get(serviceData, 'data.artifactData')
    return isEmpty(contextArtifactData)
      ? {
          ...defaultInitialFormData,
          identifier: getUniqueEntityIdentifier(defaultInitialFormData.name)
        }
      : contextArtifactData
  }
  return (
    <Formik
      initialValues={getArtifactInitialValues()}
      formName="dockerAuthForm"
      validationSchema={Yup.object().shape({
        dockerRegistryUrl: Yup.string().trim().required(getString('validation.dockerRegistryUrl')),
        authType: Yup.string().trim().required(getString('validation.authType')),
        username: Yup.string().when('authType', {
          is: val => val === AuthTypes.USER_PASSWORD,
          then: Yup.string().trim().required(getString('validation.username')),
          otherwise: Yup.string().nullable()
        }),
        password: Yup.object().when('authType', {
          is: val => val === AuthTypes.USER_PASSWORD,
          then: Yup.object().required(getString('validation.password')),
          otherwise: Yup.object().nullable()
        })
      })}
      validate={_formData => {
        // reset testConnection on each change
        setTestConnectionStatus(TestStatus.NOT_INITIATED)
        onSuccess(StepStatus.InProgress)
      }}
      onSubmit={noop} //handleSubmit
    >
      {formikProps => {
        formikRef.current = formikProps
        return (
          <Layout.Vertical margin={{ bottom: 'large' }} padding={{ left: 'small' }}>
            <Layout.Vertical padding={{ top: 'large' }} className={moduleCss.stepWrapper} width={'64%'}>
              <FormInput.Text
                name="dockerRegistryUrl"
                placeholder={getString('UrlLabel')}
                label={getString('connectors.docker.dockerRegistryURL')}
              />
              <Text tooltipProps={{ dataTooltipId: 'dockerConnectorProviderType' }}>
                {getString('connectors.docker.dockerProvideType')}
              </Text>
              <FormInput.RadioGroup
                className={moduleCss.dockerProviderType}
                inline
                name="dockerProviderType"
                radioGroup={{ inline: true }}
                items={dockerProviderTypeOptions}
                disabled={false}
              ></FormInput.RadioGroup>
              <Container className={moduleCss.authHeaderRow}>
                <Text
                  font={{ variation: FontVariation.H6 }}
                  inline
                  tooltipProps={{ dataTooltipId: 'dockerConnectorAuthentication' }}
                >
                  {getString('authentication')}
                </Text>
                <FormInput.Select
                  name="authType"
                  items={authOptions}
                  disabled={false}
                  className={commonStyles.authTypeSelectLarge}
                />
              </Container>
              {formikProps.values.authType === AuthTypes.USER_PASSWORD ? (
                <>
                  <TextReference
                    name="username"
                    stringId="username"
                    type={formikProps.values.username ? formikProps.values.username?.type : ValueType.TEXT}
                  />
                  <SecretInput name={'password'} label={getString('password')} scope={scope} />
                </>
              ) : null}
            </Layout.Vertical>
            <Layout.Horizontal>
              <Container>
                <TestConnection />
              </Container>
            </Layout.Horizontal>
          </Layout.Vertical>
        )
      }}
    </Formik>
  )
}

export default DockerArtifactory
