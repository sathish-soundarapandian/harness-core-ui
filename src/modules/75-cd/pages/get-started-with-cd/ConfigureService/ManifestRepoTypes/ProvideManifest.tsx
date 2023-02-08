/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, StepProps, Text } from '@harness/uicore'

import { FontVariation } from '@harness/design-system'
import produce from 'immer'
import { defaultTo, get, set } from 'lodash-es'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import K8sValuesManifest from '@pipeline/components/ManifestSelection/ManifestWizardSteps/K8sValuesManifest/K8sValuesManifest'
import type { ManifestLastStepProps, ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import HelmWithGIT from '@pipeline/components/ManifestSelection/ManifestWizardSteps/HelmWithGIT/HelmWithGIT'
import { ModalViewFor } from '@connectors/components/CreateConnector/CreateConnectorUtils'
import { Connectors } from '@connectors/constants'
import { useCDOnboardingContext } from '../../CDOnboardingStore'
import type { ConfigureServiceInterface } from '../ConfigureService'
import { ALLOWABLE_TYPES } from '../../CDOnboardingUtils'

export type ManifestLastTypeProps = StepProps<ConnectorConfigDTO> &
  ManifestLastStepProps & {
    context: number
    prevStepData?: ConnectorConfigDTO
  }
export interface ManifestSelectionLastStepsParams {
  selectedManifestType: ManifestConfig['type'] | null
  lastStepProps: ManifestLastTypeProps
}

export function useManifestTypeLastSteps(params: ManifestSelectionLastStepsParams): JSX.Element {
  const { selectedManifestType, lastStepProps } = params
  switch (selectedManifestType) {
    case ManifestDataType.HelmChart:
      return <HelmWithGIT {...lastStepProps} />
    default:
      return <K8sValuesManifest {...lastStepProps} />
  }
}

export const ProvideManifest = (): React.ReactElement => {
  const { getString } = useStrings()
  const { values, setFieldValue } = useFormikContext<ConfigureServiceInterface>()
  const {
    state: { service: serviceData }
  } = useCDOnboardingContext()

  const { expressions } = useVariablesExpression()
  const connectorResponse = get(serviceData, 'data.connectorRef') as ConnectorConfigDTO
  const scope = 'account'
  const prevStepData = {
    connectorRef: {
      connector: connectorResponse,
      label: connectorResponse?.name,
      value: `${scope}.${connectorResponse?.identifier}`,
      scope,
      live: connectorResponse?.status?.status === 'SUCCESS'
    },
    selectedManifest: values?.manifestData?.type,
    store: values?.manifestStoreType === Connectors.GITLAB ? ManifestStoreMap.GitLab : values?.manifestStoreType
  }

  const getManifestInitialValues = (): ManifestConfig => {
    const updatedInitialValueWithUserRepo = produce(values?.manifestConfig?.manifest as ManifestConfig, draft => {
      if (draft) {
        values?.repository && set(draft, 'spec.store.spec.repoName', defaultTo(values?.repository?.name, ''))
        set(draft, 'spec.store.spec.connectorRef', `${scope}.${connectorResponse?.identifier}`)
      }
    })
    return updatedInitialValueWithUserRepo
  }

  const lastStepProps = React.useMemo((): ManifestLastTypeProps => {
    const manifestDetailsProps: ManifestLastStepProps & {
      context: number
      prevStepData?: ConnectorConfigDTO
    } = {
      key: getString('pipeline.manifestType.manifestDetails'),
      name: getString('pipeline.manifestType.manifestDetails'),
      context: ModalViewFor.CD_Onboarding,
      expressions,
      allowableTypes: ALLOWABLE_TYPES,
      stepName: getString('pipeline.manifestType.manifestDetails'),
      initialValues: getManifestInitialValues(),
      handleSubmit: (data: ManifestConfigWrapper) => {
        const updatedDataWithUserRepo = produce(data, draft => {
          set(draft, 'manifest.spec.store.spec.repoName', defaultTo(values?.repository?.name, ''))
        })
        setFieldValue('manifestConfig', updatedDataWithUserRepo)
      },
      selectedManifest: values?.manifestData?.type as ManifestTypes,
      manifestIdsList: [],
      isReadonly: false,
      prevStepData: prevStepData
    }
    if (values?.manifestData?.type === ManifestDataType.HelmChart) {
      manifestDetailsProps.deploymentType = get(serviceData, 'serviceDefinition.type')
    }
    return manifestDetailsProps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  return (
    <Layout.Vertical spacing="small" padding={{ bottom: 'xxlarge' }}>
      <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'small' }}>
        {getString('cd.getStartedWithCD.provideManifest')}
      </Text>
      {useManifestTypeLastSteps({
        selectedManifestType: values?.manifestData?.type,
        lastStepProps
      })}
    </Layout.Vertical>
  )
}
