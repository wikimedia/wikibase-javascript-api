/**
 * @licence GNU GPL v2+
 * @author H. Snater < mediawiki@snater.com >
 */
( function( mw, wb, QUnit, sinon ) {
	'use strict';

QUnit.module( 'wikibase.api.RepoApi' );

/**
 * Instantiates a `wikibase.api.RepoApi` object with the relevant method being overwritten and
 * having applied a SinonJS spy.
 *
 * @param {string} [getOrPost='post'] Whether to mock/spy the `get` or `post` request.
 * @return {Object}
 */
function mockApi( getOrPost ) {
	var api = new mw.Api(),
		spyMethod = getOrPost !== 'get' ? 'postWithToken' : 'get';

	api.postWithToken = function() {};
	api.get = function() {};

	return {
		spy: sinon.spy( api, spyMethod ),
		api: new wb.api.RepoApi( api )
	};
}

/**
 * Returns all request parameters submitted to the function performing the `get` or `post` request.
 *
 * @param {Object} spy The SinonJS spy to extract the parameters from.
 * @param [callIndex=0] The call index if multiple API calls have been performed on the same spy.
 * @return {Object}
 */
function getParams( spy, callIndex ) {
	callIndex = callIndex || 0;
	return spy.displayName === 'postWithToken' ? spy.args[callIndex][1] : spy.args[callIndex][0];
}

/**
 * Returns a specific parameter submitted to the function performing the `get` or `post` request.
 *
 * @param {Object} spy The SinonJS spy to extract the parameters from.
 * @param {string} paramName
 * @param [callIndex=0] The call index if multiple API calls have been performed on the same spy.
 * @return {string}
 */
function getParam( spy, paramName, callIndex ) {
	return getParams( spy, callIndex || 0 )[paramName];
}

QUnit.test( 'createEntity()', function( assert ) {
	var mock = mockApi();

	mock.api.createEntity( 'item' );
	mock.api.createEntity( 'property', {
		datatype: 'string'
	} );

	assert.ok( mock.spy.calledTwice, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbeditentity',
		'Verified API module being called.'
	);

	assert.equal(
		getParam( mock.spy, 'new' ),
		'item',
		'Verified submitting entity type.'
	);

	assert.equal(
		getParam( mock.spy, 'data' ),
		JSON.stringify( {} ),
		'Verified not submitting any data by default.'
	);

	assert.equal(
		getParam( mock.spy, 'data', 1 ),
		JSON.stringify( { datatype: 'string' } ),
		'Verified submitting "datatype" field.'
	);
} );

QUnit.test( 'editEntity()', function( assert ) {
	var mock = mockApi(),
		data = {
			labels: {
				de: {
					language: 'de',
					value: 'label'
				}
			}
		};

	mock.api.editEntity( 'entity id', 12345, data );

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbeditentity',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'id' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'data' ), JSON.stringify( data ) );
} );

QUnit.test( 'formatValue()', function( assert ) {
	var mock = mockApi( 'get' );

	mock.api.formatValue(
		{ datavalue: 'serialization' },
		{ option: 'option value'},
		'data type id',
		'output format'
	);

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbformatvalue',
		'Verified API module being called.'
	);

	assert.equal(
		getParam( mock.spy, 'datavalue' ),
		JSON.stringify( { datavalue: 'serialization' } )
	);
	assert.equal( getParam( mock.spy, 'options' ), JSON.stringify( { option: 'option value'} ) );
	assert.equal( getParam( mock.spy, 'datatype' ), 'data type id' );
	assert.equal( getParam( mock.spy, 'generate' ), 'output format' );
} );

QUnit.test( 'getEntities()', function( assert ) {
	var mock = mockApi( 'get' );

	mock.api.getEntities(
		['entity id 1', 'entity id 2'],
		['property1', 'property2'],
		['language code 1', 'language code 2'],
		['sort property 1', 'sort property 2'],
		'sort direction'
	);

	mock.api.getEntities(
		'entity id',
		'property',
		'language code',
		'sort property',
		'sort direction'
	);

	assert.ok( mock.spy.calledTwice, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbgetentities',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'ids' ), 'entity id 1|entity id 2' );
	assert.equal( getParam( mock.spy, 'props' ), 'property1|property2' );
	assert.equal( getParam( mock.spy, 'languages' ), 'language code 1|language code 2' );
	assert.equal( getParam( mock.spy, 'sort' ), 'sort property 1|sort property 2' );
	assert.equal( getParam( mock.spy, 'dir' ), 'sort direction' );

	assert.equal( getParam( mock.spy, 'ids', 1 ), 'entity id' );
	assert.equal( getParam( mock.spy, 'props', 1 ), 'property' );
	assert.equal( getParam( mock.spy, 'languages', 1 ), 'language code' );
	assert.equal( getParam( mock.spy, 'sort', 1 ), 'sort property' );
	assert.equal( getParam( mock.spy, 'dir', 1 ), 'sort direction' );
} );

QUnit.test( 'getEntitiesByPage()', function( assert ) {
	var mock = mockApi( 'get' );

	mock.api.getEntitiesByPage(
		['site id 1', 'site id 2'],
		['title1', 'title2'],
		['property1', 'property2'],
		['language code 1', 'language code 2'],
		['sort property 1', 'sort property 2'],
		'sort direction',
		true
	);

	mock.api.getEntitiesByPage(
		'site id',
		'title',
		'property',
		'language code',
		'sort property',
		'sort direction',
		false
	);

	assert.ok( mock.spy.calledTwice, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbgetentities',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'sites' ), 'site id 1|site id 2' );
	assert.equal( getParam( mock.spy, 'titles' ), 'title1|title2' );
	assert.equal( getParam( mock.spy, 'props' ), 'property1|property2' );
	assert.equal( getParam( mock.spy, 'languages' ), 'language code 1|language code 2' );
	assert.equal( getParam( mock.spy, 'sort' ), 'sort property 1|sort property 2' );
	assert.equal( getParam( mock.spy, 'dir' ), 'sort direction' );
	assert.strictEqual( getParam( mock.spy, 'normalize' ), true );

	assert.equal( getParam( mock.spy, 'sites', 1 ), 'site id' );
	assert.equal( getParam( mock.spy, 'titles', 1 ), 'title' );
	assert.equal( getParam( mock.spy, 'props', 1 ), 'property' );
	assert.equal( getParam( mock.spy, 'languages', 1 ), 'language code' );
	assert.equal( getParam( mock.spy, 'sort', 1 ), 'sort property' );
	assert.equal( getParam( mock.spy, 'dir', 1 ), 'sort direction' );
	assert.strictEqual( getParam( mock.spy, 'normalize', 1 ), false );
} );

QUnit.test( 'parseValue()', function( assert ) {
	var mock = mockApi( 'get' );

	mock.api.parseValue(
		'parser id',
		['serialization1', 'serialization2'],
		{ option: 'option value'}
	);

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbparsevalue',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'parser' ), 'parser id' );
	assert.equal( getParam( mock.spy, 'values' ), 'serialization1|serialization2');
	assert.equal( getParam( mock.spy, 'options' ), JSON.stringify( { option: 'option value'} ) );
} );

QUnit.test( 'searchEntities()', function( assert ) {
	var mock = mockApi( 'get' );

	mock.api.searchEntities( 'label', 'language code', 'entity type', 10, 5 );

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsearchentities',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'search' ), 'label' );
	assert.equal( getParam( mock.spy, 'language' ), 'language code' );
	assert.equal( getParam( mock.spy, 'type' ), 'entity type' );
	assert.equal( getParam( mock.spy, 'limit' ), 10 );
	assert.equal( getParam( mock.spy, 'continue' ), 5 );
} );

QUnit.test( 'setLabel(), setDescription()', function( assert ) {
	var subjects = ['Label', 'Description'];

	for( var i = 0; i < subjects.length; i++ ) {
		var mock = mockApi();

		mock.api['set' + subjects[i]]( 'entity id', 12345, 'text', 'language code' );

		assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

		assert.equal(
			getParam( mock.spy, 'action' ),
			'wbset' + subjects[i].toLowerCase(),
			'Verified API module being called.'
		);

		assert.equal( getParam( mock.spy, 'id' ), 'entity id' );
		assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
		assert.equal( getParam( mock.spy, 'value' ), 'text' );
		assert.equal( getParam( mock.spy, 'language' ), 'language code' );
	}
} );

QUnit.test( 'setAliases()', function( assert ) {
	var mock = mockApi();

	mock.api.setAliases(
		'entity id', 12345, ['alias1', 'alias2'], ['alias-remove'], 'language code'
	);

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetaliases',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'id' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'add' ), 'alias1|alias2' );
	assert.equal( getParam( mock.spy, 'remove' ), 'alias-remove' );
	assert.equal( getParam( mock.spy, 'language' ), ['language code'] );
} );

QUnit.test( 'setClaim()', function( assert ) {
	var mock = mockApi();

	mock.api.setClaim( { 'I am': 'a Claim serialization' }, 12345, 67890 );

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetclaim',
		'Verified API module being called.'
	);

	assert.equal(
		getParam( mock.spy, 'claim' ),
		JSON.stringify( { 'I am': 'a Claim serialization' } )
	);
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'index' ), 67890 );
} );

