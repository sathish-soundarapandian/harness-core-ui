/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Layout, Formik, FormikForm, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { debounce, noop, defaultTo } from 'lodash-es'
import type { FormikProps } from 'formik'

import { useGetEKSClusterNames, K8sAwsInfrastructure } from 'services/cd-ng'

import { useStrings } from 'framework/strings'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { Connectors } from '@connectors/constants'
import {
  CommonKuberetesInfraSpecEditable,
  getValidationSchema,
  K8sAwsInfrastructureUI
} from '../Common/CommonKuberetesInfraSpec/CommonKuberetesInfraSpecEditable'
import type { K8sAwsInfrastructureSpecEditableProps } from './K8sAwsInfrastructureSpec'

export const K8sAwsInfrastructureSpecEditable: React.FC<K8sAwsInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const [clusterOptions, setClusterOptions] = useState<SelectOption[]>([])
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { getString } = useStrings()

  const {
    data: clusterNamesData,
    refetch: refetchClusterNames,
    loading: loadingClusterNames,
    error: clusterError
  } = useGetEKSClusterNames({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options = defaultTo(clusterNamesData?.data, []).map(name => ({ label: name, value: name }))
    setClusterOptions(options)
  }, [clusterNamesData])

  useEffect(() => {
    if (
      initialValues.connectorRef &&
      getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(initialValues.cluster) === MultiTypeInputType.FIXED
    ) {
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          awsConnectorRef: initialValues.connectorRef
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchClusters = (connectorRef: string): void => {
    if (getMultiTypeFromValue(connectorRef) !== MultiTypeInputType.RUNTIME) {
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          awsConnectorRef: connectorRef
        }
      })
    }
  }
  const getInitialValues = (): K8sAwsInfrastructureUI => {
    const values: K8sAwsInfrastructureUI = {
      ...initialValues
    }

    if (getMultiTypeFromValue(initialValues.cluster) === MultiTypeInputType.FIXED) {
      values.cluster = { label: initialValues.cluster, value: initialValues.cluster }
    }

    return values
  }

  const getClusterValue = (cluster: { label?: string; value?: string } | string | any): string => {
    return typeof cluster === 'string' ? /* istanbul ignore next */ (cluster as string) : cluster?.value
  }

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  return (
    <Layout.Vertical spacing="medium">
      <Formik<K8sAwsInfrastructureUI>
        formName="AwsInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<K8sAwsInfrastructure> = {
            namespace: value.namespace === '' ? undefined : value.namespace,
            releaseName: value.releaseName === '' ? undefined : value.releaseName,
            connectorRef: undefined,
            cluster: getClusterValue(value.cluster) === '' ? undefined : getClusterValue(value.cluster),
            allowSimultaneousDeployments: value.allowSimultaneousDeployments,
            provisioner: value.provisioner || undefined
          }
          /* istanbul ignore else */ if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || /* istanbul ignore next */ value.connectorRef
          }
          delayedOnUpdate(data)
        }}
        validationSchema={getValidationSchema(getString)}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik as FormikProps<unknown> | null
          return (
            <FormikForm>
              <CommonKuberetesInfraSpecEditable
                readonly={readonly}
                allowableTypes={allowableTypes}
                connectorType={Connectors.AWS as any}
                clusterError={clusterError}
                clusterLoading={loadingClusterNames}
                clusterOptions={clusterOptions}
                setClusterOptions={setClusterOptions}
                fetchClusters={fetchClusters}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
