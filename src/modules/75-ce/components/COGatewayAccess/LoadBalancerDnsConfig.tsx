/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Heading } from '@wings-software/uicore'
import { AccessPoint, useCreateAccessPoint, useEditAccessPoint, useGetAccessPoint } from 'services/lw'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import type { AccessPointScreenMode } from '@ce/types'
import { Utils } from '@ce/common/Utils'
import { PROVIDER_TYPES } from '@ce/constants'
import LBFormStepFirst, { SubmitFormVal } from './LBFormStepFirst'
import LBFormStepSecond, { FormValue } from './LBFormStepSecond'
import css from './COGatewayAccess.module.scss'

interface LoadBalancerDnsConfigProps {
  loadBalancer: AccessPoint
  cloudAccountId: string | undefined
  onClose?: (clearSelection?: boolean) => void
  onSave?: (savedLoadBalancer: AccessPoint) => void
  mode: AccessPointScreenMode
}

enum FormStep {
  FIRST = 1,
  SECOND = 2
}

const LoadBalancerDnsConfig: React.FC<LoadBalancerDnsConfigProps> = props => {
  const { loadBalancer, cloudAccountId, onClose, onSave, mode } = props
  const isEditMode = mode === 'edit'
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.FIRST)
  const [newLoadBalancer, setNewLoadBalancer] = useState<AccessPoint>(loadBalancer)
  const [lbCreationInProgress, setLbCreationInProgress] = useState<boolean>(false)
  const [loadBalancerId, setLoadBalancerId] = useState<string>()
  const [currCloudAccountId, setCurrCloudAccountId] = useState<string | undefined>(cloudAccountId)
  const [hostedZoneName, setHostedZoneName] = useState<string>()

  const { accountId } = useParams<{
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

  const {
    data: accessPointData,
    refetch,
    loading: accessPointStatusLoading
  } = useGetAccessPoint({
    account_id: accountId,
    lb_id: loadBalancerId as string, //eslint-disable-line
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const moveForward = () => {
    setCurrentStep(currentStep + 1)
  }

  const moveBackward = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleFirstScreenSubmit = (values: SubmitFormVal) => {
    if (isEditMode) {
      moveForward()
    } else {
      const updatedLb = { ...newLoadBalancer }
      if (!updatedLb.cloud_account_id) {
        updatedLb.cloud_account_id = currCloudAccountId // eslint-disable-line
      }
      if (values.lbName) {
        updatedLb.name = values.lbName
        updatedLb.host_name = values.customDomainPrefix // eslint-disable-line
      }
      updatedLb.metadata = {
        ...updatedLb.metadata,
        dns: {
          ...(values.dnsProvider === 'route53'
            ? { route53: { hosted_zone_id: values.hostedZoneId as string } } // eslint-disable-line
            : { others: values.customDomainPrefix })
        }
      }
      setHostedZoneName(values.hostedZoneName)
      setNewLoadBalancer(updatedLb)
      // if (!createMode) {
      //   saveLb(updatedLb)
      // } else {
      // }
      moveForward()
    }
  }

  useEffect(() => {
    if (lbCreationInProgress && loadBalancerId) {
      if (!accessPointStatusLoading) {
        if (accessPointData?.response?.status == 'errored') {
          setLbCreationInProgress(false)
          showError(
            getString('ce.co.accessPoint.error') + '\n' + accessPointData.response.metadata?.error,
            undefined,
            'ce.ap.creation.error'
          )
        } else if (accessPointData?.response?.status == 'created') {
          setLbCreationInProgress(false)
          // props.setAccessPoint(accessPointData?.response as AccessPoint)
          showSuccess(
            isEditMode
              ? getString('ce.co.accessPoint.successfulEdition', { name: accessPointData.response.name })
              : getString('ce.co.accessPoint.success')
          )
          onSave?.(accessPointData.response)
          onClose?.()
        } else {
          const timerId = window.setTimeout(() => {
            refetch()
          }, 1000)
          return () => {
            window.clearTimeout(timerId)
          }
        }
      }
    }
  }, [accessPointData, refetch, accessPointStatusLoading, loadBalancerId])

  const saveLb = async (lbToSave?: AccessPoint): Promise<void> => {
    setLbCreationInProgress(true)
    try {
      const result =
        isEditMode || !_isEmpty(newLoadBalancer.id)
          ? await editLoadBalancer(lbToSave || newLoadBalancer)
          : await createLoadBalancer(lbToSave || newLoadBalancer) // eslint-disable-line
      if (result.response) {
        setNewLoadBalancer(result.response)
        setLoadBalancerId(result.response.id as string)
      }
    } catch (e) {
      showError(Utils.getASErrorMessage(e) || e.data?.message || e.message, undefined, 'ce.lb.create.error')
      setLbCreationInProgress(false)
    }
  }

  const handleSecondFormSubmission = (_val: FormValue) => {
    // console.log(_val)
    const updatedLb = {
      ...newLoadBalancer,
      ...(_val.accessPointRegion && { region: _val.accessPointRegion }),
      ...(_val.vpc && { vpc: _val.vpc }),
      metadata: {
        ...newLoadBalancer.metadata,
        ...(_val.securityGroups && { security_groups: _val.securityGroups.map(_i => _i.value) as string[] }), // eslint-disable-line
        ...(_val.certificate && { certificate_id: _val.certificate }) // eslint-disable-line
      }
    }
    setNewLoadBalancer(updatedLb)
    // console.log(newLoadBalancer)
    saveLb()
  }

  const getHeading = () => {
    return Utils.getLoadBalancerModalHeader(props.mode, PROVIDER_TYPES.AWS, loadBalancer.name as string)
  }

  return (
    <div className={css.loadBalancerDnsConfigDialog}>
      <Heading level={2} className={css.configHeading}>
        {getHeading()}
      </Heading>
      <div>
        {currentStep === FormStep.FIRST && (
          <LBFormStepFirst
            cloudAccountId={currCloudAccountId}
            handleCancel={() => onClose?.(true)}
            mode={mode}
            handleSubmit={handleFirstScreenSubmit}
            loadBalancer={newLoadBalancer}
            handleCloudConnectorChange={setCurrCloudAccountId}
            isSaving={lbCreationInProgress}
            hostedZone={hostedZoneName}
          />
        )}
        {currentStep === FormStep.SECOND && (
          <LBFormStepSecond
            cloudAccountId={currCloudAccountId as string}
            loadBalancer={newLoadBalancer}
            setNewLoadBalancer={setNewLoadBalancer}
            handleSubmit={handleSecondFormSubmission}
            handlePreviousClick={moveBackward}
            isSaving={lbCreationInProgress}
            mode={mode}
          />
        )}
      </div>
    </div>
  )
}

export default LoadBalancerDnsConfig
