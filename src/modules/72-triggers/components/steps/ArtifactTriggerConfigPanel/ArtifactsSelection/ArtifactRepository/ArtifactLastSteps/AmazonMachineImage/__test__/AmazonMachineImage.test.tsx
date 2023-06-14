/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { awsRegions } from '@pipeline/components/PipelineSteps/Steps/StepGroupStep/__tests__/mocks'
import type { AMIFilter } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { AmazonMachineImage } from '../AmazonMachineImage'
import { amiTags } from './mocks'

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => ({ data: awsRegions, loading: false }))
}))

jest.mock('services/cd-ng-rq', () => ({
  useListTagsForAmiArtifactMutation: jest
    .fn()
    .mockImplementation(() => ({ data: amiTags, loading: false, mutate: jest.fn() }))
}))

describe('AMI Artifact Trigger Test', () => {
  test('Create flow', async () => {
    const handleSubmit = jest.fn()
    const { findByText, baseElement } = render(
      <TestWrapper>
        <AmazonMachineImage
          key=""
          name="Artifact Location"
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={{
            eventConditions: [],
            connectorRef: '',
            filters: [],
            tags: [],
            region: '',
            version: '<+trigger.artifact.build>'
          }}
          handleSubmit={handleSubmit}
        />
      </TestWrapper>
    )
    // TODO: Update for tags and filters use case.
    const tags: AMIFilter[] = [
      // { name: 'owner', value: '1' }
      // { name: 'purpose', value: '2' }
    ]
    const filters: AMIFilter[] = [
      // {name: 'ami-image-id', value: '1' }
      // { name: 'ami-name', value: '2' }
    ]

    expect(await findByText('pipeline.artifactsSelection.artifactDetails')).toBeInTheDocument()
    const regionField = baseElement.querySelector('[name="region"]') as HTMLInputElement
    expect(regionField).toHaveValue('')
    const submitButton = baseElement.querySelector('[type="submit"]') as HTMLButtonElement

    // Error check
    fireEvent.click(submitButton)
    expect(await findByText('validation.regionRequired')).toBeInTheDocument()

    // Enter field values
    userEvent.click(regionField)
    const dropDownSelectOption = await findByText('US East (N. Virginia)')
    expect(dropDownSelectOption).toBeInTheDocument()
    userEvent.click(dropDownSelectOption)
    const addAMITagsButton = await screen.findByText('pipeline.amiTags', { selector: 'span.bp3-button-text' })
    const addAMIFiltersButton = await screen.findByText('pipeline.amiFilters', { selector: 'span.bp3-button-text' })

    // Enter AMI Tags
    tags.forEach(async ({ name, value }, index) => {
      userEvent.click(addAMITagsButton)
      const tagName = (await waitFor(() => {
        const $tagName = baseElement.querySelector(`input[name="tags[${index}].name"]`)
        expect($tagName).toBeInTheDocument()
        return $tagName
      })) as HTMLInputElement

      userEvent.click(tagName)
      userEvent.click(await screen.findByText(name!))
      await waitFor(() => expect(tagName).toHaveValue(name))
      userEvent.type(baseElement.querySelector(`input[name="tags[${index}].value"]`) as HTMLInputElement, value!)
    })

    //  Enter AMI Filters
    filters.forEach(async ({ name, value }, index) => {
      userEvent.click(addAMIFiltersButton)
      const filterName = (await waitFor(() => {
        const $filterName = baseElement.querySelector(`input[name="filters[${index}].name"]`)
        expect($filterName).toBeInTheDocument()
        return $filterName
      })) as HTMLInputElement

      userEvent.click(filterName)
      userEvent.click(await screen.findByText(name!))
      await waitFor(() => expect(filterName).toHaveValue(name))
      userEvent.type(baseElement.querySelector(`input[name="filters[${index}].value"]`) as HTMLInputElement, value!)
    })

    // Submit Form
    fireEvent.click(submitButton)
    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith({
        connectorRef: 'connectorRef',
        region: 'us-east-1',
        tags,
        filters,
        eventConditions: [],
        version: '<+trigger.artifact.build>'
      })
    )
  })

  test('Edit flow', async () => {
    const tags: AMIFilter[] = [
      { name: 'owner', value: '1' },
      { name: 'purpose', value: '2' }
    ]
    const filters: AMIFilter[] = [
      { name: 'ami-image-id', value: '1' },
      { name: 'ami-name', value: '2' }
    ]
    const handleSubmit = jest.fn()
    const { findByText, baseElement } = render(
      <TestWrapper>
        <AmazonMachineImage
          key=""
          name="Artifact Location"
          prevStepData={{ connectorId: { value: 'connectorRef' } }}
          initialValues={{
            eventConditions: [],
            connectorRef: 'connectorRef',
            filters,
            tags,
            region: 'us-east-1',
            version: '<+trigger.artifact.build>'
          }}
          handleSubmit={handleSubmit}
        />
      </TestWrapper>
    )

    expect(await findByText('pipeline.artifactsSelection.artifactDetails')).toBeInTheDocument()
    const regionField = baseElement.querySelector('[name="region"]') as HTMLInputElement
    expect(regionField).toHaveValue('US East (N. Virginia)')
    const submitButton = baseElement.querySelector('[type="submit"]') as HTMLButtonElement

    // Change region value
    userEvent.click(regionField)
    const dropDownSelectOption = await findByText('US East (Ohio)')
    expect(dropDownSelectOption).toBeInTheDocument()
    userEvent.click(dropDownSelectOption)

    // Submit form
    await userEvent.click(submitButton)

    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith({
        connectorRef: 'connectorRef',
        region: 'us-east-2',
        tags: [],
        filters,
        eventConditions: [],
        version: '<+trigger.artifact.build>'
      })
    )
  })
})
