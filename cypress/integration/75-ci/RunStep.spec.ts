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
  stepLibrary
} from '../../support/70-pipeline/constants'
import { getRuntimeInputKeys } from '../../utils/step-utils'
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
    cy.intercept('GET', pipelineDetails, { fixture: 'ci/api/runStep/pipelineDetails.json' }).as(
      'pipelineDetailsAPIRoute'
    )
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
    visitExecutionStageWithAssertion()
  })
  it('Run Pipeline with Run Step prompts for all possible runtime inputs', () => {
    const numOfPossibleRuntimeInputs = 11
    var skipFieldIndexes: number[] = [3, 8] // start index count at 0

    cy.contains('p', 'CI_Stage1').should('be.visible')
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
    arrayOfFieldNames.forEach(fieldName => {
      cy.get('[class*="view-line"] [class*="mtk5"]').contains(fieldName)
      //   cy.contains('span', fieldName).should('be.visible')
      //   cy.contains('span', fieldName).should('be.visible')
    })
    // get step single step object and recursively go through again if there is a spec object for the other <+inputs>

    // templatesData.forEach(i => {
    //     cy.get('.MultiTypeInput--btn').eq(multiTypeButton[i]).click()
    //     cy.contains('span', 'Runtime input').click()
    //     cy.contains('p', 'Jenkins').should('be.visible')

    //   })
    // .eq(1).click()
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
