/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useFormikContext } from 'formik'
import { Container, Accordion, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  getCustomMetricGroupOptions,
  getGroupedCustomMetrics
} from '@cv/pages/health-source/common/CustomMetricV2/CustomMetric.utils'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import HealthSourceServicesV2 from '@cv/pages/health-source/common/CustomMetricV2/components/HealthSourceServicesV2'
import GroupName from '@cv/components/GroupName/GroupName'
import type { CloudWatchFormType } from '../../../CloudWatch.types'
import { getSelectedGroupItem } from '../../../CloudWatch.utils'
import CloudWatchQuery from './components/CloudWatchQuery'
import css from '../../../CloudWatch.module.scss'

export default function CloudWatchForm(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues, setFieldValue } = useFormikContext<CloudWatchFormType>()

  const { selectedCustomMetricIndex, customMetrics } = formValues

  const groupedCreatedMetrics = useMemo(
    () => getGroupedCustomMetrics(customMetrics, getString),
    [customMetrics, getString]
  )

  const customMetricGroupOptions = useMemo(
    () => getCustomMetricGroupOptions(groupedCreatedMetrics),
    [groupedCreatedMetrics]
  )

  return (
    <Layout.Horizontal spacing="large" key={selectedCustomMetricIndex}>
      <Container width={400}>
        <Accordion activeId="metricName" allowMultiOpen>
          <Accordion.Panel
            id="metricName"
            summary={getString('cv.monitoringSources.mapMetricsToServices')}
            details={
              <>
                <NameId
                  nameLabel={getString('cv.monitoringSources.metricNameLabel')}
                  identifierProps={{
                    inputName: `customMetrics.${selectedCustomMetricIndex}.metricName`,
                    idName: `customMetrics.${selectedCustomMetricIndex}.identifier`,
                    isIdentifierEditable: true
                  }}
                />
                <GroupName
                  usePortal
                  title={getString('cv.healthSource.connectors.CloudWatch.groupModalTitle')}
                  groupNames={customMetricGroupOptions}
                  selectProps={{ popoverClassName: css.groupNamePopover }}
                  onChange={setFieldValue}
                  fieldName={`customMetrics.${selectedCustomMetricIndex}.groupName`}
                  item={getSelectedGroupItem(customMetrics, selectedCustomMetricIndex)}
                  allowAddGroup
                />
              </>
            }
          />
          <Accordion.Panel
            id="riskProfile"
            summary={getString('cv.monitoringSources.assign')}
            details={<HealthSourceServicesV2 />}
          />
        </Accordion>
      </Container>
      <Container className={css.expressionContainer}>
        <CloudWatchQuery />
      </Container>
    </Layout.Horizontal>
  )
}
