/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo as _defaultTo } from 'lodash-es'
import { HarnessDocTooltip, Heading, useToaster } from '@harness/uicore'
import { AccessPointFormStep, PROVIDER_TYPES } from '@ce/constants'
import { Utils } from '@ce/common/Utils'
import { AccessPoint, useCreateAccessPoint, useEditAccessPoint } from 'services/lw'
import type { AccessPointScreenMode } from '@ce/types'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import GCPDnsMapping, { GcpDnsFormVal } from './GCPDnsMapping'
import GCPAccessPointForm, { GcpApFormValue } from './GCPAccessPointForm'
import css from './GCPAccessPoint.module.scss'

interface GCPAccessPointConfigProps {
  loadBalancer: AccessPoint
  cloudAccountId: string | undefined
  onClose?: (clearSelection?: boolean) => void
  onSave: (savedLoadBalancer: AccessPoint) => void
  mode: AccessPointScreenMode
  step?: AccessPointFormStep
}

const GCPAccessPointConfig: React.FC<GCPAccessPointConfigProps> = ({
  loadBalancer,
  cloudAccountId,
  onClose,
  onSave,
  mode,
  step
}) => {
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { accountId } = useParams<AccountPathProps>()

  const [currentStep, setCurrentStep] = useState<AccessPointFormStep>(_defaultTo(step, AccessPointFormStep.FIRST))
  const [lbCreationInProgress, setLbCreationInProgress] = useState<boolean>(false)
  const [newAp, setNewAp] = useState<AccessPoint>(loadBalancer)

  const isEditMode = mode === 'edit'

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

  const handleDnsMappingSubmission = (_values: GcpDnsFormVal) => {
    const updatedAp = { ...newAp }
    updatedAp.host_name = _values.customDomain
    updatedAp.name = _values.name
    setNewAp(updatedAp)
    moveForward()
  }

  /* istanbul ignore next */
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
        onSave?.(result.response)
        onClose?.()
      }
    } catch (e) {
      setLbCreationInProgress(false)
      showError(e.data?.errors?.join('\n '))
    }
  }

  const getUpdatedApFromValues = (values: GcpApFormValue): AccessPoint => {
    return {
      ...newAp,
      region: values.region,
      vpc: values.vpc,
      metadata: {
        ...newAp.metadata,
        zone: values.zone,
        subnet_name: values.subnet_name,
        security_groups: values.securityGroups?.map(s => s.value) as string[],
        machine_type: values.machine_type,
        ...((values.cert_secret_id || values.key_secret_id) && {
          certificates: [
            {
              cert_secret_id: values.cert_secret_id,
              key_secret_id: values.key_secret_id
            }
          ]
        })
      }
    }
  }

  const handleFormSubmit = (val: AccessPoint) => {
    const lbToSave = {
      ...getUpdatedApFromValues(val),
      cloud_account_id: cloudAccountId
    }
    saveLb(lbToSave)
  }

  const handlePreviousClick = (values: GcpApFormValue) => {
    setNewAp(getUpdatedApFromValues(values))
    moveBackward()
  }

  const getHeading = () => {
    return Utils.getLoadBalancerModalHeader(mode, PROVIDER_TYPES.GCP, loadBalancer.name)
  }

  return (
    <div className={css.loadBalancerDnsConfigDialog}>
      <Heading level={2} className={css.configHeading} data-tooltip-id={'gcpConnectorHeader'}>
        {getHeading()}
        <HarnessDocTooltip useStandAlone={true} tooltipId={'gcpConnectorHeader'} />
      </Heading>
      <div>
        {currentStep === AccessPointFormStep.FIRST && (
          <GCPDnsMapping
            loadBalancer={newAp}
            handleSubmit={handleDnsMappingSubmission}
            mode={mode}
            handleCancel={() => onClose?.(true)}
          />
        )}
        {currentStep === AccessPointFormStep.SECOND && (
          <GCPAccessPointForm
            loadBalancer={newAp}
            cloudAccountId={cloudAccountId as string}
            handlePreviousClick={handlePreviousClick}
            isSaving={lbCreationInProgress}
            mode={mode}
            handleSubmit={handleFormSubmit}
          />
        )}
      </div>
    </div>
  )
}

export default GCPAccessPointConfig
