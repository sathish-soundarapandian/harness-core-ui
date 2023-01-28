/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { LegacyRef, useCallback, useEffect, useMemo, useRef } from 'react'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  FormInput,
  SelectOption,
  Layout,
  Container,
  Text,
  ButtonVariation,
  useToaster,
  PillToggle
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import SLOTargetChartWrapper from '@cv/pages/slos/components/SLOTargetChart/SLOTargetChart'
import { SLIProps, SLITypes } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import HealthSourceDrawerHeader from '@cv/pages/health-source/HealthSourceDrawer/component/HealthSourceDrawerHeader/HealthSourceDrawerHeader'
import HealthSourceDrawerContent from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent'
import { HealthSource, useGetMonitoredService } from 'services/cv'
import { createHealthsourceList } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import type { UpdatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import PickMetric from './views/PickMetric'
import { getHealthSourceToEdit } from './SLI.utils'
import {
  convertSLOFormDataToServiceLevelIndicatorDTO,
  getHealthSourceOptions
} from '../../components/CVCreateSLOV2/CVCreateSLOV2.utils'
import { defaultOption } from './SLI.constants'
import { SLIMetricTypes, SLOV2FormFields } from '../../components/CVCreateSLOV2/CVCreateSLOV2.types'
import sliCss from './SLI.module.scss'

const SLI: React.FC<SLIProps> = ({ children, formikProps, ...rest }) => {
  const FLEX_START = 'flex-start'
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { AVAILABILITY, LATENCY } = SLITypes
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & { identifier: string }>()
  const { values, setFieldValue } = formikProps
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
    lazy: true,
    identifier: monitoredServiceRef ?? '',
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  useEffect(() => {
    if (monitoredServiceRef) {
      fetchMonitoredServiceData()
    }
  }, [monitoredServiceRef])

  const isRunTimeInput = false
  const monitoredService = monitoredServiceData?.data?.monitoredService
  const { serviceRef, environmentRef } = monitoredService || {}
  const { healthSources = [], changeSources = [] } = monitoredService?.sources || {}
  const healthSourcesOptions = useMemo(() => getHealthSourceOptions(monitoredService), [monitoredService])
  const activeHealthSource: SelectOption = useMemo(
    () => healthSourcesOptions.find(healthSource => healthSource?.value === values?.healthSourceRef) ?? defaultOption,
    [healthSourcesOptions, values.healthSourceRef]
  )
  const isRatioBasedMetric = values.SLIMetricType === SLIMetricTypes.RATIO

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

  const {
    healthSourceRef,
    SLIMetricType,
    validRequestMetric,
    objectiveValue,
    objectiveComparator,
    SLIMissingDataType,
    serviceLevelIndicatorType
  } = values

  const showChart =
    healthSourceRef &&
    SLIMetricType &&
    validRequestMetric &&
    objectiveValue &&
    objectiveComparator &&
    SLIMissingDataType &&
    serviceLevelIndicatorType

  const sliContainerBorder = values.healthSourceRef ? { border: { right: true } } : undefined
  const chartContainerBorder = !values.healthSourceRef ? { border: { left: true } } : undefined
  const chartPositionProp = !showChart ? { flex: { alignItems: 'center' as any } } : undefined
  const sliFormContainerRef: LegacyRef<HTMLDivElement> = useRef(null)
  const sliFormContainerHeight = parseInt(
    defaultTo(sliFormContainerRef.current?.getClientRects()?.[0]?.height, 0).toFixed(0)
  )

  return (
    <>
      <Layout.Horizontal flex={{ justifyContent: FLEX_START, alignItems: FLEX_START }}>
        <Container width="50%" padding={{ right: 'xlarge' }} ref={sliFormContainerRef} {...sliContainerBorder}>
          {/* Select Healthsource start */}
          <Layout.Vertical spacing="xsmall">
            <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }}>
              {getString('cv.slos.slis.HealthSource')}
            </Text>
            <Text font={{ size: 'normal', weight: 'light' }}>{getString('cv.slos.slis.HealthSourceSubTitle')}</Text>
            <Layout.Horizontal spacing="small">
              <FormInput.Select
                className={sliCss.healthSourceDropdown}
                name={SLOV2FormFields.HEALTH_SOURCE_REF}
                placeholder={monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectHealthsource')}
                items={healthSourcesOptions}
                disabled={!values.monitoredServiceRef}
                value={activeHealthSource}
                onChange={healthSource => {
                  formikProps.setFieldValue(SLOV2FormFields.HEALTH_SOURCE_REF, healthSource.value)
                  formikProps.setFieldValue(SLOV2FormFields.VALID_REQUEST_METRIC, undefined)
                  formikProps.setFieldValue(SLOV2FormFields.GOOD_REQUEST_METRIC, undefined)
                }}
              />
              <RbacButton
                icon="plus"
                text={getString('cv.healthSource.newHealthSource')}
                variation={ButtonVariation.SECONDARY}
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
          {/* Select Healthsource end */}
          {values.healthSourceRef && (
            <Layout.Vertical spacing="small">
              <Text
                color={Color.PRIMARY_10}
                font={{ size: 'normal', weight: 'semi-bold' }}
                margin={{ bottom: 'small', top: 'xxlarge' }}
              >
                {getString('cv.slos.sliType')}
              </Text>
              <Container>
                <PillToggle
                  onChange={item => setFieldValue('serviceLevelIndicatorType', item)}
                  selectedView={values.serviceLevelIndicatorType}
                  options={[
                    {
                      label: getString('cv.slos.slis.type.availability'),
                      value: AVAILABILITY
                    },
                    {
                      label: getString('cv.slos.slis.type.latency'),
                      value: LATENCY
                    }
                  ]}
                />
              </Container>
              <Text font={{ size: 'normal', weight: 'light' }} margin={{ top: 'medium', bottom: 'medium' }}>
                {getString('cv.slos.sliTypeSubtitle')}
              </Text>
              <PickMetric
                formikProps={formikProps}
                {...rest}
                onAddNewMetric={onAddNewMetric}
                monitoredServiceData={monitoredServiceData}
              />
            </Layout.Vertical>
          )}
        </Container>
        <Container
          height={sliFormContainerHeight}
          width="50%"
          padding={{ left: 'xxlarge' }}
          {...chartPositionProp}
          {...chartContainerBorder}
        >
          <SLOTargetChartWrapper
            monitoredServiceIdentifier={monitoredServiceRef}
            serviceLevelIndicator={convertSLOFormDataToServiceLevelIndicatorDTO(formikProps.values)}
            {...rest}
            topLabel={
              <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500} padding={{ bottom: 'medium' }}>
                {getString('cv.SLIRequestRatio')}
              </Text>
            }
            customChartOptions={{
              chart: { height: isRatioBasedMetric ? 420 : 350 },
              yAxis: { min: 0, max: 100, tickInterval: 25 }
            }}
          />
        </Container>
      </Layout.Horizontal>
    </>
  )
}

export default SLI
