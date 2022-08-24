/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useMemo } from 'react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import useGroupedSideNaveHook from '@cv/hooks/GroupedSideNaveHook/useGroupedSideNaveHook'
import { useStrings } from 'framework/strings'
import {
  transformCustomHealthSourceToSetupSource,
  validateMappings,
  onSubmitCustomHealthSource,
  getInitCustomMetricData
} from './CustomHealthSource.utils'
import type { CustomHealthSourceSetupSource, MapCustomHealthToService } from './CustomHealthSource.types'

import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import CustomMetric from '../../common/CustomMetric/CustomMetric'

import type { CustomMappedMetric } from '../../common/CustomMetric/CustomMetric.types'
import CustomHealthSourceForm from './CustomHealthSourceForm'
import { defaultMetricName } from './CustomHealthSource.constants'
import css from './CustomHealthSource.module.scss'

export interface CustomHealthSourceProps {
  data: any
  onSubmit: (formdata: CustomHealthSourceSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export function CustomHealthSource(props: CustomHealthSourceProps): JSX.Element {
  const { getString } = useStrings()
  const { onPrevious } = useContext(SetupSourceTabsContext)

  const { data: sourceData, onSubmit } = props

  const transformedSourceData = useMemo(() => transformCustomHealthSourceToSetupSource(sourceData), [sourceData])

  const {
    createdMetrics,
    mappedMetrics,
    selectedMetric,
    groupedCreatedMetrics,
    groupedCreatedMetricsList,
    setMappedMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics
  } = useGroupedSideNaveHook({
    defaultCustomMetricName: defaultMetricName,
    initCustomMetricData: getInitCustomMetricData(''),
    mappedServicesAndEnvs: transformedSourceData.mappedServicesAndEnvs as Map<string, CustomMappedMetric>
  })

  return (
    <Formik<MapCustomHealthToService>
      formName="mapCustomhealth"
      initialValues={{...mappedMetrics.get(selectedMetric || '') as MapCustomHealthToService, sli:true, healthScore: true, continuousVerification: true, higherBaselineDeviation: true}}
      isInitialValid={(args: any) =>
        Object.keys(
          validateMappings(
            getString,
            groupedCreatedMetricsList,
            groupedCreatedMetricsList.indexOf(selectedMetric),
            args.initialValues
          )
        ).length === 0
      }
      onSubmit={noop}
      enableReinitialize={true}
      validate={values => {
        return validateMappings(
          getString,
          groupedCreatedMetricsList,
          groupedCreatedMetricsList.indexOf(selectedMetric),
          values
        )
      }}
    >
      {formikProps => {
        return (
          <FormikForm className={css.formFullheight}>
            <CustomMetric
              isValidInput={formikProps.isValid}
              setMappedMetrics={setMappedMetrics}
              selectedMetric={selectedMetric}
              formikValues={formikProps.values as any}
              mappedMetrics={mappedMetrics}
              createdMetrics={createdMetrics}
              setCreatedMetrics={setCreatedMetrics}
              defaultMetricName={defaultMetricName}
              tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
              addFieldLabel={getString('cv.monitoringSources.addMetric')}
              initCustomForm={getInitCustomMetricData(formikProps.values.baseURL) as any}
              groupedCreatedMetrics={groupedCreatedMetrics}
              setGroupedCreatedMetrics={setGroupedCreatedMetrics}
            >
              <CustomHealthSourceForm
                formValue={formikProps.values}
                onFieldChange={formikProps.setFieldValue}
                onValueChange={formikProps.setValues}
                mappedMetrics={mappedMetrics}
                selectedMetric={selectedMetric}
                connectorIdentifier={sourceData?.connectorRef || ''}
                formikSetField={formikProps.setFieldValue}
              />
            </CustomMetric>
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={onSubmitCustomHealthSource({
                formikProps,
                createdMetrics: groupedCreatedMetricsList,
                selectedMetricIndex: groupedCreatedMetricsList.indexOf(selectedMetric),
                mappedMetrics,
                selectedMetric,
                onSubmit,
                sourceData,
                transformedSourceData,
                getString
              })}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
