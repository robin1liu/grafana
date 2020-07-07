import React from 'react';
import { css } from 'emotion';
import { stylesFactory, useTheme, Select, Button, Switch, Field } from '@grafana/ui';
import { GrafanaTheme, AppEvents } from '@grafana/data';
import appEvents from 'app/core/app_events';
import { CoreEvents } from 'app/types';

export interface RichHistorySettingsProps {
  retentionPeriod: number;
  starredTabAsFirstTab: boolean;
  activeDatasourceOnly: boolean;
  onChangeRetentionPeriod: (option: { label: string; value: number }) => void;
  toggleStarredTabAsFirstTab: () => void;
  toggleactiveDatasourceOnly: () => void;
  deleteRichHistory: () => void;
}

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    container: css`
      padding-left: ${theme.spacing.sm};
      font-size: ${theme.typography.size.sm};
      .space-between {
        margin-bottom: ${theme.spacing.lg};
      }
    `,
    input: css`
      max-width: 200px;
    `,
    switch: css`
      display: flex;
      align-items: center;
    `,
    label: css`
      margin-left: ${theme.spacing.md};
    `,
  };
});

const retentionPeriodOptions = [
  { value: 2, label: '2 天' },
  { value: 5, label: '5 天' },
  { value: 7, label: '1 周' },
  { value: 14, label: '2 周' },
];

export function RichHistorySettings(props: RichHistorySettingsProps) {
  const {
    retentionPeriod,
    starredTabAsFirstTab,
    activeDatasourceOnly,
    onChangeRetentionPeriod,
    toggleStarredTabAsFirstTab,
    toggleactiveDatasourceOnly,
    deleteRichHistory,
  } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  const selectedOption = retentionPeriodOptions.find(v => v.value === retentionPeriod);

  const onDelete = () => {
    appEvents.emit(CoreEvents.showConfirmModal, {
      title: 'Delete',
      text: 'Are you sure you want to permanently delete your query history?',
      yesText: 'Delete',
      icon: 'trash-alt',
      onConfirm: () => {
        deleteRichHistory();
        appEvents.emit(AppEvents.alertSuccess, ['Query history deleted']);
      },
    });
  };

  return (
    <div className={styles.container}>
      <Field label="保存时间" description="选择一个查询历史保存的时间" className="space-between">
        <div className={styles.input}>
          <Select value={selectedOption} options={retentionPeriodOptions} onChange={onChangeRetentionPeriod}></Select>
        </div>
      </Field>
      <div
        className={css`
          font-weight: ${theme.typography.weight.bold};
        `}
      >
        清空查询历史
      </div>
      <div
        className={css`
          margin-bottom: ${theme.spacing.sm};
        `}
      >
        永久清空全部查询历史.
      </div>
      <Button variant="destructive" onClick={onDelete}>
        清空查询历史
      </Button>
    </div>
  );
}
