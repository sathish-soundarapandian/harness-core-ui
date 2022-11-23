/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Container,
  FlexExpander,
  Layout,
  Button,
  Card,
  FormInput,
  Icon,
  ButtonVariation,
  RadioButtonGroup
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { FieldArray } from 'formik'
import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { DEFAULT_TIME_RANGE } from '@ce/utils/momentUtils'
import { EMPTY_PERSPECTIVE_RULE } from '@ce/utils/perspectiveUtils'
import type { CostBucketWidgetType, CostTargetType, SharedCostType } from '@ce/types'
import { useStrings } from 'framework/strings'
import type { SharedCost } from 'services/ce'
import type { QlceViewFieldIdentifierData } from 'services/ce/services'
import PerspectiveBuilderFilters from '../PerspectiveBuilderFilters/PerspectiveBuilderFilters'
import { getBucketNameText } from './constants'
import RuleViewer from './RuleViewer/RuleViewer'
import type { PillData } from '../PerspectiveBuilderFilters/PerspectiveBuilderFilter'
import css from './CostBucketBuilder.module.scss'

interface HeaderActionButtonsProps {
  isEditOpen: boolean | undefined
  index: number
  setFieldValue: any
  removeCostBucket: () => void
  namespace: string
  isViewerOpen: boolean | undefined
}

const HeaderActionButtons: (props: HeaderActionButtonsProps) => React.ReactElement = ({
  isEditOpen,
  index,
  setFieldValue,
  removeCostBucket,
  namespace,
  isViewerOpen
}) => {
  if (isEditOpen) {
    return (
      <>
        <Button
          icon="tick"
          iconProps={{
            size: 20
          }}
          className={css.buttonNoPadding}
          minimal
          intent="primary"
          onClick={async () => {
            setFieldValue(`${namespace}[${index}].isOpen`, false)
          }}
        />
        <Button
          icon="cross"
          className={css.buttonNoPadding}
          iconProps={{
            size: 20
          }}
          minimal
          intent="primary"
          onClick={() => {
            removeCostBucket()
          }}
        />
      </>
    )
  }
  return (
    <>
      <Button
        icon="Edit"
        className={css.buttonNoPadding}
        iconProps={{
          size: 16
        }}
        minimal
        intent="primary"
        onClick={() => {
          setFieldValue(`${namespace}[${index}].isOpen`, true)
        }}
      />
      <Button
        icon={isViewerOpen ? 'chevron-up' : 'chevron-down'}
        className={css.buttonNoPadding}
        iconProps={{
          size: 20
        }}
        minimal
        intent="primary"
        onClick={() => {
          setFieldValue(`${namespace}[${index}].isViewerOpen`, !isViewerOpen)
        }}
      />
    </>
  )
}

interface CostBucketBuilderProps {
  fieldValuesList: QlceViewFieldIdentifierData[]
  value: CostTargetType | SharedCostType
  index: number
  setFieldValue: any
  removeCostBucket: () => void
  namespace: string
  isSharedCost?: boolean
  widgetType: CostBucketWidgetType
  validateField: (field: string) => void
}

