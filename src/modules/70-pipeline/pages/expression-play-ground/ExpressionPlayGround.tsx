import React, { useState, useEffect } from 'react'
import {
  Container,
  Layout,
  Text,
  FontVariation,
  DropDown,
  TextInput,
  Button,
  Label,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'
import {
  useFetchExpression,
  useExpandedJson,
  useTestExpression,
  useDryRunExpressions,
  expandedJsonPromise
} from 'services/pipeline-ng'
import VanillaJSONEditor from './JsonEditor'
import { useMutateAsGet } from '@common/hooks'
import { useParams } from 'react-router-dom'
import { useExecutionListQueryParams } from '../execution-list/utils/executionListUtil'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { useGetListOfExecutions } from 'services/pipeline-ng'
import { defaultTo } from 'lodash-es'

const getSelectOptions = (data: any): any => {
  const selectOptions = data.map((da: any) => {
    return {
      label: defaultTo(da.runSequence, ''),
      value: defaultTo(da.planExecutionId, '')
    }
  })
  return selectOptions
}
export default function App() {
  const [options, setOptions] = useState([])
  const [input, setInput] = useState('')
  const [exeId, setExeId] = useState('')
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const queryParams = useExecutionListQueryParams()
  const { data: pipelineExecution, loading: pipelineLoading } = useMutateAsGet(useGetListOfExecutions, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    body: {
      ...queryParams.filters,
      filterType: 'PipelineExecution'
    }
  })

  const [exp, setExp] = useState('')
  const [output, setOutPut] = useState('')
  const { refetch: getExpression, data: expData1 } = useFetchExpression({
    planExecutionId: '8njHdpXCTlKPh-KtUQO3MQ',
    queryParams: { expression: 'pipeline.stages.shell1.status' }
  })
  const getExpressionCall = () => {
    getExpression({ queryParams: { expression: exp }, pathParams: { planExecutionId: exeId } })
  }
  const { mutate: dryRun } = useDryRunExpressions({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const { mutate: testExp } = useTestExpression({
    planExecutionId: exeId,
    pathParams: { planExecutionId: exeId }
  })
  const testExpressionCall = () => {
    testExp({ expressionTestDetails: testExpressionList })
      .then(data => {
        setOutPut(data.data?.expressionTestDetails)
      })
      .catch(err => {
        setOutPut(getErrorInfoFromErrorObject(err))
      })
  }
  const [testExpressionList, setTestExpressionList] = useState([])
  useEffect(() => {
    if (expData1) {
      setListOfExpression(expData1.data?.expressionDetails || [])
      setTestExpressionList([])
    }
  }, [expData1])
  useEffect(() => {
    if (pipelineExecution?.data?.content) {
      setOptions(getSelectOptions(pipelineExecution?.data?.content))
    }
  }, [pipelineExecution])
  const [content, setContent] = useState<any>({
    json: undefined,
    text: undefined
  })
  const [listOfExpression, setListOfExpression] = useState([])
  const { refetch: getData, data } = useExpandedJson({ planExecutionId: exeId })
  useEffect(() => {
    getData({ queryParams: { planExecutionId: exeId } })
  }, [exeId])
  useEffect(() => {
    if (data) {
      setContent({
        json: undefined,
        text: data?.data as any
      })
    }
  }, [data])
  useEffect(() => {
    dryRun(
      `pipeline:\n  name: waitTest\n  identifier: waitTest\n  projectIdentifier: defaultproject\n  orgIdentifier: default\n  stages:\n    - stage:\n        name: shell1\n        identifier: shell1\n        description: ""\n        type: Custom\n        spec:\n          execution:\n            steps:\n              - step:\n                  type: ShellScript\n                  name: ShellScript_1\n                  identifier: ShellScript_1\n                  spec:\n                    shell: Bash\n                    onDelegate: true\n                    source:\n                      type: Inline\n                      spec:\n                        script: |-\n                          echo <+pipeline.stages>\n                          echo <+pipeline>\n                    environmentVariables: []\n                    outputVariables: []\n                    delegateSelectors:\n                      - project-delegate-1681273340\n                  timeout: 10m\n                  failureStrategies: []\n        tags: {}\n`,
      { pathParams: { pipelineIdentifier: 'waitTest' }, headers: { 'content-type': 'application/yaml' } }
    )
  }, [])
  const addToExpressionList = da => {
    setTestExpressionList(val => {
      val.push({ expressionBlock: da.expressionBlock, scope: da.scope })
      return val
    })
    setInput(val => {
      return val + da.expressionBlock + '\n'
    })
  }
  return (
    <Layout.Horizontal
      spacing="large"
      padding="large"
      flex={{ alignItems: 'flex-start' }}
      width={'100%'}
      height={'100%'}
    >
      <Layout.Vertical spacing="medium">
        <Layout.Horizontal spacing="medium">
          <Label>{'Execution Id'}</Label>
          <DropDown
            items={options}
            value={exeId}
            onChange={selected => setExeId(selected.value as any)}
            minWidth={140}
            usePortal={true}
          ></DropDown>
        </Layout.Horizontal>
        <Layout.Horizontal spacing="medium">
          <Label>{'Path'}</Label>
          <TextInput style={{ width: '400px' }} value={exp} onChange={e => setExp(e.target.value)}></TextInput>
        </Layout.Horizontal>

        <Button width={200} intent="primary" text="Get Expression" onClick={getExpressionCall} />
        {/* <Button
          width={200}
          style={{ alignSelf: 'flex-end' }}
          intent="primary"
          text="Test"
          onClick={() => {
            console.log('callng test expression')
            // testExpressionCall()
          }}
        /> */}
        <ul>
          {listOfExpression.map(data => (
            <li key={data.expressionBlock} onClick={() => addToExpressionList(data)}>
              {data.expressionBlock}
            </li>
          ))}
        </ul>

        <div style={{ width: '700px', height: '500px', display: 'flex' }}>
          <VanillaJSONEditor content={content} readOnly={false} onChange={setContent} />
        </div>
      </Layout.Vertical>

      <Layout.Vertical width={'50%'}>
        <Button
          style={{ alignSelf: 'flex-end', width: '200px' }}
          intent="primary"
          text="Test"
          onClick={testExpressionCall}
        />
        <Container>
          <Text font={{ variation: FontVariation.H2 }}>Input</Text>
          <MonacoEditor width={700} height={700} value={input} onChange={val => setInput(val)}></MonacoEditor>
        </Container>

        <Container>
          <Text font={{ variation: FontVariation.H2 }}>Output</Text>
          <Container width={500} height={500}>
            <Text font={{ variation: FontVariation.BODY1 }}>{output}</Text>
          </Container>
        </Container>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
