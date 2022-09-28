/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { FieldArray, FormikProps } from 'formik'
import { Icon, Text, Button } from '@wings-software/uicore'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { CEView } from 'services/ce/'
import { QlceViewFieldIdentifierData, useFetchViewFieldsQuery, QlceViewFilterWrapperInput } from 'services/ce/services'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { perspectiveDefaultTimeRangeMapper } from '@ce/utils/perspectiveUtils'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import PerspectiveBuilderFilters from '../PerspectiveBuilderFilters/PerspectiveBuilderFilters'
import type { PillData } from '../PerspectiveBuilderFilters/PerspectiveBuilderFilter'
import css from './PerspectiveFilters.module.scss'

interface PerspectiveFiltersProps {
  formikProps: FormikProps<CEView>
}

const PerspectiveFiltersNew: React.FC<PerspectiveFiltersProps> = ({ formikProps }) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  const [result] = useFetchViewFieldsQuery({
    variables: {
      filters: [{ viewMetadataFilter: { viewId: perspectiveId, isPreview: true } } as QlceViewFilterWrapperInput]
    }
  })

  const { data } = result

  const dateRange =
    (formikProps.values.viewTimeRange?.viewTimeRangeType &&
      perspectiveDefaultTimeRangeMapper[formikProps.values.viewTimeRange?.viewTimeRangeType]) ||
    DATE_RANGE_SHORTCUTS.LAST_7_DAYS

  return (
    <section className={css.filtersContainer}>
      <Text
        color="grey900"
        margin={{
          bottom: 'small'
        }}
        font={{
          size: 'small'
        }}
      >
        {getString('ce.perspectives.createPerspective.filters.rulesTitle')}
      </Text>
      <Text
        margin={{
          bottom: 'xsmall'
        }}
        font={{
          size: 'small'
        }}
        color="grey500"
      >
        {getString('ce.perspectives.createPerspective.filters.rulesText1')}
      </Text>
      <Text
        margin={{
          bottom: 'xsmall'
        }}
        font={{
          size: 'small'
        }}
        color="grey500"
      >
        {getString('ce.perspectives.createPerspective.filters.rulesText2')}
      </Text>

      <FieldArray
        name="viewRules"
        render={arrayHelper => {
          const viewRules = formikProps?.values?.viewRules || []
          return (
            <div>
              {viewRules.map((viewRule, index) => {
                const indexCopy = index
                const removeRow: () => void = () => {
                  arrayHelper.remove(index)
                }

                const setField: (id: number, data: Omit<PillData, 'type'>) => void = (id, pillData) => {
                  const setFieldValue = formikProps.setFieldValue
                  setFieldValue(`viewRules[${indexCopy}].viewConditions[${id}]`, pillData)
                }

                return (
                  <div className={css.filterContainer} key={`multiline-filters-${index}`}>
                    <PerspectiveBuilderFilters
                      formikProps={formikProps}
                      fieldValuesList={data?.perspectiveFields?.fieldIdentifierData as QlceViewFieldIdentifierData[]}
                      timeRange={{
                        to: dateRange[1].format(CE_DATE_FORMAT_INTERNAL),
                        from: dateRange[0].format(CE_DATE_FORMAT_INTERNAL)
                      }}
                      index={index}
                      removeEntireRow={removeRow}
                      filterValue={viewRule.viewConditions}
                      setFieldValue={setField}
                      fieldName={`viewRules[${index}].viewConditions`}
                    />
                    <Icon
                      name="trash"
                      size={16}
                      className={css.crossIcon}
                      color={Color.GREY_300}
                      style={{
                        cursor: 'pointer',
                        height: 'fit-content',
                        alignSelf: 'center',
                        transform: 'translateY(-10px)'
                      }}
                      onClick={removeRow}
                    />
                  </div>
                )
              })}
              <div className={cx(css.addFiltersContainer, { [css.noRulesContainer]: !viewRules.length })}>
                <div
                  className={css.addFilters}
                  onClick={() => {
                    trackEvent(USER_JOURNEY_EVENTS.ADD_PERSPECTIVE_RULE, {})
                    arrayHelper.push({
                      viewConditions: [
                        {
                          type: 'VIEW_ID_CONDITION',
                          viewField: {
                            fieldId: '',
                            fieldName: '',
                            identifier: '',
                            identifierName: ''
                          },
                          viewOperator: 'IN',
                          values: []
                        }
                      ]
                    })
                  }}
                >
                  <Button
                    iconProps={{
                      size: 12
                    }}
                    intent="primary"
                    minimal
                    icon="plus"
                    text={getString('ce.perspectives.createPerspective.filters.addRuleText')}
                    className={css.addRuleButton}
                  />
                </div>
              </div>
            </div>
          )
        }}
      />
    </section>
  )
}

export default PerspectiveFiltersNew
