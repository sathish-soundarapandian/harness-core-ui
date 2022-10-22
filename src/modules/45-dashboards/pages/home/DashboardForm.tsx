/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm as Form,
  FormInput,
  Heading,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  SelectOption
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import type { FolderModel } from 'services/custom-dashboards'
import { useStrings } from 'framework/strings'
import type { DashboardPathProps } from '@common/interfaces/RouteInterfaces'
import css from './HomePage.module.scss'

const TAGS_SEPARATOR = ','

export interface DashboardFormProps {
  editableFolders: FolderModel[]
  formData?: DashboardFormRequestProps
  title: string
  loading: boolean
  onComplete: (data: DashboardFormRequestProps) => void
  setModalErrorHandler: (modalErrorHandler: ModalErrorHandlerBinding) => void
  mode: 'CREATE' | 'EDIT' | 'CLONE'
}

export interface DashboardFormRequestProps {
  description?: string
  folderId: string
  name: string
}

export interface DashboardFormikValues {
  description: string[]
  folderId: string
  name: string
}

const DashboardForm: React.FC<DashboardFormProps> = ({
  editableFolders,
  formData,
  title,
  loading,
  onComplete,
  setModalErrorHandler,
  mode
}) => {
  const { getString } = useStrings()
  const { folderId } = useParams<DashboardPathProps>()

  const folderListItems = React.useMemo(() => {
    return editableFolders.map((folder: FolderModel): SelectOption => ({ value: folder?.id, label: folder?.name }))
  }, [editableFolders])

  const initialValues: DashboardFormikValues = React.useMemo(() => {
    const initialFolderId = formData?.folderId || folderId
    const firstEditableFolder = editableFolders[0]?.id || initialFolderId
    const destinationFolderId = mode === 'EDIT' ? initialFolderId : firstEditableFolder
    return {
      folderId: destinationFolderId,
      name: formData?.name || '',
      description: formData?.description?.split(TAGS_SEPARATOR) || []
    }
  }, [editableFolders, folderId, folderListItems, formData?.description, formData?.folderId, formData?.name])

  return (
    <Layout.Vertical padding="xxlarge" spacing="large">
      <Heading level={3} font={{ variation: FontVariation.H3 }}>
        {title}
      </Heading>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<DashboardFormikValues>
        initialValues={initialValues}
        enableReinitialize
        formName="dashboardForm"
        validationSchema={Yup.object().shape({
          folderId: Yup.string().trim().required(getString('dashboards.folderForm.folderNameValidation')),
          name: Yup.string().trim().required(getString('dashboards.createModal.nameValidation'))
        })}
        onSubmit={completedFormData => {
          onComplete({
            ...completedFormData,
            description: completedFormData.description?.join(TAGS_SEPARATOR) || ''
          })
        }}
      >
        <Form className={css.formContainer}>
          <Layout.Vertical spacing="large">
            <FormInput.Select
              name="folderId"
              items={folderListItems}
              label={getString('dashboards.homePage.folder')}
              placeholder={getString('dashboards.resourceModal.folders')}
            />
            <FormInput.Text
              name="name"
              label={getString('name')}
              placeholder={getString('dashboards.createModal.namePlaceholder')}
            />
            <FormInput.KVTagInput name="description" label={getString('tagsLabel')} isArray={true} />
            <Button
              className={css.button}
              disabled={loading}
              intent="primary"
              text={getString('continue')}
              type="submit"
              variation={ButtonVariation.PRIMARY}
            />
          </Layout.Vertical>
        </Form>
      </Formik>
    </Layout.Vertical>
  )
}

export default DashboardForm
