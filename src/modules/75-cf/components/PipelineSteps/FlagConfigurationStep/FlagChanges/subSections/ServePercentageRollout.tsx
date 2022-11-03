/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useState } from 'react'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { useFormikContext } from 'formik'
import { FormError } from '@harness/uicore'
import type { Segment, Variation } from 'services/cf'
import PercentageRollout from '@cf/components/PercentageRollout/PercentageRollout'
import type { UseStringsReturn } from 'framework/strings'
import { useStrings } from 'framework/strings'
import SubSection, { SubSectionProps } from '../SubSection'
import { CFPipelineInstructionType, FlagConfigurationStepFormDataValues } from '../../types'

export const servePercentageRolloutSchema = (getString: UseStringsReturn['getString']): Yup.Schema<any> =>
  Yup.object({
    spec: Yup.object({
      distribution: Yup.object({
        clauses: Yup.array()
          .default([{ values: [''] }])
          .of(
            Yup.object({
              values: Yup.array()
                .default([''])
                .of(
                  Yup.string()
                    .trim()
                    .min(1, getString('cf.featureFlags.flagPipeline.validation.servePercentageRollout.targetGroup'))
                )
            })
          ),
        variations: Yup.array().test(
          'invalidTotalError',
          getString('cf.percentageRollout.invalidTotalError'),
          (variations: { weight: number }[] = []) =>
            variations.map(({ weight = 0 }) => weight).reduce((total, weight) => total + weight, 0) === 100
        )
      })
    })
  })

export interface ServePercentageRolloutProps extends SubSectionProps {
  targetGroups?: Segment[]
  variations?: Variation[]
  fieldValues?: FlagConfigurationStepFormDataValues
  clearField: (fieldName: string) => void
  setField: (fieldName: string, value: unknown) => void
  prefix: (fieldName: string) => string
}

const ServePercentageRollout: FC<ServePercentageRolloutProps> = ({
  variations = [],
  targetGroups = [],
  fieldValues,
  clearField,
  setField,
  prefix,
  ...props
}) => {
  const [initialLoad, setInitialLoad] = useState<boolean>(true)
  const { touched, errors, isValid } = useFormikContext()
  const { getString } = useStrings()

  useEffect(() => {
    setField('identifier', 'AddRuleIdentifier')
    setField('type', CFPipelineInstructionType.ADD_RULE)
    setField('spec.priority', 100)
    setField('spec.distribution.bucketBy', 'identifier')
    setField('spec.distribution.clauses[0].op', 'segmentMatch')
    setField('spec.distribution.clauses[0].attribute', '')
  }, [])

  useEffect(() => {
    if (!initialLoad) {
      clearField('spec.distribution.variations')
    }

    variations.forEach(({ identifier }, index) => {
      setField(`spec.distribution.variations[${index}].variation`, identifier)

      if (!initialLoad) {
        setField(`spec.distribution.variations[${index}].weight`, Math.floor(100 / variations?.length || 1))
      }
    })

    if (!initialLoad && variations?.length % 2) {
      setField(
        `spec.distribution.variations[${variations?.length - 1}].weight`,
        Math.ceil(100 / variations?.length || 1)
      )
    }
    setInitialLoad(false)
  }, [variations, setInitialLoad])

  return (
    <SubSection data-testid="flagChanges-servePercentageRollout" {...props}>
      <PercentageRollout
        targetGroups={targetGroups}
        variations={variations}
        fieldValues={get(fieldValues, prefix('spec.distribution'))}
        prefix={(fieldName: string) => prefix(`spec.distribution.${fieldName}`)}
        hideOverError
      />

      {!isValid &&
        errors &&
        get(touched, prefix('identifier')) &&
        get(errors, prefix('spec.distribution.variations')) && (
          <FormError
            name={prefix('spec.distribution.variations')}
            errorMessage={getString('cf.percentageRollout.invalidTotalError')}
          />
        )}
    </SubSection>
  )
}

export default ServePercentageRollout
