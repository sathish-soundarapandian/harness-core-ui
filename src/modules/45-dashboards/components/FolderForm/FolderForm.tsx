/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Button, FormInput, Formik, FormikForm as Form, Heading, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { FolderModel } from 'services/custom-dashboards'
import css from '@dashboards/pages/home/HomePage.module.scss'

export interface FolderFormProps {
  loading?: boolean
  error?: string
  initialFolderData?: FolderModel
  onSubmit: (formData: FolderFormikValues) => void
}

export interface FolderFormikValues {
  name: string
}

const FolderForm: React.FC<FolderFormProps> = ({ onSubmit, error, initialFolderData, loading }) => {
  const { getString } = useStrings()

  const initialValues: FolderFormikValues = React.useMemo(() => {
    return {
      name: initialFolderData?.name || ''
    }
  }, [initialFolderData])

  return (
    <Layout.Vertical padding="xxlarge">
      <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ bottom: 'large' }}>
        {getString('dashboards.folderForm.stepOne')}
      </Heading>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        formName="folderForm"
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('dashboards.folderForm.folderNameValidation'))
        })}
        onSubmit={onSubmit}
      >
        {formik => (
          <Form className={css.formContainer}>
            <Layout.Vertical spacing="large">
              <FormInput.Text
                name="name"
                label={getString('name')}
                placeholder={getString('dashboards.folderForm.folderPlaceholder')}
              />

              <Button
                type="submit"
                intent="primary"
                width="150px"
                text={getString('continue')}
                disabled={loading || !(formik.isValid && formik.dirty)}
                className={css.button}
              />
              {error && <Text intent="danger">{error}</Text>}
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default FolderForm