QUnit.test( 'createClaim()', function( assert ) {
	var mock = mockApi();

	mock.api.createClaim( 'entity id', 12345, 'snak type', 'property id', 'snak value' );

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbcreateclaim',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'entity' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'snaktype' ), 'snak type' );
	assert.equal( getParam( mock.spy, 'property' ), 'property id' );
	assert.equal( getParam( mock.spy, 'value' ), JSON.stringify( 'snak value' ) );
} );

QUnit.test( 'removeClaim()', function( assert ) {
	var mock = mockApi();

	mock.api.removeClaim( 'claim GUID', 12345 );

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbremoveclaims',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'claim' ), 'claim GUID' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
} );

QUnit.test( 'getClaims()', function( assert ) {
	var mock = mockApi( 'get' );

	mock.api.getClaims( 'entity id', 'property id', 'claim GUID', 'rank', 'claim props' );

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbgetclaims',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'entity' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'property' ), 'property id' );
	assert.equal( getParam( mock.spy, 'claim' ), 'claim GUID' );
	assert.equal( getParam( mock.spy, 'rank' ), 'rank' );
	assert.equal( getParam( mock.spy, 'props' ), 'claim props' );
} );

QUnit.test( 'setClaimValue()', function( assert ) {
	var mock = mockApi();

	mock.api.setClaimValue( 'claim GUID', 12345, 'snak type', 'property id', 'snak value' );

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetclaimvalue',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'claim' ), 'claim GUID' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'snaktype' ), 'snak type' );
	assert.equal( getParam( mock.spy, 'property' ), 'property id' );
	assert.equal( getParam( mock.spy, 'value' ), JSON.stringify( 'snak value' ) );
} );

