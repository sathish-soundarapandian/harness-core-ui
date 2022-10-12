/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dialog, Intent } from '@blueprintjs/core'
import * as yup from 'yup'
import {
  Button,
  Text,
  ButtonProps,
  Container,
  TextInput,
  Layout,
  FlexExpander,
  Icon,
  Pagination,
  PageError,
  Formik,
  FormikForm,
  Heading
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { CF_DEFAULT_PAGE_SIZE, getErrorMessage, SegmentsSortByField, SortOrder } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import { Feature, useGetAllFeatures } from 'services/cf'
import { useToaster } from '@common/exports'

import { GIT_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import type { GitSyncFormValues, UseGitSync } from '@cf/hooks/useGitSync'
import { FeatureFlagRow } from './FeatureFlagRow'
import { NoDataFoundRow } from '../NoDataFoundRow/NoDataFoundRow'
import SaveFlagToGitSubForm from '../SaveFlagToGitSubForm/SaveFlagToGitSubForm'
import AddToFlagButton from './add-to-flag-button/AddToFlagButton'

import css from './SelectFeatureFlagsModalButton.module.scss'

export interface SelectedFeatureFlag {
  feature: Feature
  variationIdentifier: string
}

export interface SelectFeatureFlagsModalButtonProps extends Omit<ButtonProps, 'onClick' | 'onSubmit'> {
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
  environmentIdentifier: string
  targetIdentifier?: string

  modalTitle: string
  submitButtonTitle?: string
  cancelButtonTitle?: string

  gitSync: UseGitSync

  shouldDisableItem: (feature: Feature) => boolean
  onSubmit: (
    selectedFeatureFlags: SelectedFeatureFlag[],
    gitDetails?: GitSyncFormValues
  ) => Promise<{ error: any } | any>
}

export const SelectFeatureFlagsModalButton: React.FC<SelectFeatureFlagsModalButtonProps> = ({
  accountIdentifier,
  orgIdentifier,
  projectIdentifier,
  targetIdentifier,
  environmentIdentifier,
  modalTitle,
  submitButtonTitle,
  cancelButtonTitle,
  gitSync,
  onSubmit,
  shouldDisableItem,
  ...props
}) => {
  const ModalComponent: React.FC = () => {
    const { getString } = useStrings()
    const { showError } = useToaster()
    const [queryString, setQueryString] = useState('')
    const [sortOrder, setSortOrder] = useState(SortOrder.ASCENDING)
    const [sortByField] = useState(SegmentsSortByField.NAME)
    const [pageNumber, setPageNumber] = useState(0)

    const gitSyncFormMeta = gitSync?.getGitSyncFormMeta(GIT_COMMIT_MESSAGES.UPDATED_FLAG_TARGETS)

    const queryParams = useMemo(
      () => ({
        accountIdentifier,
        orgIdentifier,
        projectIdentifier,
        environmentIdentifier,
        name: queryString,
        sortOrder,
        sortByField,
        pageNumber,
        pageSize: CF_DEFAULT_PAGE_SIZE
      }),
      [queryString, sortOrder, sortByField, pageNumber]
    )
    const {
      data,
      loading: loadingSegments,
      error,
      refetch
    } = useGetAllFeatures({
      queryParams,
      lazy: true
    })
    const [checkedFeatureFlags, setCheckedFeatureFlags] = useState<Record<string, SelectedFeatureFlag>>({})

    const checkOrUncheckSegment = useCallback(
      (checked: boolean, feature: Feature, variationIdentifier: string) => {
        if (checked) {
          checkedFeatureFlags[feature.identifier] = {
            feature,
            variationIdentifier
          }
        } else {
          delete checkedFeatureFlags[feature.identifier]
        }
        setCheckedFeatureFlags({ ...checkedFeatureFlags })
      },
      [checkedFeatureFlags, setCheckedFeatureFlags]
    )
    const selectedCounter = Object.keys(checkedFeatureFlags || {}).length

    const [submitLoading, setSubmitLoading] = useState(false)
    const handleSubmit = (gitFormValues?: GitSyncFormValues): void => {
      setSubmitLoading(true)
      try {
        onSubmit(Object.values(checkedFeatureFlags), gitFormValues)
          .then(async () => {
            if (!gitSync?.isAutoCommitEnabled && gitFormValues?.autoCommit) {
              await gitSync?.handleAutoCommit(gitFormValues.autoCommit)
            }

            hideModal()
          })
          .catch(_error => {
            showError(getErrorMessage(_error), 0, 'cf.save.ff.error')
          })
          .finally(() => {
            setSubmitLoading(false)
          })
      } catch (exception) {
        setSubmitLoading(false)
        showError(getErrorMessage(error), 0, 'cf.save.ff.error')
      }
    }

    useEffect(() => {
      refetch()
    }, [queryString, sortOrder, sortByField, pageNumber]) // eslint-disable-line react-hooks/exhaustive-deps

    const loading = loadingSegments || submitLoading

    return (
      <Dialog isOpen enforceFocus={false} onClose={hideModal} title={''} style={{ width: 700, maxHeight: '95vh' }}>
        <Layout.Vertical
          padding={{ left: 'xxlarge' }}
          style={{ height: '100%' }}
          data-testid="add-target-to-flag-modal"
        >
          {/* Search Input */}
          <Heading level={3} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xlarge' }}>
            {modalTitle}
          </Heading>
          <Container padding={{ right: 'xxlarge', bottom: 'large' }}>
            <TextInput
              leftIcon="search"
              width="100%"
              placeholder={getString('cf.selectFlagsModal.searchPlaceholder')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQueryString(e.target.value)}
              autoFocus
            />
          </Container>

          {/* Table view */}
          <Container className={css.container} margin={{ bottom: 'small', right: 'xxlarge' }}>
            {(error && (
              <PageError
                message={getErrorMessage(error)}
                onClick={() => {
                  refetch()
                }}
              />
            )) || (
              <>
                <Layout.Horizontal
                  style={{ position: 'sticky', top: 0, background: 'var(--white)', zIndex: 1 }}
                  padding={{ top: 'xsmall', left: 'large', right: 'huge', bottom: 'small' }}
                >
                  <Text
                    tabIndex={0}
                    role="button"
                    rightIcon={
                      sortByField === SegmentsSortByField.NAME
                        ? sortOrder === SortOrder.ASCENDING
                          ? 'caret-up'
                          : 'caret-down'
                        : undefined
                    }
                    style={{ color: '#4F5162', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => {
                      setSortOrder(previous =>
                        previous === SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING
                      )
                    }}
                  >
                    {getString('flag').toUpperCase()}
                  </Text>
                  <FlexExpander />
                  <Text style={{ color: '#4F5162', fontSize: '10px', fontWeight: 'bold' }} width={148}>
                    {getString('cf.shared.variation').toLocaleUpperCase()}
                  </Text>
                </Layout.Horizontal>

                <Layout.Vertical
                  spacing="small"
                  padding={{ top: 'xsmall', right: 'xsmall', bottom: 'large' }}
                  style={{ paddingLeft: '1px' }}
                >
                  {!!data?.features?.length &&
                    data?.features?.map((feature, index) => (
                      <FeatureFlagRow
                        id={`flag_row_${index}`}
                        key={feature.identifier}
                        feature={feature}
                        checked={false}
                        disabled={shouldDisableItem(feature)}
                        onChecked={checkOrUncheckSegment}
                      />
                    ))}
                  {data?.features?.length === 0 && <NoDataFoundRow message={getString('cf.selectFlagsModal.empty')} />}
                </Layout.Vertical>
              </>
            )}
          </Container>
          <Container margin={{ right: 'xxlarge' }} height={47}>
            {!error && (
              <Pagination
                itemCount={data?.itemCount || 0}
                pageCount={data?.pageCount || 0}
                pageIndex={data?.pageIndex}
                pageSize={CF_DEFAULT_PAGE_SIZE}
                gotoPage={setPageNumber}
                hidePageNumbers={!!data?.pageCount && data?.pageCount > 3}
              />
            )}
          </Container>

          <Container margin={{ right: 'xxlarge' }}>
            <Formik
              initialValues={{
                gitDetails: gitSyncFormMeta?.gitSyncInitialValues.gitDetails,
                autoCommit: gitSyncFormMeta?.gitSyncInitialValues.autoCommit
              }}
              formName="editVariations"
              enableReinitialize={true}
              validationSchema={yup.object().shape({
                gitDetails: gitSyncFormMeta?.gitSyncValidationSchema
              })}
              validateOnChange
              validateOnBlur
              onSubmit={handleSubmit}
            >
              <FormikForm>
                {gitSync?.isGitSyncEnabled && !gitSync?.isAutoCommitEnabled && (
                  <SaveFlagToGitSubForm subtitle={getString('cf.gitSync.commitChanges')} hideNameField />
                )}
                <Layout.Horizontal
                  spacing="small"
                  padding={{ right: 'xxlarge', top: 'medium' }}
                  style={{ alignItems: 'center' }}
                >
                  <Button
                    type="submit"
                    text={submitButtonTitle || getString('add')}
                    intent={Intent.PRIMARY}
                    disabled={loading || !!error || !selectedCounter}
                  />
                  <Button text={cancelButtonTitle || getString('cancel')} minimal onClick={hideModal} />
                  <FlexExpander />

                  {loading && <Icon intent={Intent.PRIMARY} name="spinner" size={16} />}
                  {!!selectedCounter && <Text>{getString('cf.shared.selected', { counter: selectedCounter })}</Text>}
                </Layout.Horizontal>
              </FormikForm>
            </Formik>
          </Container>
        </Layout.Vertical>
      </Dialog>
    )
  }

  const [openModal, hideModal] = useModalHook(ModalComponent, [onSubmit, shouldDisableItem])

  return <AddToFlagButton handleClick={openModal} {...props} />
}
