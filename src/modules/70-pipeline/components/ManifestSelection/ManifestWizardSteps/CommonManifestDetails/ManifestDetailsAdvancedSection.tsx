/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { Accordion, Layout, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { ManifestConfig } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { CommonManifestDataType } from '../../ManifestInterface'
import css from './CommonManifestDetails.module.scss'

interface ManifestDetailsAdvancedSectionProps {
  formik: FormikProps<CommonManifestDataType>
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  isReadonly?: boolean
}

export function ManifestDetailsAdvancedSection({
  formik,
  expressions,
  allowableTypes,
  initialValues,
  isReadonly = false
}: ManifestDetailsAdvancedSectionProps): React.ReactElement {
  const { getString } = useStrings()
  const isActiveAdvancedStep: boolean = initialValues?.spec?.skipResourceVersioning

  return (
    <Accordion activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''} className={css.advancedStepOpen}>
      <Accordion.Panel
        id={getString('advancedTitle')}
        addDomId={true}
        summary={getString('advancedTitle')}
        details={
          <Layout.Horizontal
            width={'50%'}
            flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
            margin={{ bottom: 'huge' }}
          >
            <FormMultiTypeCheckboxField
              name="skipResourceVersioning"
              label={getString('skipResourceVersion')}
              multiTypeTextbox={{ expressions, allowableTypes }}
              className={css.checkbox}
            />
            {getMultiTypeFromValue(formik.values?.skipResourceVersioning) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={(formik.values?.skipResourceVersioning || '') as string}
                type="String"
                variableName="skipResourceVersioning"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('skipResourceVersioning', value)}
                style={{ alignSelf: 'center', marginTop: 11 }}
                className={css.addmarginTop}
                isReadonly={isReadonly}
              />
            )}
          </Layout.Horizontal>
        }
      />
    </Accordion>
  )
}
