/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Layout, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@wings-software/uicore'

import type { ElastigroupInfrastructure } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import FileStoreList from '@filestore/components/FileStoreList/FileStoreList'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { connectorTypes } from '@pipeline/utils/constants'
import { fileTypes } from './ElastigroupInfraTypes'
import css from './ElastigroupInfra.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ElastigroupInfraSpecInputFormProps {
  initialValues: ElastigroupInfrastructure
  allValues?: ElastigroupInfrastructure
  onUpdate?: (data: ElastigroupInfrastructure) => void
  readonly?: boolean
  template?: ElastigroupInfrastructure
  allowableTypes: AllowedTypes
  path: string
}

const ElastigroupInfraSpecInputForm = ({
  template,
  readonly = false,
  path,
  allowableTypes
}: ElastigroupInfraSpecInputFormProps): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const connectorFieldName = isEmpty(path) ? 'connectorRef' : `${path}.connectorRef`
  const configSecretFilesName = isEmpty(path)
    ? 'configuration.store.spec.secretFiles'
    : `${path}.configuration.store.spec.secretFiles`
  const configFilesName = isEmpty(path) ? 'configuration.store.spec.files' : `${path}.configuration.store.spec.files`

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            tooltipProps={{
              dataTooltipId: 'elastigroupConnector'
            }}
            name={connectorFieldName}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={connectorTypes.Spot}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.configuration?.store.spec?.files) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.fileStoreStyle)}>
          <FileStoreList
            name={configFilesName}
            type={fileTypes.FILE_STORE}
            allowOnlyOne={true}
            expressions={expressions}
            label={getString('cd.steps.elastigroup.elastigroupConfig')}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.configuration?.store.spec?.secretFiles) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.fileStoreStyle)}>
          <FileStoreList
            name={configSecretFilesName}
            type={fileTypes.ENCRYPTED}
            allowOnlyOne={true}
            expressions={expressions}
            label={getString('cd.steps.elastigroup.elastigroupConfig')}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export const ElastigroupInfraSpecInputSetMode = connect(ElastigroupInfraSpecInputForm)
