import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import type { AllowedTypes } from '@harness/uicore'
import { useQueryParams } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { GetConnectorListQueryParams } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

type MultiTypeConnectorProps = {
  readonly: boolean
  label: string
  name: string
  category: GetConnectorListQueryParams['category']
  expressions: string[]
  allowableTypes: AllowedTypes
}

const MultiTypeConnector = ({
  readonly,
  label,
  name,
  category,
  expressions,
  allowableTypes
}: MultiTypeConnectorProps): JSX.Element => {
  const { getString } = useStrings()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  return (
    <div className={cx(stepCss.formGroup, stepCss.lg)}>
      <FormMultiTypeConnectorField
        label={label}
        category={category}
        setRefValue
        width={384}
        name={name}
        placeholder={getString('select')}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        style={{ marginBottom: 10 }}
        multiTypeProps={{ expressions, allowableTypes }}
        gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        disabled={readonly}
      />
    </div>
  )
}

export default MultiTypeConnector
