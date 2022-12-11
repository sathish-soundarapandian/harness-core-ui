import React from 'react'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { EntityReference } from '@common/exports'
import css from '@secrets/components/SecretReference/SecretReference.module.scss'
import refSelectCSS from '@common/components/ReferenceSelect/ReferenceSelect.module.scss'
import { Container } from '@harness/uicore'
import { getProjectListPromise } from 'services/cd-ng'
import cx from 'classnames'

interface PropsInterface {
  accountIdentifier: string
  orgIdentifier: string
}

const fetchRecords = ({ pageIndex, setPagedData, search, done, accountIdentifier, orgIdentifier }) => {
  return getProjectListPromise({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      searchTerm: search?.trim(),
      pageIndex,
      pageSize: 2
    }
  }).then(responseData => {
    if (responseData?.data?.content) {
      const data = responseData.data.content.map(datum => {
        return {
          name: datum.project.name,
          identifier: datum.project.identifier,
          record: { ...datum.project }
        }
      })
      setPagedData(responseData)
      done(data)
    } else {
      done([])
    }
  })
}

export const useProjectDropdown = ({ accountIdentifier, orgIdentifier }: PropsInterface) => {
  const { getString } = useStrings()

  const [pagedData, setPagedData] = React.useState({})
  const [pageNo, setPageNo] = React.useState(0)
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        title={getString('freezeWindows.freezeStudio.selectProjects')}
        className={cx(refSelectCSS.referenceSelect, refSelectCSS.dialog)}
      >
        <Container className={css.secretRefContainer}>
          <EntityReference
            onSelect={() => {}}
            selectedRecord={null}
            defaultScope={null}
            noDataCard={null}
            isMultiSelect={true}
            fetchRecords={(done, search, pageIndex, scope, _signal, allTabSelected) => {
              const aa = pageIndex
              const bb = pageNo
              fetchRecords({
                done,
                setPagedData,
                search,
                pageIndex,
                accountIdentifier,
                orgIdentifier
              })
            }}
            projectIdentifier={null}
            orgIdentifier={null}
            onCancel={() => {
              hideModal()
            }}
            noRecordsText={'nothing here'}
            searchInlineComponent={null}
            showAllTab={true}
            showAccountTab={true}
            input={''}
            renderTabSubHeading
            pagination={{
              itemCount: pagedData?.data?.totalItems || 0,
              pageSize: pagedData?.data?.pageSize || 0,
              pageCount: pagedData?.data?.totalPages || 0,
              pageIndex: pageNo || 0,
              gotoPage: pageIndex => {
                var aaa = 1
                console.log('in goToPage: ', pageIndex)
                setPageNo(pageIndex)
              }
            }}
            disableCollapse={true}
            recordRender={({ item, selectedScope, selected }) => {
              return <div>{item.name}</div>
            }}
          />
        </Container>
      </Dialog>
    ),
    [pagedData, orgIdentifier, pageNo]
  )

  return {
    open: () => {
      showModal()
    },
    close: () => {
      hideModal()
    }
  }
}
