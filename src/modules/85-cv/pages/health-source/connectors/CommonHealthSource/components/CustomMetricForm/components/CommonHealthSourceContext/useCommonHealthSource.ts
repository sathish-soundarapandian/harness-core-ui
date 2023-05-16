import { useContext } from 'react'
import { isEmpty } from 'lodash-es'
import type { CommonHealthSourceContextType } from './CommonHealthSourceContext';
import { CommonHealthSourceContext } from './CommonHealthSourceContext'

export function useCommonHealthSource(): CommonHealthSourceContextType {
  const customHealthSourceContextValues = useContext(CommonHealthSourceContext)

  if (isEmpty(customHealthSourceContextValues)) {
    throw new Error('Place useCustomHealthSource within CommonHealthSourceContext')
  }

  return customHealthSourceContextValues
}
