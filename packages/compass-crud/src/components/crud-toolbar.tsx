import type AppRegistry from 'hadron-app-registry';
import React, { useCallback, useMemo, useRef } from 'react';
import { createLoggerAndTelemetry } from '@mongodb-js/compass-logging';
import {
  Body,
  Button,
  Icon,
  IconButton,
  SegmentedControl,
  SegmentedControlOption,
  SpinLoader,
  Toolbar,
  css,
  spacing,
} from '@mongodb-js/compass-components';
import { useId } from '@react-aria/utils';
import { AddDataMenu } from './add-data-menu';

const { track } = createLoggerAndTelemetry('COMPASS-CRUD-UI');

const crudQueryBarStyles = css({
  width: '100%',
  position: 'relative',
});

const crudToolbarStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: spacing[3],
  padding: spacing[3],
});

const crudBarStyles = css({
  width: '100%',
  display: 'flex',
  gap: spacing[2],
  justifyContent: 'space-between',
});

const toolbarLeftActionStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: spacing[2],
});

const toolbarRightActionStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: spacing[2],
});

type CrudToolbarProps = {
  activeDocumentView: string;
  count?: number;
  end: number;
  getPage: (page: number) => void;
  insertDataHandler: (openInsertKey: 'insert-document' | 'import-file') => void;
  isExportable: boolean;
  loadingCount: boolean;
  localAppRegistry: AppRegistry;
  onApplyClicked: () => void;
  onResetClicked: () => void;
  openExportFileDialog: () => void;
  page: number;
  readonly: boolean;
  refreshDocuments: () => void;
  resultId: string;
  start: number;
  viewSwitchHandler: (view: 'List' | 'JSON' | 'Table') => void;
};

const CrudToolbar: React.FunctionComponent<CrudToolbarProps> = ({
  activeDocumentView,
  count,
  end,
  getPage,
  insertDataHandler,
  isExportable,
  loadingCount,
  localAppRegistry,
  onApplyClicked,
  onResetClicked,
  openExportFileDialog,
  page,
  readonly,
  refreshDocuments,
  resultId,
  start,
  viewSwitchHandler,
}) => {
  const queryBarRole = localAppRegistry.getRole('Query.QueryBar')![0];

  const queryBarRef = useRef(
    isExportable
      ? {
          component: queryBarRole.component,
          store: localAppRegistry.getStore(queryBarRole.storeName!),
          actions: localAppRegistry.getAction(queryBarRole.actionName!),
        }
      : null
  );

  const displayedDocumentCount = useMemo(
    () => (loadingCount ? '' : `${count ?? 'N/A'}`),
    [loadingCount, count]
  );

  const onClickRefreshDocuments = useCallback(() => {
    track('Query Results Refreshed');
    refreshDocuments();
  }, [refreshDocuments]);

  const QueryBarComponent = isExportable
    ? queryBarRef.current!.component
    : null;

  const controlId = useId();
  const prevButtonDisabled = useMemo(() => page === 0, [page]);
  const nextButtonDisabled = useMemo(
    () => (count ? 20 * (page + 1) >= count : false),
    [count, page]
  );

  return (
    <Toolbar className={crudToolbarStyles}>
      <div className={crudQueryBarStyles}>
        {isExportable && QueryBarComponent && (
          <QueryBarComponent
            store={queryBarRef.current!.store}
            actions={queryBarRef.current!.actions}
            resultId={resultId}
            buttonLabel="Find"
            onApply={onApplyClicked}
            onReset={onResetClicked}
          />
        )}
      </div>
      <div className={crudBarStyles}>
        <div className={toolbarLeftActionStyles}>
          {!readonly && <AddDataMenu insertDataHandler={insertDataHandler} />}
          <Button
            leftGlyph={<Icon glyph="Export" />}
            data-testid="export-collection-button"
            size="xsmall"
            onClick={openExportFileDialog}
          >
            Export Collection
          </Button>
        </div>
        <div className={toolbarRightActionStyles}>
          <Body data-testid="crud-document-count-display">
            {start} - {end} of {displayedDocumentCount}
          </Body>
          {loadingCount && (
            <SpinLoader size="12px" title="Fetching document count…" />
          )}
          {!loadingCount && (
            <IconButton
              aria-label="Refresh documents"
              title="Refresh documents"
              data-testid="refresh-documents-button"
              onClick={onClickRefreshDocuments}
            >
              <Icon glyph="Refresh" />
            </IconButton>
          )}

          <div>
            <IconButton
              data-testid="docs-toolbar-prev-page-btn"
              aria-label="Previous Page"
              title="Previous Page"
              onClick={() => getPage(page - 1)}
              disabled={prevButtonDisabled}
            >
              <Icon glyph="ChevronLeft" />
            </IconButton>
            <IconButton
              data-testid="docs-toolbar-next-page-btn"
              aria-label="Previous Page"
              title="Previous Page"
              onClick={() => getPage(page + 1)}
              disabled={nextButtonDisabled}
            >
              <Icon glyph="ChevronRight" />
            </IconButton>
          </div>

          <SegmentedControl
            id={controlId}
            aria-label="View"
            size="small"
            value={activeDocumentView}
            onChange={(value) =>
              viewSwitchHandler(value as 'List' | 'JSON' | 'Table')
            }
          >
            <SegmentedControlOption
              data-testid="toolbar-view-list"
              aria-label="Document list"
              value="List"
            >
              <Icon glyph="Menu" />
            </SegmentedControlOption>
            <SegmentedControlOption
              data-testid="toolbar-view-json"
              aria-label="E-JSON View"
              value="JSON"
            >
              <Icon glyph="CurlyBraces" />
            </SegmentedControlOption>
            <SegmentedControlOption
              data-testid="toolbar-view-table"
              aria-label="Table View"
              value="Table"
            >
              <Icon glyph="Table" />
            </SegmentedControlOption>
          </SegmentedControl>
        </div>
      </div>
    </Toolbar>
  );
};

export { CrudToolbar };
