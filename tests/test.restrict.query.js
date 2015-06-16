Tinytest.add('Dispatch restricted-find - restrictQuery', function(test) {
  test.isNotUndefined(restrictQuery, 'restrictQuery not declared');

  var foo = new FakeCollection();

  test.equal(foo.restrictQuery({}, {}), {}, 'When not restricted by rules only the selector should show');
  test.equal(foo.restrictQuery({
    foo: 12
  }, {}), {
    foo: 12
  }, 'When not restricted by rules only the selector should show');

  foo.setRestricted(true);
  test.isUndefined(foo.restrictQuery({}, {}), 'Collection is restricted but no allow rules set expected undefined');

  /* Set allow rules */
  foo.setAllow([
    function(userId, selector, options) {
      return { owner: userId };
    }
  ]);
  foo.setDeny([]);

  test.equal(foo.restrictQuery({}, {}), {
    $and: [
      {},
      { $or: [{ owner: null }] }
    ]
  }, 'When not restricted by rules only the selector should show');

  /* Set allow rules */
  foo.setAllow([]);
  foo.setDeny([
    function(userId, selector, options) {
      return { deletedAt: { $exists: true } };
    }
  ]);

  test.isUndefined(foo.restrictQuery({}, {}), 'Collection is restricted but no allow rules set expected undefined');

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

  test.equal(foo.restrictQuery({ foo: 'check' }, {}), {
    $and: [
      { foo: 'check' },
      { $or: [{ owner: null }] },
      { $nor: [
        { deletedAt: { $exists: true } }
      ]}
    ]
  }, 'When not restricted by rules only the selector should show');

  foo.setUser('foo');

  test.equal(foo.restrictQuery({ foo: 'check' }, {}), {
    $and: [
      { foo: 'check' },
      { $or: [{ owner: 'foo' }] },
      { $nor: [
        { deletedAt: { $exists: true } }
      ]}
    ]
  }, 'When not restricted by rules only the selector should show');


  foo.setDeny([
    function(userId, selector, options) {
      // Deny all
      return {};
    }
  ]);

  test.equal(foo.restrictQuery({ foo: 'check' }, {}), undefined);

  foo.setDeny([
    function(userId, selector, options) {
      // Deny all
      return true;
    }
  ]);

  test.equal(foo.restrictQuery({ foo: 'check' }, {}), undefined);

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
