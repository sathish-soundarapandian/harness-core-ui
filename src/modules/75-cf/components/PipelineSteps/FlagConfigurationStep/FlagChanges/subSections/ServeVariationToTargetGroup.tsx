/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo } from 'react'
import { get } from 'lodash-es'
import * as Yup from 'yup'
import { useFormikContext } from 'formik'
import { FormError } from '@harness/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { Segment, Variation } from 'services/cf'
import type { FlagConfigurationStepFormDataValues } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection, { SubSectionProps } from '../SubSection'
import ServeVariationToItem from './ServeVariationToItem'
import { CFPipelineInstructionType } from '../../types'

export const serveVariationToTargetGroupSchema = (getString: UseStringsReturn['getString']): Yup.Schema<any> =>
  Yup.object({
    spec: Yup.lazy<any>(spec => {
      if (!spec?.segments?.length || !spec?.variation) {
        return Yup.object({
          variation: Yup.string().required(
            getString('cf.featureFlags.flagPipeline.validation.serveVariationToTargetGroup.variationTargetGroups')
          )
        })
      }

      return Yup.object({
        variation: Yup.string(),
        segments: Yup.array().of(Yup.string())
      })
    })
  })

export interface ServeVariationToTargetGroupProps extends SubSectionProps {
  setField: (fieldName: string, value: unknown) => void
  prefix: (fieldName: string) => string
  variations?: Variation[]
  targetGroups?: Segment[]
  fieldValues?: FlagConfigurationStepFormDataValues
}

const ServeVariationToTargetGroup: FC<ServeVariationToTargetGroupProps> = ({
  fieldValues = {},
  variations = [],
  targetGroups = [],
  setField,
  prefix,
  ...props
}) => {
  const { getString } = useStrings()
  const { errors, isValid, touched } = useFormikContext()

  const selectedTargetGroups = useMemo<Segment[]>(() => {
    const selectedTargetGroupIds = get(fieldValues, prefix('spec.segments'))

    if (!Array.isArray(targetGroups) || !Array.isArray(selectedTargetGroupIds) || selectedTargetGroupIds.length === 0) {
      return []
    }

    return targetGroups.filter(({ identifier }) => selectedTargetGroupIds.includes(identifier))
  }, [targetGroups, fieldValues])

  return (
    <SubSection data-testid="flagChanges-serveVariationToTargetGroup" {...props}>
      {!isValid && errors && get(touched, prefix('identifier')) && get(errors, prefix('spec.variation')) && (
        <FormError
          name={prefix('spec.variation')}
          errorMessage={getString(
            'cf.featureFlags.flagPipeline.validation.serveVariationToTargetGroup.variationTargetGroups'
          )}
        />
      )}
      <ServeVariationToItem
        dialogTitle={getString('cf.pipeline.flagConfiguration.addEditVariationToTargetGroups')}
        itemLabel={getString('cf.shared.segments')}
        itemPlaceholder={getString('cf.pipeline.flagConfiguration.enterTargetGroup')}
        itemFieldName="segments"
        serveItemString={getString('cf.pipeline.flagConfiguration.toTargetGroup')}
        serveItemsString={getString('cf.pipeline.flagConfiguration.toTargetGroups')}
        setField={setField}
        items={targetGroups}
        selectedItems={selectedTargetGroups}
        variations={variations}
        selectedVariationId={get(fieldValues, prefix('spec.variation'))}
        instructionType={CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP}
        instructionIdentifier="SetVariationForGroup"
      />
    </SubSection>
  )
}

export default ServeVariationToTargetGroup
