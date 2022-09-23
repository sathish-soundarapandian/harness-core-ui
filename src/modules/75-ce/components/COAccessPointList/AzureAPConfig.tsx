/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heading } from '@wings-software/uicore'
import { AccessPoint, useCreateAccessPoint, useEditAccessPoint } from 'services/lw'
// import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { Utils } from '@ce/common/Utils'
import type { AccessPointScreenMode } from '@ce/types'
import { PROVIDER_TYPES } from '@ce/constants'
import { useStrings } from 'framework/strings'
import AzureAccessPointForm, { AzureApFormVal } from './AzureAccessPointForm'
import AzureApDnsMapping, { AzureDnsFormVal } from './AzureDnsMapping'
import css from '../COGatewayAccess/COGatewayAccess.module.scss'

interface AzureAPConfigProps {
  loadBalancer: AccessPoint
  cloudAccountId: string | undefined
  onClose?: (clearSelection?: boolean) => void
  onSave: (savedLoadBalancer: AccessPoint) => void
  mode: AccessPointScreenMode
}

enum FormStep {
  FIRST = 1,
  SECOND = 2
}

const AzureAPConfig: React.FC<AzureAPConfigProps> = props => {
  const { loadBalancer, cloudAccountId, mode, onSave } = props
  const isEditMode = mode === 'edit'

  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.FIRST)
  const [newAp, setNewAp] = useState<AccessPoint>(loadBalancer)
  // const [loadBalancerId, setLoadBalancerId] = useState<string>()
  const [lbCreationInProgress, setLbCreationInProgress] = useState<boolean>(false)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  const { mutate: createLoadBalancer } = useCreateAccessPoint({
    account_id: accountId
  })

  const { mutate: editLoadBalancer } = useEditAccessPoint({
    account_id: accountId
  })

  const moveForward = () => {
    setCurrentStep(currentStep + 1)
  }

  const moveBackward = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleDnsMappingSubmission = (_values: AzureDnsFormVal) => {
    const updatedAp = { ...newAp }
    updatedAp.host_name = _values.customDomain
    updatedAp.name = _values.name
    setNewAp(updatedAp)
    moveForward()
  }

  const saveLb = async (lbToSave: AccessPoint): Promise<void> => {
    setLbCreationInProgress(true)
    try {
      const result = isEditMode ? await editLoadBalancer(lbToSave) : await createLoadBalancer(lbToSave) // eslint-disable-line
      if (result.response) {
        // setLoadBalancerId(result.response.id as string)
        showSuccess(
          isEditMode
            ? getString('ce.co.accessPoint.successfulEdition', { name: result.response.name })
            : getString('ce.co.accessPoint.successfulCreation')
        )
        props.onSave?.(result.response)
        props.onClose?.()
      }
    } catch (e) {
      setLbCreationInProgress(false)
      showError(Utils.getASErrorMessage(e) || e.data?.message || e.message, undefined, 'ce.savelb.error')
    }
  }

  const handleFormSubmit = (val: AzureApFormVal) => {
    saveLb({
      ...newAp,
      org_id: orgIdentifier,
      project_id: projectIdentifier,
      cloud_account_id: props.cloudAccountId,
      region: val.region,
      subnets: val.subnet ? [val.subnet] : [],
      vpc: val.virtualNetwork,
      metadata: {
        ...newAp.metadata,
        resource_group: val.resourceGroup,
        fe_ip_id: val.ip,
        size: val.sku,
        subnet_id: val.subnet,
        ...(val.newCertificate ? { certificate: val.newCertificate } : { certificate_id: val.certificate }),
        subnet_name: val.subnet_name,
        fe_ip_name: val.fe_ip_name,
        func_region: val.func_region
      }
    })
  }

  const handleBackClick = (values: AzureApFormVal) => {
    setNewAp(prevAp => ({
      ...prevAp,
      region: values.region,
      ...(values.subnet && {
        subnets: [values.subnet]
      }),
      vpc: values.virtualNetwork,
      metadata: {
        ...prevAp.metadata,
        resource_group: values.resourceGroup,
        fe_ip_id: values.ip,
        size: values.sku,
        subnet_id: values.subnet,
        ...(values.newCertificate ? { certificate: values.newCertificate } : { certificate_id: values.certificate }),
        subnet_name: values.subnet_name,
        fe_ip_name: values.fe_ip_name,
        func_region: values.func_region
      }
    }))
    moveBackward()
  }

  const getHeading = () => {
    return Utils.getLoadBalancerModalHeader(props.mode, PROVIDER_TYPES.AZURE, loadBalancer.name)
  }

  return (
    <div className={css.loadBalancerDnsConfigDialog}>
      <Heading level={2} className={css.configHeading}>
        {getHeading()}
      </Heading>
      <div>
        {currentStep === FormStep.FIRST && (
          <AzureApDnsMapping
            mode={mode}
            handleSubmit={handleDnsMappingSubmission}
            loadBalancer={newAp}
            handleCancel={() => props.onClose?.(true)}
          />
        )}
        {currentStep === FormStep.SECOND && (
          <AzureAccessPointForm
            cloudAccountId={cloudAccountId as string}
            onSave={onSave}
            handlePreviousClick={handleBackClick}
            lbCreationInProgress={lbCreationInProgress}
            handleFormSubmit={handleFormSubmit}
            loadBalancer={newAp}
            mode={mode}
          />
        )}
      </div>
    </div>
  )
}

export default AzureAPConfig
