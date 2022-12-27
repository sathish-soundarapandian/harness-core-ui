import type { FormikHelpers } from 'formik'
import React, { useCallback, useState } from 'react'
import type { CommonHealthSourceConfigurations } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'

export interface CommonHealthSourceContextType {
  isQueryRuntimeOrExpression?: boolean
  updateParentFormik: FormikHelpers<CommonHealthSourceConfigurations>['setFieldValue']
  updateHelperContext: (updatedValue: Partial<CommonHealthSourceContextType>) => void
}

export const CommonHealthSourceContext = React.createContext<CommonHealthSourceContextType>(
  {} as CommonHealthSourceContextType
)
CommonHealthSourceContext.displayName = 'CommonHealthSourceContext'

type CommonHealthSourceProviderType = Omit<CommonHealthSourceContextType, 'updateHelperContext'> & {
  children: React.ReactNode
}

export default function CommonHealthSourceProvider({
  children,
  updateParentFormik,
  isQueryRuntimeOrExpression
}: CommonHealthSourceProviderType): JSX.Element {
  const [values, setValues] = useState<Pick<CommonHealthSourceContextType, 'isQueryRuntimeOrExpression'>>({
    isQueryRuntimeOrExpression
  })

  const updateHelperContextFn = useCallback(
    (updatedValue: Partial<CommonHealthSourceContextType>) =>
      setValues(v => ({
        ...v,
        ...updatedValue
      })),
    [setValues]
  )

  const contextValues = {
    ...values,
    updateParentFormik,
    updateHelperContext: updateHelperContextFn
  }

  return <CommonHealthSourceContext.Provider value={contextValues}>{children}</CommonHealthSourceContext.Provider>
}
