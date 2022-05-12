/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import type { FormikProps } from 'formik'
import { Button, ButtonVariation, Layout, useToaster, Utils } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import {
  useGetHarnessServices,
  useGetHarnessEnvironments,
  HarnessServiceAsFormField,
  HarnessEnvironmentAsFormField
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import {
  updatedMonitoredServiceNameForEnv,
  updateMonitoredServiceNameForService
} from '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.utils'
import type { EnvironmentMultiSelectOrCreateProps } from '@cv/components/HarnessServiceAndEnvironment/components/EnvironmentMultiSelectAndEnv/EnvironmentMultiSelectAndEnv'
import type { EnvironmentSelectOrCreateProps } from '@cv/components/HarnessServiceAndEnvironment/components/EnvironmentSelectOrCreate/EnvironmentSelectOrCreate'
import { ChangeSourceCategoryName } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import { useStrings } from 'framework/strings'
import { SLOFormFields } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { useCreateDefaultMonitoredService } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { ServiceAndEnv } from '../../SLOName.types'
import css from './CreateMonitoredServiceFromSLO.module.scss'

interface CreateMonitoredServiceFromSLOProps {
  monitoredServiceFormikProps: FormikProps<ServiceAndEnv>
  setFieldForSLOForm: (field: string, value: unknown) => void
  fetchingMonitoredServices: () => void
  hideModal: () => void
}

export default function CreateMonitoredServiceFromSLO(props: CreateMonitoredServiceFromSLOProps): JSX.Element {
  const { monitoredServiceFormikProps, fetchingMonitoredServices, hideModal, setFieldForSLOForm } = props
  const { serviceRef, environmentRef } = monitoredServiceFormikProps?.values || {}
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { serviceOptions, setServiceOptions } = useGetHarnessServices()
  const { environmentOptions, setEnvironmentOptions } = useGetHarnessEnvironments()
  const { showSuccess, showError } = useToaster()

  const createServiceQueryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: environmentRef,
      serviceIdentifier: serviceRef
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentRef, serviceRef])

  const { mutate: createDefaultMonitoredService, loading: createMonitoredServiceLoading } =
    useCreateDefaultMonitoredService({
      queryParams: createServiceQueryParams
    })

  const onSelect = useCallback(
    environment =>
      updatedMonitoredServiceNameForEnv(
        monitoredServiceFormikProps,
        environment,
        monitoredServiceFormikProps.values?.type
      ),
    [monitoredServiceFormikProps]
  )

  const handleCreateMonitoredService = async (): Promise<void> => {
    try {
      // creating the new monitored service
      const createdMonitoredService = await createDefaultMonitoredService()

      // selecting the current monitored service
      setFieldForSLOForm(
        SLOFormFields.MONITORED_SERVICE_REF,
        createdMonitoredService?.resource?.monitoredService?.identifier
      )

      // listing all the monitored services
      fetchingMonitoredServices()

      showSuccess(getString('cv.monitoredServices.monitoredServiceCreated'))
      hideModal()
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keys = useMemo(() => [Utils.randomId(), Utils.randomId()], [serviceRef, environmentRef])

  return (
    <>
      <HarnessServiceAsFormField
        key={keys[0]}
        customRenderProps={{
          name: 'serviceRef',
          label: getString('cv.healthSource.serviceLabel')
        }}
        serviceProps={{
          className: css.dropdown,
          item: serviceOptions.find(item => item?.value === serviceRef),
          options: serviceOptions,
          onSelect: selectedService =>
            updateMonitoredServiceNameForService(monitoredServiceFormikProps, selectedService),
          onNewCreated: newOption => {
            if (newOption?.identifier && newOption.name) {
              const newServiceOption = { label: newOption.name, value: newOption.identifier }
              setServiceOptions([newServiceOption, ...serviceOptions])
              updateMonitoredServiceNameForService(monitoredServiceFormikProps, newServiceOption)
            }
          }
        }}
      />
      <HarnessEnvironmentAsFormField
        key={keys[1]}
        customRenderProps={{
          name: 'environmentRef',
          label: getString('cv.healthSource.environmentLabel')
        }}
        isMultiSelectField={monitoredServiceFormikProps.values?.type === ChangeSourceCategoryName.INFRASTRUCTURE}
        environmentProps={
          {
            className: css.dropdown,
            item:
              monitoredServiceFormikProps.values?.type === ChangeSourceCategoryName.INFRASTRUCTURE
                ? environmentOptions.filter(it => environmentRef?.includes(it.value as string))
                : environmentOptions.find(item => item?.value === environmentRef),
            onSelect,
            options: environmentOptions,
            onNewCreated: newOption => {
              if (newOption?.identifier && newOption.name) {
                const newEnvOption = { label: newOption.name, value: newOption.identifier }
                setEnvironmentOptions([newEnvOption, ...environmentOptions])
                updatedMonitoredServiceNameForEnv(
                  monitoredServiceFormikProps,
                  newEnvOption,
                  monitoredServiceFormikProps.values?.type
                )
              }
            }
          } as EnvironmentMultiSelectOrCreateProps | EnvironmentSelectOrCreateProps
        }
      />
      <Layout.Horizontal spacing="small">
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('save')}
          disabled={createMonitoredServiceLoading}
          onClick={handleCreateMonitoredService}
        />
        <Button text={getString('cancel')} onClick={hideModal} variation={ButtonVariation.TERTIARY} />
      </Layout.Horizontal>
    </>
  )
}
