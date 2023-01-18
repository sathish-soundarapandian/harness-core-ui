/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import {
  Layout,
  Text,
  Button,
  Icon,
  StepWizard,
  Label,
  FormikTooltipContext,
  HarnessDocTooltip,
  ButtonVariation,
  AllowedTypes
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Classes, MenuItem, Popover, PopoverInteractionKind, Menu, Dialog } from '@blueprintjs/core'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import type { FormikProps } from 'formik'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { TerragruntVarFileWrapper } from 'services/cd-ng'
import type { TerragruntData } from '../TerragruntInterface'
import { RemoteVar, TerraformStoreTypes } from '../../Terraform/TerraformInterfaces'
import { TFRemoteWizard } from '../../Terraform/Editview/TFRemoteWizard'
import { TFVarStore } from '../../Terraform/Editview/TFVarStore'
import InlineVarFile from '../../Terraform/Editview/InlineVarFile'
import { DIALOG_PROPS } from '../TerragruntHelper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../../Terraform/Editview/TerraformVarfile.module.scss'

interface TGVarFileProps {
  formik: FormikProps<TerragruntData>
  isReadonly: boolean
  allowableTypes: AllowedTypes
  getNewConnectorSteps?: any
  setSelectedConnector?: any
  selectedConnector?: string
}

