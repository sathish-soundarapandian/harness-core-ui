/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'

import cx from 'classnames'
import {
  Text,
  Layout,
  CardSelect,
  Icon,
  Container,
  Formik,
  FormikForm as Form,
  FormError,
  useConfirmationDialog,
  HarnessDocTooltip
} from '@harness/uicore'

import { Color, FontVariation, Intent } from '@harness/design-system'
import type { FormikContextType, FormikProps } from 'formik'
import { capitalize, defaultTo, get, isEqual, set } from 'lodash-es'
import produce from 'immer'
import * as Yup from 'yup'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { DeploymentTypeItem, getNgSupportedDeploymentTypes } from '@cd/utils/deploymentUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { getServiceDeploymentTypeSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import type { ServiceDefinition } from 'services/cd-ng'
import { deploymentTypes } from '../DeployProvisioningWizard/Constants'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import { BinaryLabels, BinaryOptions, newServiceState } from '../CDOnboardingUtils'
import ButtonWrapper from '../ButtonWrapper/ButtonWrapper'
import css from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface SelectDeploymentTypeRefInstance {
  submitForm?: FormikProps<SelectDeploymentTypeInterface>['submitForm']
}
export interface SelectDeploymentTypeInterface {
  selectedDeploymentType: DeploymentTypeItem[]
}
interface SelectDeploymentTypeProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
  onSuccess: () => void
}

export type SelectDeploymentTypeForwardRef =
  | ((instance: SelectDeploymentTypeRefInstance | null) => void)
  | React.MutableRefObject<SelectDeploymentTypeRefInstance | null>
  | null

