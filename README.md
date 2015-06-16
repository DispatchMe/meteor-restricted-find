dispatch:restricted-find
===============

Adds restricted "find" and "findOne" for `Mongo.Collection`

```js
  var foo = new Mongo.Collection('foo');

  foo.allow({
    find: function(userId, selector, options) {
        // Allow user to see documents where they are the owner
        return { owner: userId };
    }
  });

  foo.deny({
    find: function(userId, selector, options) {
        // Don't let the user see "removed" documents
        return { deletedAt: { $exists: true } };
    }
  });

  var cursor = Meteor.runAsUser(userId, function() {
    // This cursor is restricted by the allow and deny rules
    // for "find". If running outside the `Meteor.runAsUser` the find
    // will work as normally/unrestricted.
    return foo.find();
  });
```