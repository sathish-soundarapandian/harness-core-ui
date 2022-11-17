/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Heading,
  Card,
  FormInput,
  SelectOption,
  Layout,
  Container,
  Text,
  ButtonVariation,
  useToaster
} from '@harness/uicore'
import type { RadioButtonProps } from '@harness/uicore/dist/components/RadioButton/RadioButton'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { defaultOption } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.constants'
import { SLIProps, SLOFormFields, SLITypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { getHealthSourceOptions } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import CVRadioLabelTextAndDescription from '@cv/components/CVRadioLabelTextAndDescription'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import HealthSourceDrawerHeader from '@cv/pages/health-source/HealthSourceDrawer/component/HealthSourceDrawerHeader/HealthSourceDrawerHeader'
import HealthSourceDrawerContent from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent'
import { HealthSource, useGetMonitoredService } from 'services/cv'
import { createHealthsourceList } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import type { UpdatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import PickMetric from './views/PickMetric'
import SLIContextualHelpText from './components/SLIContextualHelpText'
import { getHealthSourceToEdit } from './SLI.utils'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const SLI: React.FC<SLIProps> = ({ children, formikProps, ...rest }) => {
  const FLEX_START = 'flex-start'
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & { identifier: string }>()
  const { values } = formikProps
  const monitoredServiceRef = values?.monitoredServiceRef

  const {
    showDrawer: showHealthSourceDrawer,
    hideDrawer: hideHealthSourceDrawer,
    setDrawerHeaderProps
  } = useDrawer({
    createHeader: props => <HealthSourceDrawerHeader {...props} />,
    createDrawerContent: props => <HealthSourceDrawerContent {...props} />
  })

  const {
    data: monitoredServiceData,
    refetch: fetchMonitoredServiceData,
    loading: monitoredServicesLoading,
    error: monitoredServiceError
  } = useGetMonitoredService({
    identifier: monitoredServiceRef,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const isRunTimeInput = false
  const monitoredService = monitoredServiceData?.data?.monitoredService
  const { serviceRef, environmentRef } = monitoredService || {}
  const { healthSources = [], changeSources = [] } = monitoredService?.sources || {}
  const healthSourcesOptions = useMemo(() => getHealthSourceOptions(monitoredService), [monitoredService])
  const activeHealthSource: SelectOption = useMemo(
    () => healthSourcesOptions.find(healthSource => healthSource?.value === values?.healthSourceRef) ?? defaultOption,
    [healthSourcesOptions, values.healthSourceRef]
  )

  useEffect(() => {
    if (monitoredServiceError) {
      showError(getErrorMessage(monitoredServiceError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServiceError])

  const healthSourceDrawerHeaderProps = (
    isEdit = false
  ): {
    isEdit: boolean
    shouldRenderAtVerifyStep: boolean
    onClick: () => void
    breadCrumbRoute: { routeTitle: string }
  } => {
    return {
      isEdit,
      shouldRenderAtVerifyStep: true,
      onClick: () => hideHealthSourceDrawer(),
      breadCrumbRoute: { routeTitle: getString('cv.slos.backToSLI') }
    }
  }

  const getHealthSourceDrawerProps = (updatedHealthSource?: UpdatedHealthSource) => {
    const { name = '', identifier = '' } = monitoredService || {}
    return {
      isRunTimeInput,
      shouldRenderAtVerifyStep: true,
      serviceRef,
      environmentRef,
      monitoredServiceRef: { identifier, name },
      rowData: updatedHealthSource,
      tableData: updatedHealthSource
        ? createHealthsourceList(healthSources as HealthSource[], updatedHealthSource)
        : healthSources,
      changeSources,
      onSuccess: () => {
        fetchMonitoredServiceData()
        hideHealthSourceDrawer()
      }
    }
  }

  const onAddNewHealthSource = useCallback(() => {
    const drawerProps = getHealthSourceDrawerProps()
    showHealthSourceDrawer(drawerProps)
    setDrawerHeaderProps?.(healthSourceDrawerHeaderProps())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredService, serviceRef, environmentRef, healthSources, changeSources])

  const onAddNewMetric = useCallback(() => {
    const healthSourceToEdit = getHealthSourceToEdit(healthSources, formikProps)
    const drawerProps = getHealthSourceDrawerProps(healthSourceToEdit)
    showHealthSourceDrawer(drawerProps)
    setDrawerHeaderProps?.(healthSourceDrawerHeaderProps(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredService, serviceRef, environmentRef, healthSources, changeSources, formikProps])

  const radioItems: Pick<RadioButtonProps, 'label' | 'value'>[] = useMemo(() => {
    const { AVAILABILITY, LATENCY } = SLITypes
    return [
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.type.availability"
            description="cv.slos.contextualHelp.sli.availabilityDescription"
          />
        ),
        value: AVAILABILITY
      },
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.type.latency"
            description="cv.slos.contextualHelp.sli.latencyDescription"
          />
        ),
        value: LATENCY
      }
    ]
  }, [])

  return (
    <>
      <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }}>
        {getString('cv.slos.configureSLIQueries')}
      </Heading>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_400} margin={{ bottom: 'small' }}>
        {getString('cv.forConfigurationYouWillNeedAtLeastOneMonitoredServiceWithAHealthSourceAndAMetric')}
      </Text>
      <Card className={css.cardSli}>
        <Layout.Horizontal flex={{ justifyContent: FLEX_START, alignItems: FLEX_START }}>
          <Container width="50%" border={{ right: true }}>
            <Layout.Vertical width="80%">
              <Layout.Horizontal flex={{ justifyContent: FLEX_START }}>
                <FormInput.Select
                  name={SLOFormFields.HEALTH_SOURCE_REF}
                  label={getString('cv.slos.healthSourceForSLI')}
                  placeholder={
                    monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectHealthsource')
                  }
                  items={healthSourcesOptions}
                  className={css.selectPrimary}
                  disabled={!values.monitoredServiceRef}
                  value={activeHealthSource}
                  onChange={healthSource => {
                    formikProps.setFieldValue(SLOFormFields.HEALTH_SOURCE_REF, healthSource.value)
                    formikProps.setFieldValue(SLOFormFields.VALID_REQUEST_METRIC, undefined)
                    formikProps.setFieldValue(SLOFormFields.GOOD_REQUEST_METRIC, undefined)
                  }}
                />
                <RbacButton
                  icon="plus"
                  text={getString('cv.healthSource.newHealthSource')}
                  variation={ButtonVariation.LINK}
                  disabled={!values.monitoredServiceRef}
                  onClick={onAddNewHealthSource}
                  permission={{
                    permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                    resource: {
                      resourceType: ResourceType.MONITOREDSERVICE,
                      resourceIdentifier: projectIdentifier
                    }
                  }}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Vertical width="80%">
              <Heading
                level={4}
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                margin={{ top: 'xlarge', bottom: 'small' }}
              >
                {getString('cv.slos.sliTypeChooseMetric')}
              </Heading>
              <FormInput.RadioGroup name={SLOFormFields.SLI_TYPE} className={css.radioGroup} items={radioItems} />
            </Layout.Vertical>
          </Container>
          <Container className={css.contextualHelp} width="50%" padding={{ left: 'large', right: 'large' }}>
            <SLIContextualHelpText />
          </Container>
        </Layout.Horizontal>
      </Card>

      <PickMetric
        formikProps={formikProps}
        {...rest}
        onAddNewMetric={onAddNewMetric}
        monitoredServiceData={monitoredServiceData}
      />
      {children}
    </>
  )
}

export default SLI
