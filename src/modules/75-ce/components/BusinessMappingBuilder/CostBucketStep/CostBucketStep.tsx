/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Button, ButtonSize } from '@harness/uicore'
import type { Color } from '@harness/design-system'
import { FieldArray } from 'formik'

import React from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { EMPTY_PERSPECTIVE_RULE } from '@ce/utils/perspectiveUtils'
import type { CostBucketWidgetType, CostTargetType, SharedCostType } from '@ce/types'
import { useStrings } from 'framework/strings'
import type { QlceViewFieldIdentifierData } from 'services/ce/services'
import CostBucketBuilder from '../CostBucketBuilder'
import { getCostBucketTitleMap, getNewBucketButtonText } from '../constants'
import Step from '../Step/Step'

interface CostBucketStepProps {
  formikProps: any
  fieldValuesList: QlceViewFieldIdentifierData[]
  namespace: string
  value: SharedCostType[] | CostTargetType[]
  isSharedCost?: boolean
  widgetType: CostBucketWidgetType
  stepProps: {
    color: Color
    background: Color
    total: number
    current: number
    defaultOpen: boolean
    isComingSoon?: boolean
  }
}

const CostBucketStep: (props: CostBucketStepProps) => React.ReactElement = ({
  formikProps,
  fieldValuesList,
  namespace,
  value,
  isSharedCost,
  widgetType,
  stepProps
}) => {
  const { getString } = useStrings()
  const titleMap = getCostBucketTitleMap(getString)
  const newBucketButtonText = getNewBucketButtonText(getString)

  const namespaceKey = formikProps.values[`${namespace}Key`]

  return (
    <FieldArray
      name={namespace}
      render={arrayHelper => {
        /* istanbul ignore next */
        const addNewCostBucket: () => void = () => {
          arrayHelper.push({
            name: '',
            isOpen: true,
            isViewerOpen: false,
            strategy: 'FIXED',
            rules: [
              {
                viewConditions: [EMPTY_PERSPECTIVE_RULE]
              }
            ]
          })
        }

        return (
          <Step
            actionButtonProps={{
              showActionButton: value.length > 0,
              actionButtonText: newBucketButtonText[widgetType],
              actionOnClick: addNewCostBucket
            }}
            stepProps={stepProps}
            title={titleMap[widgetType]}
          >
            <Container
              margin={{
                top: 'medium'
              }}
              border={{
                top: true
              }}
            >
              <DragDropContext
                onDragEnd={
                  /* istanbul ignore next */ (result: DropResult) => {
                    if (!result.destination) {
                      return
                    }
                    const res = Array.from(value)
                    const [removed] = res.splice(result.source.index, 1)
                    res.splice(result.destination.index, 0, removed)
                    formikProps.setFieldValue(`${namespace}Key`, namespaceKey + 1)
                    formikProps.setFieldValue(namespace, res as any)
                  }
                }
              >
                <Droppable droppableId={`droppable-${namespace}`} type={`cost-bucket-${namespace}`}>
                  {provided => (
                    <div ref={provided.innerRef}>
                      {value.map((val: CostTargetType | SharedCostType, index: number) => {
                        const removeCostBucket = () => {
                          arrayHelper.remove(index)
                        }
                        return (
                          <CostBucketBuilder
                            namespace={namespace}
                            key={`${namespace}-${index}-${namespaceKey}`}
                            removeCostBucket={removeCostBucket}
                            value={val}
                            index={index}
                            fieldValuesList={fieldValuesList}
                            setFieldValue={formikProps.setFieldValue}
                            validateField={formikProps.validateField}
                            isSharedCost={isSharedCost}
                            widgetType={widgetType}
                          />
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              {value.length < 1 ? (
                <Button
                  icon="plus"
                  text={newBucketButtonText[widgetType]}
                  minimal
                  margin={{
                    top: 'medium'
                  }}
                  size={ButtonSize.SMALL}
                  onClick={addNewCostBucket}
                />
              ) : null}
            </Container>
          </Step>
        )
      }}
    />
  )
}

export default CostBucketStep
