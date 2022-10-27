/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, MouseEvent, useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { Button, ButtonVariation, Container, PageError } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { Feature, useGetAllSegments, useGetAllTargets } from 'services/cf'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { CFPipelineInstructionType, FeatureFlagConfigurationInstruction, FlagConfigurationStepData } from '../types'
import SubSectionSelector from './SubSectionSelector'
import RemoveSubSectionButton from './RemoveSubSectionButton'
import type { SubSectionProps } from './SubSection'

// sub-sections
import SetFlagSwitch, { SetFlagSwitchProps } from './subSections/SetFlagSwitch'
import DefaultRules, { DefaultRulesProps } from './subSections/DefaultRules'
import ServePercentageRollout, { ServePercentageRolloutProps } from './subSections/ServePercentageRollout'
import ServeVariationToIndividualTarget, {
  ServeVariationToIndividualTargetProps
} from './subSections/ServeVariationToIndividualTarget'
import ServeVariationToTargetGroup, {
  ServeVariationToTargetGroupProps
} from './subSections/ServeVariationToTargetGroup'

import subSectionCSS from './SubSection.module.scss'

export const allSubSections: SubSectionComponent[] = [
  SetFlagSwitch,
  DefaultRules,
  ServeVariationToIndividualTarget,
  ServeVariationToTargetGroup,
  ServePercentageRollout
]

export type SubSectionComponentProps = SubSectionProps &
  SetFlagSwitchProps &
  DefaultRulesProps &
  ServePercentageRolloutProps &
  ServeVariationToIndividualTargetProps &
  ServeVariationToTargetGroupProps
export type SubSectionComponent = FC<SubSectionComponentProps>

export interface FlagChangesFormProps {
  prefix: (fieldName: string) => string
  initialInstructions?: FeatureFlagConfigurationInstruction[]
  clearField: (fieldName: string) => void
  setField: (fieldName: string, value: unknown) => void
  fieldValues: FlagConfigurationStepData
  selectedFeature: Feature
  environmentIdentifier: string
}