const SelectDeploymentTypeRef = (
  props: SelectDeploymentTypeProps,
  forwardRef: SelectDeploymentTypeForwardRef
): React.ReactElement => {
  const { getString } = useStrings()
  const history = useHistory()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ServicePathProps>()
  const { disableNextBtn, enableNextBtn, onSuccess } = props

  const { SSH_NG, NG_SVC_ENV_REDESIGN } = useFeatureFlags()

  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()

  const [selectedDeploymentType, setSelectedDeploymentType] = useState<DeploymentTypeItem | undefined>(
    deploymentTypes.find(
      item => item.value === defaultTo(serviceData?.serviceDefinition?.type, ServiceDeploymentType.Kubernetes)
    )
  )
  const [gitOpsEnabled, setGitOpsEnabled] = useState<string>(
    serviceData?.gitOpsEnabled ? BinaryLabels.YES : BinaryLabels.NO
  )

  const formikRef = useRef<FormikContextType<SelectDeploymentTypeInterface>>()

  // Supported in NG - Only K8 enabled for onboarding phase 1
  const ngSupportedDeploymentTypes = React.useMemo((): DeploymentTypeItem[] => {
    const supportedDeploymentTypes = getNgSupportedDeploymentTypes({
      SSH_NG,
      NG_SVC_ENV_REDESIGN
    })

    return supportedDeploymentTypes.map(deploymentType => ({
      ...deploymentType,
      disabled: Boolean(deploymentType.value !== ServiceDeploymentType.Kubernetes)
    }))
  }, [SSH_NG, NG_SVC_ENV_REDESIGN])

  useEffect(() => {
    if (formikRef?.current?.values?.selectedDeploymentType) {
      enableNextBtn()
    } else {
      disableNextBtn()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  useEffect(() => {
    if (formikRef.current?.values) {
      if (!forwardRef) {
        return
      }
      if (typeof forwardRef === 'function') {
        return
      }
      if (formikRef.current.values) {
        forwardRef.current = {
          submitForm: formikRef?.current?.submitForm
        }
      }
    }
  }, [formikRef?.current?.values, forwardRef])

  const handleSubmit = (): void => {
    const updatedContextService = produce(newServiceState, draft => {
      const isGitopsEnabled = isEqual(gitOpsEnabled, BinaryLabels.YES)
      set(draft, 'serviceDefinition.type', selectedDeploymentType?.value as unknown as ServiceDefinition['type'])
      set(draft, 'gitOpsEnabled', isGitopsEnabled)
    })
    saveServiceData(updatedContextService)
    onSuccess()
  }

  const { openDialog: showGitopsRedirection } = useConfirmationDialog({
    contentText: getString('cd.getStartedWithCD.gitopsRedirect.subtitle'),
    titleText: getString('cd.getStartedWithCD.gitopsRedirect.title'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        setGitOpsEnabled(BinaryLabels.YES)
        history.push(routes.toGitOps({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
      } else {
        setGitOpsEnabled(BinaryLabels.NO)
      }
    }
  })

  const renderGitops = React.useCallback((): JSX.Element | null => {
    return selectedDeploymentType?.value === ServiceDeploymentType.Kubernetes ? (
      <Container>
        <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'large' }} color={Color.GREY_600}>
          {getString('cd.getStartedWithCD.deployToGitops')}
        </Text>
        {BinaryOptions.map(option => {
          return (
            <ButtonWrapper
              key={option.label}
              option={option}
              label={capitalize(option.label)}
              onClick={(value: string) => {
                if (value === BinaryLabels.YES) {
                  showGitopsRedirection()
                  setGitOpsEnabled(BinaryLabels.NO)
                }
              }}
              intent={gitOpsEnabled === option.label ? 'primary' : 'none'}
              margin={{ bottom: 'small' }}
              className={css.radioButton}
            />
          )
        })}
      </Container>
    ) : null
  }, [getString, gitOpsEnabled, selectedDeploymentType?.value, showGitopsRedirection])

  return (
    <Layout.Vertical width="70%">
      <Text
        font={{ variation: FontVariation.H3 }}
        padding={{ bottom: 'large' }}
        color={Color.GREY_600}
        data-tooltip-id="stageOverviewDeploymentType"
      >
        {getString('cd.getStartedWithCD.selectDeploymentType')}
        <HarnessDocTooltip tooltipId="stageOverviewDeploymentType" useStandAlone={true} />
      </Text>
      <Container className={css.borderBottom} />
      <Formik<SelectDeploymentTypeInterface>
        initialValues={{
          selectedDeploymentType: defaultTo(
            get(serviceData, 'serviceDefinition.type'),
            ServiceDeploymentType.Kubernetes
          )
        }}
        formName="cd-deploymentType selection"
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          selectedDeploymentType: getServiceDeploymentTypeSchema(getString)
        })}
      >
        {formikProps => {
          formikRef.current = formikProps
          return (
            <Form>
              <Layout.Horizontal>
                <Container padding={{ bottom: 'xxlarge' }}>
                  <Container padding={{ top: 'xxlarge', bottom: 'xxlarge' }}>
                    <CardSelect
                      data={ngSupportedDeploymentTypes}
                      cornerSelected={true}
                      className={css.icons}
                      cardClassName={css.serviceDeploymentTypeCard}
                      renderItem={(item: DeploymentTypeItem) => (
                        <>
                          <Layout.Vertical flex>
                            <Icon name={item.icon} size={30} flex className={css.serviceDeploymentTypeIcon} />
                            <Text font={{ variation: FontVariation.BODY2 }} className={css.text1}>
                              {getString(item.label)}
                            </Text>
                          </Layout.Vertical>
                        </>
                      )}
                      selected={selectedDeploymentType}
                      onChange={(item: DeploymentTypeItem) => {
                        formikProps.setFieldValue('selectedDeploymentType', item.value)
                        setSelectedDeploymentType(item)
                      }}
                    />
                    {formikProps.touched.selectedDeploymentType && !formikProps.values.selectedDeploymentType ? (
                      <FormError
                        name={'selectedDeploymentType'}
                        errorMessage={getString('common.getStarted.plsChoose', {
                          field: `${getString('infrastructureText')}`
                        })}
                      />
                    ) : null}
                    <Container className={cx({ [css.borderBottom]: selectedDeploymentType })} />
                  </Container>
                  {renderGitops()}
                </Container>
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const SelectDeploymentType = React.forwardRef(SelectDeploymentTypeRef)
