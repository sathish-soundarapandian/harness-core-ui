/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, useState, SetStateAction } from 'react'
import {
  Formik,
  Layout,
  FormikForm,
  FormInput,
  Text,
  Button,
  ButtonVariation,
  SelectOption,
  Container
} from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner, useToaster } from '@common/components'
import { TemplatePreview } from '@templates-library/components/TemplatePreview/TemplatePreview'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useGetTemplateList, TemplateSummaryResponse, useUpdateStableTemplate } from 'services/template-ng'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import css from './TemplateSettingsModal.module.scss'

export interface TemplateSettingsModalProps {
  templateIdentifier: string
  onClose: () => void
  onSuccess?: () => void
}

interface BasicDetailsInterface extends TemplateSettingsModalProps {
  setPreviewValues: Dispatch<SetStateAction<TemplateSummaryResponse | undefined>>
  templates?: TemplateSummaryResponse[]
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  onUpdateSetting: (updateStableTemplateVersion: string) => void
}

const BasicTemplateDetails = (props: BasicDetailsInterface) => {
  const { templates, setPreviewValues, onClose, onUpdateSetting } = props
  const { getString } = useStrings()
  const [versionOptions, setVersionOptions] = React.useState<SelectOption[]>([])
  const [selectedVersion, setSelectedVersion] = React.useState<string>()

  React.useEffect(() => {
    if (templates && !isEmpty(templates)) {
      const newAllVersions = templates.map((item: TemplateSummaryResponse) => {
        return {
          label: item.versionLabel || '',
          value: item.versionLabel || ''
        }
      })
      setVersionOptions(newAllVersions)
      const selectedVersionLabel = templates?.find(item => item.stableTemplate)?.versionLabel
      if (selectedVersionLabel) {
        setSelectedVersion(selectedVersionLabel)
      }
    }
  }, [templates])

  return (
    <Container width={'55%'} className={css.basicDetails} background={Color.FORM_BG} padding={'huge'}>
      <Text
        color={Color.GREY_800}
        font={{ weight: 'bold', size: 'medium' }}
        margin={{ bottom: 'xlarge', left: 0, right: 0 }}
      >
        {getString('templatesLibrary.templateSettings')}
      </Text>
      <Formik<TemplateSummaryResponse & { defaultVersion?: string }>
        initialValues={{ ...templates?.[0], defaultVersion: selectedVersion }}
        onSubmit={values => {
          onUpdateSetting(values.defaultVersion || '')
        }}
        validate={values => {
          const previewTemplate = templates?.find(item => item.versionLabel === values.defaultVersion)
          previewTemplate && setPreviewValues(previewTemplate)
        }}
        formName={`create${templates?.[0]?.templateEntityType || ''}Template`}
        enableReinitialize={true}
      >
        <FormikForm>
          <Layout.Vertical spacing={'huge'}>
            <Container>
              <Layout.Vertical>
                <NameId
                  identifierProps={{
                    isIdentifierEditable: false
                  }}
                  inputGroupProps={{ disabled: true }}
                />
                <FormInput.Select
                  name={'defaultVersion'}
                  items={versionOptions}
                  label={getString('templatesLibrary.templateSettingsModal.defaultVersionLabel')}
                />
              </Layout.Vertical>
            </Container>
            <Container>
              <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                <RbacButton
                  text={getString('save')}
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  permission={{
                    permission: PermissionIdentifier.EDIT_TEMPLATE,
                    resource: {
                      resourceType: ResourceType.TEMPLATE
                    },
                    resourceScope: {
                      accountIdentifier: props.accountId,
                      orgIdentifier: props.orgIdentifier,
                      projectIdentifier: props.projectIdentifier
                    }
                  }}
                />
                <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onClose} />
              </Layout.Horizontal>
            </Container>
          </Layout.Vertical>
        </FormikForm>
      </Formik>
    </Container>
  )
}

export const TemplateSettingsModal = (props: TemplateSettingsModalProps) => {
  const { templateIdentifier, onSuccess, onClose } = props
  const [previewValues, setPreviewValues] = useState<TemplateSummaryResponse>()
  const params = useParams<ProjectPathProps>()
  const { accountId, orgIdentifier, projectIdentifier } = params
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()

  const {
    data: templateData,
    loading,
    error: templatesError
  } = useMutateAsGet(useGetTemplateList, {
    body: {
      filterType: 'Template',
      templateIdentifiers: [templateIdentifier]
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      module,
      templateListType: TemplateListType.All,
      repoIdentifier,
      branch
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const { mutate: updateStableTemplate, loading: updateStableTemplateLoading } = useUpdateStableTemplate({
    templateIdentifier: templateIdentifier,
    versionLabel: '',
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch
    },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  React.useEffect(() => {
    setPreviewValues(templateData?.data?.content?.find(item => item.stableTemplate) || templateData?.data?.content?.[0])
  }, [templateData?.data?.content])

  React.useEffect(() => {
    if (templatesError) {
      onClose()
      showError(getRBACErrorMessage(templatesError), undefined, 'template.fetch.template.error')
    }
  }, [templatesError])

  const updateSettings = async (updateStableTemplateVersion: string) => {
    try {
      await updateStableTemplate({} as unknown as void, {
        pathParams: {
          templateIdentifier: templateIdentifier,
          versionLabel: updateStableTemplateVersion
        }
      })
      showSuccess(getString('common.template.updateTemplate.templateUpdated'))
      onSuccess?.()
    } catch (error) {
      showError(
        getRBACErrorMessage(error) || getString('common.template.updateTemplate.errorWhileUpdating'),
        undefined,
        'template.save.template.error'
      )
    }
  }

  return (
    <Layout.Horizontal style={{ flexGrow: 1 }}>
      {(loading || updateStableTemplateLoading) && <PageSpinner />}
      <BasicTemplateDetails
        {...props}
        onUpdateSetting={updateSettings}
        templates={templateData?.data?.content}
        setPreviewValues={setPreviewValues}
        accountId={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
      />
      <TemplatePreview previewValues={previewValues} />
      <Button
        className={css.closeIcon}
        iconProps={{ size: 24, color: Color.GREY_500 }}
        icon="cross"
        variation={ButtonVariation.ICON}
        onClick={props.onClose}
      />
    </Layout.Horizontal>
  )
}
