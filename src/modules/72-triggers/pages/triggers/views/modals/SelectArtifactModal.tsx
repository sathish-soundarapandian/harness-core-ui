/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonVariation, Layout, ModalDialog, MultiTypeInputType } from '@wings-software/uicore'
import { defaultTo, get, isEmpty, merge } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { TriggerFormType } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import TriggerFactory from '@pipeline/factories/ArtifactTriggerInputFactory'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import ArtifactTableInfo from '../subviews/ArtifactTableInfo'
import {
  clearRuntimeInputValue,
  filterArtifact,
  getPathString,
  getTemplateObject,
  PRIMARY_ARTIFACT,
  replaceTriggerDefaultBuild,
  updatePipelineArtifact,
  updatePipelineManifest,
  getFilteredStage
} from '../../utils/TriggersWizardPageUtils'
import type { artifactManifestData } from '../../interface/TriggersWizardInterface'
import css from './SelectArtifactModal.module.scss'

const getFormComponent = (isManifest: boolean) => {
  if (isManifest) {
    const formDetails = TriggerFactory.getTriggerFormDetails(TriggerFormType.Manifest)
    return formDetails.component
  } else {
    const artifactForm = TriggerFactory.getTriggerFormDetails(TriggerFormType.Artifact)
    return artifactForm.component
  }
}

const getArtifactId = (isManifest: boolean, selectedArtifactId: string) => {
  if (isManifest || selectedArtifactId) {
    return selectedArtifactId
  } else if (!isManifest) {
    return PRIMARY_ARTIFACT
  }
  return ''
}

const getArtifactBasefactory = () => {
  const artifactForm = TriggerFactory.getTriggerFormDetails(TriggerFormType.Artifact)
  return artifactForm.baseFactory
}

const getManifesttBasefactory = () => {
  const manifestForm = TriggerFactory.getTriggerFormDetails(TriggerFormType.Manifest)
  return manifestForm.baseFactory
}

interface SelectArtifactModalPropsInterface {
  isModalOpen: boolean
  isManifest: boolean
  artifactTableData?: any
  formikProps: any
  closeModal: () => void
  runtimeData: any
}

enum ModalState {
  SELECT = 'SELECT',
  RUNTIME_INPUT = 'RUNTIME_INPUT'
}

const getManifests = (filterFormStages: any) => {
  return filterFormStages && filterFormStages.length
    ? filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests[0]
    : {}
}

const getArtifacts = (filterFormStages: any) => {
  if (!filterFormStages) {
    return {}
  }
  if (filterFormStages.length) {
    if (filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.sidecars?.length) {
      return filterFormStages && filterFormStages.length
        ? filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.sidecars[0]
        : {}
    } else if (filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.primary) {
      return filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.primary
    }
  }
  return {}
}

const mergeArtifactManifest = (isManifest: boolean, originalArtifact: any, formFilteredArtifact: any) => {
  if (isManifest) {
    return merge({}, originalArtifact, formFilteredArtifact)?.['manifest']
  } else if (!isManifest) {
    if (originalArtifact?.sidecars?.length && originalArtifact?.sidecars[0]?.sidecar) {
      return merge({}, originalArtifact?.sidecars[0]?.sidecar, formFilteredArtifact?.sidecar)
    } else if (originalArtifact?.primary) {
      return merge({}, originalArtifact.primary, formFilteredArtifact)
    }
  }
  return {}
}

