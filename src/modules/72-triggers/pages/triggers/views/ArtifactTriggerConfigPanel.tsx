/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Layout, Text, Label, Container, HarnessDocTooltip, PageSpinner } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import { SelectArtifactModal } from './modals'
import ArtifactTableInfo from './subviews/ArtifactTableInfo'
import {
  parseArtifactsManifests,
  getArtifactTableDataFromData,
  getPathString,
  getArtifactSpecObj,
  updatePipelineManifest,
  updatePipelineArtifact,
  getArtifactId
} from '../utils/TriggersWizardPageUtils'
import type { artifactTableItem, artifactManifestData } from '../interface/TriggersWizardInterface'
import css from './ArtifactTriggerConfigPanel.module.scss'

export interface ArtifactTriggerConfigPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const artifactStr = 'pipeline.artifactTriggerConfigPanel.artifact'

const onRemoveSelectedArtifactManifest = ({
  isManifest,
  stageId,
  formikProps
}: {
  isManifest: boolean
  stageId: string
  formikProps: any
}) => {
  const { pipeline } = formikProps.values
  const newPipelineObj = isManifest
    ? updatePipelineManifest({
        pipeline,
        stageIdentifier: stageId,
        selectedArtifact: formikProps?.values?.selectedArtifact,
        newArtifact: {}
      })
    : updatePipelineArtifact({
        pipeline,
        stageIdentifier: stageId,
        selectedArtifact: formikProps?.values?.selectedArtifact,
        newArtifact: {}
      })
  formikProps.setValues({
    ...formikProps.values,
    pipeline: newPipelineObj,
    selectedArtifact: undefined,
    stageId: undefined,
    stages: undefined // clears all artifact runtime inputs
  })
  formikProps.setFieldTouched('selectedArtifact')
}

const onEdit = ({
  appliedArtifact,
  selectedArtifact,
  initialPath,
  isManifest,
  formikProps
}: {
  appliedArtifact: any
  selectedArtifact: any
  initialPath: string
  isManifest: boolean
  formikProps: any
}) => {
  const newAppliedArtifactSpecObj = getArtifactSpecObj({
    appliedArtifact,
    selectedArtifact,
    path: '',
    isManifest
  })
  if (isManifest) {
    formikProps.setFieldValue(`${initialPath}.manifests[0].manifest.spec`, newAppliedArtifactSpecObj)
  } else {
    if (appliedArtifact?.sidecar) {
      formikProps.setFieldValue(`${initialPath}.artifacts.sidecars[0].sidecar`, newAppliedArtifactSpecObj)
    } else {
      formikProps.setFieldValue(`${initialPath}.artifacts.primary`, newAppliedArtifactSpecObj)
    }
  }
}

const showAppliedTableArtifact = ({
  formikProps,
  appliedTableArtifact,
  isManifest,
  editModalOpen,
  setEditModalOpen,
  data,
  stageId
}: {
  formikProps: any
  appliedTableArtifact: any
  isManifest: boolean
  editModalOpen: boolean
  setEditModalOpen: any
  data: any
  stageId: string
}) => {
  return (
    <Container style={{ display: 'inline-block', width: '100%' }}>
      <ArtifactTableInfo
        formikProps={formikProps}
        appliedArtifact={appliedTableArtifact}
        isManifest={isManifest}
        editArtifact={() => setEditModalOpen(true)}
        removeArtifact={() =>
          onRemoveSelectedArtifactManifest({
            isManifest,
            formikProps,
            stageId
          })
        }
      />
      {editModalOpen && (
        <SelectArtifactModal
          isModalOpen={editModalOpen}
          formikProps={formikProps}
          closeModal={() => setEditModalOpen(false)}
          isManifest={isManifest}
          runtimeData={data}
        />
      )}
    </Container>
  )
}

const showAddArtifactManifest = ({
  isManifest,
  getString,
  allowSelectArtifact,
  setModalOpen,
  formikProps,
  modalOpen,
  artifactTableData,
  data
}: {
  isManifest: boolean
  getString: any
  allowSelectArtifact: boolean
  setModalOpen: any
  formikProps: any
  modalOpen: any
  artifactTableData: any
  data: any
}): JSX.Element => {
  const artifactOrManifestText = isManifest ? getString('manifestsText') : getString(artifactStr)
  return (
    <>
      <Label
        style={{
          fontSize: 13,
          color: 'var(--form-label)',
          fontWeight: 'normal',
          marginBottom: 'var(--spacing-small)'
        }}
        data-tooltip-id={'selectArtifactManifestLabel'}
      >
        {artifactOrManifestText}
        <HarnessDocTooltip tooltipId="selectArtifactManifestLabel" useStandAlone={true} />
      </Label>

      <Text
        data-name="plusAdd"
        style={{
          cursor: allowSelectArtifact ? 'pointer' : 'not-allowed',
          color: allowSelectArtifact ? 'var(--primary-7)' : 'var(--form-label)',
          width: '130px'
        }}
        onClick={() => {
          if (allowSelectArtifact) {
            setModalOpen(true)
            formikProps.setFieldTouched('selectedArtifact')
          }
        }}
      >
        {getString('pipeline.artifactTriggerConfigPanel.plusSelect', {
          artifact: artifactOrManifestText
        })}
      </Text>
      {allowSelectArtifact && (
        <SelectArtifactModal
          isModalOpen={modalOpen}
          formikProps={formikProps}
          artifactTableData={artifactTableData}
          closeModal={() => setModalOpen(false)}
          isManifest={isManifest}
          runtimeData={data}
        />
      )}
    </>
  )
}

