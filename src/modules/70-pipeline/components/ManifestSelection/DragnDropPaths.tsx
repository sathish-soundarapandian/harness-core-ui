/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FieldArray, FormikValues } from 'formik'
import {
  Layout,
  FormInput,
  MultiTypeInputType,
  ButtonVariation,
  Text,
  Button,
  Icon,
  ButtonSize,
  AllowedTypes
} from '@harness/uicore'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isMultiTypeRuntime } from '@common/utils/utils'
import css from './ManifestWizardSteps/CommonManifestDetails/CommonManifestDetails.module.scss'

export interface DragnDropPathsProps<T = unknown> {
  formik: FormikValues
  expressions: string[]
  allowableTypes: AllowedTypes
  pathLabel: string
  fieldPath: string
  placeholder: string
  defaultValue: T
  allowOnlyOneFilePath?: boolean
  dragDropFieldWidth?: number
}

function DragnDropPaths({
  formik,
  expressions,
  allowableTypes,
  pathLabel,
  fieldPath,
  placeholder,
  defaultValue,
  allowOnlyOneFilePath,
  dragDropFieldWidth: dialogWidth
}: DragnDropPathsProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <DragDropContext
      onDragEnd={(result: DropResult) => {
        if (!result.destination) {
          return
        }
        const res = Array.from(formik.values[fieldPath])
        const [removed] = res.splice(result.source.index, 1)
        res.splice(result.destination.index, 0, removed)
        formik.setFieldValue(fieldPath, res)
      }}
    >
      <Droppable droppableId="droppable">
        {(provided, _snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <MultiTypeFieldSelector
              defaultValueToReset={[defaultValue]}
              allowedTypes={
                (allowableTypes as MultiTypeInputType[]).filter(
                  allowedType => allowedType !== MultiTypeInputType.EXPRESSION
                ) as AllowedTypes
              }
              name={fieldPath}
              label={<Text className={css.pathLabel}>{pathLabel}</Text>}
            >
              <FieldArray
                name={fieldPath}
                render={arrayHelpers => (
                  <Layout.Vertical>
                    {formik.values?.[fieldPath]?.map((draggablepath: { path: string; uuid: string }, index: number) => (
                      <Draggable key={draggablepath.uuid} draggableId={draggablepath.uuid} index={index}>
                        {providedDrag => (
                          <Layout.Horizontal
                            flex={{ distribution: 'space-between', alignItems: 'flex-start' }}
                            key={draggablepath.uuid}
                            ref={providedDrag.innerRef}
                            {...providedDrag.draggableProps}
                            {...providedDrag.dragHandleProps}
                          >
                            <Layout.Horizontal spacing="medium" style={{ alignItems: 'baseline' }}>
                              {!allowOnlyOneFilePath && (
                                <>
                                  <Icon name="drag-handle-vertical" className={css.drag} />
                                  <Text className={css.text}>{`${index + 1}.`}</Text>
                                </>
                              )}
                              <FormInput.MultiTextInput
                                label={''}
                                placeholder={placeholder}
                                name={`${fieldPath}[${index}].path`}
                                style={{ width: defaultTo(dialogWidth, 275) }}
                                multiTextInputProps={{
                                  expressions,
                                  allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                                    allowedType => !isMultiTypeRuntime(allowedType)
                                  ) as AllowedTypes
                                }}
                              />

                              {formik.values[fieldPath]?.length > 1 && (
                                <Button minimal icon="main-trash" onClick={() => arrayHelpers.remove(index)} />
                              )}
                            </Layout.Horizontal>
                          </Layout.Horizontal>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {allowOnlyOneFilePath && formik.values[fieldPath].length === 1 ? null : (
                      <span>
                        <Button
                          text={getString('addFileText')}
                          icon="plus"
                          size={ButtonSize.SMALL}
                          variation={ButtonVariation.LINK}
                          className={css.addFileButton}
                          onClick={() => arrayHelpers.push(defaultValue)}
                        />
                      </span>
                    )}
                  </Layout.Vertical>
                )}
              />
            </MultiTypeFieldSelector>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DragnDropPaths
