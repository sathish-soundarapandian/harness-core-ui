/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react'
import type { MonacoEditorProps } from 'react-monaco-editor'
//@ts-ignore
import ReactMonacoEditor from 'react-monaco-editor'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import '@wings-software/monaco-yaml/lib/esm/monaco.contribution'
import { IKeyboardEvent, IPosition, languages, Range } from 'monaco-editor/esm/vs/editor/editor.api'
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'
import type { Diagnostic } from 'vscode-languageserver-types'
import { debounce, isEmpty, throttle, defaultTo, attempt, every, isEqualWith, isNil, isUndefined, get } from 'lodash-es'
import { Layout, Text, Collapse } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import {} from 'lodash-es'
import { useToaster } from '@common/exports'
import { useParams } from 'react-router-dom'
import { Intent } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import cx from 'classnames'
import { scalarOptions, defaultOptions, parse } from 'yaml'
import { Tag, Icon, Container, useConfirmationDialog } from '@harness/uicore'
import type {
  YamlBuilderProps,
  YamlBuilderHandlerBinding,
  CompletionItemInterface,
  Theme
} from '@common/interfaces/YAMLBuilderProps'
import { pluralize } from '@common/utils/StringUtils'
import { getSchemaWithLanguageSettings, validateYAMLWithSchema } from '@common/utils/YamlUtils'
import { sanitize } from '@common/utils/JSONUtils'
import { getYAMLFromEditor, getMetaDataForKeyboardEventProcessing, verifyYAML } from './YAMLBuilderUtils'

import css from './YamlBuilder.module.scss'
import './resizer.scss'
import {
  DEFAULT_EDITOR_HEIGHT,
  EditorTheme,
  EDITOR_BASE_DARK_THEME,
  EDITOR_BASE_LIGHT_THEME,
  EDITOR_DARK_BG,
  EDITOR_DARK_FG,
  EDITOR_DARK_SELECTION,
  EDITOR_LIGHT_BG,
  EDITOR_WHITESPACE,
  MIN_SNIPPET_SECTION_WIDTH,
  TRIGGER_CHARS_FOR_NEW_EXPR,
  TRIGGER_CHAR_FOR_PARTIAL_EXPR,
  KEY_CODE_FOR_PLUS_SIGN,
  ANGULAR_BRACKET_CHAR,
  KEY_CODE_FOR_SEMI_COLON,
  KEY_CODE_FOR_PERIOD,
  KEY_CODE_FOR_SPACE,
  KEY_CODE_FOR_CHAR_Z,
  CONTROL_EVENT_KEY_CODE,
  META_EVENT_KEY_CODE,
  SHIFT_EVENT_KEY_CODE,
  navigationKeysMap,
  allowedKeysInEditModeMap
} from './YAMLBuilderConstants'
import CopyToClipboard from '../CopyToClipBoard/CopyToClipBoard'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { AutoCompletionMap } from './YAMLAutoCompletionHelper'
import { isWindowsOS } from '@common/utils/utils'
import { carriageReturnRegex } from '@common/utils/StringUtils'
import { parseInput } from '../ConfigureOptions/ConfigureOptionsUtils'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { PluginsPanel } from './PluginsPanel/PluginsPanel'

// Please do not remove this, read this https://eemeli.org/yaml/#scalar-options
scalarOptions.str.fold.lineWidth = 100000
defaultOptions.indent = 4

const getTheme = (theme: Theme) => (theme === 'DARK' ? EDITOR_BASE_DARK_THEME : EDITOR_BASE_LIGHT_THEME)

const setUpEditor = (theme: Theme): void => {
  //@ts-ignore
  monaco.editor.defineTheme(getTheme(theme), {
    base: getTheme(theme),
    inherit: theme === 'DARK',
    rules: theme === 'DARK' ? EditorTheme.DARK : EditorTheme.LIGHT,
    colors:
      theme === 'DARK'
        ? {
            'editor.background': `#${EDITOR_DARK_BG}`,
            'editor.foreground': `#${EDITOR_DARK_FG}`,
            'editor.selectionBackground': `#${EDITOR_DARK_SELECTION}`,

            'editor.lineHighlightBackground': `#${EDITOR_DARK_SELECTION}`,
            'editorCursor.foreground': `#${EDITOR_DARK_FG}`,
            'editorWhitespace.foreground': `#${EDITOR_WHITESPACE}`
          }
        : { 'editor.background': `#${EDITOR_LIGHT_BG}` }
  })
  //@ts-ignore
  monaco.editor.setTheme(getTheme(theme))
}

