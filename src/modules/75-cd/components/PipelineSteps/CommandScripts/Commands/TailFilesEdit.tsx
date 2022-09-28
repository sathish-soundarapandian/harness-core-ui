/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { FieldArray, FieldArrayRenderProps, FormikProps } from 'formik'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { Button, ButtonVariation, Color, Container, FormInput, Icon, Layout, AllowedTypes, Text } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { CommandUnitType, CustomScriptCommandUnit } from '../CommandScriptsTypes'
import css from './TailFilesEdit.module.scss'

interface TailFilesEditProps {
  formik: FormikProps<CommandUnitType>
  allowableTypes: AllowedTypes
  readonly?: boolean
}

export function TailFilesEdit(props: TailFilesEditProps): React.ReactElement {
  const { formik, readonly = false } = props
  const { getString } = useStrings()
  const arrayHelpersRef = useRef<FieldArrayRenderProps>()

  return (
    <Layout.Vertical margin={{ bottom: 'small' }} data-testid="tail-files-edit">
      <Container className={css.filesPatternsHeaderContainer}>
        <Text className={css.filesPatternsHeader}>{getString('cd.steps.commands.filesAndPatterns')}</Text>
        <Text className={css.filesPatternsHeaderOptional}>{getString('optionalField')}</Text>
      </Container>
      <div className={css.panel}>
        <div className={css.header}>
          <div></div>
          <Text color={Color.GREY_600}>{getString('cd.steps.commands.fileToTail')}</Text>
          <Text color={Color.GREY_600}>{getString('cd.steps.commands.patternToSearch')}</Text>
          <div></div>
        </div>
        <DragDropContext
          onDragEnd={(result: DropResult) => {
            if (!result.destination) {
              return
            }
            const res = Array.from(defaultTo((formik.values as CustomScriptCommandUnit).spec.tailFiles, []))
            const [removed] = res.splice(result.source.index, 1)
            res.splice(result.destination.index, 0, removed)
            formik.setFieldValue('spec.tailFiles', res)
          }}
        >
          <Droppable droppableId="droppable">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <FieldArray
                  name="spec.tailFiles"
                  render={arrayHelpers => {
                    arrayHelpersRef.current = arrayHelpers
                    return (
                      <>
                        {(formik.values as CustomScriptCommandUnit).spec.tailFiles?.map((_tailFile, index) => {
                          return (
                            <Draggable key={index} draggableId={`${index}`} index={index}>
                              {providedDrag => (
                                <Layout.Horizontal
                                  key={index}
                                  ref={providedDrag.innerRef}
                                  {...providedDrag.draggableProps}
                                  {...providedDrag.dragHandleProps}
                                  className={cx(css.header, css.row)}
                                >
                                  <Container height={32} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                                    <Icon name="drag-handle-vertical" margin={{ right: 'small' }} />
                                    {`${index + 1}.`}
                                  </Container>
                                  <FormInput.Text
                                    disabled={readonly}
                                    name={`spec.tailFiles[${index}].tailFile`}
                                    placeholder={getString('cd.steps.commands.fileToTailPlaceholder')}
                                  />
                                  <FormInput.Text
                                    disabled={readonly}
                                    name={`spec.tailFiles[${index}].tailPattern`}
                                    placeholder={getString('cd.steps.commands.patternToSearchPlaceholder')}
                                  />
                                  <Button
                                    minimal
                                    disabled={readonly}
                                    icon="main-trash"
                                    data-testid={`remove-tailFile-${index}`}
                                    onClick={() => arrayHelpers.remove(index)}
                                  />
                                </Layout.Horizontal>
                              )}
                            </Draggable>
                          )
                        })}
                      </>
                    )
                  }}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Button
          icon="plus"
          variation={ButtonVariation.LINK}
          data-testid="add-tailFile"
          disabled={readonly}
          onClick={() => arrayHelpersRef.current?.push({ tailFile: '', tailPattern: '' })}
          className={css.addButton}
        >
          {getString('add')}
        </Button>
      </div>
    </Layout.Vertical>
  )
}
