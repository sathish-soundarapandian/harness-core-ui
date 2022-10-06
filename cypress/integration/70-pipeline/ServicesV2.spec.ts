/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  serviceName,
  gitSyncEnabledCall,
  featureFlagsCall,
  servicesRoute,
  afterSaveServiceResponse,
  afterSaveServiceNameResponse,
  afterFinalSaveServiceNameResponse,
  afterFinalServiceNameWinrmResponse,
  afterSaveServiceHeaderResponse,
  finalSaveServiceResponse,
  finalSaveServiceNameResponse,
  afterFinalSaveConnectorsListResponse
} from '../../support/70-pipeline/constants'

describe('Service V2', () => {
  const afterSaveServiceEndpointPOST = '/ng/api/servicesV2?routingId=accountId&accountIdentifier=accountId'
  const afterSaveServiceNameEndpoint =
    '/ng/api/servicesV2/testServiceV2?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const afterFinalSaveServiceNameEndpoint =
    '/ng/api/servicesV2/testServiceV2?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const afterSaveServiceHeaderEndpoint =
    '/ng/api/dashboard/getServiceHeaderInfo?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&serviceId=testServiceV2'
  const finalSaveServiceEndpointPUT = '/ng/api/servicesV2?routingId=accountId&accountIdentifier=accountId'
  const finalSaveNameServiceEndpoint =
    '/ng/api/servicesV2/testServiceV2?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
  const afterFinalSaveConnectorsListEndpoint =
    '/ng/api/connectors/listV2?routingId=accountId&pageIndex=0&pageSize=10&searchTerm=&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&includeAllConnectorsAvailableAtScope=true'
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })

    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })

    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'NG_SVC_ENV_REDESIGN',
            enabled: true,
            lastUpdatedAt: 0
          },
          {
            uuid: null,
            name: 'SSH_NG',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      }).as('enableFeatureFlag')
    })

    cy.initializeRoute()

    cy.visit(servicesRoute, {
      timeout: 30000
    })
    cy.wait(3000)
  })

  it('Creation of Kubernetes Service', () => {
    cy.intercept('POST', afterSaveServiceEndpointPOST, afterSaveServiceResponse).as('afterSaveService')
    cy.intercept('GET', afterSaveServiceNameEndpoint, afterSaveServiceNameResponse).as('afterSaveServiceName')
    cy.intercept('GET', afterSaveServiceHeaderEndpoint, afterSaveServiceHeaderResponse).as('afterSaveServiceHeader')
    cy.intercept('PUT', finalSaveServiceEndpointPUT, finalSaveServiceResponse).as('finalSaveService')
    cy.intercept('GET', finalSaveNameServiceEndpoint, finalSaveServiceNameResponse).as('finalSaveServiceName')
    cy.intercept('POST', afterFinalSaveConnectorsListEndpoint, afterFinalSaveConnectorsListResponse).as(
      'afterFinalSaveConnectorsList'
    )
    cy.get('[id*="serviceLandingPageTabs_manageServices"]').should('be.visible')
    cy.get('div[id*="serviceLandingPageTabs_manageServices"]').click({ force: true })
    cy.contains('span', 'New Service').click()
    cy.fillField('name', serviceName)
    cy.contains('span', 'Save').click()
    cy.contains('p', 'Kubernetes').should('be.visible')
    cy.contains('p', 'Native Helm').should('be.visible')
    cy.contains('p', 'Azure Web App').should('be.visible')
    cy.contains('p', 'Serverless Lambda').should('be.visible')
    cy.contains('p', 'Secure Shell').should('be.visible')

    cy.contains('p', 'Kubernetes').click()
    cy.contains('div', 'Manifests').should('be.visible')
    cy.contains('span', 'Add Manifest').should('be.visible')

    cy.contains('span', 'Add Manifest').click()

    cy.contains('p', 'Manifest Type').should('be.visible')
    cy.contains('p', 'Manifest Source').should('be.visible')
    cy.contains('p', 'Manifest Details').should('be.visible')

    cy.contains('p', 'Kustomize').should('be.visible')
    cy.contains('p', 'K8s Manifest').should('be.visible')
    cy.contains('p', 'Values YAML').should('be.visible')
    cy.contains('p', 'Helm Chart').should('be.visible')
    cy.contains('p', 'OpenShift Template').should('be.visible')
    cy.contains('p', 'OpenShift Param').should('be.visible')
    cy.contains('p', 'Kustomize Patches').should('be.visible')
    cy.contains('p', 'K8s Manifest').click()
    cy.clickSubmit()

    cy.get('span[data-icon="service-github"]').should('be.visible')
    cy.contains('p', 'GitLab').should('be.visible')
    cy.contains('p', 'Bitbucket').should('be.visible')
    cy.contains('p', 'Harness').should('be.visible')

    cy.contains('p', 'GitHub').click()
    cy.contains('span', 'New GitHub Connector').should('be.visible')
    cy.contains('span', 'Select GitHub Connector').should('be.visible')
    cy.get('span[data-icon="fixed-input"]').click()
    cy.contains('span', 'Fixed value').should('be.visible')
    cy.contains('span', 'Runtime input').should('be.visible')
    cy.contains('span', 'Expression').should('be.visible')

    cy.contains('span', 'Select GitHub Connector').click({ force: true })
    cy.contains('p', 'Create or Select an Existing Connector').should('be.visible')
    cy.contains('p', 'Organization').should('be.visible')
    cy.get('button[aria-label="Close"]').click()

    cy.get('span[data-icon="fixed-input"]').click()
    cy.contains('span', 'Runtime input').click()
    cy.get('input[value="<+input>"]').should('be.visible')
    cy.clickSubmit()

    cy.get('input[name="identifier"]').type('testManifestName')
    cy.get('input[name="branch"]').type('master')
    cy.get('input[name="paths[0].path"]').type('root/bin/')
    cy.clickSubmit()

    cy.contains('span', 'Add Primary Artifact').click()

    cy.contains('p', 'Artifact Repository Type').should('be.visible')
    cy.contains('p', 'Artifact Repository').should('be.visible')
    cy.contains('p', 'Artifact Location').should('be.visible')

    cy.contains('p', 'GCR').should('be.visible')
    cy.contains('p', 'Docker Registry').should('be.visible')
    cy.contains('p', 'ECR').should('be.visible')
    cy.contains('p', 'Nexus').should('be.visible')
    cy.contains('p', 'Artifactory').should('be.visible')

    cy.contains('p', 'Docker Registry').click()
    cy.clickSubmit()

    cy.get('span[data-icon="fixed-input"]').click()
    cy.contains('span', 'Runtime input').click()
    cy.get('input[value="<+input>"]').should('be.visible')
    cy.clickSubmit()

    cy.get('span[data-icon="fixed-input"]').click()
    cy.contains('span', 'Runtime input').click()
    cy.get('input[value="<+input>"]').should('be.visible')
    cy.clickSubmit()

    cy.contains('div', 'Unsaved changes').should('be.visible') //
    cy.contains('span', 'Save').click()
    cy.contains('span', 'Service updated successfully').should('be.visible')

    cy.contains('p', 'Id').should('be.visible')
  })

  it('creation of SSH Service using Artifactory', () => {
    cy.intercept('POST', afterSaveServiceEndpointPOST, afterSaveServiceResponse).as('afterSaveService')
    cy.intercept('GET', afterSaveServiceNameEndpoint, afterSaveServiceNameResponse).as('afterSaveServiceName')
    cy.intercept('GET', afterFinalSaveServiceNameEndpoint, afterFinalSaveServiceNameResponse).as(
      'afterFinalSaveServiceName'
    )
    cy.get('[id*="serviceLandingPageTabs_manageServices"]').should('be.visible')
    cy.get('div[id*="serviceLandingPageTabs_manageServices"]').click({ force: true })
    cy.contains('span', 'New Service').click()
    cy.fillField('name', serviceName)
    cy.contains('span', 'Save').click()
    cy.contains('p', 'Secure Shell').click()
    cy.contains('span', 'Add Primary Artifact').should('be.visible')
    cy.get('button[id="add-config-file"]').within(() => {
      cy.get('span[class="bp3-button-text"]').should('be.visible')
    })

    cy.contains('span', 'Add Primary Artifact').click()
    cy.contains('p', 'Specify Artifact Repository Type').should('be.visible')

    cy.contains('p', 'Artifactory').should('be.visible')
    cy.contains('p', 'Jenkins').should('be.visible')

    cy.contains('p', 'Artifactory').click()
    cy.contains('span', 'Change').should('be.visible')
    cy.clickSubmit()
    cy.get('span[data-icon="fixed-input"]').click()
    cy.contains('span', 'Runtime input').click()
    cy.get('input[value="<+input>"]').should('be.visible')
    cy.clickSubmit()

    cy.get('button[class="MultiTypeInput--btn MultiTypeInput--FIXED"]').each($btn => {
      cy.wrap($btn)
        .click()
        .then(() => {
          cy.contains('span', 'Runtime input').click()
        })
    })
    cy.clickSubmit()

    cy.contains('span', 'Add Config File').click()

    cy.contains('p', 'Harness').click()
    cy.clickSubmit()
    cy.get('input[name="identifier"]').type('testConfigFileIdentifier')
    cy.get('span[data-icon="fixed-input"]').eq(0).click()
    cy.contains('span', 'Runtime input').click()
    cy.get('input[value="<+input>"]').should('be.visible')

    cy.clickSubmit()
    cy.get('div[class$="GtxnYE"]').within(() => {
      cy.contains('span', 'testConfigFileIdentifier').should('be.visible')
    })
    cy.contains('span', 'Save').click()
    cy.contains('span', 'Service updated successfully').should('be.visible')
    cy.contains('p', /^Id:/).should('have.text', 'Id: testServiceV2')

    cy.contains('span', '<+input>').should('be.visible')
    cy.contains('p', '<+input>').should('be.visible')
    cy.contains('div', 'Artifactory').should('be.visible')
    cy.contains('div', 'Primary').should('be.visible')
  })

  it('creation of Winrm Service using Artifactory', () => {
    cy.intercept('POST', afterSaveServiceEndpointPOST, afterSaveServiceResponse).as('afterSaveService')
    cy.intercept('GET', afterSaveServiceNameEndpoint, afterSaveServiceNameResponse).as('afterSaveServiceName')
    cy.intercept('GET', afterFinalSaveServiceNameEndpoint, afterFinalServiceNameWinrmResponse).as(
      'afterFinalSaveServiceNameWinrm'
    )
    cy.get('[id*="serviceLandingPageTabs_manageServices"]').should('be.visible')
    cy.get('div[id*="serviceLandingPageTabs_manageServices"]').click({ force: true })
    cy.contains('span', 'New Service').click()
    cy.fillField('name', serviceName)
    cy.contains('span', 'Save').click()
    cy.contains('p', 'WinRM').click()
    cy.contains('span', 'Add Primary Artifact').should('be.visible')
    cy.contains('span', 'Add Primary Artifact').should('be.visible')
    cy.get('button[id="add-config-file"]').within(() => {
      cy.get('span[class="bp3-button-text"]').should('be.visible')
    })

    cy.contains('span', 'Add Primary Artifact').click()
    cy.contains('p', 'Specify Artifact Repository Type').should('be.visible')

    cy.contains('p', 'Artifactory').should('be.visible')
    cy.contains('p', 'Jenkins').should('be.visible')

    cy.contains('p', 'Artifactory').click()
    cy.contains('span', 'Change').should('be.visible')
    cy.clickSubmit()
    cy.get('span[data-icon="fixed-input"]').click()
    cy.contains('span', 'Runtime input').click()
    cy.get('input[value="<+input>"]').should('be.visible')
    cy.clickSubmit()

    cy.get('button[class="MultiTypeInput--btn MultiTypeInput--FIXED"]').each($btn => {
      cy.wrap($btn)
        .click()
        .then(() => {
          cy.contains('span', 'Runtime input').click()
        })
    })

    cy.clickSubmit()

    cy.contains('span', 'Add Config File').click()
    cy.contains('p', 'Harness').click()
    cy.clickSubmit()
    cy.get('input[name="identifier"]').type('testConfigFileIdentifier')
    cy.get('span[data-icon="fixed-input"]').eq(0).click()
    cy.contains('span', 'Runtime input').click()
    cy.get('input[value="<+input>"]').should('be.visible')

    cy.clickSubmit()
    cy.get('div[class$="GtxnYE"]').within(() => {
      cy.contains('span', 'testConfigFileIdentifier').should('be.visible')
    })
    cy.contains('span', 'Save').click()
    cy.contains('span', 'Service updated successfully').should('be.visible')
    cy.contains('p', /^Id:/).should('have.text', 'Id: testServiceV2')

    cy.contains('span', '<+input>').should('be.visible')
    cy.contains('p', '<+input>').should('be.visible')
    cy.contains('div', 'Artifactory').should('be.visible')
    cy.contains('div', 'Primary').should('be.visible')
  })
})
