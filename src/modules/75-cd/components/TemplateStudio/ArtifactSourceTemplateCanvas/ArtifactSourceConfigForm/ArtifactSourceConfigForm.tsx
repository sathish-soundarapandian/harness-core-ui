/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, noop } from 'lodash-es'
import { Container, Formik } from '@wings-software/uicore'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { useStrings } from 'framework/strings'
import type {
  ArtifactSourceConfigDetails,
  ArtifactSourceConfigFormData
} from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/types'
import { getValidationSchema } from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/ArtifactSourceConfigForm/ArtifactSourceConfigFormUtils'
import { ArtifactSourceSpecifications } from './ArtifactSourceSpecifications'
import css from './ArtifactSourceConfigForm.module.scss'

export interface ArtifactSourceConfigFormProps {
  artifactSourceConfigInitialValues: ArtifactSourceConfigDetails
  updateTemplate: (data: ArtifactSourceConfigFormData) => void
}

function ArtifactSourceConfigForm(props: ArtifactSourceConfigFormProps, formikRef: TemplateFormRef): JSX.Element {
  const { artifactSourceConfigInitialValues, updateTemplate } = props
  const ref = React.useRef<any | null>()
  const { getString } = useStrings()

  const getArtifactSourceConfigInitialValues = (): ArtifactSourceConfigFormData => {
    return {
      artifactType: artifactSourceConfigInitialValues?.type,
      artifactConfig: { spec: artifactSourceConfigInitialValues?.spec },
      connectorId: artifactSourceConfigInitialValues?.spec?.connectorRef
    }
  }

  /* istanbul ignore next */ React.useImperativeHandle(formikRef, () => ({
    resetForm() {
      return ref?.current?.resetForm()
    },
    submitForm() {
      return ref?.current?.submitForm()
    },
    getErrors() {
      return defaultTo(ref?.current.errors, {})
    }
  }))

  return (
    <Container className={css.artifactSourceConfigFormContainer}>
      <Formik
        formName="ArtifactSourceConfigForm"
        onSubmit={noop}
        initialValues={getArtifactSourceConfigInitialValues()}
        validationSchema={getValidationSchema(getString)}
        validate={updateTemplate}
      >
        {formik => {
          ref.current = formik
          return <ArtifactSourceSpecifications formik={formik} updateTemplate={updateTemplate} />
        }}
      </Formik>
    </Container>
  )
}

export const ArtifactSourceConfigFormWithRef = React.forwardRef(ArtifactSourceConfigForm)
