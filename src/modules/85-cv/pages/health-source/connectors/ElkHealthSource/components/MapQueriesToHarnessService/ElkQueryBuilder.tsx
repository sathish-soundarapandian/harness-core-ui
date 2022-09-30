/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Formik, FormikForm, Utils, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { useStrings } from 'framework/strings'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { updateSelectedMetricsMap, validateMappings, getElkMappedMetric } from './utils'
import MapQueriesToHarnessServiceLayout from './components/MapElkQueriesToService/components/MapQueriesToHarnessServiceLayout/MapQueriesToHarnessServiceLayout'
import type { MapElkQueryToService, ElkQueryBuilderProps } from './ElkQueryBuilder.types'
import css from './ElkQueryBuilder.module.scss'

export function ElkQueryBuilder(props: ElkQueryBuilderProps): JSX.Element {
  const { getString } = useStrings()
  const { onSubmit, data: sourceData, onPrevious, isTemplate, expressions } = props
  const connectorIdentifier =
    typeof sourceData.connectorRef === 'string' ? sourceData.connectorRef : sourceData.connectorRef?.value

  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED

  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<{
    selectedMetric: string
    mappedMetrics: Map<string, MapElkQueryToService>
  }>(getElkMappedMetric({ sourceData, isConnectorRuntimeOrExpression }))

  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState({
    createdMetrics: defaultTo(Array.from(mappedMetrics.keys()), [getString('cv.monitoringSources.elk.elkLogsQuery')]),
    selectedMetricIndex: Array.from(mappedMetrics.keys()).findIndex(metric => metric === selectedMetric)
  })

  const [rerenderKey, setRerenderKey] = useState('')

  return (
    <Formik<MapElkQueryToService | undefined>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onSubmit={async updatedSource => {
        if (updatedSource) {
          mappedMetrics.set(selectedMetric, updatedSource)
        }

        await onSubmit({ ...sourceData, mappedServicesAndEnvs: new Map(mappedMetrics) })
      }}
      formName="mapElk"
      initialValues={mappedMetrics.get(defaultTo(selectedMetric, ''))}
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
      {formikProps => {
        return (
          <FormikForm className={css.formFullheight}>
            <SetupSourceLayout
              leftPanelContent={
                <MultiItemsSideNav
                  defaultMetricName={`getString('cv.monitoringSources.Elk.ElkLogsQuery')`}
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
                          defaultTo({ ...formikProps.values }, { metricName: updatedMetric }) as MapElkQueryToService
                          //return defaultTo(serviceRef?.current?.getErrors(), {})
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
                        mappedMetrics: new Map<string, MapElkQueryToService>(oldState.mappedMetrics),
                        formikProps
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
        )
      }}
    </Formik>
  )
}
