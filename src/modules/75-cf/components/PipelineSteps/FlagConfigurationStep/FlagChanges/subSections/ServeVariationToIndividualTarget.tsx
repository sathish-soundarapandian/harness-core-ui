/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo } from 'react'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { useFormikContext } from 'formik'
import { FormError } from '@harness/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { Target, Variation } from 'services/cf'
import type { FlagConfigurationStepFormDataValues } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection, { SubSectionProps } from '../SubSection'
import ServeVariationToItem from './ServeVariationToItem'
import { CFPipelineInstructionType } from '../../types'

export const serveVariationToIndividualTargetSchema = (getString: UseStringsReturn['getString']): Yup.Schema<any> =>
  Yup.object({
    spec: Yup.lazy<any>(spec => {
      if (!spec?.targets?.length || !spec?.variation) {
        return Yup.object({
          variation: Yup.string().required(
            getString('cf.featureFlags.flagPipeline.validation.serveVariationToIndividualTarget.variationTargets')
          )
        })
      }

      return Yup.object({
        variation: Yup.string(),
        targets: Yup.array().of(Yup.string())
      })
    })
  })

export interface ServeVariationToIndividualTargetProps extends SubSectionProps {
  setField: (fieldName: string, value: unknown) => void
  prefix: (fieldName: string) => string
  variations?: Variation[]
  targets?: Target[]
  fieldValues?: FlagConfigurationStepFormDataValues
}

const ServeVariationToIndividualTarget: FC<ServeVariationToIndividualTargetProps> = ({
  fieldValues = {},
  variations = [],
  targets = [],
  setField,
  prefix,
  ...props
}) => {
  const { getString } = useStrings()
  const { errors, isValid, touched } = useFormikContext()

  const selectedTargets = useMemo<Target[]>(() => {
    const selectedTargetIds = get(fieldValues, prefix('spec.targets'))

    if (!Array.isArray(targets) || !Array.isArray(selectedTargetIds) || selectedTargetIds.length === 0) {
      return []
    }

    return targets.filter(({ identifier }) => selectedTargetIds.includes(identifier))
  }, [targets, fieldValues])

  return (
    <SubSection data-testid="flagChanges-serveVariationToIndividualTarget" {...props}>
      {!isValid && errors && get(touched, prefix('identifier')) && get(errors, prefix('spec.variation')) && (
        <FormError
          name={prefix('spec.variation')}
          errorMessage={getString(
            'cf.featureFlags.flagPipeline.validation.serveVariationToIndividualTarget.variationTargets'
          )}
        />
      )}
      <ServeVariationToItem
        dialogTitle={getString('cf.pipeline.flagConfiguration.addEditVariationToSpecificTargets')}
        itemLabel={getString('cf.shared.targets')}
        itemPlaceholder={getString('cf.pipeline.flagConfiguration.enterTarget')}
        itemFieldName="targets"
        serveItemString={getString('cf.featureFlags.toTarget')}
        serveItemsString={getString('cf.pipeline.flagConfiguration.toTargets')}
        setField={setField}
        items={targets}
        selectedItems={selectedTargets}
        variations={variations}
        selectedVariationId={get(fieldValues, prefix('spec.variation'))}
        instructionType={CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP}
        instructionIdentifier="SetVariationForTarget"
      />
    </SubSection>
  )
}

export default ServeVariationToIndividualTarget
