import type { AllowedTypes } from '@harness/uicore'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import YAML from 'yaml'
import React, { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import { getProvisionerExecutionStrategyYamlPromise } from 'services/cd-ng'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { InfraProvisioningData, ProvisionersOptions } from '../../InfraProvisioning/InfraProvisioning'
import type { DeployEnvironmentEntityFormState } from '../types'
import { InfraProvisioningEntityBaseWithRef } from '../../InfraProvisioning/InfraProvisoningEntityBase'

interface DeployProvisionerProps {
  initialValues: DeployEnvironmentEntityFormState
  allowableTypes: AllowedTypes
}

export const DeployProvisioner = ({ initialValues, allowableTypes }: DeployProvisionerProps): JSX.Element => {
  const [provisionerEnabled, setProvisionerEnabled] = useState<boolean>(false)
  const [provisionerSnippetLoading, setProvisionerSnippetLoading] = useState<boolean>(false)
  const [provisionerType, setProvisionerType] = useState<ProvisionersOptions>('TERRAFORM')
  const { accountId } = useParams<PipelinePathProps>()

  const { setFieldValue } = useFormikContext<DeployEnvironmentEntityFormState>()

  const isProvisionerEmpty = (): boolean => {
    const provisionerData = get(initialValues, 'provisioner')
    return isEmpty(provisionerData?.steps) && isEmpty(provisionerData?.rollbackSteps)
  }

  // load and apply provisioner snippet to the stage
  useEffect(() => {
    if (initialValues && isProvisionerEmpty() && provisionerEnabled && provisionerType) {
      setProvisionerSnippetLoading(true)
      getProvisionerExecutionStrategyYamlPromise({
        // eslint-disable-next-line
        // @ts-ignore
        queryParams: { provisionerType: provisionerType, routingId: accountId }
      }).then(res => {
        const provisionerSnippet = YAML.parse(defaultTo(res?.data, ''))
        if (initialValues && isProvisionerEmpty() && provisionerSnippet) {
          setFieldValue('provisioner', provisionerSnippet.provisioner)
          setProvisionerSnippetLoading(false)
        }
      })
    }
  }, [provisionerEnabled, provisionerType])

  useEffect(() => {
    setProvisionerEnabled(!isProvisionerEmpty())
  }, [])

  const getProvisionerData = (): InfraProvisioningData => {
    let provisioner = get(initialValues, 'provisioner')
    provisioner = isNil(provisioner)
      ? {
          steps: [],
          rollbackSteps: []
        }
      : { ...provisioner }

    if (isNil(provisioner.steps)) {
      provisioner.steps = []
    }
    if (isNil(provisioner.rollbackSteps)) {
      provisioner.rollbackSteps = []
    }

    return {
      provisioner: { ...provisioner },
      provisionerEnabled,
      provisionerSnippetLoading,
      originalProvisioner: { ...provisioner }
    }
  }

  return (
    <InfraProvisioningEntityBaseWithRef
      initialValues={getProvisionerData()}
      allowableTypes={allowableTypes}
      onUpdate={(value: InfraProvisioningData) => {
        setProvisionerType(value.selectedProvisioner!)
        setProvisionerEnabled(value.provisionerEnabled)
        setFieldValue('provisioner', value.provisioner)
      }}
    />
  )
}
