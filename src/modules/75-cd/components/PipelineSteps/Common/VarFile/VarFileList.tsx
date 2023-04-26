/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
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
import { get, set } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { RemoteVar, TerraformStoreTypes } from '../Terraform/TerraformInterfaces'
import InlineVarFile from './InlineVarFile'
import { DIALOG_PROPS } from './helper'
import { RemoteVarStore } from './RemoteVarStore'
import { RemoteWizard } from './RemoteWizard'
import { ArtifactoryForm } from './ArtifactoryForm'
import { AmazonS3Store } from '../ConfigFileStore/AmazonS3Store/AmazonS3Store'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './VarFile.module.scss'

interface VarFileProps<T> {
  formik: FormikProps<T>
  isReadonly: boolean
  varFilePath: string
  allowableTypes: AllowedTypes
  getNewConnectorSteps?: any
  setSelectedConnector?: any
  selectedConnector?: string
  isTerragrunt?: boolean
  isTerraformPlan?: boolean
}

export default function VarFileList<T, U>(props: VarFileProps<T>): React.ReactElement {
  const {
    formik,
    isReadonly = false,
    allowableTypes,
    getNewConnectorSteps,
    setSelectedConnector,
    selectedConnector,
    varFilePath,
    isTerragrunt,
    isTerraformPlan
  } = props
  const inlineInitValues = {
    varFile: {
      spec: {
        content: ''
      },
      identifier: '',
      type: TerraformStoreTypes.Inline
    }
  } as unknown as U
  const remoteInitialValues = {
    varFile: {
      spec: {},
      identifier: '',
      type: TerraformStoreTypes.Remote
    }
  } as unknown as U

  const [showTfModal, setShowTfModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedVar, setSelectedVar] = useState(inlineInitValues)
  const [selectedVarIndex, setSelectedVarIndex] = useState(-1)
  const [showRemoteWizard, setShowRemoteWizard] = useState(false)
  const [connectorView, setConnectorView] = useState(false)
  const { getString } = useStrings()

  const onSubmit = /* istanbul ignore next */ (values: RemoteVar, arrayHelpers: FieldArrayRenderProps): void => {
    if (isEditMode) {
      arrayHelpers.replace(selectedVarIndex, values)
    } else {
      arrayHelpers.push(values)
    }
    onCloseOfRemoteWizard()
  }

  const remoteRender = (varFile: U, index: number): React.ReactElement => {
    const { identifier } = get(varFile, 'varFile')
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

  const inlineRender = (varFile: U, index: number): React.ReactElement => {
    const { identifier } = get(varFile, 'varFile')
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
      <Icon name="service-terraform" size={50} padding={{ bottom: 'large' }} />
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
  const [removeVarFile, setRemoveVarFile] = useState(false)
  const listofVarFiles = get(formik.values, varFilePath)

  const deleteVarFile = (index: number): void => {
    listofVarFiles.splice(index, 1)
    set(formik, `values.${varFilePath}`, listofVarFiles)
    setRemoveVarFile(!removeVarFile)
  }

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
              const res = Array.from(get(formik.values, varFilePath))
              const [removed] = res.splice(result.source.index, 1)
              res.splice(result.destination.index, 0, removed)
              formik.setFieldValue(varFilePath, res)
            }
          }
        >
          <Droppable droppableId="droppable">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <FieldArray
                  name={varFilePath}
                  render={arrayHelpers => {
                    return (
                      <div>
                        {get(formik.values, varFilePath)?.map((varFile: U, index: number) => {
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
                                    {get(formik.values, varFilePath, [])?.length > 1 && (
                                      <Text color={Color.BLACK}>{`${index + 1}.`}</Text>
                                    )}
                                    {get(varFile, 'varFile.type') === TerraformStoreTypes.Remote &&
                                      remoteRender(varFile, index)}
                                    {get(varFile, 'varFile.type') === TerraformStoreTypes.Inline &&
                                      inlineRender(varFile, index)}

                                    <Button
                                      minimal
                                      icon="main-trash"
                                      data-testid={`remove-varFile-${index}`}
                                      onClick={() => deleteVarFile(index)}
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
                                <RemoteVarStore
                                  isReadonly={isReadonly}
                                  name={getString('cd.tfVarStore')}
                                  initialValues={isEditMode ? selectedVar : remoteInitialValues}
                                  isEditMode={isEditMode}
                                  allowableTypes={allowableTypes}
                                  setSelectedConnector={setSelectedConnector}
                                  handleConnectorViewChange={/* istanbul ignore next */ () => setConnectorView(true)}
                                  setConnectorView={setConnectorView}
                                  isTerragrunt={!!isTerragrunt}
                                />
                                {connectorView ? getNewConnectorSteps() : null}
                                {selectedConnector === 'Artifactory' ? (
                                  <ArtifactoryForm
                                    isConfig={false}
                                    isTerraformPlan={!!isTerraformPlan}
                                    allowableTypes={allowableTypes}
                                    name={getString('cd.varFileDetails')}
                                    onSubmitCallBack={(values: RemoteVar) => onSubmit(values, arrayHelpers)}
                                  />
                                ) : selectedConnector === 'S3' ? (
                                  <AmazonS3Store
                                    isTerraformPlan={!!isTerraformPlan}
                                    allowableTypes={allowableTypes}
                                    name={getString('cd.varFileDetails')}
                                    onSubmitCallBack={(values: RemoteVar) => onSubmit(values, arrayHelpers)}
                                    isReadonly={isReadonly}
                                  />
                                ) : (
                                  <RemoteWizard
                                    name={getString('cd.varFileDetails')}
                                    onSubmitCallBack={
                                      /* istanbul ignore next */ (values: RemoteVar) => onSubmit(values, arrayHelpers)
                                    }
                                    isEditMode={isEditMode}
                                    isReadonly={isReadonly}
                                    allowableTypes={allowableTypes}
                                  />
                                )}
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
