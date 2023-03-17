/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import { Accordion, Layout, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import cx from 'classnames'
import { isBoolean } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ManifestConfig } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { CommonManifestDataType, HarnessFileStoreDataType, ManifestTypes } from '../../ManifestInterface'
import { allowedManifestForDeclarativeRollback } from '../../Manifesthelper'
import css from './CommonManifestDetails.module.scss'

interface ManifestDetailsAdvancedSectionProps {
  formik: FormikProps<CommonManifestDataType> | FormikProps<HarnessFileStoreDataType>
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  isReadonly?: boolean
  selectedManifest?: ManifestTypes | null
}

export function ManifestDetailsAdvancedSection({
  formik,
  expressions,
  allowableTypes,
  initialValues,
  isReadonly = false,
  selectedManifest
}: ManifestDetailsAdvancedSectionProps): React.ReactElement {
  const { getString } = useStrings()
  const isActiveAdvancedStep: boolean = initialValues?.spec?.skipResourceVersioning
  const isSkipVersioningDisabled =
    isBoolean(formik?.values?.enableDeclarativeRollback) && !!formik?.values?.enableDeclarativeRollback

  return (
    <Accordion activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''} className={css.advancedStepOpen}>
      <Accordion.Panel
        id={getString('advancedTitle')}
        addDomId={true}
        summary={getString('advancedTitle')}
        details={
          <Layout.Vertical
            width={'50%'}
            flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
            margin={{ bottom: 'huge' }}
          >
            {allowedManifestForDeclarativeRollback(selectedManifest) && (
              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                margin={{ bottom: 'small' }}
                width={'100%'}
              >
                <FormMultiTypeCheckboxField
                  name="enableDeclarativeRollback"
                  label={getString('pipeline.manifestType.enableDeclarativeRollback')}
                  multiTypeTextbox={{ expressions, allowableTypes }}
                  className={cx(css.checkbox, css.marginTop)}
                />
                {getMultiTypeFromValue(formik.values?.enableDeclarativeRollback) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={(formik.values?.enableDeclarativeRollback || '') as string}
                    type="String"
                    variableName="enableDeclarativeRollback"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik.setFieldValue('enableDeclarativeRollback', value)}
                    style={{ alignSelf: 'center', marginTop: 11 }}
                    className={css.addmarginTop}
                    isReadonly={isReadonly}
                  />
                )}
              </Layout.Horizontal>
            )}
            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }} width={'100%'}>
              <FormMultiTypeCheckboxField
                key={isSkipVersioningDisabled.toString()}
                name="skipResourceVersioning"
                label={getString('skipResourceVersion')}
                multiTypeTextbox={{ expressions, allowableTypes, disabled: isSkipVersioningDisabled }}
                className={css.checkbox}
                disabled={isSkipVersioningDisabled}
              />
              {getMultiTypeFromValue(formik.values?.skipResourceVersioning) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={(formik.values?.skipResourceVersioning || '') as string}
                  type="String"
                  variableName="skipResourceVersioning"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={value => formik.setFieldValue('skipResourceVersioning', value)}
                  style={{ alignSelf: 'center', marginTop: 11 }}
                  className={css.addmarginTop}
                  isReadonly={isReadonly}
                />
              )}
            </Layout.Horizontal>
          </Layout.Vertical>
        }
      />
    </Accordion>
  )
}