/*isManifest: boolean, selectedStageId: string, selectedArtifactId: string, formikProps: any */
const onSubmit = ({
  isManifest,
  selectedStageId,
  selectedArtifactId,
  runtimeData,
  formikProps
}: {
  isManifest: boolean
  selectedStageId: string
  selectedArtifactId: string
  runtimeData: any
  formikProps: any
}): void => {
  const originalArtifact = filterArtifact({
    runtimeData,
    stageId: selectedStageId,
    artifactId: getArtifactId(isManifest, selectedArtifactId),
    isManifest
  })

  /*
              when we have multiple stages - need to filter undefined values
              in this case formikprops.values.stages will be [undefined, [stage obj]]
              when chartVersion alone is runtime input, stages array could be empty
  */
  const filterFormStages = formikProps?.values?.stages?.filter((item: any) => item)
  // when stages is empty array, filteredArtifact will be empty object
  const formFilteredArtifact = isManifest ? getManifests(filterFormStages) : getArtifacts(filterFormStages)
  const finalArtifact = mergeArtifactManifest(isManifest, originalArtifact, formFilteredArtifact)
  if (finalArtifact?.spec?.chartVersion && isManifest) {
    // hardcode manifest chart version to default
    finalArtifact.spec.chartVersion = replaceTriggerDefaultBuild({
      chartVersion: finalArtifact.spec.chartVersion
    })
  } else if (!isManifest && finalArtifact?.spec?.tag) {
    finalArtifact.spec.tag = replaceTriggerDefaultBuild({
      build: finalArtifact?.spec?.tag
    })
  } else if (!isManifest && finalArtifact?.spec?.build) {
    finalArtifact.spec.build = replaceTriggerDefaultBuild({
      build: finalArtifact?.spec?.build
    })
  } else if (!isManifest && finalArtifact?.spec?.artifactPath) {
    finalArtifact.spec.artifactPath = replaceTriggerDefaultBuild({
      artifactPath: finalArtifact?.spec?.artifactPath
    })
  }

  const selectedArtifact = clearRuntimeInputValue<artifactManifestData>(finalArtifact)
  const { pipeline } = formikProps.values
  const newPipelineObj = isManifest
    ? updatePipelineManifest({
        pipeline,
        stageIdentifier: selectedStageId,
        selectedArtifact,
        newArtifact: selectedArtifact
      })
    : updatePipelineArtifact({
        pipeline,
        stageIdentifier: selectedStageId,
        selectedArtifact,
        newArtifact: selectedArtifact
      })

  formikProps.setValues({
    ...formikProps.values,
    pipeline: newPipelineObj,
    selectedArtifact,
    stageId: selectedStageId
  })
}
const SelectArtifactModal: React.FC<SelectArtifactModalPropsInterface> = ({
  isModalOpen,
  formikProps,
  closeModal,
  isManifest,
  artifactTableData,
  runtimeData
}) => {
  const { values } = formikProps
  const [selectedArtifactLabel, setSelectedArtifactLabel] = useState(undefined) // artifactLabel is unique
  const [selectedStageId, setSelectedStageId] = useState(values?.stageId)
  const [selectedArtifactId, setSelectedArtifactId] = useState(values?.selectedArtifact?.identifier)
  const [modalState, setModalState] = useState<ModalState>(
    !isEmpty(values?.selectedArtifact) ? ModalState.RUNTIME_INPUT : ModalState.SELECT
  )

  const { getString } = useStrings()

  const closeAndReset = () => {
    closeModal()
    setSelectedArtifactId(undefined)
    setSelectedArtifactLabel(undefined)
    setSelectedStageId(undefined)
    setModalState(!isEmpty(values?.selectedArtifact) ? ModalState.RUNTIME_INPUT : ModalState.SELECT)
    if (isEmpty(values?.selectedArtifact || {}) && values?.stages) {
      // cancelling without applying should clear
      formikProps.setFieldValue('stages', undefined)
    }
  }

  const getSelectedArtifactId = () => {
    if (selectedArtifactId) {
      return selectedArtifactId
    } else if (
      values?.selectedArtifact &&
      Object.keys(values?.selectedArtifact).length &&
      !values?.selectedArtifact?.identifier
    ) {
      return PRIMARY_ARTIFACT
    }
    return ''
  }
  const FormComponent = getFormComponent(isManifest)
  const filteredArtifact = filterArtifact({
    runtimeData,
    stageId: selectedStageId,
    artifactId: getSelectedArtifactId(),
    isManifest
  })

  const templateObject = isManifest ? getTemplateObject(filteredArtifact, []) : getTemplateObject([], filteredArtifact)
  const artifactOrManifestText = isManifest
    ? getString('manifestsText')
    : getString('pipeline.artifactTriggerConfigPanel.artifact')

  const selectedStage = formikProps?.values?.originalPipeline?.stages
    ? getFilteredStage(formikProps?.values?.originalPipeline?.stages, selectedStageId)
    : undefined

  const artifacts = selectedStageId
    ? get(selectedStage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts')
    : templateObject?.artifacts

  const artifact = values?.selectedArtifact

  const formComponentProps = isManifest
    ? { manifestSourceBaseFactory: getManifesttBasefactory(), manifests: templateObject?.manifests }
    : {
        artifactSourceBaseFactory: getArtifactBasefactory(),
        type: defaultTo(templateObject?.artifacts?.primary?.type, ''),
        artifacts,
        artifact: isEmpty(artifact) ? undefined : artifact
      }

  return (
    <ModalDialog
      width={880}
      height={350}
      className={css.selectArtifactModal}
      enforceFocus={false}
      isOpen={isModalOpen}
      title={
        modalState === ModalState.SELECT
          ? isManifest
            ? getString('pipeline.artifactTriggerConfigPanel.selectAManifest')
            : getString('pipeline.artifactTriggerConfigPanel.selectAnArtifact')
          : getString('pipeline.artifactTriggerConfigPanel.configureArtifactRuntimeInputs', {
              artifact: artifactOrManifestText
            })
      }
      onClose={closeAndReset}
      footer={
        modalState === ModalState.SELECT ? (
          <Layout.Horizontal spacing="medium">
            <Button
              text={getString('select')}
              variation={ButtonVariation.PRIMARY}
              disabled={!selectedArtifactId}
              data-name="selectBtn"
              onClick={() => {
                setModalState(ModalState.RUNTIME_INPUT)
              }}
            />
            <Button variation={ButtonVariation.TERTIARY} onClick={closeAndReset} text={getString('cancel')} />
          </Layout.Horizontal>
        ) : (
          <Layout.Horizontal spacing="medium">
            {isEmpty(values?.selectedArtifact) && (
              <Button
                text={getString('back')}
                icon="chevron-left"
                variation={ButtonVariation.SECONDARY}
                minimal
                onClick={() => {
                  setModalState(ModalState.SELECT)
                }}
              />
            )}
            <Button
              text={getString('filters.apply')}
              variation={ButtonVariation.PRIMARY}
              onClick={() => {
                onSubmit({
                  isManifest,
                  selectedStageId,
                  selectedArtifactId,
                  formikProps,
                  runtimeData
                })
                closeModal()
              }}
            />
            <Button variation={ButtonVariation.TERTIARY} onClick={closeAndReset} text={getString('cancel')} />
          </Layout.Horizontal>
        )
      }
    >
      {modalState === ModalState.SELECT ? (
        <ArtifactTableInfo
          setSelectedArtifact={setSelectedArtifactId}
          selectedArtifact={selectedArtifactId}
          setSelectedStage={setSelectedStageId}
          selectedStage={selectedStageId}
          setSelectedArtifactLabel={setSelectedArtifactLabel}
          selectedArtifactLabel={selectedArtifactLabel}
          isManifest={isManifest}
          formikProps={formikProps}
          artifactTableData={artifactTableData}
        />
      ) : (
        <PipelineVariablesContextProvider pipeline={formikProps.values.originalPipeline}>
          <FormComponent
            template={templateObject}
            path={getPathString(runtimeData, selectedStageId)}
            initialValues={runtimeData}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            readonly={false}
            stageIdentifier={selectedStageId}
            formik={formikProps}
            fromTrigger={true}
            stepViewType={StepViewType.InputSet}
            {...formComponentProps}
          />
        </PipelineVariablesContextProvider>
      )}
    </ModalDialog>
  )
}

export default SelectArtifactModal
