import { parse } from 'yaml'
import {
  gitSyncEnabledCall,
  runPipelineTemplateCall,
  inputSetTemplate,
  pipelineDetails,
  pipelineSaveCall,
  pipelineStudioRoute,
  inputSetsRoute,
  inputSetsCall,
  inputSetsTemplateCall,
  pipelineDetailsWithRoutingIdCall,
  pipelineInputSetTemplate,
  servicesCallV2,
  servicesV2AccessResponse,
  stepLibrary,
  pipelineVariablesCall,
  stagesExecutionList
} from '../../support/70-pipeline/constants'
import { getRuntimeInputKeys, getTemplatesDataAsStepTemplate } from '../../utils/step-utils'
import templatesData from '../../fixtures/ci/api/runStep/inputSetTemplateResponse.json'
// Data from QA, CI Automation Account
//  https://qa.harness.io/ng/#/account/h61p38AZSV6MzEkpWWBtew/ci/orgs/default/projects/mtran/pipelines/CI_Pipeline1/pipeline-studio/

describe('Pipeline Studio', () => {
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
    cy.intercept('POST', inputSetTemplate, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')
    cy.intercept('POST', runPipelineTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')

    visitExecutionStageWithAssertion()
  })

  it('STEP CONFIG: Toggle all fields as Runtime Inputs', () => {
    const numOfPossibleRuntimeInputs = 11
    var skipFieldIndexes: number[] = [3, 8] // start index count at 0
    // skip Shell(3) and Image Pull Policy (8)
    cy.intercept('POST', runPipelineTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')
    cy.contains('p', 'CI_Stage1').should('be.visible')
    cy.contains('p', 'CI_Stage1').click()
    cy.contains('p', 'Add Step').click({ force: true })
    cy.get('button[data-testid="addStepPipeline"]').click({ force: true })
    cy.get('[data-testid="step-card-Run"]').click({ force: true })
    cy.wait(1000)
    cy.contains('div', 'Optional Configuration').should('be.visible')
    cy.contains('div', 'Optional Configuration').click()
    const multiTypeButton = Array.from(Array(numOfPossibleRuntimeInputs).keys()).filter(
      (x: number) => !skipFieldIndexes.includes(x)
    )
    // should click on all but it skips some
    // Need to manually test the following fields:
    // Container Registry, Privileged, Report Paths, Output Variables, Limit Memory, Timeout
    multiTypeButton.forEach(i => {
      cy.get('span[data-icon="fixed-input"]').eq(multiTypeButton[i]).click()
      cy.contains('span', 'Runtime input').click()
      cy.wait(200)

      //   }
    })
    cy.wait(5000)
  })

  it('RUN PIPELINE: Prompts for all required runtime inputs in YAML view', () => {
    cy.intercept('POST', runPipelineTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')
    cy.contains('span', 'Run').click()
    cy.wait(1000)
    const arrayOfFieldNames = getRuntimeInputKeys(parse(templatesData.data.inputSetTemplateYaml))
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()

    cy.contains('span', 'run-pipeline.yaml').should('be.visible')
    cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '30%', { ensureScrollable: false })

    // should verify all but it fails on some
    // Need to manually test the following fields:
    // description, outputVariables, runAsUser, memory, cpu, timeout
    arrayOfFieldNames.forEach(fieldName => {
      if (
        fieldName !== 'description' &&
        fieldName !== 'outputVariables' &&
        fieldName !== 'runAsUser' &&
        fieldName !== 'memory' &&
        fieldName !== 'cpu' &&
        fieldName !== 'timeout'
      ) {
        cy.get('[class*="view-line"] [class*="mtk5"]').contains(fieldName)
      }
    })
    cy.wait(5000)
  })

  it('RUN PIPELINE: Run Pipeline with Run Step Template prompts for all possible runtime inputs', () => {
    const fixture = getTemplatesDataAsStepTemplate(templatesData)
    cy.intercept('POST', runPipelineTemplateCall, fixture).as('inputSetTemplateCall')
    cy.contains('span', 'Run').click()
    cy.wait(1000)

    const arrayOfFieldNames = getRuntimeInputKeys(parse(templatesData.data.inputSetTemplateYaml))
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()
    // cy.contains('div', 'YAML').click()
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()

    cy.contains('span', 'run-pipeline.yaml').should('be.visible')
    cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '30%', { ensureScrollable: false })
    // should verify all but it fails on some
    // Need to manually test the following fields:
    // paths, envVariables, description, outputVariables, runAsUser, memory, cpu, timeout
    arrayOfFieldNames.forEach(fieldName => {
      if (
        fieldName !== 'paths' &&
        fieldName !== 'envVariables' &&
        fieldName !== 'description' &&
        fieldName !== 'outputVariables' &&
        fieldName !== 'runAsUser' &&
        fieldName !== 'memory' &&
        fieldName !== 'cpu' &&
        fieldName !== 'timeout'
      ) {
        cy.get('[class*="view-line"] [class*="mtk5"]').contains(fieldName)
      }
    })
    cy.wait(5000)
  })

  // // Don't need to fill input set since we have a jest tests that can do this
  // it('TRIGGER: Run Pipeline with Input Set prompts for all possible runtime inputs', () => {
  //   const fixture = getTemplatesDataAsStepTemplate(templatesData)
  //   cy.intercept('POST', runPipelineTemplateCall, fixture).as('inputSetTemplateCall')
  //   cy.contains('span', 'Run').click()
  //   cy.wait(1000)
  //   // cy.get('.MultiTypeInput--btn').eq(numOfPossibleRuntimeInputs - skipFieldIndexes.length - 1)

  //   console.log(templatesData)
  //   // console.log(JSON.parse(templatesData.data.inputSetTemplateYaml))
  //   console.log(parse(templatesData.data.inputSetTemplateYaml))
  //   const arrayOfFieldNames = getRuntimeInputKeys(parse(templatesData.data.inputSetTemplateYaml))
  //   //    cy.get('form > div').
  //   cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()
  //   // cy.contains('div', 'YAML').click()
  //   cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()

  //   cy.contains('span', 'run-pipeline.yaml').should('be.visible')
  //   cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '30%', { ensureScrollable: false })

  //   arrayOfFieldNames.forEach(fieldName => {
  //     cy.get('[class*="view-line"] [class*="mtk5"]').contains(fieldName)
  //     //   cy.contains('span', fieldName).should('be.visible')
  //   })
  // })
})
describe('Input Sets', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()
    cy.intercept('GET', inputSetsCall, { fixture: 'pipeline/api/inputSet/emptyInputSetsList' }).as('emptyInputSetList')
    cy.intercept('POST', inputSetsTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
      // fixture: 'pipeline/api/inputSet/fetchServiceTemplate'
    }).as('fetchServiceTemplate')
    cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
      fixture: 'pipeline/api/inputSet/fetchPipelineTemplate'
    }).as('fetchPipelineTemplate')
    cy.intercept('POST', pipelineInputSetTemplate, {
      fixture: 'pipeline/api/inputSet/applyTemplates'
    }).as('applyTemplates')
    cy.intercept('GET', servicesCallV2, servicesV2AccessResponse).as('servicesCallV2')
    cy.visit(inputSetsRoute, {
      timeout: 30000
    })
    cy.wait(2000)
  })

  it.only('Input Set Creation & Deletion', () => {
    cy.visitPageAssertion()
    cy.wait('@emptyInputSetList')
    cy.wait(1000)
    cy.contains('span', '+ New Input Set').should('be.visible')
    cy.get('.NoDataCard--buttonContainer').contains('span', '+ New Input Set').click()
    // Input Flow - Service
    cy.wait(1000)
    cy.wait('@servicesCallV2').wait(1000)
    // CI Code here

    //   cy.fillField('name', 'testService')
    //   cy.findByText('Select Service').should('exist')
    //   cy.get('input[name="pipeline.stages[0].stage.spec.serviceConfig.serviceRef"]').click()
    //   cy.contains('p', 'testService').click({ force: true })

    //   cy.fillField('pipeline.stages[0].stage.spec.infrastructure.infrastructureDefinition.spec.namespace', 'default')
    //   cy.get('[value="default"]').should('be.visible')

    //   // Toggle to YAML view
    //   cy.get('[data-name="toggle-option-two"]').click({ force: true })
    //   cy.wait(1000)
    //   // Verify all details in YAML view
    //   cy.contains('span', 'testService').should('be.visible')
    //   cy.contains('span', 'project1').should('be.visible')

    //   cy.contains('span', 'identifier').should('be.visible')
    //   cy.contains('span', 'testStage_Cypress').should('be.visible')

    //   cy.contains('span', 'identifier').should('be.visible')
    //   cy.contains('span', 'testPipeline_Cypress').should('be.visible')

    //   cy.contains('span', 'serviceRef').should('be.visible')
    //   cy.contains('span', 'testService').should('be.visible')

    //   cy.contains('span', 'namespace').should('be.visible')
    //   cy.contains('span', 'default').should('be.visible')

    //   cy.contains('span', 'Save').click()
    //   cy.intercept('GET', inputSetsCall, {
    //     fixture: 'pipeline/api/inputSet/inputSetsList'
    //   }).as('inputSetList')
    //   cy.wait('@inputSetList')
    //   cy.wait(1000)

    //   cy.contains('p', 'testService').should('be.visible')
    //   cy.contains('p', 'Id: testService').should('be.visible')
    //   cy.contains('span', 'Run Pipeline').should('be.visible')

    //   cy.get('[data-icon="more"]').should('be.visible')
    //   cy.get('[data-icon="more"]').first().click()

    //   cy.contains('div', 'Edit').should('be.visible')
    //   cy.contains('div', 'Delete').should('be.visible')

    //   // Delete flow verification
    //   cy.intercept('GET', inputSetsCall, {
    //     fixture: 'pipeline/api/inputSet/emptyInputSetsList'
    //   })
    //   cy.contains('div', 'Delete').click()
    //   cy.contains('p', 'Delete Input Set').should('be.visible')
    //   cy.contains('span', 'Delete').should('be.visible')
    //   cy.contains('span', 'Delete').click({ force: true })
    //   cy.contains('span', 'Input Set "testService" deleted').should('be.visible')
    //   cy.contains('p', 'testService').should('not.exist')
  })
})
