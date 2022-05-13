/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Spinner } from '@blueprintjs/core'
import {
  Button,
  ButtonVariation,
  Container,
  Dialog,
  Formik,
  FormikForm,
  getErrorInfoFromErrorObject,
  Layout,
  Page,
  useToaster
} from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { Segments, Target, useGetTargetAvailableSegments, usePatchTarget } from 'services/cf'
import { CF_DEFAULT_PAGE_SIZE, getErrorMessage } from '@cf/utils/CFUtils'
import type { Instruction } from '@cf/utils/instructions'
import {
  AddTargetToTargetGroupsDialogFormValues,
  AddTargetToTargetGroupsDialogStatus as STATUS
} from '@cf/pages/target-detail/TargetDetailPage.types'
import { NoData } from '@cf/components/NoData/NoData'
import imageUrl from '@cf/images/segment.svg'
import ListingWithSearchAndPagination from './ListingWithSearchAndPagination'

import css from './AddTargetToTargetGroupsDialog.module.scss'

export interface AddTargetToTargetGroupsDialogProps {
  target: Target
  modalTitle: string
  addButtonText: StringKeys
  instructionKind: Instruction['kind']
  hideModal: () => void
  onChange: () => void
}

const AddTargetToTargetGroupsDialog: FC<AddTargetToTargetGroupsDialogProps> = ({
  target,
  modalTitle,
  addButtonText,
  instructionKind,
  hideModal,
  onChange
}) => {
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [pageNumber, setPageNumber] = useState<number>(0)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { showError } = useToaster()

  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

  const {
    data: targetGroups,
    loading: loadingTargetGroups,
    error: targetGroupsError,
    refetch: refetchTargetGroups
  } = useGetTargetAvailableSegments({
    identifier: target.identifier,
    queryParams: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      environmentIdentifier: target.environment,
      sortByField: 'name',
      sortOrder: 'ASCENDING',
      pageNumber,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      segmentName: searchTerm
    }
  })

  const state = useMemo<STATUS>(() => {
    if (targetGroupsError) {
      return STATUS.error
    } else if (submitting) {
      return STATUS.submitting
    } else if (loadingTargetGroups) {
      return !searchTerm && !targetGroups ? STATUS.initialLoading : STATUS.loading
    } else if (targetGroups?.itemCount === 0) {
      return searchTerm ? STATUS.noSearchResults : STATUS.noTargetGroups
    }

    return STATUS.ok
  }, [loadingTargetGroups, searchTerm, submitting, targetGroups, targetGroupsError])

  const onSearch = useCallback((str: string) => {
    setSearchTerm(str.trim())
    setPageNumber(0)
  }, [])

  const { mutate: patchTarget } = usePatchTarget({
    identifier: target.identifier,
    queryParams: {
      environmentIdentifier: target.environment,
      projectIdentifier,
      accountIdentifier,
      orgIdentifier
    }
  })

  const onSubmit = useCallback(
    async (values: AddTargetToTargetGroupsDialogFormValues) => {
      if (state !== STATUS.submitting) {
        setSubmitting(true)

        const instructions: Instruction[] = [
          {
            kind: instructionKind,
            parameters: {
              segments: Object.keys(values.targetGroups)
            } as any
          }
        ]

        try {
          await patchTarget({ instructions })
          onChange()
          hideModal()
        } catch (e) {
          showError(getErrorInfoFromErrorObject(e))
        }

        setSubmitting(false)
      }
    },
    [hideModal, instructionKind, onChange, patchTarget, showError, state]
  )

  return (
    <Formik<AddTargetToTargetGroupsDialogFormValues>
      formName="AddTargetToTargetGroups"
      onSubmit={values => {
        onSubmit(values)
      }}
      initialValues={{ targetGroups: {} }}
    >
      {({ submitForm, values, setFieldValue }) => {
        const targetGroupCount = Object.values(values.targetGroups).filter(added => added).length

        return (
          <Dialog
            className={css.dialog}
            isOpen
            enforceFocus={false}
            title={modalTitle}
            onClose={hideModal}
            footer={
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  intent="primary"
                  onClick={submitForm}
                  disabled={!targetGroupCount || submitting}
                  text={getString(addButtonText, { count: targetGroupCount })}
                />
                <Button variation={ButtonVariation.TERTIARY} onClick={hideModal} text={getString('cancel')} />
                {submitting && (
                  <span data-testid="saving-spinner">
                    <Spinner size={24} />
                  </span>
                )}
              </Layout.Horizontal>
            }
          >
            <FormikForm disabled={submitting}>
              <Layout.Vertical className={css.body} spacing="small">
                {state === STATUS.error && (
                  <Page.Error
                    message={getErrorMessage(targetGroupsError)}
                    onClick={e => {
                      e.preventDefault()
                      refetchTargetGroups()
                    }}
                  />
                )}

                {state === STATUS.initialLoading && <ContainerSpinner flex={{ align: 'center-center' }} />}

                {state === STATUS.noTargetGroups && (
                  <Container height="100%" flex={{ align: 'center-center' }}>
                    <NoData imageURL={imageUrl} message={getString('cf.targetDetail.noTargetGroupsAvailable')} />
                  </Container>
                )}

                {[STATUS.ok, STATUS.loading, STATUS.noSearchResults, STATUS.submitting].includes(state) && (
                  <ListingWithSearchAndPagination
                    state={state}
                    targetGroups={targetGroups as Segments}
                    onSearch={onSearch}
                    setPageNumber={setPageNumber}
                    setFieldValue={setFieldValue}
                    values={values}
                  />
                )}
              </Layout.Vertical>
            </FormikForm>
          </Dialog>
        )
      }}
    </Formik>
  )
}

export default AddTargetToTargetGroupsDialog
