/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypesWithRunTime, Layout, MultiTypeInputType, StepProps, Text } from '@harness/uicore'

import { FontVariation } from '@harness/design-system'
import produce from 'immer'
import { defaultTo, get, omit, set } from 'lodash-es'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper, UserRepoResponse } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import K8sValuesManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/K8sValuesManifest/K8sValuesManifest'
import type { ManifestLastStepProps, ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import HelmWithGIT from '@pipeline/components/ManifestSelection/ManifestWizardSteps/HelmWithGIT/HelmWithGIT'
import { useCDOnboardingContext } from '../../CDOnboardingStore'
import type { ConfigureServiceInterface } from '../ConfigureService'
import { getFullRepoName } from '../../DeployProvisioningWizard/Constants'

interface ProvideManifestProps {
  initialValues: ManifestConfig
  formikProps: FormikProps<ConfigureServiceInterface>
}

export type ManifestLastTypeProps = StepProps<ConnectorConfigDTO> &
  ManifestLastStepProps & {
    isOnboardingFlow: boolean
    prevStepData?: ConnectorConfigDTO
  }
export interface ManifestSelectionLastStepsParams {
  selectedManifestType: ManifestConfig['type'] | null
  lastStepProps: ManifestLastTypeProps
}

export function useManifestTypeLastSteps(params: ManifestSelectionLastStepsParams) {
  const { selectedManifestType, lastStepProps } = params
  switch (selectedManifestType) {
    case ManifestDataType.HelmChart:
      return <HelmWithGIT {...lastStepProps} />
    default:
      return <K8sValuesManifest {...lastStepProps} />
  }
}
const ProvideManifestRef = (props: ProvideManifestProps): React.ReactElement => {
  const { getString } = useStrings()
  const { formikProps } = props
  const {
    state: { service: serviceData }
  } = useCDOnboardingContext()

  const { expressions } = useVariablesExpression()
  const connectorResponse = get(serviceData, 'data.connectorRef') as ConnectorConfigDTO
  const connectorData = omit(connectorResponse, ['spec.url']) // omitting to nbot show repodetails from component
  const scope = 'account'
  const prevStepData = {
    connectorRef: {
      connector: connectorData,
      label: connectorData.name,
      value: `${scope}.${connectorData.identifier}`,
      scope,
      live: connectorData?.status?.status === 'SUCCESS'
    },
    selectedManifest: formikProps?.values?.manifestData?.type,
    store: formikProps?.values?.manifestStoreType
  }
  const allowableTypes: AllowedTypesWithRunTime[] = [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ]

  const lastStepProps = React.useMemo((): ManifestLastTypeProps => {
    const manifestDetailsProps: ManifestLastStepProps & {
      isOnboardingFlow: boolean
      prevStepData?: ConnectorConfigDTO
    } = {
      key: getString('pipeline.manifestType.manifestDetails'),
      name: getString('pipeline.manifestType.manifestDetails'),
      isOnboardingFlow: true,
      expressions,
      allowableTypes,
      stepName: getString('pipeline.manifestType.manifestDetails'),
      initialValues: defaultTo(serviceData?.serviceDefinition?.spec?.manifests?.[0]?.manifest, null) as ManifestConfig,
      handleSubmit: (data: ManifestConfigWrapper) => {
        const updatedDataWithUserRepo = produce(data, draft => {
          set(
            draft,
            'manifest.spec.store.spec.repoName',
            getFullRepoName(serviceData?.data?.repoValues as UserRepoResponse)
          )
        })
        formikProps?.setFieldValue('manifestConfig', updatedDataWithUserRepo)
      },
      selectedManifest: formikProps?.values?.manifestData?.type as ManifestTypes,
      manifestIdsList: [],
      isReadonly: false, //readonly,
      prevStepData: prevStepData
      // formClassName:''
    }
    if (formikProps?.values?.manifestData?.type === ManifestDataType.HelmChart) {
      manifestDetailsProps.deploymentType = get(serviceData, 'serviceDefinition.type')
    }
    return manifestDetailsProps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikProps?.values])

  return (
    <Layout.Vertical spacing="small" padding={{ bottom: 'xxlarge' }}>
      <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'small' }}>
        {getString('cd.getStartedWithCD.provideManifest')}
      </Text>
      {useManifestTypeLastSteps({
        selectedManifestType: formikProps?.values?.manifestData?.type,
        lastStepProps
      })}
    </Layout.Vertical>
  )
}

export const ProvideManifest = React.forwardRef(ProvideManifestRef)
