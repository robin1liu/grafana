import { e2e } from '../index';
import { getDashboardUid } from '../support/url';

export interface AddDashboardConfig {
  title: string;
}

// @todo this actually returns type `Cypress.Chainable`
export const addDashboard = (config?: Partial<AddDashboardConfig>): any => {
  e2e().logToConsole('Adding dashboard');

  const fullConfig = {
    title: `e2e-${Date.now()}`,
    ...config,
  } as AddDashboardConfig;

  const { title } = fullConfig;

  e2e.pages.AddDashboard.visit();

  e2e.pages.Dashboard.Toolbar.toolbarItems('Save dashboard').click();

  e2e.pages.SaveDashboardAsModal.newName()
    .clear()
    .type(title);
  e2e.pages.SaveDashboardAsModal.save().click();

  e2e.flows.assertSuccessNotification();

  e2e().logToConsole('Added dashboard with title:', title);

  return e2e()
    .url()
    .then((url: string) => {
      const uid = getDashboardUid(url);

      e2e.getScenarioContext().then(({ addedDashboardUids }: any) => {
        e2e.setScenarioContext({
          addedDashboardUids: [...addedDashboardUids, uid],
          lastAddedDashboard: title,
          lastAddedDashboardUid: uid,
        });
      });

      // @todo remove `wrap` when possible
      return e2e().wrap({
        config: fullConfig,
        uid,
      });
    });
};
