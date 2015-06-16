Tinytest.add('Dispatch restricted-find - not loggedin - find', function(test) {

  // Create a local test collection
  var foo = new Mongo.Collection(null);

  // Insert some mock data
  foo.insert({ owner: ['foo'] });
  foo.insert({ deletedAt: new Date() });
  foo.insert({ owner: ['bar'], deletedAt: new Date() });

  test.equal(foo.find().count(), 3, 'Expected 3 test documents');

  // Check without allow/deny rules
  Meteor.runAsUser(null, function() {
    test.equal(foo.find().count(), 3, 'Expected 3 test documents');
  });

  Meteor.runAsUser('foo', function() {
    test.equal(foo.find().count(), 3, 'Expected 3 test documents');
  });

  Meteor.runAsUser('bar', function() {
    test.equal(foo.find().count(), 3, 'Expected 3 test documents');
  });

  foo.allow({
    find: function(userId, selector, options) {
      // The user have to be an owner
      return { $and: [ { owner: userId }, { owner: { $exists: true } } ] };
    }
  });
  // Check with allow rules
  Meteor.runAsUser(null, function() {
    test.equal(foo.find().count(), 0, 'Expected 0 test documents');
  });

  Meteor.runAsUser('foo', function() {
    if (Meteor.isClient) {
      // On client we are user null - we cannot run as "foo"
      test.equal(foo.find().count(), 0, 'Expected 0 test documents');
    } else {
      test.equal(foo.find().count(), 1, 'Expected 1 test documents');
    }
  });

  Meteor.runAsUser('bar', function() {
    if (Meteor.isClient) {
      // On client we are user null - we cannot run as "foo"
      test.equal(foo.find().count(), 0, 'Expected 0 test documents');
    } else {
      test.equal(foo.find().count(), 1, 'Expected 1 test documents');
    }
  });


  foo.deny({
    find: function(userId, selector, options) {
      // The user have to be an owner
      return { deletedAt: { $exists: true } };
    }
  });

  // Check with deny rules
  Meteor.runAsUser(null, function() {
    test.equal(foo.find().count(), 0, 'Expected 0 test documents');
  });

  Meteor.runAsUser('foo', function() {
    if (Meteor.isClient) {
      // On client we are user null - we cannot run as "foo"
      test.equal(foo.find().count(), 0, 'Expected 0 test documents');
    } else {
      test.equal(foo.find().count(), 1, 'Expected 1 test documents');
    }
  });

  Meteor.runAsUser('bar', function() {
    test.equal(foo.find().count(), 0, 'Expected 0 test documents');
  });

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
