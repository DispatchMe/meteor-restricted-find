
Tinytest.add('Dispatch restricted-find - compileRulesEJSON', function(test) {
  test.isNotUndefined(compileRulesEJSON, 'compileRulesEJSON not declared');

  var foo = new FakeCollection();

  test.equal(foo.compileRulesEJSON('allow', {}, {}), []);
  test.equal(foo.compileRulesEJSON('deny', {}, {}), []);

  test.equal(foo.compileRulesEJSON('allow', { foo: 12 }, {}), []);
  test.equal(foo.compileRulesEJSON('deny', { foo: 12 }, {}), []);

  foo.setRestricted(true);
  test.equal(foo.compileRulesEJSON('allow', {}, {}), []);
  test.equal(foo.compileRulesEJSON('deny', {}, {}), []);

  /* Set allow rules */
  foo.setAllow([
    function(userId, selector, options) {
      return { owner: userId };
    }
  ]);
  foo.setDeny([]);

  test.equal(foo.compileRulesEJSON('allow', {}, {}),
    ['{"owner":null}']
  );

  test.equal(foo.compileRulesEJSON('deny', {}, {}), []);

  /* Set allow rules */
  foo.setAllow([]);
  foo.setDeny([
    function(userId, selector, options) {
      return { deletedAt: { $exists: true } };
    }
  ]);

  test.equal(foo.compileRulesEJSON('allow', {}, {}),
    []
  );

  test.equal(foo.compileRulesEJSON('deny', {}, {}), [
    '{"deletedAt":{"$exists":true}}'
  ]);

  /* Set allow rules */
  foo.setAllow([
    function(userId, selector, options) {
      return { owner: userId };
    }]);
  foo.setDeny([
    function(userId, selector, options) {
      return { deletedAt: { $exists: true } };
    }
  ]);

  test.equal(foo.compileRulesEJSON('allow', { foo: 'check' }, {}), [
      '{"owner":null}'
  ]);

  test.equal(foo.compileRulesEJSON('deny', { foo: 'check' }, {}), [
      '{"deletedAt":{"$exists":true}}'
  ]);

  foo.setUser('foo');

  test.equal(foo.compileRulesEJSON('allow', { foo: 'check' }, {}), [
      '{"owner":"foo"}'
  ]);

  test.equal(foo.compileRulesEJSON('deny', { foo: 'check' }, {}), [
      '{"deletedAt":{"$exists":true}}'
  ]);


  /* Set allow rules */
  foo.setAllow([]);
  foo.setDeny([
    function(userId, selector, options) {
      return {};
    }
  ]);

  test.equal(foo.compileRulesEJSON('allow', {}, {}),
    []
  );

  test.equal(foo.compileRulesEJSON('deny', {}, {}), [
    '{}'
  ]);

  /* Set allow rules */
  foo.setAllow([]);
  foo.setDeny([
    function(userId, selector, options) {
      return true;
    }
  ]);

  test.equal(foo.compileRulesEJSON('allow', {}, {}),
    []
  );

  test.equal(foo.compileRulesEJSON('deny', {}, {}), [
    '{}'
  ]);

  /* Set allow rules */
  foo.setAllow([]);
  foo.setDeny([
    function(userId, selector, options) {
      return false;
    }
  ]);

  test.equal(foo.compileRulesEJSON('allow', {}, {}), []);

  test.equal(foo.compileRulesEJSON('deny', {}, {}), []);

});

// Ref: http://vowsjs.org/#reference
//
// test.ok({ message: 'Ok' })
// test.expect_fail()
// test.fail({type: 'foo', expected: '', actual: '', message: ''})
// test.exception(exception)
// test.runId()
// test.equal(actual, expected, message, not)
// test.notEqual(actual, expected, message)
// test.instanceOf(obj, klass, message)
// test.notInstanceOf(obj, klass, message)
// test.matches(actual, regexp, message)
// test.notMatches(actual, regexp, message)
// test.throws(f, expected)
// test.isTrue(v, msg)
// test.isFalse(v, msg)
// test.isNull(v, msg)
// test.isNotNull(v, msg)
// test.isUndefined(v, msg)
// test.isNotUndefined(v, msg)
// test.isNaN(v, msg)
// test.isNotNaN(v, msg)
// test.include(s, v, message, not)
// test.notInclude(s, v, message)
// test.length(obj, expected_length, msg)
// test._stringEqual(actual, expected, message) EXPERIMENTAL
