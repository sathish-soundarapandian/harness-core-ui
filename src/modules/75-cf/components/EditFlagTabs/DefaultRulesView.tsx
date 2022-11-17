/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Heading, Layout, SelectOption, Text } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { FontVariation } from '@harness/design-system'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import { useStrings } from 'framework/strings'
import type { Variation } from 'services/cf'
import { CFVariationColors } from '@cf/constants'
import { VariationWithIcon } from '../VariationWithIcon/VariationWithIcon'
import type { FlagActivationFormValues } from '../FlagActivation/FlagActivation'

import css from './DefaultRulesView.module.scss'

export interface DefaultRulesViewProps {
  editing: boolean
  variations: Variation[]
  formikProps: FormikProps<FlagActivationFormValues>
}

export const DefaultRulesView: React.FC<DefaultRulesViewProps> = ({ editing, variations, formikProps }) => {
  const { getString } = useStrings()

  const variationItems = variations.map<SelectOption>((elem, index) => ({
    label: elem.name || elem.identifier,
    value: elem.identifier,
    icon: { name: 'full-circle', style: { color: CFVariationColors[index] } }
  }))

  const onVariationIndex = variations.findIndex(variation => formikProps.values.onVariation === variation.identifier)
  const offVariationIndex = variations.findIndex(variation => formikProps.values.offVariation === variation.identifier)

  return (
    <>
      <Heading level={3} font={{ variation: FontVariation.H6 }}>
        <StringWithTooltip stringId="cf.featureFlags.rules.defaultRules" tooltipId="ff_ffDefaultRules_heading" />
      </Heading>

      <div className={css.rules}>
        <Text>
          <span dangerouslySetInnerHTML={{ __html: getString('cf.featureFlags.ifFlagOnServe') }} />
        </Text>
        {editing ? (
          <FormInput.Select inline name="onVariation" items={variationItems} />
        ) : (
          <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
            <VariationWithIcon
              variation={variations[onVariationIndex]}
              index={onVariationIndex}
              textStyle={{ fontWeight: 600 }}
            />
          </Layout.Horizontal>
        )}

        <Text>
          <span dangerouslySetInnerHTML={{ __html: getString('cf.featureFlags.ifFlagOffServe') }} />
        </Text>
        {editing ? (
          <FormInput.Select inline name="offVariation" items={variationItems} onChange={formikProps.handleChange} />
        ) : (
          <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
            <VariationWithIcon
              variation={variations[offVariationIndex]}
              index={offVariationIndex}
              textStyle={{ fontWeight: 600 }}
            />
          </Layout.Horizontal>
        )}
      </div>
    </>
  )
}
