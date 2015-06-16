/* global compileRulesEJSON: true, parseRules: true, restrictQuery: true */

// This file adds a helper for restricting a query. We may have a user selector
// and perhaps some allow/deny rules.
//
// When doing allow/deny rules on find we need to run all the rules to make sure
// all restrictions are compiled into the restricted query.
//
// The restricted selector is a query at it's max:
// { $and: [
//     selector,
//     $or: allowQueries
//     $not: denyQueries
//   ]
// }

/**
 * This function runs all rules on selected allow or deny method. Each
 * result is converted to string via EJSON and stacked in a uniq array.
 * @param  {String} method   Either "allow" or "deny"
 * @param  {String/Object} selector String ID or query object
 * @param  {[Object]} options  Options
 * @return {Array}          Array of EJSON string rules
 */
compileRulesEJSON = function(method, selector, options) {
  var self = this;
  var userId = Meteor.userId();

  var querieRules = _.map(self._validators.find[method], function(rule) {
    // We allow the rules to modify options eg. for changing limit
    // but the selector should be immutable
    var queryRule = rule(userId, _.clone(selector), options);

    if (!Match.test(queryRule, Match.OneOf(Object, Boolean))) {
      throw new Error('Rules for "find" in "' + method + '" must return query object or boolean value');
    }

    // Allow users to return shorthand true
    if (queryRule === true) queryRule = {};

    return EJSON.stringify(queryRule);
  });

  // Remove all false since they have no influence and optimize the query
  // by removing repitative queries.
  querieRules = _.without(_.uniq(querieRules), 'false');

  return querieRules;
};

/**
 * Parses compiled ejson rules into rule selector objects.
 * @param  {Array} ejsonRules Array of ejson strings
 * @return {Array}            Array of objects
 */
parseRules = function(ejsonRules) {
  return _.map(ejsonRules, function(rule) {
    return EJSON.parse(rule);
  });
};

/**
 * Restricts a query selector using the allow/deny rules applied to the
 * Mongo.Collection
 * @param  {String/Object} selector Query selector
 * @param  {Objecy} options  Find options
 * @return {Objecy}          Restricted query selector
 */
restrictQuery = function(selector, options) {
  var self = this;

  // If the selector is a string we want to convert it into an id
  // query.
  if (selector === ''+selector) {
    selector = { _id: selector };
  }

  if (typeof selector === 'undefined') {
    selector = {};
  }

  if (!Match.test(selector, Object)) {
    throw new Error('Query selector should be string or object not "' + (typeof selector) + '"');
  }

  // Collect all allow and deny results and create restricted
  // query.
  if (self._restricted) {

    // Short circut if collection is restricted and no allow
    // rules set
    if (self._validators.find.allow.length === 0) {
      return undefined;
    }

    var denyQueries = compileRulesEJSON.call(self, 'deny', selector, options);

    // If any of the selectors in deny have a "select all" it's denying
    // all access.
    var denyAccess = (_.indexOf(denyQueries, '{}') > -1);

    if (!denyAccess)  {

      var allowQueries = compileRulesEJSON.call(self, 'allow', selector, options);

      var haveSelector = (selector || allowQueries.length || denyQueries.length);

      if (haveSelector) {

        var andArray = [];

        // User selector
        if (selector) andArray.push(selector);

        // Allow
        if (allowQueries.length) andArray.push({ $or: parseRules(allowQueries) });

        // Deny
        if (denyQueries.length) andArray.push({ $nor: parseRules(denyQueries) });

        // Return the restricted selector
        return { $and: andArray };
      }

    }

    // Deny access
    return undefined;
  }

  return selector;
};
