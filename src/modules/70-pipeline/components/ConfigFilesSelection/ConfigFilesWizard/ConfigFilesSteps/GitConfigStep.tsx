/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Layout,
  Button,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  StepProps,
  ButtonVariation,
  FormikForm
} from '@harness/uicore'
import type { FormikProps } from 'formik'
import { FontVariation } from '@harness/design-system'
import * as Yup from 'yup'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { defaultTo, isEmpty, set } from 'lodash-es'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { shouldHideHeaderAndNavBtns } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { removeEmptyFieldsFromStringArray } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/ManifestUtils'
import { GitRepoName } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ConfigFileGitCoreSection } from '../../ConfigFileGitCoreSection/ConfigFileGitCoreSection'
import { ConfigFilesMap } from '../../ConfigFilesHelper'
import { getRepositoryName } from './StepUtils'

import type { GitConfigFileCoreValuesPropType } from '../../ConfigFilesInterface'
import css from '../ConfigFilesWizard.module.scss'

export function GitConfigStep({
  stepName,
  selectedConfigFile,
  expressions,
  allowableTypes = [MultiTypeInputType.FIXED],
  handleSubmit,
  prevStepData,
  previousStep,
  context,
  isReadonly = false,
  editConfigFilePrevStepData
}: StepProps<ConnectorConfigDTO> & GitConfigFileCoreValuesPropType): React.ReactElement {
  const { getString } = useStrings()
  const [initialValues, setInitialValues] = React.useState({
    identifier: '',
    branch: undefined,
    commitId: undefined,
    gitFetchType: 'Branch',
    paths: [''],
    skipResourceVersioning: false,
    enableDeclarativeRollback: false,
    repoName: '',
    valuesPaths: [''],
    store: prevStepData?.store
  })

  const hideHeaderAndNavBtns = context ? shouldHideHeaderAndNavBtns(context) : false

  const modifiedPrevStepData = defaultTo(prevStepData, editConfigFilePrevStepData)

  const gitConnectionType: string = modifiedPrevStepData?.store === ConfigFilesMap.Git ? 'connectionType' : 'type'
  const connectionType =
    /* istanbul ignore next */
    modifiedPrevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    modifiedPrevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  React.useEffect(() => {
    setInitialValues({
      ...initialValues,
      ...prevStepData
    })
  }, [prevStepData])

  const getInitialValues = React.useCallback((): any => {
    if (modifiedPrevStepData?.identifier) {
      return {
        ...modifiedPrevStepData,
        identifier: modifiedPrevStepData?.identifier,
        skipResourceVersioning: modifiedPrevStepData.skipResourceVersioning,
        enableDeclarativeRollback: modifiedPrevStepData.enableDeclarativeRollback,
        repoName: getRepositoryName(modifiedPrevStepData, {
          ...initialValues,
          spec: {
            store: {
              type: modifiedPrevStepData?.store,
              spec: {
                connectorRef: modifiedPrevStepData.connectorRef?.connector?.identifier,
                repoName: modifiedPrevStepData.repoName
              }
            }
          }
        }),
        paths:
          typeof modifiedPrevStepData.paths === 'string'
            ? modifiedPrevStepData.paths
            : removeEmptyFieldsFromStringArray(modifiedPrevStepData.paths)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              })),
        valuesPaths:
          typeof modifiedPrevStepData.valuesPaths === 'string'
            ? modifiedPrevStepData.valuesPaths
            : removeEmptyFieldsFromStringArray(modifiedPrevStepData.valuesPaths)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              }))
      }
    }
    return initialValues
  }, [modifiedPrevStepData, prevStepData])

  const submitFormData = (formData: any): void => {
    const configFileObj: any = {
      configFile: {
        identifier: formData.identifier,
        type: selectedConfigFile as any,
        spec: {
          store: {
            type: modifiedPrevStepData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              gitFetchType: formData?.gitFetchType,
              paths:
                typeof formData?.paths === 'string'
                  ? formData?.paths
                  : formData?.paths?.map((path: { path: string }) => path.path)
            }
          },
          valuesPaths:
            typeof formData.valuesPaths === 'string'
              ? formData.valuesPaths
              : removeEmptyFieldsFromStringArray(formData?.valuesPaths?.map((path: { path: string }) => path.path))
        }
      }
    }
    if (connectionType === GitRepoName.Account) {
      set(configFileObj, 'configFile.spec.store.spec.repoName', formData.repoName)
    }

    if (configFileObj?.configFile?.spec?.store) {
      if (formData?.gitFetchType === 'Branch') {
        set(configFileObj, 'configFile.spec.store.spec.branch', formData.branch)
      } else if (formData?.gitFetchType === 'Commit') {
        set(configFileObj, 'configFile.spec.store.spec.commitId', formData?.commitId)
      }
    }

    handleSubmit(configFileObj)
  }

  const connectorRefNotFixedValue = React.useMemo(() => {
    return getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
      ? modifiedPrevStepData?.connectorRef
      : modifiedPrevStepData?.connectorRef?.value
  }, [modifiedPrevStepData])

  const handleValidate = (formData: any): void => {
    if (hideHeaderAndNavBtns) {
      const modifiedId = modifiedPrevStepData?.identifier || ''
      submitFormData({
        ...modifiedPrevStepData,
        ...formData,
        connectorRef: modifiedPrevStepData?.connectorRef ? connectorRefNotFixedValue : modifiedId
      })
    }
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {stepName}
        </Text>
      )}

      <Formik
        initialValues={getInitialValues()}
        formName="configFileDetails"
        validationSchema={Yup.object().shape({
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          paths: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
              return Yup.array().of(
                Yup.object().shape({
                  path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
                })
              )
            }
            return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          }),
          repoName: Yup.string().test('repoName', getString('common.validation.repositoryName'), value => {
            if (
              connectionType === GitRepoName.Repo ||
              getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
            ) {
              return true
            }
            return !isEmpty(value) && value?.length > 0
          })
        })}
        validate={handleValidate}
        onSubmit={formData => {
          const modifiedId = modifiedPrevStepData?.identifier || ''
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            /* istanbul ignore next */
            connectorRef: modifiedPrevStepData?.connectorRef ? connectorRefNotFixedValue : modifiedId
          })
        }}
      >
        {(formik: FormikProps<any>) => {
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <ConfigFileGitCoreSection
                    formik={formik}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    prevStepData={modifiedPrevStepData}
                    isReadonly={isReadonly}
                  />
                </div>
                {!hideHeaderAndNavBtns && (
                  <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                    <Button
                      variation={ButtonVariation.SECONDARY}
                      text={getString('back')}
                      icon="chevron-left"
                      onClick={() => {
                        previousStep?.(modifiedPrevStepData)
                      }}
                    />
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      type="submit"
                      text={getString('submit')}
                      rightIcon="chevron-right"
                    />
                  </Layout.Horizontal>
                )}
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
