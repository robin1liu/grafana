import { e2e } from '../index';
import { getScenarioContext } from '../support/scenarioContext';

export interface AddPanelConfig {
  dashboardUid: string;
  dataSourceName: string;
  queriesForm: (config: AddPanelConfig) => void;
  panelTitle: string;
  visualizationName: string;
}

// @todo this actually returns type `Cypress.Chainable`
export const addPanel = (config?: Partial<AddPanelConfig>): any =>
  getScenarioContext().then(({ lastAddedDashboardUid, lastAddedDataSource }: any) => {
    const fullConfig = {
      dashboardUid: lastAddedDashboardUid,
      dataSourceName: lastAddedDataSource,
      panelTitle: `e2e-${Date.now()}`,
      queriesForm: () => {},
      visualizationName: 'Table',
      ...config,
    } as AddPanelConfig;

    const { dashboardUid, dataSourceName, panelTitle, queriesForm, visualizationName } = fullConfig;

    e2e.flows.openDashboard(dashboardUid);
    e2e.pages.Dashboard.Toolbar.toolbarItems('Add panel').click();
    e2e.pages.AddDashboard.addNewPanel().click();

    e2e()
      .get('.ds-picker')
      .click()
      .contains('[id^="react-select-"][id*="-option-"]', dataSourceName)
      .scrollIntoView()
      .click();

    openOptionsGroup('settings');
    getOptionsGroup('settings')
      .find('[value="Panel Title"]')
      .scrollIntoView()
      .clear()
      .type(panelTitle);
    closeOptionsGroup('settings');

    openOptionsGroup('type');
    e2e()
      .get(`[aria-label="Plugin visualization item ${visualizationName}"]`)
      .scrollIntoView()
      .click();
    closeOptionsGroup('type');

    queriesForm(fullConfig);

    // @todo enable when plugins have this implemented
    //e2e.components.QueryEditorRow.actionButton('Disable/enable query').click();
    //e2e.components.Panels.Panel.containerByTitle(panelTitle).find('.panel-content').contains('No data');
    //e2e.components.QueryEditorRow.actionButton('Disable/enable query').click();

    e2e.components.PanelEditor.OptionsPane.close().click();

    e2e()
      .get('button[title="Apply changes and go back to dashboard"]')
      .click();

    // @todo remove `wrap` when possible
    return e2e().wrap({ config: fullConfig });
  });

const closeOptionsGroup = (name: string) => {
  if (isOptionsGroupOpen(name)) {
    toggleOptionsGroup(name);
  }
};

const getOptionsGroup = (name: string) => e2e().get(`.options-group:has([aria-label="Options group Panel ${name}"])`);

const getOptionsGroupState = (name: string) =>
  JSON.parse(localStorage.getItem(`grafana.dashboard.editor.ui.optionGroup[Panel ${name}]`) as string); // will throw at runtime

const isOptionsGroupOpen = (name: string) => !getOptionsGroupState(name).defaultToClosed;

const openOptionsGroup = (name: string) => {
  if (!isOptionsGroupOpen(name)) {
    toggleOptionsGroup(name);
  }
};

const toggleOptionsGroup = (name: string) =>
  getOptionsGroup(name)
    .find('.editor-options-group-toggle')
    .click();
