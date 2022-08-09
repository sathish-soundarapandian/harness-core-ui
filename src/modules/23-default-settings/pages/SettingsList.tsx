import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, FormikForm, getErrorInfoFromErrorObject, Layout, useToaster } from '@harness/uicore'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

import ScopedTitle from '@common/components/Title/ScopedTitle'
import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { useStrings } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { SettingDTO, SettingRequestDTO, useUpdateSettingValue } from 'services/cd-ng'
import type { SettingCategory, SettingType, SettingYupValidation } from '../interfaces/SettingType.types'
import SettingsCategorySection from '../components/SettingsCategorySection'
import css from './SettingsList.module.scss'

const SettingsList = () => {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & ModulePathParams>()
  const defaultSettingsCategory: SettingCategory[] = DefaultSettingsFactory.getCategoryNamesList()
  const [changedSettings, updateChangedSettings] = useState<Map<SettingType, SettingRequestDTO>>(new Map())
  const [settingErrorMessage, updateSettingErrorMessage] = useState<Map<SettingType, string>>(new Map())
  const [disableSave, updateDisableSave] = useState<boolean>(true)
  const { showError } = useToaster()
  const onSettingChange = (
    settingType: SettingType,
    settingDTO: SettingDTO,
    updateType: SettingRequestDTO['updateType']
  ) => {
    if (disableSave) {
      updateDisableSave(false)
    }
    const exisitingChangedSettings = new Map(changedSettings)
    const { allowOverrides, identifier, value } = settingDTO
    exisitingChangedSettings.set(settingType, { allowOverrides, updateType, identifier, value })
    updateChangedSettings(exisitingChangedSettings)
  }
  const {
    loading: savingSettingInProgress,
    mutate: updateSettingValue,
    error: savingError
  } = useUpdateSettingValue({
    queryParams: { projectIdentifier: projectIdentifier, accountIdentifier: accountId, orgIdentifier }
  })
  if (savingError) {
    showError(savingError)
  }
  const saveSettings = () => {
    updateSettingErrorMessage(new Map())
    try {
      updateSettingValue(Array.from(changedSettings.values())).then(data => {
        const errorMap = new Map()
        data.data?.forEach(setting => {
          if (!setting.updateStatus && setting.errorMessage) {
            errorMap.set(setting.identifier, setting.errorMessage)
          }
        })
        updateSettingErrorMessage(errorMap)
        if (!errorMap.size) {
          updateDisableSave(true)
          updateChangedSettings(new Map())
        }
      })
    } catch (error) {
      showError(getErrorInfoFromErrorObject(error))
    }
  }
  const [validationScheme, updateValidationScheme] = useState<SettingYupValidation>({})
  const updateValidation = (val: SettingYupValidation) => {
    updateValidationScheme({ ...validationScheme, ...val })
  }

  return (
    <>
      <Formik
        formName="defaultSettingsForm"
        initialValues={{}}
        validationSchema={Yup.object(validationScheme as any)}
        onSubmit={saveSettings}
      >
        {() => {
          return (
            <FormikForm>
              <Page.Header
                title={
                  <ScopedTitle
                    title={{
                      [Scope.PROJECT]: getString('common.defaultSettings'),
                      [Scope.ORG]: getString('common.defaultSettings'),
                      [Scope.ACCOUNT]: getString('common.defaultSettings')
                    }}
                  />
                }
                toolbar={
                  <Button
                    text={getString('save')}
                    disabled={disableSave}
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                  />
                }
                breadcrumbs={
                  <NGBreadcrumbs
                    links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
                  />
                }
              />
              {savingSettingInProgress && <Page.Spinner message={getString('common.saving')}></Page.Spinner>}
              <Page.Body>
                <Layout.Vertical className={css.settingList}>
                  {defaultSettingsCategory.map(categ => {
                    return (
                      <SettingsCategorySection
                        settingCategory={categ}
                        onSettingChange={onSettingChange}
                        settingErrorMessages={settingErrorMessage}
                        updateValidationSchema={updateValidation}
                        key={categ}
                      />
                    )
                  })}
                </Layout.Vertical>
              </Page.Body>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export default SettingsList
