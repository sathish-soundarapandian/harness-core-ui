import React, { lazy } from 'react'
import { connect } from 'formik'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isRuntimeInput } from '@pipeline/utils/CIUtils'
import pipelineInputSetCss from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm.module.scss'

const RemoteIACMApp = lazy(() => import('iacm/MicroFrontendApp'))
const IACMInputForm = lazy(() => import('iacm/IACMStageInputSet'))

function RemoteComponentMounter({ RemoteComponent, childProps, ...rest }: any): JSX.Element {
  const getStyles = (key: string): any => ({ pipelineInputSetCss }[key])
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
const IACMInputSetForm = (props: any) => {
  return <RemoteComponentMounter RemoteComponent={IACMInputForm} childProps={props} />
}

export default connect(IACMInputSetForm)
