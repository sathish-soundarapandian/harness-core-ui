import React, { useState, useEffect } from 'react'
import type { FormikContextType } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'

import {
  FormInput,
  getErrorInfoFromErrorObject,
  Icon,
  Layout,
  ModalErrorHandlerBinding,
  SelectOption,
  Text,
  useToggleOpen
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { Error, GitRepositoryResponseDTO, useGetListOfReposByRefConnector } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './RepositorySelect.module.scss'

export interface RepositorySelectProps<T> {
  modalErrorHandler?: ModalErrorHandlerBinding
  formikProps: FormikContextType<T>
  connectorRef?: string
  selectedValue?: string
  onChange?: (selected: SelectOption, options?: SelectOption[]) => void
  formik?: any
}

const getRepoSelectOptions = (data: GitRepositoryResponseDTO[] = []) => {
  return data.map((repo: GitRepositoryResponseDTO) => {
    return {
      label: defaultTo(repo.name, ''),
      value: defaultTo(repo.name, '')
    }
  })
}

const RepositorySelect: React.FC<RepositorySelectProps<any>> = props => {
  const { modalErrorHandler, connectorRef, selectedValue, formikProps } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [repoSelectOptions, setRepoSelectOptions] = useState<SelectOption[]>([])

  const {
    data: response,
    error,
    loading,
    refetch
  } = useGetListOfReposByRefConnector({
    queryParams: {
      connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      page: 0,
      size: 100
    },
    lazy: true
  })

  const { open } = useToggleOpen()

  useEffect(() => {
    if (connectorRef) {
      refetch()
    } else {
      setRepoSelectOptions([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorRef])

  const handleError = (errorMessage: string): void => {
    modalErrorHandler?.showDanger(errorMessage)
  }

  useEffect(() => {
    if (loading) {
      return
    }
    modalErrorHandler?.hide()

    if (error) {
      if ((error?.data as Error)?.responseMessages?.length) {
        open()
      } else {
        handleError(getErrorInfoFromErrorObject(error))
      }
      return
    }

    if (response?.status !== 'SUCCESS') {
      response && handleError(getErrorInfoFromErrorObject(response))
    } else {
      if (!isEmpty(response?.data)) {
        const selectOptions = getRepoSelectOptions(response?.data)
        setRepoSelectOptions(selectOptions)
        if (selectOptions.length === 1) {
          formikProps.setFieldValue('repoName', selectOptions[0].value)
          props.onChange?.(selectOptions[0], repoSelectOptions)
        }
      } else {
        modalErrorHandler?.showDanger('noRepoFound')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <Layout.Horizontal>
      <FormInput.Select
        name="repoName"
        label={'Select Repository'}
        placeholder={loading ? 'Loading...' : 'Select'}
        disabled={loading}
        items={repoSelectOptions}
        value={{ label: selectedValue || '', value: selectedValue || '' }}
        onChange={selected => props.onChange?.(selected, repoSelectOptions)}
        selectProps={{ usePortal: true, popoverClassName: css.gitBranchSelectorPopover }}
      />
      {loading ? (
        <Layout.Horizontal spacing="small" flex padding={{ top: 'xsmall', left: 'xsmall' }}>
          <Icon name="steps-spinner" size={18} color={Color.PRIMARY_7} />
          <Text>{'Loading repositories'.concat('...')}</Text>
        </Layout.Horizontal>
      ) : null}
      {/* <Dialog isOpen={isOpen} enforceFocus={false} title={'repoFetchFailed'} onClose={close}>
        {responseMessages ? <ErrorHandler responseMessages={responseMessages} /> : undefined}
      </Dialog> */}
    </Layout.Horizontal>
  )
}
export default RepositorySelect
