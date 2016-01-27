# Wikibase JavaScript API

JavaScript client for the Wikibase Repository web API.

[![Latest Stable Version](https://poser.pugx.org/wikibase/javascript-api/version.png)](https://packagist.org/packages/wikibase/javascript-api)

## Release notes

### 1.0.5 (2016-01-27)

* Added compatibility with DataValues JavaScript 0.8.0.
* Removed compatibility for Internet Explorer 8 by removing the json polyfill.

### 1.0.4 (2015-09-30)

* Use mw.ForeignApi for remote API endpoints (T50389)
* Pass `uselang` parameter to `wbsearchentities` api call

### 1.0.3 (2015-05-21)

* Made installable with DataValues JavaScript 0.7.0.

### 1.0.2 (2015-05-20)

#### Enhancements
* Updated code documentation to be able to generate documentation using JSDuck.
* `wikibase.api.RepoApi` QUnit tests have been rewritten to not execute actual API requests anymore.
* Added `wikibase.api.RepoApi` QUnit tests for functions not yet tested.
* Added type checks to `wikibase.api.RepoApi` functions to actually reflect parameter documentation in the code instead of relying on the back-end handling.

### Bugfixes
* An empty `Entity` may be created by omitting the `data` parameter on `wikibase.api.RepoApi.createEntity()` again.
* `wikibase.api.RepoApi` functions explicitly submit default parameters if not set otherwise.

### 1.0.1 (2014-11-28)

* Bump the data-values/javascript dependency to 0.6.0 so that it matches Wikibase.git's.
	No changes needed.

### 1.0 (2014-11-26)

Initial release.
