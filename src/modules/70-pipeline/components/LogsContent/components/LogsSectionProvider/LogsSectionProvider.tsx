import React, { createContext, useState, useEffect } from 'react'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import { formatLogsForClipboard, getSelectedLogs } from './logsSelectionUtils'

export const CUSTOM_SELECTION_LINE_ROOT = 'custom-selection-line-root'

interface LogsSelectionContextProps {
  from: number
  to: number
  setSelectionFrom: (from: number) => void
  setSelectionTo: (to: number) => void
  setSelectionProgress: (to: number) => void
  hasSelection: boolean
  isInSelection: (index: number) => boolean
}

export const LogsSelectionContext = createContext<LogsSelectionContextProps>({
  from: -1,
  to: -1,
  setSelectionFrom: () => -1,
  setSelectionTo: () => -1,
  setSelectionProgress: () => -1,
  hasSelection: false,
  isInSelection: (_index: number) => false
})

export interface LogsSelectionProviderProps extends React.PropsWithChildren<unknown> {
  rootClassSelector: string
  lineClassSelector: string
  data: string[]
}

export function LogsSelectionProvider({
  children,
  data,
  rootClassSelector,
  lineClassSelector
}: LogsSelectionProviderProps): React.ReactElement {
  const dataRef = React.useRef<string[]>(data)
  dataRef.current = data

  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()

  const [fromInternal, setFromInternal] = useState(-1)
  const [toInternal, setToInternal] = useState(-1)
  const [progress, setProgressInternal] = useState(-1)
  const [isDown, setIsDown] = useState(false)

  let exposedFrom = fromInternal
  let exposedTo = progress > -1 ? progress : toInternal

  if (exposedFrom !== -1 && exposedTo !== -1 && exposedFrom > exposedTo) {
    const tmpExposedFrom = exposedFrom
    exposedFrom = exposedTo
    exposedTo = tmpExposedFrom
  }

  const hasSelection = exposedFrom !== exposedTo && exposedFrom !== -1 && exposedTo !== -1

  const isInSelection = (index: number): boolean => {
    return exposedFrom !== exposedTo && index >= exposedFrom && index <= exposedTo
  }

  const setSelectionFrom = (line: number): void => {
    // prevent deselect if user click on selected element
    if (line >= exposedFrom && line <= exposedTo) {
      return
    }

    setToInternal(-1)
    setIsDown(true)
    setFromInternal(line)
  }

  const setSelectionProgress = (line: number): void => {
    if (isDown) {
      setProgressInternal(line)
    }
  }

  const setSelectionTo = (line: number): void => {
    if (!isDown) return

    setProgressInternal(-1)
    setIsDown(false)

    if (fromInternal === line) {
      setFromInternal(-1)
      setToInternal(-1)
    } else {
      setToInternal(line)
    }
  }

  // handle global mousedown/mouseup
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent): void => {
      // reset selection on mouse click outside
      if (!(e.target as HTMLElement)?.closest(`.${lineClassSelector}`)) {
        setFromInternal(-1)
        setToInternal(-1)
        setProgressInternal(-1)
        setIsDown(false)

        // clear native selection as well
        if ((e.target as HTMLElement)?.closest(`.${rootClassSelector}`)) {
          document.getSelection()?.removeAllRanges()
        }
      }
    }

    const handleMouseUp = () => () => {
      setIsDown(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [setFromInternal, setToInternal, setProgressInternal, setIsDown])

  // handle copy to clipboard
  React.useEffect(() => {
    const handleClipboard = (e: ClipboardEvent): void => {
      if (!hasSelection) {
        return
      }

      if (!(e.target as HTMLElement)?.closest(`.${rootClassSelector}`)) {
        return
      }

      e.stopPropagation()
      const selectedLogs = getSelectedLogs(dataRef.current, exposedFrom, exposedTo)
      const formatedLogs = formatLogsForClipboard(selectedLogs)
      navigator?.clipboard?.writeText(formatedLogs).then(
        () => {
          showSuccess(getString('clipboardCopySuccess'))
        },
        () => {
          showError(getString('clipboardCopyFail'))
        }
      )
    }

    document.addEventListener('copy', handleClipboard)
    return () => {
      document.removeEventListener('copy', handleClipboard)
    }
  }, [exposedFrom, exposedTo, hasSelection])

  return (
    <LogsSelectionContext.Provider
      value={{
        hasSelection,
        from: exposedFrom,
        to: exposedTo,
        setSelectionFrom,
        setSelectionTo,
        setSelectionProgress,
        isInSelection
      }}
    >
      {children}
    </LogsSelectionContext.Provider>
  )
}
