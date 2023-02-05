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
import { IKeyboardEvent, languages, Position } from 'monaco-editor/esm/vs/editor/editor.api'
import type { editor, IDisposable } from 'monaco-editor/esm/vs/editor/editor.api'
import {
  debounce,
  isEmpty,
  throttle,
  defaultTo,
  attempt,
  every,
  isEqualWith,
  isNil,
  get,
  set,
  truncate
} from 'lodash-es'
import { Icon, Layout, Tag, Container, useConfirmationDialog } from '@harness/uicore'
import { useToaster } from '@common/exports'
import { useParams } from 'react-router-dom'
import { Intent, Popover, PopoverInteractionKind, Position as PopoverPosition } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import cx from 'classnames'
import { scalarOptions, defaultOptions, parse } from 'yaml'
import type {
  YamlBuilderProps,
  YamlBuilderHandlerBinding,
  CompletionItemInterface,
  Theme
} from '@common/interfaces/YAMLBuilderProps'
import { findAllValuesForJSONPath, getSchemaWithLanguageSettings } from '@common/utils/YamlUtils'
import { sanitize } from '@common/utils/JSONUtils'
import { Status } from '@common/utils/Constants'
import {
  getYAMLFromEditor,
  getMetaDataForKeyboardEventProcessing,
  verifyYAML,
  findPositionsForMatchingKeys,
  getStageYAMLPathForStageIndex,
  getStepYAMLPathForStepInsideAStage
} from './YAMLBuilderUtils'

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
  allowedKeysInEditModeMap,
  MAX_ERR_MSSG_LENGTH,
  allowedKeysInReadOnlyModeMap
} from './YAMLBuilderConstants'
import CopyToClipboard from '../CopyToClipBoard/CopyToClipBoard'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { countAllKeysInObject } from '@common/utils/utils'
import { parseInput } from '../ConfigureOptions/ConfigureOptionsUtils'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { PluginAddUpdateMetadata, PluginsPanel, PluginType } from '../PluginsPanel/PluginsPanel'

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
    comparableYaml,
    displayBorder = true,
    shouldShowPluginsPanel = false,
    toggleResizeButton,
    customCss
  } = props
  const comparableYamlJson = parse(defaultTo(comparableYaml, ''))

  setUpEditor(theme)
  const params = useParams()
  const [currentYaml, setCurrentYaml] = useState<string>(defaultTo(existingYaml, ''))
  const [initialSelectionRemoved, setInitialSelectionRemoved] = useState<boolean>(
    !defaultTo(existingYaml, existingJSON)
  )
  const [yamlValidationErrors, setYamlValidationErrors] = useState<Map<number, string> | undefined>()

  const editorRef = useRef<ReactMonacoEditor>(null)
  const yamlRef = useRef<string | undefined>('')
  const yamlValidationErrorsRef = useRef<Map<number, string>>()
  yamlValidationErrorsRef.current = yamlValidationErrors
  const editorVersionRef = useRef<number>()
  const currentCursorPosition = useRef<Position>()
  const codeLensRegistrations = useRef<Map<number, IDisposable>>(new Map<number, IDisposable>())
  const [selectedPlugin, setSelectedPlugin] = useState<Record<string, any>>()
  const [pluginAddUpdateOpnStatus, setPluginAddUpdateOpnStatus] = useState<Status>()
  const stepMatchRegex = 'steps:\\n(\\s*)-(\\s*)name:'
  const stageMatchRegex = 'spec:\\n(\\s*)steps:\\n(\\s*)-(\\s*)name:'

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

  const getEditorCurrentVersion = (): number | undefined => {
    return editorRef.current?.editor?.getModel()?.getAlternativeVersionId()
  }

  const verifyIncomingJSON = (jsonObj?: Record<string, any>): void => {
    const sanitizedJSONObj = jsonObj ? sanitize(jsonObj, yamlSanityConfig) : null
    if (sanitizedJSONObj && Object.keys(sanitizedJSONObj).length > 0) {
      const yamlEqOfJSON = yamlStringify(sanitizedJSONObj)
      let sanitizedYAML = yamlEqOfJSON.replace(': null\n', ': \n')

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

  const onYamlChange = useCallback(
    debounce((updatedYaml: string): void => {
      setCurrentYaml(updatedYaml)
      yamlRef.current = updatedYaml
      verifyYAML({
        updatedYaml,
        setYamlValidationErrors,
        showError,
        schema,
        errorMessage: yamlError
      })
      onChange?.(!(updatedYaml === ''))
    }, 500),
    [setYamlValidationErrors, showError, schema, yamlError, setCurrentYaml, onChange]
  )

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
    currentCursorPosition.current = new Position(0, 0)
    if (!props.isReadOnlyMode) {
      editor?.focus()
    }
    editor.onKeyDown((event: IKeyboardEvent) => handleEditorKeyDownEvent(event, editor))
    editor.onDidChangeCursorPosition((event: editor.ICursorPositionChangedEvent) => {
      currentCursorPosition.current = event.position
    })
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
    const { keyCode, code, ctrlKey, metaKey, shiftKey } = event
    const isMetaOrControlKeyPressed = [CONTROL_EVENT_KEY_CODE, META_EVENT_KEY_CODE, SHIFT_EVENT_KEY_CODE].includes(
      keyCode
    )
    const navigationKeysPressed = navigationKeysMap.includes(code)
    if (isHarnessManaged) {
      showHarnessManagedError()
    } else if (props.isReadOnlyMode && isEditModeSupported) {
      const isMetaOrControlKeyPressedForCopyPaste =
        (ctrlKey || metaKey || shiftKey) && allowedKeysInEditModeMap.includes(code)
      if (!(isMetaOrControlKeyPressed || isMetaOrControlKeyPressedForCopyPaste || navigationKeysPressed)) {
        // this is to avoid showing warning dialog if user just wants to copy paste
        openDialog()
      }
    } else if (props.isReadOnlyMode && !isEditModeSupported && !hideErrorMesageOnReadOnlyMode) {
      const isMetaOrControlKeyPressedForCopy =
        (ctrlKey || metaKey || shiftKey) && allowedKeysInReadOnlyModeMap.includes(code)
      if (!(isMetaOrControlKeyPressed || isMetaOrControlKeyPressedForCopy || navigationKeysPressed)) {
        // this is to avoid showing warning dialog if user just wants to copy paste
        showNoPermissionError()
      }
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

  const getErrorSummary = (errorMap?: Map<number, string>): React.ReactElement => {
    const errors: React.ReactElement[] = []
    errorMap?.forEach((value, key) => {
      const error = (
        <li className={css.item} title={value} key={key}>
          {getString('yamlBuilder.lineNumberLabel')}&nbsp;
          {key + 1},&nbsp;
          {truncate(value, { length: MAX_ERR_MSSG_LENGTH })}
        </li>
      )
      errors.push(error)
    })
    return (
      <div className={css.errorSummary}>
        <ol className={css.errorList}>{errors}</ol>
      </div>
    )
  }

  const renderHeader = useCallback(
    (): JSX.Element => (
      <div className={cx(css.header)}>
        <div className={css.flexCenter}>
          <span className={cx(css.filePath, css.flexCenter, { [css.lightBg]: theme === 'DARK' })}>{fileName}</span>
          {fileName && entityType ? <Tag className={css.entityTag}>{entityType}</Tag> : null}
          {yamlRef.current ? (
            <Container padding={{ left: entityType ? 'medium' : undefined }}>
              {showCopyIcon ? <CopyToClipboard content={defaultTo(yamlRef.current, '')} showFeedback={true} /> : null}
            </Container>
          ) : null}
        </div>
        <div className={cx(css.flexCenter, css.validationStatus)}>
          {!isReadOnlyMode && yamlValidationErrors && yamlValidationErrors.size > 0 && (
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              position={PopoverPosition.TOP}
              content={getErrorSummary(yamlValidationErrors)}
              popoverClassName={css.summaryPopover}
            >
              <div>
                <Icon name="main-issue-filled" size={14} className={css.validationIcon} />
                <span className={css.invalidYaml}>{getString('invalidText')}</span>
              </div>
            </Popover>
          )}
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

  const renderEditor = useCallback(
    (): JSX.Element => (
      <MonacoEditor
        width={width}
        height={defaultTo(height, DEFAULT_EDITOR_HEIGHT)}
        language="yaml"
        value={currentYaml}
        onChange={onYamlChange}
        editorDidMount={editorDidMount}
        options={
          {
            readOnly: defaultTo(isReadOnlyMode, !isEditModeSupported),
            wordBasedSuggestions: false,
            scrollBeyondLastLine: false,
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            minimap: {
              enabled: false
            },
            codeLens: codeLensRegistrations.current.size > 0
          } as MonacoEditorProps['options']
        }
        ref={editorRef}
      />
    ),
    [width, height, currentYaml, onYamlChange, codeLensRegistrations.current]
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

  const addCodeLensRegistration = useCallback(
    ({
      fromLine,
      toLineNum,
      cursorPosition
    }: {
      fromLine: number
      toLineNum: number
      cursorPosition: Position
    }): IDisposable => {
      const commandId = editorRef.current?.editor?.addCommand(
        0,
        () => {
          try {
            const numberOfLinesInSelection = getSelectionRangeOnSettingsBtnClick(cursorPosition, currentYaml)
            if (numberOfLinesInSelection) {
              currentCursorPosition.current = cursorPosition
              highlightInsertedYAML(fromLine, toLineNum + numberOfLinesInSelection - 1)
            }
          } catch (e) {
            //ignore error
          }
        },
        ''
      )
      const registrationId: IDisposable = monaco.languages.registerCodeLensProvider('yaml', {
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
            dispose: () => {
              try {
                registrationId.dispose()
              } catch (e) {
                // ignore error
              }
            }
          }
        }
      })
      return registrationId
    },
    [editorRef.current?.editor, currentYaml]
  )

  const getClosestIndexToSearchToken = useCallback(
    (
      sourcePosition: Position,
      searchToken: string,
      startIdxForLookup?: number,
      noOfResultsToBeIncludedInLookup?: number
    ): number => {
      const editor = editorRef.current?.editor
      if (editor) {
        const { lineNumber: currentCursorLineNum } = sourcePosition || {}
        if (currentCursorLineNum) {
          const allMatchesFound = findPositionsForMatchingKeys(editor, searchToken)
          const relevantMatches = (
            startIdxForLookup && noOfResultsToBeIncludedInLookup
              ? allMatchesFound.slice(startIdxForLookup, noOfResultsToBeIncludedInLookup)
              : allMatchesFound
          )
            .map((position: Position) => position.lineNumber)
            ?.sort(function (location1, location2) {
              return location1 - location2
            })
          let closestPosition = -1
          for (let matchItr = 0; matchItr < relevantMatches.length; matchItr++) {
            if (matchItr === relevantMatches.length - 1 && currentCursorLineNum >= relevantMatches[matchItr]) {
              closestPosition = matchItr
              break
            } else if (
              currentCursorLineNum < relevantMatches[matchItr] ||
              (currentCursorLineNum >= relevantMatches[matchItr] &&
                currentCursorLineNum < relevantMatches[matchItr + 1])
            ) {
              closestPosition = matchItr
              break
            }
          }
          return closestPosition
        }
      }
      return 0
    },
    [editorRef.current?.editor]
  )

  const getClosestStepIndexInCurrentStage = useCallback(
    (cursorPosition: Position, precedingStageStepsCount: number, currentStageStepsCount: number): number => {
      let closestStepIndex = -1
      if (precedingStageStepsCount > 0) {
        closestStepIndex = getClosestIndexToSearchToken(
          cursorPosition,
          stepMatchRegex,
          precedingStageStepsCount,
          precedingStageStepsCount + currentStageStepsCount
        )
      } else {
        closestStepIndex = getClosestIndexToSearchToken(cursorPosition, stepMatchRegex, 0, currentStageStepsCount)
      }
      return closestStepIndex === -1 ? 0 : closestStepIndex
    },
    []
  )

  const spotLightInsertedYAML = useCallback(
    ({
      noOflinesInserted,
      closestStageIndex,
      isPluginUpdate,
      closestStepIndex,
      startStepIndex
    }: {
      noOflinesInserted: number
      closestStageIndex: number
      isPluginUpdate: boolean
      closestStepIndex: number
      startStepIndex: number
    }): void => {
      const editor = editorRef.current?.editor
      if (editor) {
        let position: Position
        if (isPluginUpdate) {
          const allMatches = findPositionsForMatchingKeys(editor, stepMatchRegex) || []
          const allMatchesInClosestStageIndex = allMatches.slice(startStepIndex)
          position = allMatchesInClosestStageIndex[closestStepIndex]
          const { lineNumber: startingLineNum } = position
          const endingLineNum = startingLineNum + noOflinesInserted > 0 ? startingLineNum + noOflinesInserted - 1 : 0
          const contentInEndingLine = editor.getModel()?.getLineContent(endingLineNum) || ''

          // highlight the inserted text
          highlightInsertedYAML(startingLineNum, endingLineNum + 1)

          // Scroll to the end of the inserted text
          editor.setPosition({ column: contentInEndingLine.length + 1, lineNumber: endingLineNum })
          editor.revealLineInCenter(endingLineNum)
          editor.focus()
        } else {
          position = findPositionsForMatchingKeys(editor, 'steps')[closestStageIndex]
          const endingLineForCursorPosition = position.lineNumber + noOflinesInserted
          const contentInStartingLine = editor.getModel()?.getLineContent(position.lineNumber)?.trim() || ''
          const contentInEndingLine = editor.getModel()?.getLineContent(endingLineForCursorPosition) || ''
          const startingLineNum = position.lineNumber + (contentInStartingLine ? 1 : 0)
          const endingLineNum = contentInStartingLine ? endingLineForCursorPosition + 1 : endingLineForCursorPosition

          // highlight the inserted text
          highlightInsertedYAML(startingLineNum, endingLineNum)

          // Scroll to the end of the inserted text
          editor.setPosition({ column: contentInEndingLine.length + 1, lineNumber: endingLineForCursorPosition })
          editor.revealLineInCenter(endingLineForCursorPosition)
          editor.focus()
        }
      }
    },
    [editorRef.current?.editor]
  )

  const getSelectionRangeOnSettingsBtnClick = useCallback((cursorPosition: Position, latestYAML: string): number => {
    if (cursorPosition) {
      try {
        const currentYAMLAsJSON = parse(latestYAML)
        const closestStageIndex = getClosestIndexToSearchToken(cursorPosition, stageMatchRegex)
        const stageStepsForTheClosestIndex = findAllValuesForJSONPath(
          currentYAMLAsJSON,
          getStageYAMLPathForStageIndex(closestStageIndex)
        ) as unknown[]
        const stageStepsForThePrecedingIndex =
          closestStageIndex > 0
            ? (findAllValuesForJSONPath(
                currentYAMLAsJSON,
                getStageYAMLPathForStageIndex(closestStageIndex - 1)
              ) as unknown[])
            : []
        const stageStepsCountForThePrecedingIndex = (stageStepsForThePrecedingIndex as unknown[]).length
        const closestStepIndex = getClosestStepIndexInCurrentStage(
          cursorPosition,
          stageStepsCountForThePrecedingIndex,
          stageStepsForTheClosestIndex.length
        )
        const stepYAMLPath = getStepYAMLPathForStepInsideAStage(closestStageIndex, closestStepIndex)
        const pluginAsStep = get(currentYAMLAsJSON, stepYAMLPath) as Record<string, any>
        setSelectedPlugin(pluginAsStep)
        const stepValueTokens = yamlStringify(pluginAsStep).split('\n').length
        return stepValueTokens
      } catch (e) {
        // ignore error
      }
    }
    return 0
  }, [])

  useEffect(() => {
    const editor = editorRef.current?.editor
    if (shouldShowPluginsPanel && editor) {
      const matchingPositions = findPositionsForMatchingKeys(editor, stepMatchRegex)
      if (matchingPositions.length) {
        matchingPositions.map((matchingPosition: Position) => {
          const { lineNumber } = matchingPosition
          if (codeLensRegistrations.current.has(lineNumber)) {
            const existingRegistrationId = codeLensRegistrations.current.get(lineNumber)
            if (existingRegistrationId) {
              try {
                existingRegistrationId.dispose()
              } catch (ex) {
                //ignore excetion
              }
              codeLensRegistrations.current.delete(lineNumber)
            }
          }
          const registrationId = addCodeLensRegistration({
            fromLine: lineNumber,
            toLineNum: lineNumber,
            cursorPosition: matchingPosition
          })
          codeLensRegistrations.current.set(lineNumber, registrationId)
        })
      }
    }
  }, [currentYaml, editorRef.current?.editor, shouldShowPluginsPanel, codeLensRegistrations.current])

  const highlightInsertedYAML = useCallback(
    (fromLine: number, toLineNum: number): void => {
      const pluginInputDecoration: editor.IModelDeltaDecoration = {
        range: new monaco.Range(fromLine, 1, toLineNum, 1),
        options: {
          isWholeLine: false,
          className: css.pluginDecorator
        }
      }
      const decorations = editorRef.current?.editor?.deltaDecorations([], [pluginInputDecoration])
      if (decorations) {
        setTimeout(() => editorRef.current?.editor?.deltaDecorations(decorations, []), 10000)
      }
    },
    [editorRef.current?.editor]
  )

  const wrapPlugInputInAStep = useCallback((pluginMetadata: PluginAddUpdateMetadata): Record<string, any> => {
    const { pluginData, pluginType, pluginName, pluginUses } = pluginMetadata
    return {
      name: pluginName,
      //@vardan confirm if id needs to be there
      id: `${pluginName?.split(' ').join('_')}_${new Date().getTime().toString()}`,
      type: pluginType,
      spec:
        pluginType === PluginType.HARNESS
          ? sanitizePluginValues(pluginData)
          : { with: sanitizePluginValues(pluginData), uses: pluginUses }
    }
  }, [])

  const sanitizePluginValues = useCallback((unSanitizedObj: Record<string, any>): Record<string, any> => {
    try {
      return JSON.parse(JSON.stringify(unSanitizedObj).replace(/\:null/gi, ':""'))
    } catch (e) {
      return unSanitizedObj
    }
  }, [])

  const addUpdatePluginIntoExistingYAML = useCallback(
    (pluginMetadata: PluginAddUpdateMetadata, isPluginUpdate: boolean): void => {
      const { pluginData, shouldInsertYAML } = pluginMetadata
      const cursorPosition = currentCursorPosition.current
      if (!isEmpty(pluginData) && shouldInsertYAML && cursorPosition) {
        try {
          const closestStageIndex = getClosestIndexToSearchToken(cursorPosition, stageMatchRegex)
          if (closestStageIndex < 0) {
            setPluginAddUpdateOpnStatus(Status.ERROR)
            return
          }
          const yamlStepToBeInsertedAt = getStageYAMLPathForStageIndex(closestStageIndex)
          const currentPipelineJSON = parse(currentYaml)
          const existingSteps =
            (findAllValuesForJSONPath(currentPipelineJSON, yamlStepToBeInsertedAt) as unknown[]) || []
          let updatedSteps = existingSteps.slice(0) as unknown[]
          const pluginValuesAsStep = wrapPlugInputInAStep(pluginMetadata)
          const stepCountInPrecedingStage = (
            closestStageIndex > 0
              ? (findAllValuesForJSONPath(
                  currentPipelineJSON,
                  getStageYAMLPathForStageIndex(closestStageIndex - 1)
                ) as unknown[])
              : []
          ).length
          let closestStepIndexInCurrentStage: number = 0
          if (isPluginUpdate) {
            const currentStageIndex = getClosestIndexToSearchToken(cursorPosition, stageMatchRegex)
            const stepsInCurrentStage = findAllValuesForJSONPath(
              currentPipelineJSON,
              getStageYAMLPathForStageIndex(currentStageIndex)
            ) as unknown[]
            closestStepIndexInCurrentStage = getClosestStepIndexInCurrentStage(
              cursorPosition,
              stepCountInPrecedingStage,
              stepsInCurrentStage.length
            )
            updatedSteps[closestStepIndexInCurrentStage] = pluginValuesAsStep
          } else {
            if (Array.isArray(existingSteps) && existingSteps.length > 0) {
              updatedSteps.unshift(pluginValuesAsStep)
            } else {
              updatedSteps = [pluginValuesAsStep]
            }
          }
          const updatedYAML = yamlStringify(set(currentPipelineJSON, yamlStepToBeInsertedAt, updatedSteps))
          onYamlChange(updatedYAML)
          setCurrentYaml(updatedYAML)
          setPluginAddUpdateOpnStatus(Status.SUCCESS)
          spotLightInsertedYAML({
            noOflinesInserted: countAllKeysInObject(pluginValuesAsStep),
            closestStageIndex,
            isPluginUpdate,
            closestStepIndex: closestStepIndexInCurrentStage,
            startStepIndex: stepCountInPrecedingStage
          })
        } catch (e) {
          // ignore error
        }
      }
    },
    [currentCursorPosition, currentYaml]
  )

  const renderEditorControls = useCallback((): React.ReactElement => {
    return !isReadOnlyMode && isEditModeSupported ? (
      <Layout.Horizontal>
        <Icon className={css.resizeIcon} name="main-minimize" onClick={toggleResizeButton} />
      </Layout.Horizontal>
    ) : (
      <></>
    )
  }, [isReadOnlyMode, isEditModeSupported])

  return shouldShowPluginsPanel ? (
    <Layout.Horizontal>
      <Layout.Vertical>
        <div
          className={cx(css.borderWithPluginsPanel, {
            [css.darkBg]: theme === 'DARK'
          })}
        >
          <div className={css.editor}>
            <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} spacing="medium" className={css.headerBorder}>
              {renderEditorControls()}
              {defaultTo(renderCustomHeader, renderHeader)()}
            </Layout.Horizontal>
            {renderEditor()}
          </div>
        </div>
      </Layout.Vertical>
      <PluginsPanel
        height={height}
        onPluginAddUpdate={addUpdatePluginIntoExistingYAML}
        onPluginDiscard={() => {
          setSelectedPlugin(undefined)
          setPluginAddUpdateOpnStatus(Status.TO_DO)
        }}
        selectedPluginFromYAMLView={selectedPlugin}
        pluginAddUpdateOpnStatus={pluginAddUpdateOpnStatus}
      />
    </Layout.Horizontal>
  ) : (
    <div className={cx(customCss, { [css.main]: displayBorder }, { [css.darkBg]: theme === 'DARK' })}>
      <div className={css.editor}>
        {defaultTo(renderCustomHeader, renderHeader)()}
        {renderEditor()}
      </div>
    </div>
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
