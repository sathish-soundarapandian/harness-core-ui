/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FormInput, MultiSelectOption } from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { useMutateAsGet } from '@common/hooks'
import { StringKeys, useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetUsers, useGetOrganizationAggregateDTOList, useGetProjectListWithMultiOrgFilter } from 'services/cd-ng'
import { actionToLabelMap, getOrgDropdownList, getProjectDropdownList } from '@audit-trail/utils/RequestUtil'
import UserItemRenderer from '@audit-trail/components/UserItemRenderer/UserItemRenderer'
import UserTagRenderer from '@audit-trail/components/UserTagRenderer/UserTagRenderer'
import AuditTrailFactory from '@audit-trail/factories/AuditTrailFactory'
import type { AuditTrailFormType } from './FilterDrawer'

interface AuditTrailFormProps {
  formikProps?: FormikProps<AuditTrailFormType>
}

const AuditTrailFilterForm: React.FC<AuditTrailFormProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [userQuery, setUserQuery] = useState<string>()
  const [orgQuery, setOrgQuery] = useState<string>()
  const [projectsQuery, setProjectsQuery] = useState<string>()
  const { getString } = useStrings()

  const { data: userData } = useMutateAsGet(useGetUsers, {
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    body: {
      searchTerm: userQuery
    },
    debounce: 300
  })

  const { data } = useGetOrganizationAggregateDTOList({
    queryParams: { accountIdentifier: accountId, searchTerm: orgQuery },
    debounce: 300
  })

  const users =
    userData?.data?.content?.map(user => {
      return {
        label: user.name || user.email,
        value: user.email
      }
    }) || []

  const organizations = data?.data?.content ? getOrgDropdownList(data?.data?.content) : []

  const getOrgs = (): string[] => {
    if (orgIdentifier) {
      return [orgIdentifier]
    }

    return props.formikProps?.values.organizations?.map(org => org.value as string) || []
  }

  const { data: projectData, refetch: refetchProjectList } = useGetProjectListWithMultiOrgFilter({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm: projectsQuery,
      orgIdentifiers: getOrgs(),
      pageSize: 10
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    debounce: 300
  })

  const getOptionsForMultiSelect = (map: Record<any, StringKeys>): MultiSelectOption[] => {
    return Object.keys(map).map(key => ({
      label: getString(map[key]),
      value: key
    }))
  }

  const projects = projectData?.data?.content ? getProjectDropdownList(projectData?.data?.content) : []

  return (
    <>
      <FormInput.MultiSelect
        name="users"
        key="users"
        items={users}
        label={getString('common.userLabel')}
        multiSelectProps={{
          allowCreatingNewItems: true,
          onQueryChange: setUserQuery,
          tagRenderer: (item: MultiSelectOption) => <UserTagRenderer key={item.value.toString()} item={item} />,
          itemRender: (item, { handleClick }) => (
            <UserItemRenderer key={item.value.toString()} item={item} handleClick={handleClick} />
          )
        }}
      />
      {!orgIdentifier && (
        <FormInput.MultiSelect
          name="organizations"
          key="organizations"
          items={organizations}
          label={getString('orgLabel')}
          multiSelectProps={{
            onQueryChange: setOrgQuery
          }}
          onChange={() => {
            props.formikProps?.setFieldValue('projects', [])
          }}
        />
      )}
      <FormInput.MultiSelect
        name="projects"
        key="projects"
        label={getString('projectLabel')}
        items={projects}
        multiSelectProps={{
          onQueryChange: query => {
            setProjectsQuery(query)
            refetchProjectList()
          }
        }}
      />
      {/* <FormInput.MultiSelect
        items={getOptionsForMultiSelect(moduleToLabelMap)}
        name="modules"
        label={getString('common.moduleLabel')}
        key="modules"
      /> */}
      <FormInput.MultiSelect
        items={getOptionsForMultiSelect(AuditTrailFactory.getResourceTypeTolabelMap())}
        name="resourceType"
        label={getString('common.resourceTypeLabel')}
        key="resourceType"
        onChange={() => {
          props.formikProps?.setFieldValue('resourceIdentifier', '')
        }}
      />
      <FormInput.Text
        name="resourceIdentifier"
        key="resourceIdentifier"
        label={getString('common.resourceIdentifier')}
        disabled={props.formikProps?.values?.['resourceType']?.length !== 1}
        tooltipProps={{ dataTooltipId: 'auditTrails_resourceIdentifier' }}
      />
      <FormInput.MultiSelect
        items={getOptionsForMultiSelect(actionToLabelMap)}
        name="actions"
        label={getString('action')}
        key="actions"
      />
    </>
  )
}

export default AuditTrailFilterForm
