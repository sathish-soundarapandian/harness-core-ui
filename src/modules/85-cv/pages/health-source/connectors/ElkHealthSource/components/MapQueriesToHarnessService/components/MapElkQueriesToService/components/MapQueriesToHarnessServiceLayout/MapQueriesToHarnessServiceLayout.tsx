/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
//xxx
import {
  Accordion,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Utils
} from "@wings-software/uicore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import noop from "lodash/noop";
import { MapElkToServiceFieldNames } from "@cv/pages/health-source/connectors/ElkHealthSource/components/MapQueriesToHarnessService/constants";
// import { useGetElkSampleData, useGetElkSavedSearches } from "services/cv"; // Get these API's ready
import { useStrings } from "framework/strings";
import type { ProjectPathProps } from "@common/interfaces/RouteInterfaces";
import { QueryViewer } from "@cv/components/QueryViewer/QueryViewer";
import Card from "@cv/components/Card/Card";
import { ElkMetricNameAndHostIdentifier } from "../../ElkMetricNameAndHostIdentifier";
import type { MapQueriesToHarnessServiceLayoutProps } from "./types";
import css from "./MapQueriesToHarnessServiceLayout.module.scss";

export default function MapQueriesToHarnessServiceLayout(
  props: MapQueriesToHarnessServiceLayoutProps
): JSX.Element {
  const {
    formikProps,
    connectorIdentifier,
    onChange,
    isConnectorRuntimeOrExpression,
    isTemplate,
    expressions
  } = props;
  const [isQueryExecuted, setIsQueryExecuted] = useState(false);
  const { projectIdentifier, orgIdentifier, accountId } =
    useParams<ProjectPathProps>();
  const { getString } = useStrings();
  const values = formikProps?.values;
  const query = useMemo(
    () => (values?.query?.length ? values.query : ""),
    [values]
  );
  const isQueryRuntimeOrExpression =
    getMultiTypeFromValue(query) !== MultiTypeInputType.FIXED;

  const queryParams = useMemo(
    () => ({
      accountId,
      projectIdentifier,
      orgIdentifier,
      tracingId: Utils.randomId(),
      connectorIdentifier: connectorIdentifier as string
    }),
    [accountId, projectIdentifier, orgIdentifier, connectorIdentifier]
  );

  const useGetElkSavedSearches = noop;
  const useGetElkSampleData = noop;

  const {
    data: savedQuery,
    loading: loadingSavedQuery,
    refetch: refetchSavedQuery
  } = useGetElkSavedSearches({
    lazy: isConnectorRuntimeOrExpression || isQueryRuntimeOrExpression,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      connectorIdentifier,
      requestGuid: queryParams?.tracingId
    }
  }) || {};

  useEffect(() => {
    if (!isConnectorRuntimeOrExpression || !isQueryRuntimeOrExpression) {
      refetchSavedQuery?.();
    }
  }, [isConnectorRuntimeOrExpression, isQueryRuntimeOrExpression]);

  const {
    data: ElkData,
    loading,
    refetch,
    error
  } = useGetElkSampleData({ lazy: true }) || {};

  const fetchElkRecords = useCallback(async () => {
    await refetch?.({
      queryParams: {
        accountId,
        orgIdentifier,
        projectIdentifier,
        connectorIdentifier,
        requestGuid: queryParams?.tracingId,
        query
      }
    });
    setIsQueryExecuted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const postFetchingRecords = useCallback(() => {
    // resetting values of service once fetch records button is clicked.
    onChange(MapElkToServiceFieldNames.SERVICE_INSTANCE, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    onChange(MapElkToServiceFieldNames.IS_STALE_RECORD, false);
  }, []);

  const savedSearchQueryOption = useMemo(
    () =>
      loadingSavedQuery
        ? [{ label: getString("loading"), value: getString("loading") }]
        : savedQuery?.resource?.map((item) => ({
            label: item.title as string,
            value: item.searchQuery as string
          })) || [],
    [loadingSavedQuery]
  );

  const onSavedQueryChange = useCallback(
    (item: SelectOption) => {
      onChange(MapElkToServiceFieldNames.QUERY, item.value as string);
      onChange(MapElkToServiceFieldNames.SERVICE_INSTANCE, "");
      onChange(MapElkToServiceFieldNames.RECORD_COUNT, "0");
      setIsQueryExecuted(false);
    },
    [query]
  );

  const getSavedQueryValue = useCallback(
    () =>
      savedSearchQueryOption?.find((item) => item.value === query) || {
        value: "",
        label: ""
      },
    [query]
  );

  const staleRecordsWarningMessage = useMemo(
    () =>
      values?.isStaleRecord
        ? `getString("cv.monitoringSources.Elk.staleRecordsWarning")`
        : "",
    [values?.isStaleRecord]
  );

  return (
    <Card>
      <>
        <Layout.Horizontal>
          <Accordion activeId="metricToService" className={css.accordian}>
            <Accordion.Panel
              id="metricToService"
              summary={getString("cv.monitoringSources.mapQueriesToServices")}
              details={
                <ElkMetricNameAndHostIdentifier
                  serviceInstance={values?.serviceInstance}
                  sampleRecord={ElkData?.resource?.[0] || null}
                  isQueryExecuted={isQueryExecuted}
                  onChange={onChange}
                  loading={loading}
                  isTemplate={isTemplate}
                  expressions={expressions}
                  isConnectorRuntimeOrExpression={
                    isConnectorRuntimeOrExpression
                  }
                />
              }
            />
          </Accordion>
          <div className={css.queryViewContainer}>
            {!isConnectorRuntimeOrExpression && (
              <FormInput.Select
                className={css.savedQueryDropdown}
                label={getString("cv.selectQuery")}
                name={"savedSearchQuery"}
                placeholder={`getString(
                  "cv.monitoringSources.Elk.savedSearchQuery"
                )`}
                value={getSavedQueryValue()}
                items={savedSearchQueryOption}
                onChange={onSavedQueryChange}
              />
            )}
            <QueryViewer
              isQueryExecuted={isQueryExecuted}
              className={css.validationContainer}
              records={ElkData?.resource}
              fetchRecords={fetchElkRecords}
              postFetchingRecords={postFetchingRecords}
              loading={loading}
              error={error}
              query={query}
              queryNotExecutedMessage={`getString(
                "cv.monitoringSources.Elk.submitQueryToSeeRecords"
              )`}
              queryTextAreaProps={{
                onChangeCapture: () => {
                  onChange(MapElkToServiceFieldNames.IS_STALE_RECORD, true);
                }
              }}
              staleRecordsWarning={staleRecordsWarningMessage}
              dataTooltipId={"ElkQuery"}
              isTemplate={isTemplate}
              expressions={expressions}
              isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
            />
          </div>
        </Layout.Horizontal>
      </>
    </Card>
  );
}
///xxx
