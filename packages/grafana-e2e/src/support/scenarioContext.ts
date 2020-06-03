import { e2e } from '../index';
import { DeleteDashboardConfig } from '../flows/deleteDashboard';
import { DeleteDataSourceConfig } from '../flows/deleteDataSource';

export interface ScenarioContext {
  addedDashboards: DeleteDashboardConfig[];
  addedDataSources: DeleteDataSourceConfig[];
  lastAddedDashboard: string; // @todo rename to `lastAddedDashboardTitle`
  lastAddedDashboardUid: string;
  lastAddedDataSource: string; // @todo rename to `lastAddedDataSourceName`
  lastAddedDataSourceId: string;
  [key: string]: any;
}

const scenarioContext: ScenarioContext = {
  addedDashboards: [],
  addedDataSources: [],
  lastAddedDashboard: '',
  lastAddedDashboardUid: '',
  lastAddedDataSource: '',
  lastAddedDataSourceId: '',
};

// @todo this actually returns type `Cypress.Chainable`
export const getScenarioContext = (): any =>
  e2e()
    .wrap({
      getScenarioContext: () => ({ ...scenarioContext } as ScenarioContext),
    })
    .invoke('getScenarioContext');

// @todo this actually returns type `Cypress.Chainable`
export const setScenarioContext = (newContext: Partial<ScenarioContext>): any =>
  e2e()
    .wrap({
      setScenarioContext: () => {
        Object.entries(newContext).forEach(([key, value]) => {
          scenarioContext[key] = value;
        });
      },
    })
    .invoke('setScenarioContext');
