const custom = require('@digitalroute/cz-conventional-changelog-for-jira/configurable');

module.exports = custom({
  types: {
    ...defaultTypes,
    copies: {
      description: 'Copies changes only (eg: text/string changes) without any new feature/bug fix',
      title: 'Copies',
    },
    version: {
      description: 'Only increase app version, no changes made to any other src files',
      title: 'Version',
    },
    perf: {
      description: 'Improvements that will make your code perform better',
      title: 'Performance',
    },
  },
  skipScope: true,
});