const FlagChangesForm: FC<FlagChangesFormProps> = ({
  clearField,
  setField,
  prefix,
  fieldValues,
  initialInstructions,
  selectedFeature,
  environmentIdentifier
}) => {
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true)
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const queryParams = {
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier,
    pageSize: 1000
  }

  const {
    data: targetGroupsData,
    loading: loadingTargetGroups,
    error: errorTargetGroups,
    refetch: refetchTargetGroups
  } = useGetAllSegments({ queryParams, debounce: 250 })

  const {
    data: targetsData,
    loading: loadingTargets,
    error: errorTargets,
    refetch: refetchTargets
  } = useGetAllTargets({ queryParams, debounce: 250 })

  const loading = loadingTargetGroups || loadingTargets
  const error = errorTargetGroups || errorTargets

  const showLoading = useMemo<boolean>(() => {
    if (isInitialRender) {
      if (!error) {
        setIsInitialRender(loading)
      }
      return loading
    }

    return false
  }, [isInitialRender, error, loading])

  const prefixInstruction = (path: string, index: number): string => `spec.instructions[${index}].${path}`

  const [subSections, setSubSections] = useState<SubSectionComponent[]>(() => {
    if (!Array.isArray(initialInstructions) || initialInstructions.length === 0) {
      return [SetFlagSwitch]
    }

    return [
      ...new Set(
        initialInstructions.map(instruction => {
          switch (instruction.type) {
            case CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION:
            case CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION:
            case CFPipelineInstructionType.SET_DEFAULT_VARIATIONS:
              return DefaultRules
            case CFPipelineInstructionType.ADD_RULE:
              return ServePercentageRollout
            case CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP:
              return ServeVariationToIndividualTarget
            case CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP:
              return ServeVariationToTargetGroup
            case CFPipelineInstructionType.SET_FEATURE_FLAG_STATE:
            default:
              return SetFlagSwitch
          }
        })
      )
    ]
  })

  const clearInstruction = useCallback<(subSection: SubSectionComponent) => void>(
    subSection => {
      const index = subSections.indexOf(subSection)
      clearField(prefix(`spec.instructions[${index}]`))
    },
    [prefix, subSections, clearField]
  )

  const availableSubSections = useMemo<SubSectionComponent[]>(
    () => allSubSections.filter(section => !subSections.includes(section)),
    [subSections]
  )
  const { getString } = useStrings()

  const subSectionNameMap = useMemo<Map<SubSectionComponent, StringKeys>>(() => {
    const nameMap = new Map<SubSectionComponent, StringKeys>()
    nameMap.set(SetFlagSwitch, 'cf.pipeline.flagConfiguration.setFlagSwitch')
    nameMap.set(DefaultRules, 'cf.featureFlags.rules.defaultRules')
    nameMap.set(ServeVariationToIndividualTarget, 'cf.pipeline.flagConfiguration.serveVariationToIndividualTarget')
    nameMap.set(ServeVariationToTargetGroup, 'cf.pipeline.flagConfiguration.serveVariationToTargetGroup')
    nameMap.set(ServePercentageRollout, 'cf.pipeline.flagConfiguration.servePercentageRollout')

    return nameMap
  }, [])

  const handleConfigureMore = (e: MouseEvent): void => {
    e.preventDefault()
    const [newSubsection] = availableSubSections
    setSubSections([...subSections, newSubsection])
  }

  const removeSubSection = (subSection: SubSectionComponent): void => {
    const index = subSections.indexOf(subSection)

    const path = prefix('spec.instructions')
    const instructions = get(fieldValues, path)
    instructions.splice(index, 1)
    setField(path, instructions)

    const newSubSections = [...subSections]
    newSubSections.splice(index, 1)

    setSubSections(newSubSections)
  }

  const swapSubSection = (currentSubSection: SubSectionComponent, newSubSection: SubSectionComponent): void => {
    clearInstruction(currentSubSection)

    const newSubSections = [...subSections]
    newSubSections.splice(newSubSections.indexOf(currentSubSection), 1, newSubSection)

    setSubSections(newSubSections)
  }

  if (showLoading) {
    return (
      <Container className={subSectionCSS.loading} data-testid="flag-changes-form-loading">
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return (
      <Container className={subSectionCSS.subSection} padding="large" data-testid="flag-changes-form-error">
        <PageError
          message={getErrorMessage(error)}
          width={450}
          onClick={() => {
            refetchTargets()
            refetchTargetGroups()
          }}
        />
      </Container>
    )
  }

  return (
    <>
      {subSections.map((SubSection, index) => {
        const subSectionProps: SubSectionComponentProps = {
          subSectionSelector: (
            <SubSectionSelector
              subSectionNameMap={subSectionNameMap}
              availableSubSections={availableSubSections}
              currentSubSection={SubSection}
              onSubSectionChange={newSubSection => swapSubSection(SubSection, newSubSection)}
            />
          ),
          clearField: (fieldName: string) => clearField(prefixInstruction(fieldName, index)),
          setField: (fieldName, value) => setField(prefixInstruction(fieldName, index), value),
          fieldValues,
          prefix: (fieldName: string) => prefix(prefixInstruction(fieldName, index)),
          variations: selectedFeature.variations,
          targetGroups: targetGroupsData?.segments ?? [],
          targets: targetsData?.targets ?? []
        }

        if (subSections.length > 1) {
          subSectionProps.removeSubSectionButton = (
            <RemoveSubSectionButton onClick={() => removeSubSection(SubSection)} />
          )
        }

        return <SubSection key={SubSection.name} {...subSectionProps} />
      })}

      {!!availableSubSections.length && (
        <Button
          variation={ButtonVariation.LINK}
          text={getString('cf.pipeline.flagConfiguration.configureMore')}
          onClick={handleConfigureMore}
          style={{ alignSelf: 'flex-start', padding: 0 }}
        />
      )}
    </>
  )
}

export default FlagChangesForm
