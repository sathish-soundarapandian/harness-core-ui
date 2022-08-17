/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { defaultTo } from 'lodash-es'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  Color,
  FontVariation,
  FormikTooltipContext,
  HarnessDocTooltip,
  Icon,
  Label,
  Layout,
  Text
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { CommandScriptsData } from './CommandScriptsTypes'
import useCommands from './Commands/useCommand'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './CommandScripts.module.scss'

interface CommandListProps {
  allowableTypes: AllowedTypes
  readonly?: boolean
}

export function CommandList(props: CommandListProps): React.ReactElement {
  const { allowableTypes, readonly } = props
  const { getString } = useStrings()
  const tooltipContext = React.useContext(FormikTooltipContext)
  const formik = useFormikContext<CommandScriptsData>()
  const arrayHelpersRef = useRef<FieldArrayRenderProps>()
  const dataTooltipId = tooltipContext?.formName ? `${tooltipContext?.formName}_commandUnits` : ''

  const { openCommandModal } = useCommands({
    allowableTypes,
    readonly
  })

  return (
    <div>
      <Label data-tooltip-id={dataTooltipId} className={stepCss.bottomMargin5}>
        <Text font={{ variation: FontVariation.BODY2_SEMI }}>{getString('cd.steps.commands.runTheCommands')}</Text>
        <HarnessDocTooltip useStandAlone={true} tooltipId={dataTooltipId} />
      </Label>
      <DragDropContext
        onDragEnd={(result: DropResult) => {
          if (!result.destination) {
            return
          }
          const res = Array.from(defaultTo(formik.values.spec.commandUnits, []))
          const [removed] = res.splice(result.source.index, 1)
          res.splice(result.destination.index, 0, removed)
          formik.setFieldValue('spec.commandUnits', res)
        }}
      >
        <Droppable droppableId="droppable">
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <FieldArray
                name="spec.commandUnits"
                render={(arrayHelpers: FieldArrayRenderProps) => {
                  arrayHelpersRef.current = arrayHelpers
                  return (
                    <>
                      {formik.values.spec.commandUnits?.map((command, i) => (
                        <Draggable key={command.name} draggableId={defaultTo(command.name, '')} index={i}>
                          {(providedDrag, draggableSnapshot) => (
                            <Layout.Horizontal
                              spacing="medium"
                              padding={{ top: 'small', bottom: 'small' }}
                              flex={{ alignItems: 'center' }}
                              border={{
                                bottom: true,
                                ...(i === 0 || draggableSnapshot.isDragging ? { top: true } : {})
                              }}
                              background={Color.FORM_BG}
                              ref={providedDrag.innerRef}
                              {...providedDrag.draggableProps}
                              {...providedDrag.dragHandleProps}
                            >
                              <Icon name="drag-handle-vertical" />
                              <span className={css.commandUnitNumber}>{i + 1}</span>
                              <Text lineClamp={1} width="100%" font={{ variation: FontVariation.BODY2 }}>
                                {command.name}
                              </Text>
                              <Layout.Horizontal>
                                <Button
                                  icon="Edit"
                                  disabled={readonly}
                                  variation={ButtonVariation.ICON}
                                  onClick={() => {
                                    openCommandModal({
                                      arrayHelpers,
                                      isUpdate: true,
                                      initialModalValues: command,
                                      updateIndex: i
                                    })
                                  }}
                                  data-testid={`edit-command-unit-${i}`}
                                ></Button>
                                <Button
                                  icon="main-trash"
                                  disabled={readonly}
                                  onClick={() => arrayHelpers.remove(i)}
                                  variation={ButtonVariation.ICON}
                                  data-testid={`delete-command-unit-${i}`}
                                ></Button>
                              </Layout.Horizontal>
                            </Layout.Horizontal>
                          )}
                        </Draggable>
                      ))}
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
        data-testid="add-command-unit"
        disabled={readonly}
        onClick={() => {
          openCommandModal({
            arrayHelpers: arrayHelpersRef.current as FieldArrayRenderProps,
            isUpdate: false
          })
        }}
        className={stepCss.topMargin5}
      >
        {getString('cd.steps.commands.addCommand')}
      </Button>
    </div>
  )
}
