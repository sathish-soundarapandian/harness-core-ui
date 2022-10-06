/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { AllowedTypes, Container, FormInput, useToaster } from '@harness/uicore'
import React, { useEffect, useMemo } from 'react'
import type { InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getMonitoredServiceOptions } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import { useGetAllMonitoredServicesWithTimeSeriesHealthSources } from 'services/cv'
import type { VerifyStepMonitoredService } from '@cv/components/PipelineSteps/ContinousVerification/types'
import { monitoredServiceRefPath } from '@cv/components/PipelineSteps/ContinousVerification/constants'
import { getMultiTypeInputProps } from '../../../ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/VerificationJobFields/VerificationJobFields.utils'
import { MONITORED_SERVICE_TYPE } from '../../../ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/SelectMonitoredServiceType.constants'
import css from '../../ContinousVerificationInputSetStep.module.scss'

interface ConfiguredRunTimeMonitoredServiceProps {
  prefix: string
  monitoredService?: VerifyStepMonitoredService
  expressions: string[]
  allowableTypes: AllowedTypes
}

export default function ConfiguredRunTimeMonitoredService(props: ConfiguredRunTimeMonitoredServiceProps): JSX.Element {
  const { prefix, expressions, allowableTypes, monitoredService } = props
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()

  const queryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  }, [accountId, orgIdentifier, projectIdentifier])

  const {
    data: monitoredServicesData,
    refetch: fecthMonitoredServices,
    loading: monitoredServicesLoading,
    error: monitoredServicesDataError
  } = useGetAllMonitoredServicesWithTimeSeriesHealthSources({
    queryParams,
    lazy: true
  })

  useEffect(() => {
    if (monitoredService?.spec?.monitoredServiceRef && monitoredService?.type === MONITORED_SERVICE_TYPE.CONFIGURED) {
      fecthMonitoredServices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredService?.spec?.monitoredServiceRef, monitoredService?.type])

  useEffect(() => {
    const error = monitoredServicesDataError
    if (error) {
      showError(getErrorMessage(error))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServicesDataError])

  const monitoredServicesOptions = useMemo(
    () => getMonitoredServiceOptions(monitoredServicesData?.data),
    [monitoredServicesData]
  )

  return (
    <Card>
      <Container className={css.itemRuntimeSetting}>
        <FormInput.MultiTypeInput
          name={`${prefix}${monitoredServiceRefPath}`}
          label={'Monitored Service'}
          useValue
          placeholder={monitoredServicesLoading ? getString('loading') : 'Select Monitored Service'}
          selectItems={monitoredServicesOptions}
          multiTypeInputProps={getMultiTypeInputProps(expressions, allowableTypes)}
        />
      </Container>
    </Card>
  )
}
