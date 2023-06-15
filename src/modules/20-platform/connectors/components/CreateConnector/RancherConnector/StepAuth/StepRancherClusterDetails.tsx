import React, { useEffect, useState } from 'react'
import {
  Layout,
  Text,
  Container,
  FormInput,
  Formik,
  Button,
  ButtonVariation,
  PageSpinner,
  ThumbnailSelect,
  StepProps
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation, Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import type { ConnectorInfoDTO, ConnectorConfigDTO, ConnectorRequestBody } from 'services/cd-ng'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { setupRancherFormData, DelegateCardInterface } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { DelegateTypes } from '@common/components/ConnectivityMode/ConnectivityMode'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import { useStrings } from 'framework/strings'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { Connectors } from '@connectors/constants'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { URLValidationSchema } from '@common/utils/Validation'
import type { ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import { useConnectorWizard } from '../../../CreateConnectorWizard/ConnectorWizardContext'
import css from './StepRancherClusterDetails.module.scss'

interface StepRancherClusterDetailsProps extends ConnectorInfoDTO {
  name: string
}

interface RancherClusterDetailsProps {
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  hideModal: () => void
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}
interface RancherFormInterface {
  delegateType?: string
  authType: string
  password: SecretReferenceInterface | void
  delegateSelectors: Array<string>
}

const defaultInitialFormData: RancherFormInterface = {
  delegateType: undefined,
  authType: AuthTypes.BEARER_TOKEN_RANCHER,
  password: undefined,
  delegateSelectors: []
}

interface AuthOptionInterface {
  label: string
  value: string
}

const RenderRancherAuthForm: React.FC<FormikProps<RancherFormInterface> & { isEditMode: boolean } & ScopedObjectDTO> =
  props => {
    const { orgIdentifier, projectIdentifier } = props
    const { getString } = useStrings()
    const scope = props.isEditMode ? { orgIdentifier, projectIdentifier } : undefined

    switch (props.values.authType) {
      case AuthTypes.BEARER_TOKEN_RANCHER:
        return (
          <Container width={'42%'}>
            <SecretInput name={'passwordRef'} label={getString('token')} scope={scope} />
          </Container>
        )

      default:
        return null
    }
  }

const StepRancherClusterDetails: React.FC<StepProps<StepRancherClusterDetailsProps> & RancherClusterDetailsProps> =
  props => {
    const { accountId, prevStepData, nextStep } = props
    const { getString } = useStrings()

    const DelegateCards: DelegateCardInterface[] = [
      {
        type: DelegateTypes.DELEGATE_OUT_CLUSTER,
        info: getString('connectors.rancher.delegateOutClusterInfo')
      }
    ]

    const authOptions: Array<AuthOptionInterface> = [
      {
        label: getString('connectors.bearerToken'),
        value: AuthTypes.BEARER_TOKEN_RANCHER
      }
    ]

    const validationSchema = Yup.object().shape({
      rancherUrl: Yup.string()
        .nullable()
        .when('delegateType', {
          is: delegateType => delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER,
          then: URLValidationSchema(getString, { requiredMessage: getString('connectors.rancher.validation') })
        }),
      delegateType: Yup.string().required(
        getString('connectors.chooseMethodForConnection', { name: Connectors.Rancher })
      ),
      authType: Yup.string()
        .nullable()
        .when('delegateType', {
          is: delegateType => delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER,
          then: Yup.string().required(getString('validation.authType'))
        }),

      passwordRef: Yup.object().when('authType', {
        is: authType => authType === AuthTypes.BEARER_TOKEN_RANCHER,
        then: Yup.object().required(getString('validation.accessToken')),
        otherwise: Yup.object().nullable()
      })
    })

    const [initialValues, setInitialValues] = useState(defaultInitialFormData)
    const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

    useEffect(() => {
      if (loadingConnectorSecrets) {
        if (props.isEditMode) {
          if (props.connectorInfo) {
            setupRancherFormData(props.connectorInfo, accountId).then(data => {
              setInitialValues(data as RancherFormInterface)
              setLoadingConnectorSecrets(false)
            })
          } else {
            setLoadingConnectorSecrets(false)
          }
        }
      }
    }, [loadingConnectorSecrets])

    const handleSubmit = (formData: ConnectorConfigDTO): void => {
      trackEvent(ConnectorActions.DetailsStepSubmit, {
        category: Category.CONNECTOR,
        connector_type: Connectors.Rancher
      })
      nextStep?.({
        ...props.connectorInfo,
        ...prevStepData,
        ...formData,
        ...(typeof formData.rancherUrl === 'string' && { masterUrl: formData.rancherUrl.trim() })
      } as StepRancherClusterDetailsProps)
    }
    useConnectorWizard({ helpPanel: { referenceId: 'RancherConnectorDetails', contentWidth: 1100 } })
    const { trackEvent } = useTelemetry()

    useTrackEvent(ConnectorActions.DetailsStepLoad, {
      category: Category.CONNECTOR,
      connector_type: Connectors.Rancher
    })

    return loadingConnectorSecrets ? (
      <PageSpinner />
    ) : (
      <Layout.Vertical spacing="medium" className={css.secondStep}>
        <Text
          font={{ variation: FontVariation.H3 }}
          color={Color.BLACK}
          tooltipProps={{ dataTooltipId: 'RancherConnectorDetails' }}
        >
          {getString('details')}
        </Text>
        <Text font={{ variation: FontVariation.H6, weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('connectors.rancher.delegateSelector')}
        </Text>
        <Formik
          initialValues={{
            ...initialValues,
            ...props.prevStepData
          }}
          validationSchema={validationSchema}
          formName="rancherClusterForm"
          onSubmit={handleSubmit}
        >
          {formikProps => {
            return (
              <>
                <Container className={css.clusterWrapper}>
                  <ThumbnailSelect
                    items={DelegateCards.map(card => ({
                      label: (
                        <Text
                          font={{ size: 'small', weight: 'bold' }}
                          icon={card.icon}
                          iconProps={{ size: 23, margin: { right: 'xsmall' } }}
                        >
                          {card.info}
                        </Text>
                      ),
                      value: card.type
                    }))}
                    name="delegateType"
                    size="large"
                    onChange={type => {
                      formikProps?.setFieldValue('delegateType', type)
                      formikProps?.setFieldValue(
                        'authType',
                        type === DelegateTypes.DELEGATE_OUT_CLUSTER ? AuthTypes.BEARER_TOKEN_RANCHER : ''
                      )
                    }}
                    className={css.delegateCard}
                  />

                  {DelegateTypes.DELEGATE_OUT_CLUSTER === formikProps.values.delegateType ? (
                    <>
                      <FormInput.Text
                        label={getString('connectors.rancher.rancherUrlLabel')}
                        placeholder={getString('UrlLabel')}
                        name="rancherUrl"
                        className={css.formFieldWidth}
                      />

                      <Container className={css.authHeaderRow}>
                        <Text
                          font={{ variation: FontVariation.H6 }}
                          inline
                          tooltipProps={{ dataTooltipId: 'RancherAuthenticationTooltip' }}
                        >
                          {getString('authentication')}
                        </Text>
                        <FormInput.DropDown
                          name="authType"
                          items={authOptions}
                          disabled={false}
                          dropDownProps={{
                            isLabel: true,
                            filterable: false,
                            minWidth: 'unset'
                          }}
                        />
                      </Container>

                      <RenderRancherAuthForm
                        {...formikProps}
                        isEditMode={props.isEditMode}
                        orgIdentifier={prevStepData?.orgIdentifier}
                        projectIdentifier={prevStepData?.projectIdentifier}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </Container>
                <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    variation={ButtonVariation.SECONDARY}
                    onClick={() => props?.previousStep?.(props?.prevStepData)}
                    data-name="rancherBackButton"
                  />
                  <Button
                    type="submit"
                    variation={ButtonVariation.PRIMARY}
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    onClick={formikProps.submitForm}
                    margin={{ left: 'medium' }}
                  />
                </Layout.Horizontal>
              </>
            )
          }}
        </Formik>
      </Layout.Vertical>
    )
  }

export default StepRancherClusterDetails
