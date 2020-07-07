// Libraries
import React, { PureComponent, memo, FormEvent } from 'react';
import { css, cx } from 'emotion';

// Components
import { Tooltip } from '../Tooltip/Tooltip';
import { Icon } from '../Icon/Icon';
import { TimePickerContent } from './TimePickerContent/TimePickerContent';
import { ClickOutsideWrapper } from '../ClickOutsideWrapper/ClickOutsideWrapper';

// Utils & Services
import { stylesFactory } from '../../themes/stylesFactory';
import { withTheme, useTheme } from '../../themes/ThemeContext';

// Types
import { isDateTime, rangeUtil, GrafanaTheme, dateTimeFormat, timeZoneFormatUserFriendly } from '@grafana/data';
import { TimeRange, TimeOption, TimeZone, dateMath } from '@grafana/data';
import { Themeable } from '../../types';

const quickOptions: TimeOption[] = [
  { from: 'now-5m', to: 'now', display: '最近 5 分钟', section: 3 },
  { from: 'now-15m', to: 'now', display: '最近 15 分钟', section: 3 },
  { from: 'now-30m', to: 'now', display: '最近 30 分钟', section: 3 },
  { from: 'now-1h', to: 'now', display: '最近 1 小时', section: 3 },
  { from: 'now-3h', to: 'now', display: '最近 3 小时', section: 3 },
  { from: 'now-6h', to: 'now', display: '最近 6 小时', section: 3 },
  { from: 'now-12h', to: 'now', display: '最近 12 小时', section: 3 },
  { from: 'now-24h', to: 'now', display: '最近 24 小时', section: 3 },
  { from: 'now-2d', to: 'now', display: '最近 2 天', section: 3 },
  { from: 'now-7d', to: 'now', display: '最近 7 天', section: 3 },
  { from: 'now-30d', to: 'now', display: '最近 30 天', section: 3 },
  { from: 'now-90d', to: 'now', display: '最近 90 天', section: 3 },
  { from: 'now-6M', to: 'now', display: '最近 6 月', section: 3 },
  { from: 'now-1y', to: 'now', display: '最近 1 年', section: 3 },
  { from: 'now-2y', to: 'now', display: '最近 2 年', section: 3 },
  { from: 'now-5y', to: 'now', display: '最近 5 年', section: 3 },
];

const otherOptions: TimeOption[] = [
  { from: 'now-1d/d', to: 'now-1d/d', display: '昨天', section: 3 },
  { from: 'now-2d/d', to: 'now-2d/d', display: '昨天之前', section: 3 },
  { from: 'now-7d/d', to: 'now-7d/d', display: '此前一周', section: 3 },
  { from: 'now-1w/w', to: 'now-1w/w', display: '上周', section: 3 },
  { from: 'now-1M/M', to: 'now-1M/M', display: '上个月', section: 3 },
  { from: 'now-1y/y', to: 'now-1y/y', display: '去年', section: 3 },
  { from: 'now/d', to: 'now/d', display: '今天', section: 3 },
  { from: 'now/w', to: 'now/w', display: '本周', section: 3 },
  { from: 'now/M', to: 'now/M', display: '本月', section: 3 },
  { from: 'now/y', to: 'now/y', display: '今年', section: 3 },
];

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    container: css`
      position: relative;
      display: flex;
      flex-flow: column nowrap;
    `,
    buttons: css`
      display: flex;
    `,
    caretIcon: css`
      margin-left: ${theme.spacing.xs};
    `,
    clockIcon: css`
      margin-left: ${theme.spacing.xs};
      margin-right: ${theme.spacing.xs};
    `,
    noRightBorderStyle: css`
      label: noRightBorderStyle;
      border-right: 0;
    `,
  };
});

const getLabelStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    container: css`
      display: inline-block;
    `,
    utc: css`
      color: ${theme.palette.orange};
      font-size: 75%;
      padding: 3px;
      font-weight: ${theme.typography.weight.semibold};
    `,
  };
});

export interface Props extends Themeable {
  hideText?: boolean;
  value: TimeRange;
  timeZone?: TimeZone;
  timeSyncButton?: JSX.Element;
  isSynced?: boolean;
  onChange: (timeRange: TimeRange) => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
  onZoom: () => void;
  history?: TimeRange[];
}

export interface State {
  isOpen: boolean;
}