const YAMLBuilder: React.FC<YamlBuilderProps> = (props: YamlBuilderProps): JSX.Element => {
  const {
    height,
    width,
    fileName,
    entityType,
    existingJSON,
    existingYaml,
    isReadOnlyMode,
    isEditModeSupported = true,
    isHarnessManaged = false,
    hideErrorMesageOnReadOnlyMode = false,
    invocationMap,
    bind,
    onExpressionTrigger,
    schema,
    onEnableEditMode,
    theme = 'LIGHT',
    yamlSanityConfig,
    onChange,
    onErrorCallback,
    renderCustomHeader,
    openDialogProp,
    showCopyIcon = true,
    showErrorPanel = false,
    comparableYaml,
    showPluginsPanel = false
  } = props
  const comparableYamlJson = parse(defaultTo(comparableYaml, ''))

  setUpEditor(theme)
  const params = useParams()
  const [currentYaml, setCurrentYaml] = useState<string>(defaultTo(existingYaml, ''))
  const [initialSelectionRemoved, setInitialSelectionRemoved] = useState<boolean>(
    !defaultTo(existingYaml, existingJSON)
  )
  const [yamlValidationErrors, setYamlValidationErrors] = useState<Map<number, string> | undefined>()
  const { innerWidth } = window
  const [dynamicWidth, setDynamicWidth] = useState<number>(innerWidth - 2 * MIN_SNIPPET_SECTION_WIDTH)
  const [dynamicHeight, setDynamicHeight] = useState<React.CSSProperties['height']>(
    defaultTo(height, DEFAULT_EDITOR_HEIGHT)
  )

  const editorRef = useRef<ReactMonacoEditor>(null)
  const yamlRef = useRef<string | undefined>('')
  const yamlValidationErrorsRef = useRef<Map<number, string>>()
  yamlValidationErrorsRef.current = yamlValidationErrors
  const editorVersionRef = useRef<number>()
  const [shouldShowErrorPanel, setShouldShowErrorPanel] = useState<boolean>(false)
  const [schemaValidationErrors, setSchemaValidationErrors] = useState<Diagnostic[]>()
  const [pluginInput, setPluginInput] = useState<string>('')

  let expressionCompletionDisposer: { dispose: () => void }
  let runTimeCompletionDisposer: { dispose: () => void }
  let allowedValuesCompletionDisposer: { dispose: () => void }

  const { showError } = useToaster()
  const { getString } = useStrings()

  const yamlError = getString('yamlBuilder.yamlError')

  const handler = React.useMemo(
    () =>
      ({
        getLatestYaml: () => yamlRef.current,
        setLatestYaml: (json: Record<string, any>) => {
          attempt(verifyIncomingJSON, json)
        },
        getYAMLValidationErrorMap: () => yamlValidationErrorsRef.current
      } as YamlBuilderHandlerBinding),
    []
  )

  useEffect(() => {
    bind?.(handler)

    return () => {
      bind?.(undefined)
    }
  }, [bind, handler])

  useEffect(() => {
    setDynamicWidth(width as number)
  }, [width])

  const getEditorCurrentVersion = (): number | undefined => {
    return editorRef.current?.editor?.getModel()?.getAlternativeVersionId()
  }

  const verifyIncomingJSON = (jsonObj?: Record<string, any>): void => {
    const sanitizedJSONObj = jsonObj ? sanitize(jsonObj, yamlSanityConfig) : null
    if (sanitizedJSONObj && Object.keys(sanitizedJSONObj).length > 0) {
      const yamlEqOfJSON = yamlStringify(sanitizedJSONObj)
      let sanitizedYAML = yamlEqOfJSON.replace(': null\n', ': \n')

      if (isWindowsOS()) {
        sanitizedYAML = sanitizedYAML.replace(carriageReturnRegex, '\n')
      }

      setCurrentYaml(sanitizedYAML)
      yamlRef.current = sanitizedYAML
      verifyYAML({
        updatedYaml: sanitizedYAML,
        setYamlValidationErrors,
        showError,
        schema,
        errorMessage: yamlError
      })
    } else {
      setCurrentYaml('')
      yamlRef.current = ''
      setYamlValidationErrors(undefined)
    }
  }

  /* #region Bootstrap editor with schema */

  // useEffect(() => {
  //   //for optimization, restrict setting value to editor if previous and current json inputs are the same.
  //   //except when editor is reset/cleared, by setting empty json object as input
  //   if (
  //     every([existingJSON, isEmpty(existingJSON), isEmpty(currentJSON)]) ||
  //     JSON.stringify(existingJSON) !== JSON.stringify(currentJSON)
  //   ) {
  //     attempt(verifyIncomingJSON, existingJSON)
  //     setCurrentJSON(existingJSON)
  //   }
  // }, [existingJSON])

  useEffect(() => {
    verifyIncomingJSON(existingJSON)
  }, [JSON.stringify(existingJSON)])

  useEffect(() => {
    if (existingYaml) {
      setCurrentYaml(existingYaml)
      yamlRef.current = existingYaml
      verifyYAML({
        updatedYaml: existingYaml,
        setYamlValidationErrors,
        showError,
        schema,
        errorMessage: yamlError
      })
    }
  }, [existingYaml, schema])

  useEffect(() => {
    if (schema) {
      const languageSettings = getSchemaWithLanguageSettings(schema)
      setUpYAMLBuilderWithLanguageSettings(languageSettings)
    }
  }, [schema])

  const setUpYAMLBuilderWithLanguageSettings = (languageSettings: string | Record<string, any>): void => {
    //@ts-ignore
    const { yaml } = defaultTo(languages, {})
    yaml?.yamlDefaults.setDiagnosticsOptions(languageSettings)
  }

  /* #endregion */

  /* #region Handle various interactions with the editor */

  const validateYAMLAgainstSchema = useCallback(
    (updatedYaml: string): void => {
      if (schema) {
        validateYAMLWithSchema(updatedYaml, getSchemaWithLanguageSettings(schema)).then((errors: Diagnostic[]) => {
          setSchemaValidationErrors(errors)
          if (isEmpty(errors)) {
            setShouldShowErrorPanel(false)
          }
        })
      } else {
        setSchemaValidationErrors([])
        setShouldShowErrorPanel(false)
      }
    },
    [schema]
  )

  const onYamlChange = useCallback(
    debounce((editedYaml: string): void => {
      const updatedYaml = isWindowsOS() ? editedYaml.replace(carriageReturnRegex, '\n') : editedYaml
      setCurrentYaml(updatedYaml)
      yamlRef.current = updatedYaml
      verifyYAML({
        updatedYaml,
        setYamlValidationErrors,
        showError,
        schema,
        errorMessage: yamlError
      })
      if (updatedYaml && schema) {
        validateYAMLAgainstSchema(updatedYaml)
      }
      onChange?.(!(updatedYaml === ''))
      autoCompleteYAML()
    }, 500),
    [setYamlValidationErrors, showError, schema, yamlError, setCurrentYaml, onChange]
  )

  const autoCompleteYAML = useCallback((): void => {
    const editor = editorRef.current?.editor
    if (editor) {
      const currentCursorPosition = editor.getPosition()
      const { lineNumber, column } = currentCursorPosition || {}
      if (lineNumber && column) {
        const editorContent = editor.getModel()?.getValue() || ''
        const contextKey = editorContent.replace('\n', '')
        const { autoCompletionYAML } = AutoCompletionMap.get(contextKey) || {}
        if (AutoCompletionMap.has(contextKey)) {
          editor.executeEdits('', [
            {
              range: {
                startLineNumber: lineNumber,
                startColumn: column,
                endLineNumber: lineNumber,
                endColumn: column
              } as Range,
              text: autoCompletionYAML || '',
              forceMoveMarkers: true
            }
          ])
          const lastLineNum = editor.getModel()?.getLineCount()
          if (lastLineNum) {
            const lastColumn = editor.getModel()?.getLineMaxColumn(lastLineNum)
            editor.setSelection(new monaco.Range(0, 0, 0, 0))
            editor.setPosition({
              lineNumber: lastLineNum,
              column: lastColumn
            } as IPosition)
            const updatedPosition = editor.getPosition()
            if (updatedPosition) {
              setTimeout(() => editor.setPosition({ ...updatedPosition, column: updatedPosition?.column + 1 }), 1000)
            }
          }
        }
      }
    }
  }, [editorRef.current?.editor])

  const showNoPermissionError = useCallback(
    throttle(() => {
      showError(getString('noPermission'), 5000)
    }, 5000),
    []
  )

  const showHarnessManagedError = useCallback(
    throttle(() => {
      showError(getString('common.showHarnessManagedError'), 5000)
    }, 5000),
    []
  )

  const editorDidMount = (editor: editor.IStandaloneCodeEditor): void => {
    // editor.addAction({
    //   id: 'Paste',
    //   label: getString('common.paste'),
    //   keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_V],
    //   contextMenuGroupId: '9_cutcopypaste',
    //   run: async (editor: editor.IStandaloneCodeEditor) => {
    //     try {
    //       const response = await navigator?.clipboard?.readText()
    //       const line = editor.getPosition()
    //       editor.executeEdits('', [
    //         {
    //           range: new monaco.Range(line?.lineNumber, line?.column, line?.lineNumber, line?.column),
    //           text: response ?? ''
    //         }
    //       ])
    //     } catch (e) {
    //       showError(e)
    //     }
    //   }
    // })
    editorVersionRef.current = editor.getModel()?.getAlternativeVersionId()
    if (!props.isReadOnlyMode) {
      editor?.focus()
    }
    editor.onKeyDown((event: IKeyboardEvent) => handleEditorKeyDownEvent(event, editor))
  }

  const disposePreviousSuggestions = (): void => {
    if (expressionCompletionDisposer) {
      expressionCompletionDisposer.dispose()
    }
    if (runTimeCompletionDisposer) {
      runTimeCompletionDisposer.dispose()
    }
    if (allowedValuesCompletionDisposer) {
      allowedValuesCompletionDisposer.dispose()
    }
  }

  /* #endregion */

  /* #region Custom invocations */

  /** Expressions support */
  const getEditorContentInCurrentLine = (editor: editor.IStandaloneCodeEditor): string | undefined => {
    const currentLineNum = editor.getPosition()?.lineNumber
    if (currentLineNum) {
      return editor.getModel()?.getLineContent(currentLineNum)
    }
  }

  const getExpressionFromCurrentLine = (editor: editor.IStandaloneCodeEditor): string | undefined => {
    const expression = getEditorContentInCurrentLine(editor)
      ?.split(':')
      .map((item: string) => item.trim())?.[1]
    return expression
  }

  function registerCompletionItemProviderForExpressions(
    editor: editor.IStandaloneCodeEditor,
    triggerCharacters: string[],
    matchingPath: string | undefined,
    currentExpression: string | undefined = ''
  ): void {
    if (editor && matchingPath) {
      const suggestionsPromise = onExpressionTrigger ? onExpressionTrigger(matchingPath, currentExpression) : null
      if (suggestionsPromise) {
        suggestionsPromise.then(suggestions => {
          // @ts-ignore
          expressionCompletionDisposer = monaco?.languages?.registerCompletionItemProvider('yaml', {
            triggerCharacters,
            provideCompletionItems: () => {
              return { suggestions }
            }
          })
        })
      }
    }
  }

  /** Run-time Inputs support */
  function registerCompletionItemProviderForRTInputs(
    editor: editor.IStandaloneCodeEditor,
    suggestionsPromise: Promise<CompletionItemInterface[]>
  ): void {
    if (editor) {
      suggestionsPromise.then(suggestions => {
        // @ts-ignore
        disposePreviousSuggestions()
        runTimeCompletionDisposer = monaco?.languages?.registerCompletionItemProvider('yaml', {
          triggerCharacters: [' '],
          provideCompletionItems: () => {
            return { suggestions }
          }
        })
      })
    }
  }

  function isAllowedValues(input: string): boolean {
    let regex = /<\+input>\.allowedValues\([^)]*\)/i
    return regex.test(input)
  }

  const getAllowedValuesFromString = (inputValue: string): CompletionItemInterface[] => {
    const parsedInput = parseInput(inputValue)
    const items: CompletionItemInterface[] = defaultTo(parsedInput?.allowedValues?.values, []).map(item => ({
      label: item,
      insertText: item,
      kind: CompletionItemKind.Field
    }))

    return items
  }

  /** Run-time Allowed values Inputs support */
  function registerCompletionItemProviderForAllowedValues(
    editor: editor.IStandaloneCodeEditor,
    currentPathValue: string
  ): void {
    if (isAllowedValues(currentPathValue)) {
      const suggestedValues = getAllowedValuesFromString(currentPathValue)
      if (editor) {
        disposePreviousSuggestions()
        allowedValuesCompletionDisposer = monaco?.languages?.registerCompletionItemProvider('yaml', {
          triggerCharacters: [' '],
          provideCompletionItems: () => {
            return { suggestions: suggestedValues }
          }
        })
      }
    }
  }

  const invokeCallBackForMatchingYAMLPaths = (
    editor: editor.IStandaloneCodeEditor,
    matchingPath: string | undefined
  ): void => {
    if (editor && matchingPath) {
      invocationMap?.forEach((callBackFunc, yamlPath) => {
        if (matchingPath.match(yamlPath) && typeof callBackFunc === 'function') {
          const yamlFromEditor = getYAMLFromEditor(editor, true) as string
          const suggestionsPromise = callBackFunc(matchingPath, yamlFromEditor, params)
          registerCompletionItemProviderForRTInputs(editor, suggestionsPromise)
        }
      })
    }
  }

  const shouldInvokeExpressions = (editor: editor.IStandaloneCodeEditor, event: IKeyboardEvent): boolean => {
    const lastKeyStrokeCharacter = getEditorContentInCurrentLine(editor)?.substr(-1)
    const { shiftKey, code } = event
    return lastKeyStrokeCharacter === ANGULAR_BRACKET_CHAR && shiftKey && code === KEY_CODE_FOR_PLUS_SIGN
  }

  /* #endregion */

  const { openDialog } = openDialogProp
    ? { openDialog: openDialogProp }
    : useConfirmationDialog({
        contentText: getString('yamlBuilder.enableEditContext'),
        titleText: getString('confirm'),
        confirmButtonText: getString('enable'),
        cancelButtonText: getString('cancel'),
        intent: Intent.WARNING,
        onCloseDialog: async didConfirm => {
          if (didConfirm) {
            onEnableEditMode?.()
          }
        }
      })

  const handleEditorKeyDownEvent = (event: IKeyboardEvent, editor: any): void => {
    if (isHarnessManaged) {
      showHarnessManagedError()
    } else if (props.isReadOnlyMode && isEditModeSupported) {
      const { keyCode, code, ctrlKey, metaKey, shiftKey } = event
      const isMetaOrControlKeyPressed = [CONTROL_EVENT_KEY_CODE, META_EVENT_KEY_CODE, SHIFT_EVENT_KEY_CODE].includes(
        keyCode
      )
      const isMetaOrControlKeyPressedForCopyPaste =
        (ctrlKey || metaKey || shiftKey) && allowedKeysInEditModeMap.includes(code)
      const navigationKeysPressed = navigationKeysMap.includes(code)
      if (!(isMetaOrControlKeyPressed || isMetaOrControlKeyPressedForCopyPaste || navigationKeysPressed)) {
        // this is to avoid showing warning dialog if user just wants to copy paste
        openDialog()
      }
    } else if (props.isReadOnlyMode && !isEditModeSupported && !hideErrorMesageOnReadOnlyMode) {
      showNoPermissionError()
    }
    try {
      const { shiftKey, code, ctrlKey, metaKey } = event
      //TODO Need to check hotkey for cross browser/cross OS compatibility

      // this is to prevent reset of the editor to empty when there is no undo history
      if ((ctrlKey || metaKey) && code === KEY_CODE_FOR_CHAR_Z) {
        if (editorVersionRef.current && editorVersionRef.current + 1 === getEditorCurrentVersion()) {
          event.stopPropagation()
          event.preventDefault()
        }
      }

      // dispose expressionCompletion if (+) sign is not preceding with (<)
      if (code === KEY_CODE_FOR_PLUS_SIGN) {
        const lastKeyStrokeCharacter = getEditorContentInCurrentLine(editor)?.substr(-1)
        if (lastKeyStrokeCharacter !== ANGULAR_BRACKET_CHAR) {
          expressionCompletionDisposer?.dispose()
        }
      }

      if (code === KEY_CODE_FOR_SPACE || code === KEY_CODE_FOR_SEMI_COLON) {
        const yamlPathForAllowedValues = getMetaDataForKeyboardEventProcessing({
          editor,
          onErrorCallback
        })?.parentToCurrentPropertyPath

        //currently working with Pipelines and InputSets entityTypes only as these are the only ones which support runtime inputs
        const currentPathWithoutEntityType =
          //for runPipelineForm we don't need to remove the entityType as it already starts from 'pipeline.[something]'
          entityType === 'Pipelines'
            ? defaultTo(yamlPathForAllowedValues, '')
            : entityType === 'InputSets'
            ? defaultTo(yamlPathForAllowedValues?.split('inputSet.').pop(), '')
            : ''
        const currentPathValue = get(comparableYamlJson, currentPathWithoutEntityType)

        //disposing values
        if (isAllowedValues(currentPathValue)) {
          runTimeCompletionDisposer?.dispose()
          expressionCompletionDisposer?.dispose()
        } else {
          allowedValuesCompletionDisposer?.dispose()
        }

        // this is to invoke allowedValues inputs as suggestions
        if (isAllowedValues(currentPathValue)) {
          registerCompletionItemProviderForAllowedValues(editor, currentPathValue)
        }

        // this is to invoke run-time inputs as suggestions
        // also these are restricted to specific keystrokes as these action make api calls
        if ((ctrlKey && code === KEY_CODE_FOR_SPACE) || (shiftKey && code === KEY_CODE_FOR_SEMI_COLON)) {
          if (invocationMap && invocationMap.size > 0 && !isAllowedValues(currentPathValue)) {
            const yamlPathForNonAllowedValued = getMetaDataForKeyboardEventProcessing({
              editor,
              onErrorCallback,
              shouldAddPlaceholder: true
            })?.parentToCurrentPropertyPath
            invokeCallBackForMatchingYAMLPaths(editor, yamlPathForNonAllowedValued)
          }
        }
      }

      if (shiftKey) {
        // this is to invoke expressions callback
        if (shouldInvokeExpressions(editor, event)) {
          const yamlPath = getMetaDataForKeyboardEventProcessing({
            editor,
            onErrorCallback
          })?.parentToCurrentPropertyPath
          disposePreviousSuggestions()
          registerCompletionItemProviderForExpressions(editor, TRIGGER_CHARS_FOR_NEW_EXPR, yamlPath)
        }
      }
      // this is to invoke partial expressions callback e.g. invoke expressions callback on hitting a period(.) after an expression: expr1.expr2. <-
      if (code === KEY_CODE_FOR_PERIOD) {
        const yamlPath = getMetaDataForKeyboardEventProcessing({ editor, onErrorCallback })?.parentToCurrentPropertyPath
        disposePreviousSuggestions()
        registerCompletionItemProviderForExpressions(
          editor,
          [TRIGGER_CHAR_FOR_PARTIAL_EXPR],
          yamlPath,
          getExpressionFromCurrentLine(editor)
        )
      }
    } catch (err) {
      showError(yamlError)
    }
  }

  const renderHeader = useCallback(
    (): JSX.Element => (
      <div className={cx(css.header)}>
        <div className={css.flexCenter}>
          <span className={cx(css.filePath, css.flexCenter, { [css.lightBg]: theme === 'DARK' })}>{fileName}</span>
          {fileName && entityType ? <Tag className={css.entityTag}>{entityType}</Tag> : null}
          {yamlRef.current ? (
            <Container padding={{ left: 'medium' }}>
              {showCopyIcon ? <CopyToClipboard content={defaultTo(yamlRef.current, '')} showFeedback={true} /> : null}
            </Container>
          ) : null}
        </div>
      </div>
    ),
    [yamlValidationErrors, fileName, entityType, theme]
  )

  // used to remove initial selection that appears when yaml builder is loaded with an initial value
  useEffect(() => {
    if (every([!initialSelectionRemoved, editorRef.current?.editor?.getValue()])) {
      editorRef.current?.editor?.setSelection(new monaco.Range(0, 0, 0, 0))
      setInitialSelectionRemoved(true)
    }
  }, [currentYaml])

  useEffect(() => {
    if (height) {
      if (shouldShowErrorPanel && !isEmpty(schemaValidationErrors)) {
        const heightWithErrorPanel: React.CSSProperties['height'] = 'calc(80vh - 250px)'
        setDynamicHeight(heightWithErrorPanel)
      } else {
        setDynamicHeight(height)
      }
    }
  }, [shouldShowErrorPanel, height, schemaValidationErrors])

  const renderErrorPanel = useCallback((): JSX.Element => {
    if (isUndefined(schemaValidationErrors)) {
      return <></>
    }
    const { lineNumber, column } = editorRef.current?.editor?.getPosition() || {}
    return (
      <Collapse
        isOpen={shouldShowErrorPanel}
        onToggleOpen={(isOpen: boolean) => setShouldShowErrorPanel(isOpen)}
        heading={
          <Layout.Horizontal
            background={Color.GREY_50}
            flex={{ alignItems: 'center' }}
            width={showPluginsPanel ? '90%' : '95%'}
          >
            <Text
              color={Color.RED_800}
              font={{ variation: FontVariation.BODY2 }}
              padding={{ top: 'small', left: 'medium' }}
            >{`${schemaValidationErrors.length} ${getString('error')}${pluralize(
              schemaValidationErrors.length
            )}`}</Text>
            <Layout.Horizontal flex spacing="medium">
              {lineNumber && column ? (
                <Text font={{ variation: FontVariation.SMALL }}>{`Ln ${lineNumber}, Col ${column}`}</Text>
              ) : null}
              <Text font={{ variation: FontVariation.SMALL }}>{getString('yaml')}</Text>
            </Layout.Horizontal>
          </Layout.Horizontal>
        }
        collapsedIcon="chevron-up"
        expandedIcon="chevron-down"
        collapseClassName={css.errorPanelCollapse}
        collapseHeaderClassName={css.errorPanelHeader}
      >
        <Container padding={{ top: 'small' }} className={css.errorPanel}>
          {schemaValidationErrors.map((error: Diagnostic) => {
            const { message, range } = error
            const { end } = range
            const { line: row, character: column } = end
            const editor = editorRef.current?.editor
            return message ? (
              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start' }}
                spacing="xsmall"
                padding={{ bottom: 'small' }}
                onClick={() => {
                  editor?.setPosition({ lineNumber: row + 1, column })
                  editor?.revealLineInCenter(row + 1)
                  editor?.focus()
                }}
                className={css.errorRow}
              >
                <Icon name="danger-icon" />
                <Text font={{ variation: FontVariation.BODY }}>
                  {message} [Ln&nbsp;{row + 1},&nbsp;Col&nbsp;{column}]
                </Text>
              </Layout.Horizontal>
            ) : null
          })}
        </Container>
      </Collapse>
    )
  }, [schemaValidationErrors, shouldShowErrorPanel, editorRef.current?.editor?.getPosition()])

  const renderEditor = useCallback(
    (): JSX.Element => (
      <MonacoEditor
        width={dynamicWidth}
        height={dynamicHeight}
        language="yaml"
        value={currentYaml}
        onChange={onYamlChange}
        editorDidMount={editorDidMount}
        options={
          {
            readOnly: defaultTo(isReadOnlyMode, !isEditModeSupported),
            wordBasedSuggestions: false,
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            minimap: {
              enabled: false
            }
          } as MonacoEditorProps['options']
        }
        ref={editorRef}
      />
    ),
    [dynamicWidth, dynamicHeight, currentYaml, onYamlChange]
  )

  const throttledOnResize = throttle(() => {
    editorRef.current?.editor?.layout()
  }, 500)

  useEffect(() => {
    window.addEventListener('resize', throttledOnResize)
    return () => {
      window.removeEventListener('resize', throttledOnResize)
      disposePreviousSuggestions()
    }
  }, [])

  const showErrorFooter = showErrorPanel && !isEmpty(schemaValidationErrors)

  const addCodeLens = useCallback(
    (fromLine: number, toLineNum: number) => {
      const commandId = editorRef.current?.editor?.addCommand(
        0,
        function () {
          setPluginInput('\na\nb')
        },
        ''
      )

      const registrationId = monaco.languages.registerCodeLensProvider('yaml', {
        provideCodeLenses: function (_model: unknown, _token: unknown) {
          return {
            lenses: [
              {
                range: {
                  startLineNumber: fromLine,
                  startColumn: 1,
                  endLineNumber: toLineNum,
                  endColumn: 1
                },
                id: 'plugin-settings',
                command: {
                  id: commandId,
                  title: 'Settings'
                }
              }
            ],
            dispose: () => {}
          }
        }
      })

      return () => {
        registrationId.dispose()
      }
    },
    [editorRef.current?.editor]
  )

  const addTextAtCurrentCursorPosition = useCallback(
    (textToInsert: string): void => {
      const editor = editorRef.current?.editor
      const linesOfText = textToInsert.split('\n')
      const numberOfNewLinesIntroduced = linesOfText.length
      if (editor) {
        const position = editor?.getPosition()
        if (position) {
          editor.trigger('keyboard', 'type', { text: `\n${textToInsert}` })
          const endingLineForCursorPosition =
            position.lineNumber + (numberOfNewLinesIntroduced ? numberOfNewLinesIntroduced : 0)
          const contentInEndlingLine = editor.getModel()?.getLineContent(endingLineForCursorPosition)
          if (contentInEndlingLine) {
            editor.setPosition({
              column: contentInEndlingLine.length + 1,
              lineNumber: endingLineForCursorPosition
            })
            editor.focus()
          }
          highlightInsertedText(position.lineNumber, endingLineForCursorPosition)
          addCodeLens(position.lineNumber, endingLineForCursorPosition)
        }
      }
    },
    [editorRef.current?.editor]
  )

  const highlightInsertedText = useCallback(
    (fromLine: number, toLineNum: number): void => {
      const pluginInputDecoration: editor.IModelDeltaDecoration = {
        range: new monaco.Range(fromLine, 1, toLineNum, 1),
        options: {
          isWholeLine: false,
          className: css.pluginDecorator
        }
      }
      editorRef?.current?.editor?.deltaDecorations([], [pluginInputDecoration])
    },
    [editorRef.current?.editor]
  )

  useEffect(() => {
    if (pluginInput) {
      addTextAtCurrentCursorPosition(pluginInput)
    }
  }, [pluginInput])

  return (
    <Layout.Horizontal>
      <Layout.Vertical>
        <div
          className={cx(
            css.main,
            { [css.darkBg]: theme === 'DARK' },
            { [css.borderWithErrorPanel]: showErrorFooter },
            { [css.borderWithPluginsPanel]: showPluginsPanel }
          )}
        >
          <div className={css.editor}>
            {defaultTo(renderCustomHeader, renderHeader)()}
            {renderEditor()}
          </div>
        </div>
        {showErrorFooter ? <Container padding={{ bottom: 'medium' }}>{renderErrorPanel()}</Container> : null}
      </Layout.Vertical>
      {showPluginsPanel ? (
        <PluginsPanel
          height={height}
          onPluginAdd={(pluginInput: string) => setPluginInput(pluginInput)}
          existingPluginValues={pluginInput}
        />
      ) : null}
    </Layout.Horizontal>
  )
}

export default YAMLBuilder

export const YamlBuilderMemo = React.memo(YAMLBuilder, (prevProps, nextProps) => {
  if (isNil(prevProps.schema) && !isNil(nextProps.schema)) {
    return false
  }
  return isEqualWith(nextProps, prevProps, (_arg1, _arg2, key) => {
    if (
      ['existingJSON', 'onExpressionTrigger', 'schema', 'onEnableEditMode', 'openDialogProp'].indexOf(key as string) >
      -1
    ) {
      return true
    }
  })
})
