/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Formik,
  FormikForm,
  getMultiTypeFromValue,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  Utils
} from '@wings-software/uicore'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { useStrings } from 'framework/strings'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { updateSelectedMetricsMap, validateMappings } from './utils'
import { initialFormData } from './constants'
import MapQueriesToHarnessServiceLayout from './components/MapGCPLogsQueriesToService/components/MapQueriesToHarnessServiceLayout/MapQueriesToHarnessServiceLayout'
import type { MapGCOLogsQueryToService, MapQueriesToHarnessServiceProps } from './types'
import css from './MapQueriesToHarnessService.module.scss'

export function MapQueriesToHarnessService(props: MapQueriesToHarnessServiceProps): JSX.Element {
  const { getString } = useStrings()
  const { onSubmit, data: sourceData, onPrevious, isTemplate, expressions } = props
  const connectorIdentifier =
    typeof sourceData?.connectorRef === 'string' ? sourceData?.connectorRef : sourceData?.connectorRef?.value
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED

  const initialMetricData = isConnectorRuntimeOrExpression
    ? {
        ...initialFormData,
        serviceInstance: RUNTIME_INPUT_VALUE,
        messageIdentifier: RUNTIME_INPUT_VALUE
      }
    : initialFormData

  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<{
    selectedMetric: string
    mappedMetrics: Map<string, MapGCOLogsQueryToService>
  }>({
    selectedMetric:
      (Array.from(sourceData?.mappedServicesAndEnvs?.keys() || [])?.[0] as string) ||
      getString('cv.monitoringSources.gcoLogs.gcoLogsQuery'),
    mappedMetrics:
      sourceData?.mappedServicesAndEnvs?.size > 0
        ? sourceData?.mappedServicesAndEnvs
        : new Map<string, MapGCOLogsQueryToService>([
            [getString('cv.monitoringSources.gcoLogs.gcoLogsQuery'), initialMetricData]
          ])
  })

  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState({
    createdMetrics: Array.from(mappedMetrics.keys()) || [getString('cv.monitoringSources.gcoLogs.gcoLogsQuery')],
    selectedMetricIndex: Array.from(mappedMetrics.keys()).findIndex(metric => metric === selectedMetric)
  })

  const [rerenderKey, setRerenderKey] = useState('')

  return (
    <Formik<MapGCOLogsQueryToService | undefined>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onSubmit={async updatedSource => {
        if (updatedSource) {
          mappedMetrics.set(selectedMetric, updatedSource)
        }
        await onSubmit({ ...sourceData, mappedServicesAndEnvs: new Map(mappedMetrics) })
      }}
      formName="mapGCOLogs"
      initialValues={mappedMetrics.get(selectedMetric || '')}
      key={rerenderKey}
      isInitialValid={(args: any) => {
        return (
          Object.keys(validateMappings(getString, createdMetrics, selectedMetricIndex, args.initialValues)).length === 0
        )
      }}
      enableReinitialize={true}
      validate={values => {
        return validateMappings(getString, createdMetrics, selectedMetricIndex, values)
      }}
    >
      {formikProps => (
        <FormikForm className={css.formFullheight}>
          <SetupSourceLayout
            leftPanelContent={
              <MultiItemsSideNav
                defaultMetricName={getString('cv.monitoringSources.gcoLogs.gcoLogsQuery')}
                tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
                addFieldLabel={getString('cv.monitoringSources.addQuery')}
                createdMetrics={createdMetrics}
                defaultSelectedMetric={selectedMetric}
                renamedMetric={formikProps.values?.metricName}
                onRemoveMetric={(removedMetric, updatedMetric, updatedList, smIndex) => {
                  setMappedMetrics(oldState => {
                    const { selectedMetric: oldMetric, mappedMetrics: oldMappedMetric } = oldState
                    const updatedMap = new Map(oldMappedMetric)

                    if (updatedMap.has(removedMetric)) {
                      updatedMap.delete(removedMetric)
                    } else {
                      // handle case where user updates the metric name for current selected metric
                      updatedMap.delete(oldMetric)
                    }

                    // update map with current values
                    if (formikProps.values?.metricName !== removedMetric) {
                      updatedMap.set(
                        updatedMetric,
                        { ...(formikProps.values as MapGCOLogsQueryToService) } || { metricName: updatedMetric }
                      )
                    } else {
                      setRerenderKey(Utils.randomId())
                    }

                    setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
                    return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
                  })
                }}
                onSelectMetric={(newMetric, updatedList, smIndex) => {
                  setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
                  setMappedMetrics((oldState: any) => {
                    return updateSelectedMetricsMap({
                      updatedMetric: newMetric,
                      oldMetric: oldState.selectedMetric,
                      mappedMetrics: new Map<string, MapGCOLogsQueryToService>(oldState.mappedMetrics),
                      formikProps,
                      initialFormData: initialMetricData
                    })
                  })
                  setRerenderKey(Utils.randomId())
                }}
                isValidInput={formikProps.isValid}
              />
            }
            content={
              <>
                <SetupSourceCardHeader
                  mainHeading={getString('cv.monitoringSources.gcoLogs.querySpecificationsAndMappings')}
                  subHeading={getString('cv.monitoringSources.gcoLogs.customizeQuery')}
                />
                <MapQueriesToHarnessServiceLayout
                  onChange={formikProps.setFieldValue}
                  formikProps={formikProps}
                  connectorIdentifier={connectorIdentifier}
                  isTemplate={isTemplate}
                  expressions={expressions}
                  isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
                />
              </>
            }
          />
          <DrawerFooter isSubmit onPrevious={onPrevious} onNext={formikProps.submitForm} />
        </FormikForm>
      )}
    </Formik>
  )
}