const CostBucketBuilder: (props: CostBucketBuilderProps) => React.ReactElement = ({
  fieldValuesList,
  value,
  index,
  setFieldValue,
  removeCostBucket,
  namespace,
  isSharedCost,
  widgetType
}) => {
  const { getString } = useStrings()
  const bucketNameText = getBucketNameText(getString)

  const isEditOpen = value.isOpen
  const isViewerOpen = value.isViewerOpen

  return (
    <Draggable
      key={`draggable-${namespace}-${index}`}
      draggableId={`${namespace}-${index}-${value.name}`}
      index={index}
    >
      {provided => {
        return (
          <Container ref={provided.innerRef} {...provided.draggableProps} className={css.drag}>
            <Card className={css.mainContainer}>
              <Layout.Horizontal
                background={isEditOpen ? Color.PRIMARY_1 : Color.GREY_100}
                className={css.costBucketNameContainet}
              >
                <Container {...provided.dragHandleProps}>
                  <Icon
                    name="drag-handle-vertical"
                    margin={{
                      top: 'xsmall'
                    }}
                    size={24}
                    color={Color.GREY_300}
                  />
                </Container>
                <FormInput.Text
                  name={`${namespace}[${index}].name`}
                  placeholder={bucketNameText[widgetType]}
                  className={css.nameInput}
                />
                <FlexExpander />
                <HeaderActionButtons
                  isEditOpen={isEditOpen}
                  index={index}
                  setFieldValue={setFieldValue}
                  removeCostBucket={removeCostBucket}
                  namespace={namespace}
                  isViewerOpen={isViewerOpen}
                />
              </Layout.Horizontal>
              {isEditOpen ? (
                <Container
                  background={Color.PRIMARY_BG}
                  padding={{
                    top: 'xsmall',
                    left: 'medium',
                    right: 'medium',
                    bottom: 'medium'
                  }}
                >
                  <FieldArray
                    name={`${namespace}[${index}].rules`}
                    render={arrayHelper => {
                      return (
                        <Container>
                          {value.rules?.map((rule, index1) => {
                            const indexCopy = index1

                            /* istanbul ignore next */
                            const removeRow: () => void = () => {
                              arrayHelper.remove(index1)
                            }

                            /* istanbul ignore next */
                            const setField: (id: number, data: Omit<PillData, 'type'>) => void = (id, data) => {
                              setFieldValue(`${namespace}[${index}].rules[${indexCopy}].viewConditions[${id}]`, data)
                            }

                            return (
                              <PerspectiveBuilderFilters
                                key={`rules-${index1}`}
                                index={index1}
                                setFieldValue={setField}
                                removeEntireRow={removeRow}
                                fieldValuesList={fieldValuesList}
                                showAndOperator={true}
                                timeRange={DEFAULT_TIME_RANGE}
                                filterValue={rule.viewConditions}
                                fieldName={`${namespace}[${index}].rules[${index1}]viewConditions`}
                              />
                            )
                          })}
                          <Button
                            icon="add"
                            margin={{
                              top: 'small',
                              bottom: 'small'
                            }}
                            variation={ButtonVariation.SECONDARY}
                            text="OR"
                            onClick={
                              /* istanbul ignore next */ () => {
                                arrayHelper.push({
                                  viewConditions: [EMPTY_PERSPECTIVE_RULE]
                                })
                              }
                            }
                          />
                        </Container>
                      )
                    }}
                  />

                  {isSharedCost ? (
                    <Container
                      border={{
                        top: true
                      }}
                      margin={{
                        top: 'medium'
                      }}
                      padding={{
                        top: 'medium'
                      }}
                    >
                      <RadioButtonGroup
                        label={getString('ce.businessMapping.sharedCostBucket.sharingStrategyLabel')}
                        selectedValue={(value as SharedCost).strategy}
                        options={[
                          {
                            label: getString('ce.businessMapping.sharedCostBucket.sharingStrategy.equal'),
                            value: 'FIXED'
                          },
                          {
                            label: getString('ce.businessMapping.sharedCostBucket.sharingStrategy.proportional'),
                            value: 'PROPORTIONAL'
                          },
                          {
                            label: getString('ce.businessMapping.sharedCostBucket.sharingStrategy.fixed'),
                            value: '-',
                            disabled: true
                          }
                        ]}
                        onChange={e => {
                          const selectedValue = (e as any).target.value
                          setFieldValue(`${namespace}[${index}].strategy`, selectedValue)
                        }}
                      />
                    </Container>
                  ) : null}
                </Container>
              ) : null}

              <RuleViewer isOpen={isViewerOpen && !isEditOpen ? true : false} value={value} />
            </Card>
          </Container>
        )
      }}
    </Draggable>
  )
}

export default CostBucketBuilder
