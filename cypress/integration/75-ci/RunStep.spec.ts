import { parse } from 'yaml'

import { connectorInfo, connectorsList } from '../../support/35-connectors/constants'
import {
  gitSyncEnabledCall,
  runPipelineTemplateCall,
  inputSetTemplate,
  jobDetailsCall,
  jobDetailsCallAfterConnectorChange,
  jobDetailsForParentJob,
  jobParametersList,
  pipelineDetails,
  pipelineSaveCall,
  pipelineStudioRoute,
  stepLibrary,
  pipelineVariablesCall,
  stagesExecutionList
} from '../../support/70-pipeline/constants'
import { getRuntimeInputKeys, getTemplatesDataAsStepTemplate } from '../../utils/step-utils'
import templatesData from '../../fixtures/ci/api/runStep/inputSetTemplateResponse.json'

describe('Run Step', () => {
  const visitExecutionStageWithAssertion = (): void => {
    cy.visit(pipelineStudioRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion()
    cy.wait('@pipelineDetailsAPIRoute', { timeout: 30000 })
    cy.wait(2000)
  }

  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()

    cy.intercept('GET', gitSyncEnabledCall, {
      connectivityMode: null,
      gitSyncEnabled: false,
      gitSimplificationEnabled: false
    })
    cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post' })
    cy.intercept('POST', stepLibrary, { fixture: 'ci/api/common/stepLibraryResponse.json' }).as('stepLibrary')
    cy.intercept('GET', stagesExecutionList, { fixture: 'ci/api/common/stagesExecutionListResponse.json' }).as(
      'stagesExecutionList'
    )
    // ensure resolvedTemplatesPipelineYaml is in data
    cy.intercept('GET', pipelineDetails, { fixture: 'ci/api/runStep/pipelineDetails.json' }).as(
      'pipelineDetailsAPIRoute'
    )
    cy.intercept('POST', pipelineVariablesCall, { fixture: 'pipeline/api/notifications/pipelines.variables' })
    // ! we are missing templates call so it is not showing up that there are input sets . Trying to re-use here but we may ahve to create our own response
    cy.intercept('POST', inputSetTemplate, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')
    cy.intercept('POST', runPipelineTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')

    //localhost:8181/pipeline/api/inputSets/template?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&pipelineIdentifier=testPipeline_Cypress&projectIdentifier=project1
    // cy.intercept('GET', connectorInfo, { fixture: 'pipeline/api/jenkinsStep/connectorInfo.json' }).as('connectorInfo')
    // cy.intercept('GET', jobDetailsCall, { fixture: 'pipeline/api/jenkinsStep/jobDetails.json' }).as('jobDetailsCall')
    // cy.intercept('GET', connectorsList, { fixture: 'pipeline/api/connector/connectorList.json' }).as(
    //   'connectorsListCall'
    // )
    // cy.intercept('GET', jobDetailsCallAfterConnectorChange, { fixture: 'pipeline/api/jenkinsStep/jobDetails.json' }).as(
    //   'jobDetailsCallAfterConnectorChange'
    // )
    // cy.intercept('GET', jobDetailsForParentJob, { fixture: 'pipeline/api/jenkinsStep/childJobDetails.json' }).as(
    //   'jobDetailsCallAfterConnectorChange'
    // )
    // cy.intercept('GET', jobParametersList, { fixture: 'pipeline/api/jenkinsStep/jobParameterResponse.json' }).as(
    //   'jobParametersList'
    // )
    https: visitExecutionStageWithAssertion()
  })
  it('Toggle all fields as Runtime Inputs and prompts for all possible runtime inputs', () => {
    const numOfPossibleRuntimeInputs = 11
    var skipFieldIndexes: number[] = [3, 8] // start index count at 0
    cy.intercept('POST', runPipelineTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')
    cy.contains('p', 'CI_Stage1').should('be.visible')
    cy.contains('p', 'CI_Stage1').click()
    // cy.get('span[data-icon="run-step"]').click({ force: true })
    cy.contains('p', 'Add step').click({ force: true })
    cy.get('button[data-testid="addStepPipeline"]').click({ force: true })
    // cy.get('[data-name="add-popover] span[data-icon="Edit"]').click({ force: true })
    // cy.get('section[class*="StepPalette"]').scrollTo('0%', '30%', { ensureScrollable: false })
    cy.get('[data-testid="step-card-Run"]').click({ force: true })
    // cy.contains('section', 'Run').click({ force: true })

    // cy.get('span[data-icon="ci-main"]').click({ force: true })
    cy.wait(1000)
    cy.contains('div', 'Optional Configuration').should('be.visible')

    // cy.get('button[data-testid="cr-field-spec.connectorRef"]').click()
    cy.contains('div', 'Optional Configuration').click()
    // cy.contains('span', 'Apply Selected').click()
    // cy.get('input[name="spec.jobName"]').click()
    // cy.contains('p', 'AutomationQA').click()
    // !we don't even need to do this and can manually add it in ourselves
    const multiTypeButton = Array.from(Array(10).keys()).filter((x: number) => !skipFieldIndexes.includes(x))
    console.log(multiTypeButton)
    // should click on all but it skips some
    multiTypeButton.forEach(i => {
      cy.get('span[data-icon="fixed-input"]').eq(multiTypeButton[i]).click()

      console.log(i)
      //   cy.get('.MultiTypeInput--btn').eq(multiTypeButton[i]).click()
      //   if (cy.contains('span', 'Runtime input').should('be.visible')) {
      cy.contains('span', 'Runtime input').click()
      cy.wait(200)

      //   }
    })
    // for (var i = 0; i < numOfPossibleRuntimeInputs; i++) {
    //   if (skipFieldIndexes.includes(i)) {
    //     return
    //   }
    //   if (cy.contains('span', 'Runtime input')) {
    //   } else {
    //     cy.contains('span', 'Fixed Value').click()
    //   }
    // }
    // cy.get('.MultiTypeInput--btn').eq(2).click()
    // cy.contains('span', 'Runtime input').click()

    // cy.contains('span', 'Apply Changes').click()
    // cy.wait(1000)
    // cy.contains('div', 'Optional Configuration').should('be.null')

    cy.intercept('GET', pipelineDetails, { fixture: 'ci/api/runStep/pipelineDetails.json' }).as(
      'pipelineDetailsAPIRouteAfterSave'
    )
    cy.contains('span', 'Save').click()

    // cy.contains('span', 'Apply Changes').click()
    // cy.wait(1000)
    // cy.intercept('GET', pipelineDetails, {
    //   fixture: 'ci/api/runStep/pipelineDetails.json'
    // }).as('pipelineDetailsAPIRouteAfterSave')

    // // cy.intercept('POST', runPipelineTemplateCall, {
    // //   fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    // // }).as('inputSetTemplateCall')
    // // cy.intercept('GET', inputSetTemplate, {
    // //   fixture: 'ci/api/runStep/inputSetPipelineDetails.json'
    // // }).as('inputSetTemplate')
    // cy.contains('span', 'Run').click()
    // cy.wait(1000)
    // // cy.get('.MultiTypeInput--btn').eq(numOfPossibleRuntimeInputs - skipFieldIndexes.length - 1)

    // console.log(templatesData)
    // // console.log(JSON.parse(templatesData.data.inputSetTemplateYaml))
    // console.log(parse(templatesData.data.inputSetTemplateYaml))
    // const arrayOfFieldNames = getRuntimeInputKeys(parse(templatesData.data.inputSetTemplateYaml))
    // //    cy.get('form > div').
    // cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()
    // // cy.contains('div', 'YAML').click()
    // cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()

    // cy.contains('span', 'run-pipeline.yaml').should('be.visible')
    // cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '30%', { ensureScrollable: false })

    // arrayOfFieldNames.forEach(fieldName => {
    //   cy.get('[class*="view-line"] [class*="mtk5"]').contains(fieldName)
    //   //   cy.contains('span', fieldName).should('be.visible')
    // })
  })

  it('Run Pipeline with Run Step prompts for all possible runtime inputs', () => {
    const numOfPossibleRuntimeInputs = 11
    var skipFieldIndexes: number[] = [3, 8] // start index count at 0
    cy.intercept('POST', runPipelineTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')
    // cy.contains('p', 'CI_Stage1').should('be.visible')
    // cy.contains('p', 'CI_Stage1').click()
    // cy.get('span[data-icon="run-step"]').click({ force: true })
    // cy.get('span[data-icon="ci-main"]').click({ force: true })
    // cy.wait(1000)

    // cy.get('button[data-testid="cr-field-spec.connectorRef"]').click()
    // cy.contains('div', 'Optional Configuration').click()
    // cy.contains('span', 'Apply Selected').click()
    // cy.get('input[name="spec.jobName"]').click()
    // cy.contains('p', 'AutomationQA').click()
    // !we don't even need to do this and can manually add it in ourselves
    // const multiTypeButton = Array.from(Array(10).keys()).filter((x: number) => !skipFieldIndexes.includes(x))
    // console.log(multiTypeButton)
    // multiTypeButton.forEach(i => {
    //   cy.get('.MultiTypeInput--btn').eq(multiTypeButton[i]).click()
    //   cy.contains('span', 'Runtime input').click()
    // })
    // for (var i = 0; i < numOfPossibleRuntimeInputs; i++) {
    //   if (skipIndexes.includes(i)) {
    //     return
    //   }
    //   //   if (cy.contains('span', 'Runtime input')) {
    //   //   } else {
    //   //     cy.contains('span', 'Fixed Value').click()
    //   //   }
    // }
    // cy.get('.MultiTypeInput--btn').eq(2).click()
    // cy.contains('span', 'Runtime input').click()

    // cy.contains('span', 'Apply Changes').click()
    // cy.wait(1000)
    // cy.contains('div', 'Optional Configuration').should('be.null')

    // cy.intercept('GET', pipelineDetails, { fixture: 'ci/api/runStep/pipelineDetails.json' }).as(
    //   'pipelineDetailsAPIRouteAfterSave'
    // )
    // cy.contains('span', 'Save').click()

    // cy.contains('span', 'Apply Changes').click()
    // cy.wait(1000)
    // cy.intercept('GET', pipelineDetails, {
    //   fixture: 'ci/api/runStep/pipelineDetails.json'
    // }).as('pipelineDetailsAPIRouteAfterSave')

    // cy.intercept('POST', runPipelineTemplateCall, {
    //   fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    // }).as('inputSetTemplateCall')
    // cy.intercept('GET', inputSetTemplate, {
    //   fixture: 'ci/api/runStep/inputSetPipelineDetails.json'
    // }).as('inputSetTemplate')
    cy.contains('span', 'Run').click()
    cy.wait(1000)
    // cy.get('.MultiTypeInput--btn').eq(numOfPossibleRuntimeInputs - skipFieldIndexes.length - 1)

    console.log(templatesData)
    // console.log(JSON.parse(templatesData.data.inputSetTemplateYaml))
    console.log(parse(templatesData.data.inputSetTemplateYaml))
    const arrayOfFieldNames = getRuntimeInputKeys(parse(templatesData.data.inputSetTemplateYaml))
    //    cy.get('form > div').
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()
    // cy.contains('div', 'YAML').click()
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()

    cy.contains('span', 'run-pipeline.yaml').should('be.visible')
    cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '30%', { ensureScrollable: false })

    arrayOfFieldNames.forEach(fieldName => {
      cy.get('[class*="view-line"] [class*="mtk5"]').contains(fieldName)
      //   cy.contains('span', fieldName).should('be.visible')
    })
  })

  it('TEMPLATE: Run Pipeline with Run Step prompts for all possible runtime inputs', () => {
    const fixture = getTemplatesDataAsStepTemplate(templatesData)
    cy.intercept('POST', runPipelineTemplateCall, fixture).as('inputSetTemplateCall')
    cy.contains('span', 'Run').click()
    cy.wait(1000)
    // cy.get('.MultiTypeInput--btn').eq(numOfPossibleRuntimeInputs - skipFieldIndexes.length - 1)

    console.log(templatesData)
    // console.log(JSON.parse(templatesData.data.inputSetTemplateYaml))
    console.log(parse(templatesData.data.inputSetTemplateYaml))
    const arrayOfFieldNames = getRuntimeInputKeys(parse(templatesData.data.inputSetTemplateYaml))
    //    cy.get('form > div').
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()
    // cy.contains('div', 'YAML').click()
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()

    cy.contains('span', 'run-pipeline.yaml').should('be.visible')
    cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '30%', { ensureScrollable: false })

    arrayOfFieldNames.forEach(fieldName => {
      cy.get('[class*="view-line"] [class*="mtk5"]').contains(fieldName)
      //   cy.contains('span', fieldName).should('be.visible')
    })
  })

  // Don't need to fill input set since we have a jest tests that can do this
  it('TRIGGER: Run Pipeline with Input Set prompts for all possible runtime inputs', () => {
    const fixture = getTemplatesDataAsStepTemplate(templatesData)
    cy.intercept('POST', runPipelineTemplateCall, fixture).as('inputSetTemplateCall')
    cy.contains('span', 'Run').click()
    cy.wait(1000)
    // cy.get('.MultiTypeInput--btn').eq(numOfPossibleRuntimeInputs - skipFieldIndexes.length - 1)

    console.log(templatesData)
    // console.log(JSON.parse(templatesData.data.inputSetTemplateYaml))
    console.log(parse(templatesData.data.inputSetTemplateYaml))
    const arrayOfFieldNames = getRuntimeInputKeys(parse(templatesData.data.inputSetTemplateYaml))
    //    cy.get('form > div').
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()
    // cy.contains('div', 'YAML').click()
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()

    cy.contains('span', 'run-pipeline.yaml').should('be.visible')
    cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '30%', { ensureScrollable: false })

    arrayOfFieldNames.forEach(fieldName => {
      cy.get('[class*="view-line"] [class*="mtk5"]').contains(fieldName)
      //   cy.contains('span', fieldName).should('be.visible')
    })
  })

  //   it('jenkins step addition, with all fixed values and jobName as subFolder value', () => {
  //     cy.contains('p', 'Jenkins').should('be.visible')
  //     cy.contains('p', 'Jenkins').click()
  //     cy.get('span[data-icon="service-jenkins"]').click({ force: true })
  //     cy.get('button[data-testid="cr-field-spec.connectorRef"]').click()
  //     cy.contains('p', 'testConnector2').click()
  //     cy.contains('span', 'Apply Selected').click()
  //     cy.get('input[name="spec.jobName"]').click()
  //     cy.contains('p', 'alex-pipeline-test').click()
  //     cy.contains('p', 'AutomationQA').click()
  //     cy.contains('span', 'Apply Changes').click()
  //     cy.wait(1000)
  //     cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/jenkinsStep/pipelineDetailsAfterSave.json' }).as(
  //       'pipelineDetailsAPIRouteAfterSave'
  //     )
  //     cy.contains('span', 'Save').click()
  //   })

  //   it('jenkins step addition, with jobName as runtime values', () => {
  //     cy.contains('p', 'Jenkins').should('be.visible')
  //     cy.contains('p', 'Jenkins').click()
  //     cy.get('span[data-icon="service-jenkins"]').click({ force: true })
  //     cy.get('button[data-testid="cr-field-spec.connectorRef"]').click()
  //     cy.contains('p', 'testConnector2').click()
  //     cy.contains('span', 'Apply Selected').click()
  //     cy.get('.MultiTypeInput--btn').eq(2).click()
  //     cy.contains('span', 'Runtime input').click()

  //     cy.contains('span', 'Apply Changes').click()
  //     cy.wait(1000)
  //     cy.intercept('GET', pipelineDetails, {
  //       fixture: 'pipeline/api/jenkinsStep/pipelineDetailsWithJobRuntimeValues.json'
  //     }).as('pipelineDetailsAPIRouteAfterSave')
  //     cy.contains('span', 'Save').click()
  //     cy.wait(1000)
  //     cy.intercept('POST', runPipelineTemplateCall, {
  //       fixture: 'pipeline/api/jenkinsStep/inputSetTemplateResponse.json'
  //     }).as('inputSetTemplateCall')
  //     cy.intercept('GET', inputSetTemplate, {
  //       fixture: 'pipeline/api/jenkinsStep/inputSetPipelineDetails.json'
  //     }).as('inputSetTemplate')
  //     cy.contains('span', 'Run').click()
  //     cy.wait(1000)
  //     cy.get('input[name="stages[0].stage.spec.execution.steps[0].step.spec.jobName"]').click()
  //     cy.contains('p', 'alex-pipeline-test').click()
  //     cy.contains('p', 'AutomationQA').click()
  //     cy.contains('span', 'Run Pipeline').click()
  //   })

  //   it.only('jenkins step addition, with jobName and connector as runtime values', () => {
  //     cy.contains('p', 'Jenkins').should('be.visible')
  //     cy.contains('p', 'Jenkins').click()
  //     cy.get('span[data-icon="service-jenkins"]').click({ force: true })
  //     cy.wait(1000)
  //     cy.get('.MultiTypeInput--btn').eq(1).click()
  //     cy.contains('span', 'Runtime input').click()
  //     cy.get('.MultiTypeInput--btn').eq(2).click()
  //     cy.contains('span', 'Runtime input').click()

  //     cy.contains('span', 'Apply Changes').click()
  //     cy.wait(1000)
  //     cy.intercept('GET', pipelineDetails, {
  //       fixture: 'pipeline/api/jenkinsStep/pipelineDetailsWithAllRuntimeValues.json'
  //     }).as('pipelineDetailsAPIRouteAfterSave')
  //     cy.contains('span', 'Save').click()
  //     cy.wait(1000)
  //     cy.intercept('POST', runPipelineTemplateCall, {
  //       fixture: 'pipeline/api/jenkinsStep/inputSetTemplateWithAllRuntime.json'
  //     }).as('inputSetTemplateCall')
  //     cy.intercept('GET', inputSetTemplate, {
  //       fixture: 'pipeline/api/jenkinsStep/inputSetPipelineDetailsWithRuntimeValues.json'
  //     }).as('inputSetTemplate')
  //     cy.contains('span', 'Run').click()
  //     cy.wait(1000)
  //     cy.get('button[data-testid="cr-field-stages[0].stage.spec.execution.steps[0].step.spec.connectorRef"]').click()
  //     cy.contains('p', 'testConnector2').click()
  //     cy.contains('span', 'Apply Selected').click()
  //     cy.get('input[name="stages[0].stage.spec.execution.steps[0].step.spec.jobName"]').click()
  //     cy.contains('p', 'alex-pipeline-test').click()
  //     cy.contains('p', 'AutomationQA').click()
  //     cy.contains('span', 'Run Pipeline').click()
  //   })
})