export class UnthemedTimeRangePicker extends PureComponent<Props, State> {
  state: State = {
    isOpen: false,
  };

  onChange = (timeRange: TimeRange) => {
    this.props.onChange(timeRange);
    this.setState({ isOpen: false });
  };

  onOpen = (event: FormEvent<HTMLButtonElement>) => {
    const { isOpen } = this.state;
    event.stopPropagation();
    this.setState({ isOpen: !isOpen });
  };

  onClose = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const {
      value,
      onMoveBackward,
      onMoveForward,
      onZoom,
      timeZone,
      timeSyncButton,
      isSynced,
      theme,
      history,
    } = this.props;

    const { isOpen } = this.state;
    const styles = getStyles(theme);
    const hasAbsolute = isDateTime(value.raw.from) || isDateTime(value.raw.to);
    const syncedTimePicker = timeSyncButton && isSynced;
    const timePickerIconClass = cx({ ['icon-brand-gradient']: syncedTimePicker });
    const timePickerButtonClass = cx('btn navbar-button navbar-button--tight', {
      [`btn--radius-right-0 ${styles.noRightBorderStyle}`]: !!timeSyncButton,
      [`explore-active-button`]: syncedTimePicker,
    });

    return (
      <div className={styles.container}>
        <div className={styles.buttons}>
          {hasAbsolute && (
            <button className="btn navbar-button navbar-button--tight" onClick={onMoveBackward}>
              <Icon name="angle-left" size="lg" />
            </button>
          )}
          <div>
            <Tooltip content={<TimePickerTooltip timeRange={value} timeZone={timeZone} />} placement="bottom">
              <button aria-label="TimePicker Open Button" className={timePickerButtonClass} onClick={this.onOpen}>
                <Icon name="clock-nine" className={cx(styles.clockIcon, timePickerIconClass)} size="lg" />
                <TimePickerButtonLabel {...this.props} />
                <span className={styles.caretIcon}>{<Icon name={isOpen ? 'angle-up' : 'angle-down'} size="lg" />}</span>
              </button>
            </Tooltip>
            {isOpen && (
              <ClickOutsideWrapper onClick={this.onClose}>
                <TimePickerContent
                  timeZone={timeZone}
                  value={value}
                  onChange={this.onChange}
                  otherOptions={otherOptions}
                  quickOptions={quickOptions}
                  history={history}
                />
              </ClickOutsideWrapper>
            )}
          </div>

          {timeSyncButton}

          {hasAbsolute && (
            <button className="btn navbar-button navbar-button--tight" onClick={onMoveForward}>
              <Icon name="angle-right" size="lg" />
            </button>
          )}

          <Tooltip content={ZoomOutTooltip} placement="bottom">
            <button className="btn navbar-button navbar-button--zoom" onClick={onZoom}>
              <Icon name="search-minus" size="lg" />
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }
}

const ZoomOutTooltip = () => (
  <>
    增大时间范围 <br /> CTRL+Z
  </>
);

const TimePickerTooltip = ({ timeRange, timeZone }: { timeRange: TimeRange; timeZone?: TimeZone }) => {
  const theme = useTheme();
  const styles = getLabelStyles(theme);

  return (
    <>
      {dateTimeFormat(timeRange.from, { timeZone })}
      <div className="text-center">到</div>
      {dateTimeFormat(timeRange.to, { timeZone })}
      <div className="text-center">
        <span className={styles.utc}>{timeZoneFormatUserFriendly(timeZone)}</span>
      </div>
    </>
  );
};

const TimePickerButtonLabel = memo<Props>(({ hideText, value, timeZone }) => {
  const theme = useTheme();
  const styles = getLabelStyles(theme);

  if (hideText) {
    return null;
  }

  return (
    <span className={styles.container}>
      <span>{formattedRange(value, timeZone)}</span>
      <span className={styles.utc}>{rangeUtil.describeTimeRangeAbbrevation(value, timeZone)}</span>
    </span>
  );
});

const formattedRange = (value: TimeRange, timeZone?: TimeZone) => {
  const adjustedTimeRange = {
    to: dateMath.isMathString(value.raw.to) ? value.raw.to : value.to,
    from: dateMath.isMathString(value.raw.from) ? value.raw.from : value.from,
  };
  return rangeUtil.describeTimeRange(adjustedTimeRange, timeZone);
};

export const TimeRangePicker = withTheme(UnthemedTimeRangePicker);