export default function TgVarFileList(props: TGVarFileProps): React.ReactElement {
  const { formik, isReadonly = false, allowableTypes, getNewConnectorSteps, setSelectedConnector } = props
  const inlineInitValues: TerragruntVarFileWrapper = {
    varFile: {
      spec: {},
      identifier: '',
      type: TerraformStoreTypes.Inline
    }
  }
  const remoteInitialValues: TerragruntVarFileWrapper = {
    varFile: {
      spec: {},
      identifier: '',
      type: TerraformStoreTypes.Remote
    }
  }

  const [showTfModal, setShowTfModal] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [selectedVar, setSelectedVar] = React.useState(inlineInitValues)
  const [selectedVarIndex, setSelectedVarIndex] = React.useState(-1)
  const [showRemoteWizard, setShowRemoteWizard] = React.useState(false)
  const [connectorView, setConnectorView] = React.useState(false)
  const { getString } = useStrings()

  const onSubmit = /* istanbul ignore next */ (values: RemoteVar, arrayHelpers: FieldArrayRenderProps): void => {
    if (isEditMode) {
      arrayHelpers.replace(selectedVarIndex, values)
    } else {
      arrayHelpers.push(values)
    }
    onCloseOfRemoteWizard()
  }

  const remoteRender = (varFile: TerragruntVarFileWrapper, index: number): React.ReactElement => {
    const { identifier } = varFile.varFile
    return (
      <div className={css.configField}>
        <Layout.Horizontal>
          <Icon name="remote" className={css.iconPosition} />
          <Text className={css.branch}>{identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            setShowRemoteWizard(true)
            setSelectedVar(varFile)
            setSelectedVarIndex(index)
            setIsEditMode(true)
          }}
        />
      </div>
    )
  }

  const inlineRender = (varFile: TerragruntVarFileWrapper, index: number): React.ReactElement => {
    const { identifier } = varFile.varFile
    return (
      <div className={css.configField}>
        <Layout.Horizontal>
          <Icon name="Inline" className={css.iconPosition} />
          <Text className={css.branch}>{identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            setShowTfModal(true)
            setIsEditMode(true)
            setSelectedVarIndex(index)
            setSelectedVar(varFile)
          }}
        />
      </div>
    )
  }

  const getTitle = () => (
    <Layout.Vertical flex style={{ justifyContent: 'center', alignItems: 'center' }} margin={{ bottom: 'xlarge' }}>
      <Icon name="service-terraform" className={css.remoteIcon} size={50} padding={{ bottom: 'large' }} />
      <Text color={Color.WHITE}>{getString('pipelineSteps.remoteFile')}</Text>
    </Layout.Vertical>
  )

  /* istanbul ignore next */
  const onCloseOfRemoteWizard = () => {
    setShowRemoteWizard(false)
    setIsEditMode(false)
    setSelectedVar(remoteInitialValues)
  }
  /* istanbul ignore next */
  const onCloseOfInlineVarForm = () => {
    setShowTfModal(false)
    setIsEditMode(false)
    setSelectedVar(inlineInitValues)
  }
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId = tooltipContext?.formName ? `${tooltipContext.formName}_${name}` : ''
  const varFilesPath = 'spec.configuration.spec.varFiles'
  return (
    <Layout.Vertical>
      <Label style={{ color: Color.GREY_900 }} className={css.tfVarLabel} data-tooltip-id={dataTooltipId}>
        {getString('optionalField', { name: getString('cd.terraformVarFiles') })}
        <HarnessDocTooltip useStandAlone={true} tooltipId={dataTooltipId} />
      </Label>
      <div className={cx(stepCss.formGroup, css.tfVarMargin)}>
        <DragDropContext
          onDragEnd={
            /* istanbul ignore next */ (result: DropResult) => {
              if (!result.destination) {
                return
              }
              const res = Array.from(get(formik.values, varFilesPath))
              const [removed] = res.splice(result.source.index, 1)
              res.splice(result.destination.index, 0, removed)
              formik.setFieldValue(varFilesPath, res)
            }
          }
        >
          <Droppable droppableId="droppable">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <FieldArray
                  name={varFilesPath}
                  render={arrayHelpers => {
                    return (
                      <div>
                        {get(formik.values, varFilesPath)?.map((varFile: TerragruntVarFileWrapper, index: number) => {
                          return (
                            <Draggable key={index} draggableId={`${index}`} index={index}>
                              {providedDrag => (
                                <Layout.Horizontal
                                  flex={{ distribution: 'space-between', alignItems: 'flex-start' }}
                                  key={index}
                                  ref={providedDrag.innerRef}
                                  {...providedDrag.draggableProps}
                                  {...providedDrag.dragHandleProps}
                                >
                                  <Layout.Horizontal spacing="medium" style={{ alignItems: 'baseline' }}>
                                    <Icon name="drag-handle-vertical" className={css.drag} />
                                    {get(formik.values, varFilesPath, [])?.length > 1 && (
                                      <Text color={Color.BLACK}>{`${index + 1}.`}</Text>
                                    )}
                                    {get(varFile, 'varFile.type') === TerraformStoreTypes.Remote &&
                                      remoteRender(varFile, index)}
                                    {get(varFile, 'varFile.type') === TerraformStoreTypes.Inline &&
                                      inlineRender(varFile, index)}

                                    <Button
                                      minimal
                                      icon="main-trash"
                                      data-testid={`remove-header-${index}`}
                                      onClick={() => arrayHelpers.remove(index)}
                                    />
                                  </Layout.Horizontal>
                                </Layout.Horizontal>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                        <Popover
                          interactionKind={PopoverInteractionKind.CLICK}
                          boundary="viewport"
                          popoverClassName={Classes.DARK}
                          content={
                            <Menu className={css.tfMenu}>
                              <MenuItem
                                text={<Text intent="primary">{getString('cd.addInline')} </Text>}
                                icon={<Icon name="Inline" className={css.iconMargin} />}
                                onClick={() => {
                                  setShowTfModal(true)
                                }}
                              />

                              <MenuItem
                                text={<Text intent="primary">{getString('cd.addRemote')}</Text>}
                                icon={<Icon name="remote" className={css.iconMargin} />}
                                onClick={() => setShowRemoteWizard(true)}
                              />
                            </Menu>
                          }
                        >
                          <Button
                            variation={ButtonVariation.LINK}
                            data-testid="add-tfvar-file"
                            className={css.addTfVarFile}
                          >
                            {getString('plusAdd')}
                          </Button>
                        </Popover>
                        {showRemoteWizard && (
                          <Dialog
                            {...DIALOG_PROPS}
                            isOpen={true}
                            isCloseButtonShown
                            onClose={onCloseOfRemoteWizard}
                            className={cx(css.modal, Classes.DIALOG)}
                          >
                            <div className={css.createTfWizard}>
                              <StepWizard title={getTitle()} initialStep={1} className={css.manifestWizard}>
                                <TFVarStore
                                  isReadonly={isReadonly}
                                  name={getString('cd.tfVarStore')}
                                  initialValues={isEditMode ? selectedVar : remoteInitialValues}
                                  isEditMode={isEditMode}
                                  allowableTypes={allowableTypes}
                                  setSelectedConnector={setSelectedConnector}
                                  handleConnectorViewChange={/* istanbul ignore next */ () => setConnectorView(true)}
                                  setConnectorView={setConnectorView}
                                  isTerragrunt
                                />
                                {connectorView ? getNewConnectorSteps() : null}
                                <TFRemoteWizard
                                  name={getString('cd.varFileDetails')}
                                  onSubmitCallBack={
                                    /* istanbul ignore next */ (values: RemoteVar) => onSubmit(values, arrayHelpers)
                                  }
                                  isEditMode={isEditMode}
                                  isReadonly={isReadonly}
                                  allowableTypes={allowableTypes}
                                />
                              </StepWizard>
                            </div>
                            <Button
                              minimal
                              icon="cross"
                              iconProps={{ size: 18 }}
                              onClick={() => setShowRemoteWizard(false)}
                              className={css.crossIcon}
                            />
                          </Dialog>
                        )}
                        {showTfModal && (
                          <InlineVarFile
                            arrayHelpers={arrayHelpers}
                            isEditMode={isEditMode}
                            selectedVarIndex={selectedVarIndex}
                            showTfModal={showTfModal}
                            selectedVar={selectedVar}
                            onClose={onCloseOfInlineVarForm}
                            onSubmit={() => {
                              onCloseOfInlineVarForm()
                            }}
                            isReadonly={isReadonly}
                            allowableTypes={allowableTypes}
                          />
                        )}
                      </div>
                    )
                  }}
                />
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </Layout.Vertical>
  )
}