QUnit.test( 'setReference()', function( assert ) {
	var mock = mockApi();

	mock.api.setReference(
		'statement GUID',
		{'I am': 'serialized Snaks'},
		12345,
		'reference hash',
		67890
	);

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetreference',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'statement' ), 'statement GUID' );
	assert.equal( getParam( mock.spy, 'snaks' ), JSON.stringify( {'I am': 'serialized Snaks'} ) );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'reference' ), 'reference hash' );
	assert.equal( getParam( mock.spy, 'index' ), 67890 );
} );

QUnit.test( 'removeReferences()', function( assert ) {
	var mock = mockApi();

	mock.api.removeReferences( 'statement GUID', ['reference hash 1', 'reference hash 2'], 12345 );
	mock.api.removeReferences( 'statement GUID', 'reference hash', 12345 );

	assert.ok( mock.spy.calledTwice, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbremovereferences',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'statement' ), 'statement GUID' );
	assert.equal( getParam( mock.spy, 'references' ), 'reference hash 1|reference hash 2' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );

	assert.equal( getParam( mock.spy, 'statement', 1 ), 'statement GUID' );
	assert.equal( getParam( mock.spy, 'references', 1 ), 'reference hash' );
	assert.equal( getParam( mock.spy, 'baserevid', 1 ), 12345 );
} );

QUnit.test( 'setSiteLink()', function( assert ) {
	var mock = mockApi();

	mock.api.setSitelink(
		'entity id', 12345, 'site id', 'page name', ['entity id of badge1', 'entity id of badge 2']
	);

	assert.ok( mock.spy.calledOnce, 'Triggered API call.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbsetsitelink',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'id' ), 'entity id' );
	assert.equal( getParam( mock.spy, 'baserevid' ), 12345 );
	assert.equal( getParam( mock.spy, 'linksite' ), 'site id' );
	assert.equal( getParam( mock.spy, 'linktitle' ), 'page name' );
	assert.equal( getParam( mock.spy, 'badges' ), 'entity id of badge1|entity id of badge 2' );
} );

QUnit.test( 'mergeItems()', function( assert ) {
	var mock = mockApi();

	mock.api.mergeItems(
		'entity id from',
		'entity id to',
		['property to ignore conflict for 1', 'property to ignore conflict for 2'],
		'edit summary'
	);
	mock.api.mergeItems(
		'entity id from',
		'entity id to',
		'property to ignore conflict for',
		'edit summary'
	);

	assert.ok( mock.spy.calledTwice, 'Triggered API calls.' );

	assert.equal(
		getParam( mock.spy, 'action' ),
		'wbmergeitems',
		'Verified API module being called.'
	);

	assert.equal( getParam( mock.spy, 'fromid' ), 'entity id from' );
	assert.equal( getParam( mock.spy, 'toid' ), 'entity id to' );
	assert.equal(
		getParam( mock.spy, 'ignoreconflicts' ),
		'property to ignore conflict for 1|property to ignore conflict for 2'
	);
	assert.equal( getParam( mock.spy, 'summary' ), 'edit summary' );

	assert.equal( getParam( mock.spy, 'fromid', 1 ), 'entity id from' );
	assert.equal( getParam( mock.spy, 'toid', 1 ), 'entity id to' );
	assert.equal(
		getParam( mock.spy, 'ignoreconflicts', 1 ),
		'property to ignore conflict for'
	);
	assert.equal( getParam( mock.spy, 'summary', 1 ), 'edit summary' );
} );

}( mediaWiki, wikibase, QUnit, sinon ) );
