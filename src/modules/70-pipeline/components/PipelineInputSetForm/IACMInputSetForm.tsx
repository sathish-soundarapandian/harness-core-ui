import React, { lazy } from 'react'
import { connect } from 'formik'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isRuntimeInput } from '@pipeline/utils/CIUtils'
import type { StageInputSetFormProps } from './StageInputSetForm'
import pipelineInputSetCss from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

// eslint-disable-next-line import/no-unresolved
const RemoteIACMApp = lazy(() => import('iacm/MicroFrontendApp'))
// eslint-disable-next-line import/no-unresolved
const IACMInputForm = lazy(() => import('iacm/IACMStageInputSet'))

type IACMInputSetFormProps = Omit<StageInputSetFormProps, 'executionIdentifier' | 'stageType'>

function RemoteComponentMounter({
  RemoteComponent,
  childProps,
  ...rest
}: {
  RemoteComponent: React.FC<IACMInputSetFormProps>
  childProps: IACMInputSetFormProps
}): JSX.Element {
  const getStyles = (key: string): unknown => ({ pipelineInputSetCss, stepCss }[key])
  return (
    <ChildAppMounter
      ChildApp={RemoteIACMApp}
      customComponents={{}}
      customFunctions={{ isRuntimeInput, getStyles }}
      customHooks={{ useVariablesExpression }}
      {...rest}
    >
      <RemoteComponent {...childProps} />
    </ChildAppMounter>
  )
}

// eslint-disable-next-line react/function-component-definition
const IACMInputSetForm = (props: IACMInputSetFormProps): JSX.Element => {
  return <RemoteComponentMounter RemoteComponent={IACMInputForm} childProps={props} />
}

export default connect(IACMInputSetForm)
