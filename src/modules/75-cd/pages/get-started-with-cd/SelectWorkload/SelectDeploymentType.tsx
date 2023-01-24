/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Text,
  Layout,
  CardSelect,
  Icon,
  Container,
  Formik,
  FormikForm,
  FormError,
  HarnessDocTooltip
} from '@harness/uicore'

import { Color, FontVariation } from '@harness/design-system'
import type { FormikContextType, FormikProps } from 'formik'
import { defaultTo, get, set } from 'lodash-es'
import produce from 'immer'
import * as Yup from 'yup'
import { HelpPanel } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import { deploymentIconMap, DeploymentTypeItem } from '@cd/utils/deploymentUtils'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { getServiceDeploymentTypeSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type { ServiceDefinition } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { deploymentTypes } from '../DeployProvisioningWizard/Constants'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import { newServiceState } from '../CDOnboardingUtils'
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
  const { trackEvent } = useTelemetry()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { disableNextBtn, enableNextBtn, onSuccess } = props

  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()

  const [selectedDeploymentType, setSelectedDeploymentType] = useState<DeploymentTypeItem | undefined>(
    deploymentTypes.find(
      item => item.value === defaultTo(serviceData?.serviceDefinition?.type, ServiceDeploymentType.Kubernetes)
    )
  )

  const formikRef = useRef<FormikContextType<SelectDeploymentTypeInterface>>()

  // Supported in NG - Only K8 enabled for onboarding phase 1
  const ngSupportedDeploymentTypes = [
    {
      label: 'pipeline.serviceDeploymentTypes.kubernetes',
      icon: deploymentIconMap[ServiceDeploymentType.Kubernetes],
      value: ServiceDeploymentType.Kubernetes
    }
    // {
    //   label: 'pipeline.serviceDeploymentTypes.kubernetesWithGitops',
    //   icon: deploymentIconMap[ServiceDeploymentType.KubernetesGitops],
    //   value: ServiceDeploymentType.KubernetesGitops
    // }
  ]

  useEffect(() => {
    if (formikRef?.current?.values?.selectedDeploymentType) {
      enableNextBtn()
    } else {
      disableNextBtn()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  React.useImperativeHandle(forwardRef, () => ({
    submitForm() {
      if (formikRef.current) {
        return formikRef.current.submitForm()
      }
      return Promise.resolve()
    }
  }))

  const handleSubmit = (): void => {
    const updatedContextService = produce(newServiceState, draft => {
      set(draft, 'serviceDefinition.type', selectedDeploymentType?.value as unknown as ServiceDefinition['type'])
    })
    saveServiceData(updatedContextService)
    onSuccess()
  }

  return (
    <Container flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <Layout.Vertical width="70%">
        <Text
          font={{ variation: FontVariation.H3 }}
          padding={{ bottom: 'large' }}
          color={Color.GREY_600}
          data-tooltip-id="cdOnboardingDeploymentType"
        >
          {getString('cd.getStartedWithCD.selectDeploymentType')}
          <HarnessDocTooltip tooltipId="cdOnboardingDeploymentType" useStandAlone={true} />
        </Text>
        <Formik<SelectDeploymentTypeInterface>
          initialValues={{
            selectedDeploymentType: defaultTo(
              get(serviceData, 'serviceDefinition.type'),
              ServiceDeploymentType.Kubernetes
            )
          }}
          formName="select-deployment-type-cd"
          onSubmit={handleSubmit}
          validationSchema={Yup.object().shape({
            selectedDeploymentType: getServiceDeploymentTypeSchema(getString)
          })}
        >
          {formikProps => {
            formikRef.current = formikProps
            return (
              <FormikForm>
                <Layout.Horizontal>
                  <Container padding={{ bottom: 'xxlarge' }}>
                    <Container padding={{ top: 'xxlarge', bottom: 'xxlarge' }}>
                      <CardSelect
                        data={ngSupportedDeploymentTypes as DeploymentTypeItem[]}
                        cornerSelected={true}
                        className={css.icons}
                        cardClassName={css.serviceDeploymentTypeCard}
                        renderItem={(item: DeploymentTypeItem) => (
                          <>
                            <Layout.Vertical flex>
                              <Icon name={item.icon} size={48} flex className={css.serviceDeploymentTypeIcon} />
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
                          trackEvent(CDOnboardingActions.SelectDeploymentType, {
                            selectedDeploymentType
                          })
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
                    </Container>
                    <Link to={routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module: 'cd' })}>
                      <Text
                        color={Color.PRIMARY_7}
                        font={{ variation: FontVariation.SMALL_SEMI }}
                        margin={{ top: 'huge' }}
                      >
                        {getString('cd.getStartedWithCD.clickForOtherDeploymentTypes')}
                      </Text>
                    </Link>
                  </Container>
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
      <Container className={css.helpPanelContainer}>
        <HelpPanel referenceId="cdOnboardSelectDeploymentType" />
      </Container>
    </Container>
  )
}

export const SelectDeploymentType = React.forwardRef(SelectDeploymentTypeRef)
