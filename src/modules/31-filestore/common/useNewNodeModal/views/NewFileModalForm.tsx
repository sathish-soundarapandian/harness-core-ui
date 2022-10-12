/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  Container,
  Formik,
  FormikForm as Form,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Layout,
  FormInput
} from '@harness/uicore'
import * as Yup from 'yup'

import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'

import { useToaster } from '@common/components'

import { useStrings } from 'framework/strings'
import { IdentifierSchema } from '@common/utils/Validation'
import { FooterRenderer } from '@filestore/common/ModalComponents/ModalComponents'
import { NGTag, useCreate, useUpdate } from 'services/cd-ng'
import { getFileUsageNameByType, prepareFileValues } from '@filestore/utils/FileStoreUtils'
import { FileStoreNodeTypes, FileUsage, NewFileDTO, NewFileFormDTO } from '@filestore/interfaces/FileStore'
import type { FileStoreContextState, FileStoreNodeDTO } from '@filestore/components/FileStoreContext/FileStoreContext'
import { FILE_STORE_ROOT, SEARCH_FILES } from '@filestore/utils/constants'
import css from '../useNewNodeModal.module.scss'

interface NewFileModalData {
  data?: NewFileDTO
  editMode?: boolean
  onSubmit?: (resourceGroup: NewFileDTO) => void
  close: () => void
  parentIdentifier: string
  tempNode?: FileStoreNodeDTO | undefined
  currentNode: FileStoreNodeDTO
  fileStoreContext: FileStoreContextState
  notCurrentNode?: boolean
}

export const getTags = (tags?: NGTag[]) => {
  const result = {} as any

  tags?.forEach(tag => {
    if (!tag.key) {
      return
    } else {
      result[tag.key] = tag.value
    }
  })

  return result
}

const NewFileForm: React.FC<NewFileModalData> = props => {
  const { close, editMode = false, tempNode, fileStoreContext, currentNode, notCurrentNode } = props
  const { updateCurrentNode, removeFromTempNodes, getNode, queryParams, setUnsavedNodes, fileUsage } = fileStoreContext
  const [initialValues, setInitialValues] = useState<Omit<NewFileDTO, 'type'>>({
    name: '',
    description: '',
    identifier: '',
    fileUsage: fileUsage ?? null,
    content: '',
    tags: []
  })

  useEffect(() => {
    if (currentNode && editMode) {
      setInitialValues({
        name: currentNode.name,
        description: currentNode?.description || '',
        identifier: currentNode.identifier,
        fileUsage: currentNode.fileUsage as string,
        content: currentNode?.content || '',
        tags: getTags(currentNode.tags)
      })
    }
  }, [currentNode])

  const { mutate: createFile, loading: createLoading } = useCreate({
    queryParams
  })
  const { mutate: updateNode, loading: updateLoading } = useUpdate({
    identifier: currentNode.identifier,
    queryParams
  })

  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const handleSubmit = async (values: any): Promise<void> => {
    const data = prepareFileValues(values, currentNode, notCurrentNode)

    try {
      if (!tempNode && editMode) {
        const { data: updateResponse, status } = await updateNode(data as any)

        if (status === 'SUCCESS' && updateResponse) {
          showSuccess(getString('filestore.fileSuccessSaved', { name: values.name }))
          updateCurrentNode({
            ...currentNode,
            ...(updateResponse as FileStoreNodeDTO),
            initialContent: currentNode?.content ? currentNode.content : undefined
          })
          close()
        }
      } else {
        const response = await createFile(data as any)
        if (response.status === 'SUCCESS') {
          if (tempNode) {
            showSuccess(getString('filestore.fileSuccessCreated', { name: values.name }))
            removeFromTempNodes(currentNode.identifier)

            getNode(
              {
                identifier: currentNode.parentIdentifier || FILE_STORE_ROOT,
                name: currentNode?.parentName ? currentNode.parentName : '',
                type: FileStoreNodeTypes.FOLDER
              },
              {
                setNewCurrentNode: true,
                type: FileStoreNodeTypes.FILE,
                identifier: values.identifier,
                parentName: currentNode.parentName || ''
              }
            )
            close()
          } else {
            try {
              if (currentNode?.type === FileStoreNodeTypes.FILE) {
                getNode(
                  {
                    identifier: currentNode.parentIdentifier || '',
                    name: currentNode.parentName || '',
                    type: FileStoreNodeTypes.FOLDER
                  },
                  {
                    setNewCurrentNode: true,
                    type: FileStoreNodeTypes.FILE,
                    identifier: values.identifier,
                    parentName: currentNode.parentName
                  }
                )
                showSuccess(getString('filestore.fileSuccessCreated', { name: values.name }))
                close()
                return
              }
              getNode(
                {
                  identifier: currentNode.identifier !== SEARCH_FILES ? currentNode.identifier : FILE_STORE_ROOT,
                  name: currentNode.name !== SEARCH_FILES ? currentNode.name : FILE_STORE_ROOT,
                  type: FileStoreNodeTypes.FOLDER
                },
                {
                  setNewCurrentNode: true,
                  type: FileStoreNodeTypes.FILE,
                  identifier: values.identifier,
                  parentName: currentNode.name
                }
              )
              showSuccess(getString('filestore.fileSuccessCreated', { name: values.name }))
              close()
            } catch (e) {
              modalErrorHandler?.showDanger(e.data.message)
            }
          }
        }
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e.data.message)
    } finally {
      setUnsavedNodes([])
    }
  }

  const fileUsageItems = React.useMemo(() => {
    if (fileUsage) {
      return [
        {
          label: getFileUsageNameByType(fileUsage),
          value: fileUsage
        }
      ]
    }
    return Object.values(FileUsage).map((fs: FileUsage) => ({
      label: getFileUsageNameByType(fs),
      value: fs
    }))
  }, [fileUsage])

  return (
    <Formik<NewFileFormDTO>
      enableReinitialize
      initialValues={initialValues}
      formName="newFile"
      validationSchema={Yup.object().shape({
        identifier: IdentifierSchema()
      })}
      onSubmit={values => {
        modalErrorHandler?.hide()
        handleSubmit(values)
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Layout.Vertical style={{ justifyContent: 'space-between' }} height="100%">
              <Container>
                <ModalErrorHandler bind={setModalErrorHandler} />
                <NameIdDescriptionTags
                  formikProps={formikProps}
                  identifierProps={{
                    isIdentifierEditable: !editMode || !!tempNode
                  }}
                />
                <FormInput.Select
                  className={css.fileUsage}
                  value={
                    formikProps?.values?.fileUsage
                      ? {
                          label: getFileUsageNameByType(formikProps?.values?.fileUsage as FileUsage),
                          value: formikProps?.values?.fileUsage
                        }
                      : null
                  }
                  items={fileUsageItems}
                  name="fileUsage"
                  label={getString('filestore.view.fileUsage')}
                  onChange={e => {
                    fileStoreContext?.updateCurrentNode({
                      ...fileStoreContext.currentNode,
                      fileUsage: e.value as FileUsage
                    })
                  }}
                  usePortal
                />
              </Container>
              <FooterRenderer
                type="submit"
                onCancel={close}
                confirmText={editMode ? getString('save') : getString('create')}
                cancelText={getString('cancel')}
                loading={(editMode ? updateLoading : createLoading) || (tempNode && createLoading)}
              />
            </Layout.Vertical>
          </Form>
        )
      }}
    </Formik>
  )
}

export default NewFileForm
