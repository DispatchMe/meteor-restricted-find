var _superMeteorUserId = Meteor.userId;

var fakeRunAsUser = function(userId, f) {
  // Hijack Meteor.userId
  Meteor.userId = function() { return userId; };

  // Run code
  var result = f();

  // Put back Meteor.userId
  Meteor.userId = _superMeteorUserId;

  return result;
};

FakeCollection = function() {
  var self = this;

  self.userId = null;

  self._validators = {
    find: {
      allow: [],
      deny: []
    }
  };

  self._restricted = false;
};


FakeCollection.prototype.compileRulesEJSON = function(method, selector, options) {
  var self = this;
  return fakeRunAsUser(self.userId, function() {
    return compileRulesEJSON.call(self, method, selector, options);
  });
};

FakeCollection.prototype.restrictQuery = function(selector, options) {
  var self = this;
  return fakeRunAsUser(self.userId, function() {
    return restrictQuery.call(self, selector, options);
  });
};

FakeCollection.prototype.setUser = function(userId) {
  this.userId = userId;
};

FakeCollection.prototype.setRestricted = function(bool) {
  this._restricted = bool;
};

FakeCollection.prototype.setAllow = function(rules) {
  this._validators.find.allow = rules;
};

FakeCollection.prototype.setDeny = function(rules) {
  this._validators.find.deny = rules;
};

FakeCollection.prototype.allow = function(rules) {
  this._validators.find.allow.push(rules);
};

FakeCollection.prototype.deny = function(rules) {
  this._validators.find.deny.push(rules);
};
