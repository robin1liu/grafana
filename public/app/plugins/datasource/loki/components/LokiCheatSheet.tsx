import React, { PureComponent } from 'react';
import { shuffle } from 'lodash';
import { ExploreStartPageProps, DataQuery, ExploreMode } from '@grafana/data';
import LokiLanguageProvider from '../language_provider';

const DEFAULT_EXAMPLES = ['{job="default/prometheus"}'];
const PREFERRED_LABELS = ['job', 'app', 'k8s_app'];
const EXAMPLES_LIMIT = 5;

const LOGQL_EXAMPLES = [
  {
    title: 'Count over time',
    expression: 'count_over_time({job="mysql"}[5m])',
    label: 'This query counts all the log lines within the last five minutes for the MySQL job.',
  },
  {
    title: 'Rate',
    expression: 'rate(({job="mysql"} |= "error" != "timeout")[10s])',
    label:
      'This query gets the per-second rate of all non-timeout errors within the last ten seconds for the MySQL job.',
  },
  {
    title: 'Aggregate, count, and group',
    expression: 'sum(count_over_time({job="mysql"}[5m])) by (level)',
    label: 'Get the count of logs during the last five minutes, grouping by level.',
  },
];

export default class LokiCheatSheet extends PureComponent<ExploreStartPageProps, { userExamples: string[] }> {
  userLabelTimer: NodeJS.Timeout;
  state = {
    userExamples: DEFAULT_EXAMPLES,
  };

  componentDidMount() {
    this.scheduleUserLabelChecking();
  }

  componentWillUnmount() {
    clearTimeout(this.userLabelTimer);
  }

  scheduleUserLabelChecking() {
    this.userLabelTimer = setTimeout(this.checkUserLabels, 1000);
  }

  checkUserLabels = async () => {
    // Set example from user labels
    const provider: LokiLanguageProvider = this.props.datasource.languageProvider;
    if (provider.started) {
      const labels = provider.getLabelKeys() || [];
      const preferredLabel = PREFERRED_LABELS.find(l => labels.includes(l));
      if (preferredLabel) {
        const values = await provider.getLabelValues(preferredLabel);
        const userExamples = shuffle(values)
          .slice(0, EXAMPLES_LIMIT)
          .map(value => `{${preferredLabel}="${value}"}`);
        this.setState({ userExamples });
      }
    } else {
      this.scheduleUserLabelChecking();
    }
  };

  renderExpression(expr: string) {
    const { onClickExample } = this.props;

    return (
      <div
        className="cheat-sheet-item__example"
        key={expr}
        onClick={e => onClickExample({ refId: 'A', expr } as DataQuery)}
      >
        <code>{expr}</code>
      </div>
    );
  }

  renderLogsCheatSheet() {
    const { userExamples } = this.state;

    return (
      <>
        <h2>日志查询入门</h2>
        <div className="cheat-sheet-item">
          <div className="cheat-sheet-item__title">简单查询</div>
          <div className="cheat-sheet-item__label">使用日志标签下拉框选择需要查询的指定标签日志.</div>
          <div className="cheat-sheet-item__label">也可以直接手动输入如下格式的查询语句:</div>
          {this.renderExpression('{job="default/prometheus"}')}
          {userExamples !== DEFAULT_EXAMPLES && userExamples.length > 0 ? (
            <div>
              <div className="cheat-sheet-item__label">你的日志可以参考如下示例:</div>
              {userExamples.map(example => this.renderExpression(example))}
            </div>
          ) : null}
        </div>
        <div className="cheat-sheet-item">
          <div className="cheat-sheet-item__title">组合查询</div>
          {this.renderExpression('{app="cassandra",namespace="prod"}')}
          <div className="cheat-sheet-item__label">将返回同时拥有这两个标签的日志.</div>
        </div>

        <div className="cheat-sheet-item">
          <div className="cheat-sheet-item__title">关键字</div>
          {this.renderExpression('{app="cassandra"} |~ "(duration|latency)s*(=|is|of)s*[d.]+"')}
          {this.renderExpression('{app="cassandra"} |= "关键字匹配"')}
          {this.renderExpression('{app="cassandra"} != "关键字过滤"')}
          <div className="cheat-sheet-item__label">
            <a href="https://github.com/grafana/loki/blob/master/docs/logql.md#filter-expression" target="logql">
              LogQL
            </a>{' '}
            更多语法请参考日志开源文档.
          </div>
        </div>
      </>
    );
  }

  renderMetricsCheatSheet() {
    return (
      <div>
        <h2>LogQL Cheat Sheet</h2>
        {LOGQL_EXAMPLES.map(item => (
          <div className="cheat-sheet-item" key={item.expression}>
            <div className="cheat-sheet-item__title">{item.title}</div>
            {this.renderExpression(item.expression)}
            <div className="cheat-sheet-item__label">{item.label}</div>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { exploreMode } = this.props;

    return exploreMode === ExploreMode.Logs ? this.renderLogsCheatSheet() : this.renderMetricsCheatSheet();
  }
}
