/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout, Text, Button, Icon, StepWizard, Label, ButtonVariation, AllowedTypes } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Classes, MenuItem, Popover, PopoverInteractionKind, Menu, Dialog } from '@blueprintjs/core'
import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import { get } from 'lodash-es'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { useStrings } from 'framework/strings'
import type { TerragruntVarFileWrapper } from 'services/cd-ng'
import { RemoteVar, TerraformStoreTypes } from '../Common/Terraform/TerraformInterfaces'
import type { TGPlanFormData } from '../Common/Terragrunt/TerragruntInterface'
import { TFRemoteWizard } from '../Common/Terraform/Editview/TFRemoteWizard'
import { TFVarStore } from '../Common/Terraform/Editview/TFVarStore'
import InlineVarFile from '../Common/Terraform/Editview/InlineVarFile'
import { TFArtifactoryForm } from '../Common/Terraform/Editview/TerraformArtifactoryForm'
import { DIALOG_PROPS } from '../Common/Terragrunt/TerragruntHelper'
import css from '../Common/Terraform/Editview/TerraformVarfile.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TgVarFileProps {
  formik: FormikProps<TGPlanFormData>
  isReadonly: boolean
  allowableTypes: AllowedTypes
  getNewConnectorSteps?: any
  setSelectedConnector?: any
  selectedConnector?: string
}

export default function TgPlanVarFileList(props: TgVarFileProps): React.ReactElement {
  const {
    formik,
    isReadonly = false,
    allowableTypes,
    getNewConnectorSteps,
    setSelectedConnector,
    selectedConnector
  } = props
  const inlineInitValues: TerragruntVarFileWrapper = {
    varFile: {
      identifier: '',
      spec: {},
      type: TerraformStoreTypes.Inline
    }
  }
  const remoteInitialValues: TerragruntVarFileWrapper = {
    varFile: {
      identifier: '',
      spec: {},
      type: TerraformStoreTypes.Remote
    }
  }

  const [showTfModal, setShowTfModal] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [selectedVar, setSelectedVar] = React.useState(inlineInitValues as any)
  const [selectedVarIndex, setSelectedVarIndex] = React.useState<number>(-1)

  const [showRemoteWizard, setShowRemoteWizard] = React.useState(false)
  const [connectorView, setConnectorView] = React.useState(false)
  const { getString } = useStrings()

  const onSubmit = (values: RemoteVar, arrayHelpers: any) => {
    if (isEditMode) {
      arrayHelpers.replace(selectedVarIndex, values)
    } else {
      arrayHelpers.push(values)
    }
    onCloseOfRemoteWizard()
  }

  const remoteRender = (varFile: TerragruntVarFileWrapper, index: number) => {
    const { type, identifier } = varFile.varFile
    return (
      <div className={css.configField} data-name={`edit-remote-${index}`}>
        <Layout.Horizontal>
          {type === getString('remote') && <Icon name="remote" className={css.iconPosition} />}
          <Text className={css.branch}>{identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            /* istanbul ignore next */
            setShowRemoteWizard(true)
            setSelectedVar(varFile)
            setSelectedVarIndex(index)
            setIsEditMode(true)
          }}
        />
      </div>
    )
  }

  const inlineRender = (varFile: TerragruntVarFileWrapper, index: number) => {
    const { type, identifier } = varFile.varFile
    return (
      <div className={css.configField} data-name={`edit-inline-${index}`}>
        <Layout.Horizontal>
          {type === getString('inline') && <Icon name="Inline" className={css.iconPosition} />}
          <Text className={css.branch}>{identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            /* istanbul ignore next */
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

  return (
    <Layout.Vertical>
      <Label style={{ color: Color.GREY_900 }} className={css.tfVarLabel}>
        {getString('optionalField', { name: getString('cd.terraformVarFiles') })}
      </Label>
      <div className={cx(stepCss.formGroup, css.tfVarMargin)}>
        <DragDropContext
          onDragEnd={(result: DropResult) => {
            if (!result.destination) {
              return
            }
            const res = Array.from(get(formik.values, 'spec.configuration.varFiles'))
            const [removed] = res.splice(result.source.index, 1)
            res.splice(result.destination.index, 0, removed)
            formik.setFieldValue('spec.configuration.varFiles', res)
          }}
        >
          <Droppable droppableId="droppable">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <FieldArray
                  name="spec.configuration.varFiles"
                  render={arrayHelpers => {
                    return (
                      <div>
                        {formik.values?.spec?.configuration?.varFiles?.map(
                          (varFile: TerragruntVarFileWrapper, index: number) => {
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
                                      {(formik.values.spec?.configuration?.varFiles || [])?.length > 1 && (
                                        <Text color={Color.BLACK}>{`${index + 1}.`}</Text>
                                      )}
                                      {varFile?.varFile?.type === TerraformStoreTypes.Remote &&
                                        remoteRender(varFile, index)}
                                      {varFile?.varFile?.type === TerraformStoreTypes.Inline &&
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
                          }
                        )}
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
                                icon={<Icon name="Inline" className={css.iconMargin} />}
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
                            onClose={() => {
                              onCloseOfRemoteWizard()
                            }}
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
                                  handleConnectorViewChange={() => setConnectorView(true)}
                                  setConnectorView={setConnectorView}
                                  isTerragrunt
                                />
                                {connectorView ? getNewConnectorSteps() : null}
                                {selectedConnector === 'Artifactory' ? (
                                  <TFArtifactoryForm
                                    isConfig={false}
                                    isTerraformPlan={false}
                                    allowableTypes={allowableTypes}
                                    name={getString('cd.varFileDetails')}
                                    onSubmitCallBack={(values: RemoteVar) => onSubmit(values, arrayHelpers)}
                                  />
                                ) : (
                                  <TFRemoteWizard
                                    name={getString('cd.varFileDetails')}
                                    onSubmitCallBack={(values: RemoteVar) => onSubmit(values, arrayHelpers)}
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
                            onClose={() => {
                              onCloseOfInlineVarForm()
                            }}
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