const ArtifactTriggerConfigPanel: React.FC<ArtifactTriggerConfigPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}) => {
  const { artifactType, manifestType, stageId, inputSetTemplateYamlObj, resolvedPipeline, selectedArtifact } =
    formikProps.values
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
  const [parsedArtifactsManifests, setParsedArtifactsManifests] = useState<{
    appliedArtifact?: artifactManifestData
    data?: artifactManifestData[]
  }>({})
  // appliedArtifact is saved on the trigger or in formikValues vs. selectedArtifact is in the modal
  const [appliedTableArtifact, setAppliedTableArtifact] = useState<artifactTableItem[] | undefined>(undefined)
  const [artifactTableData, setArtifactTableData] = useState<artifactTableItem[] | undefined>(undefined)
  const { appliedArtifact, data } = parsedArtifactsManifests
  const { getString } = useStrings()
  const isManifest = !!manifestType
  const initialPath = data && stageId && getPathString(data, stageId)
  useEffect(() => {
    if (
      !formikProps.values?.stages &&
      initialPath &&
      appliedArtifact &&
      Object.entries(appliedArtifact).length &&
      selectedArtifact
    ) {
      // sets stages which is required to edit runtime input of selected artifact
      // when onEdit or from yaml switch
      onEdit({ appliedArtifact, selectedArtifact, initialPath, isManifest, formikProps })
    }
  }, [initialPath, appliedTableArtifact])

  useEffect(() => {
    if (inputSetTemplateYamlObj || selectedArtifact) {
      const res = parseArtifactsManifests({
        inputSetTemplateYamlObj,
        manifestType,
        stageId,
        artifactType,
        artifactRef: getArtifactId(isManifest, selectedArtifact?.identifier), // artifactRef will represent artifact or manifest
        isManifest
      })
      setParsedArtifactsManifests(res)
    }
  }, [inputSetTemplateYamlObj, selectedArtifact])

  useEffect(() => {
    if (!selectedArtifact) {
      setAppliedTableArtifact(undefined)
    }
    if ((appliedArtifact || data) && resolvedPipeline) {
      const { appliedTableArtifact: newAppliedTableArtifact, artifactTableData: newArtifactTableData } =
        getArtifactTableDataFromData({
          data,
          isManifest,
          appliedArtifact,
          stageId,
          getString,
          artifactType,
          pipeline: resolvedPipeline
        })
      if (newAppliedTableArtifact) {
        setAppliedTableArtifact(newAppliedTableArtifact)
      } else if (newArtifactTableData) {
        setArtifactTableData(newArtifactTableData)
      }
    }
  }, [appliedArtifact, data, resolvedPipeline, selectedArtifact])

  const loading = false
  const allowSelectArtifact = !!data?.length
  const artifactOrManifestText = isManifest ? getString('manifestsText') : getString(artifactStr)
  const { errors } = formikProps
  const getTooltipIds = (manifestTooltipIds: string, artifactTooltipIds: string): string => {
    return isManifest ? manifestTooltipIds : artifactTooltipIds
  }
  return (
    <Layout.Vertical className={css.artifactTriggerConfigContainer} padding="xxlarge">
      {loading && (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
      <Text
        className={css.formContentTitle}
        inline={true}
        tooltipProps={{ dataTooltipId: getTooltipIds('artifactManifestLabel', 'artifactLabel') }}
      >
        {getString('triggers.triggerConfigurationLabel')}
        {!isEdit
          ? `: ${getString('triggers.onNewArtifactTitle', {
              artifact: artifactOrManifestText
            })}`
          : ''}
      </Text>
      <div className={css.formContent}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
          tooltipProps={{
            dataTooltipId: 'artifactTrigger'
          }}
        />
      </div>
      <Text
        className={css.formContentTitle}
        inline={true}
        tooltipProps={{ dataTooltipId: getTooltipIds('listenOnNewArtifactManifest', 'listenNewArtifact') }}
      >
        {getString('pipeline.artifactTriggerConfigPanel.listenOnNewArtifact', {
          artifact: artifactOrManifestText
        })}
      </Text>
      <div className={css.formContent}>
        {appliedTableArtifact ? (
          showAppliedTableArtifact({
            formikProps,
            appliedTableArtifact,
            isManifest,
            editModalOpen,
            setEditModalOpen,
            data,
            stageId
          })
        ) : (
          <>
            {showAddArtifactManifest({
              isManifest,
              getString,
              allowSelectArtifact,
              setModalOpen,
              formikProps,
              modalOpen,
              artifactTableData,
              data
            })}
            {(formikProps.touched['selectedArtifact'] || formikProps.submitCount > 0) &&
              !modalOpen &&
              errors['selectedArtifact'] && (
                <Text color={Color.RED_500} style={{ marginBottom: 'var(--spacing-medium)' }}>
                  {errors['selectedArtifact']}
                </Text>
              )}
          </>
        )}
        {inputSetTemplateYamlObj && !appliedArtifact && !allowSelectArtifact && (
          <Text margin="small" intent="warning">
            {getString('pipeline.artifactTriggerConfigPanel.noSelectableArtifactsFound', {
              artifact: artifactOrManifestText
            })}
          </Text>
        )}
      </div>
    </Layout.Vertical>
  )
}
export default ArtifactTriggerConfigPanel
