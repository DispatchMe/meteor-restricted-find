/* global restrictQuery: true */
// This file adds overwrites of basic Mongo.Collection methods involved in
// a restricted find.
//
// Adding restricted check if restricted in:
// * find
// * findOne
//
// Adding "find" as a rule in:
// * allow
// * deny

// We overwrite "find" and "findOne" to add in a restricted query if in
// restricted mode. If we are not in restricted mode we simply passthrough.
_.each(['find', 'findOne'], function(method) {

  var _super = Mongo.Collection.prototype[method];

  Mongo.Collection.prototype[method] = function (selector, options) {
    var self = this;

    // If we are in restricted mode we restrict the query by applying
    // allow and deny rules for the collection.
    if (Meteor.isRestricted()) {
      selector = restrictQuery.call(self, selector, options);

      return _super.call(self, selector, options);
    }

    return _super.apply(self, _.toArray(arguments));
  };
});


// Overwriting the allow and deny rules and adding "find" to the table. We
// don't modify how the normal restrictions are set those are just passed on
// to super.
//
// A "find" rule is a function that returns a query object as a restriction.
//

var _ensureFindAllowDeny = function(self) {
  if (typeof self._validators.find === 'undefined') {
    self._validators.find = { allow: [], deny: [] };
  }
};

_.each(['allow', 'deny'], function(method) {

  var _super = Mongo.Collection.prototype[method];

  Mongo.Collection.prototype[method] = function(rules) {
    var self = this;

    if (rules.find) {

      if (!(rules.find instanceof Function)) {
        throw new Error(method + ': Value for `' + name + '` must be a function');
      }

      // Make suer the allow and deny arrays for the find validator exists
      // before pushing rules to it.
      _ensureFindAllowDeny(self);

      // Push find rules to the validator.
      self._validators.find[method].push(rules.find);

      // This collection is now restricted by find rules.
      // xxx: Investigate if this affects the regular allow/deny restrictions.
      self._restricted = true;
    }

    // Pass on valid meteor rules
    return _super.call(self, _.omit(rules, 'find'));
  };

});
