Package.describe({
  name: 'dispatch:restricted-find',
  version: '0.0.1',
  summary: 'Add find to allow / deny rules',
  git: 'https://github.com/DispatchMe/Meteor-restricted-find.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use([
    'meteor',
    'check',
    'underscore',
    'mongo',
    'dispatch:run-as-user@0.0.1'
  ]);

  api.addFiles([
    'lib/restrict.query.js',
    'lib/collection.overwrites.js'
  ], ['client', 'server']);

  api.export('compileRulesEJSON', { testOnly: true });
  api.export('parseRules', { testOnly: true });
  api.export('restrictQuery', { testOnly: true });

});

Package.onTest(function(api) {
  api.use([
    'tinytest',
    'check',
    'mongo',
    'accounts-password',
    'dispatch:run-as-user@0.0.1',
    'dispatch:restricted-find'
  ]);

  api.addFiles([
    'tests/test.helpers.fake.js',
    'tests/check.environment.js',
    'tests/test.compile.rules.ejson.js',
    'tests/test.parse.rules.js',
    'tests/test.restrict.query.js',
    'tests/test.js'
  ]);

});
