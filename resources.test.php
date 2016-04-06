<?php

/**
 * @license GPL-2.0+
 * @author Daniel Werner
 * @author H. Snater < mediawiki@snater.com >
 */
global $wgHooks;
$wgHooks['ResourceLoaderTestModules'][] = function(
		array &$testModules,
		ResourceLoader &$resourceLoader
	) {
	$testModules['qunit'] = array_merge(
		$testModules['qunit'],
		include 'tests/resources.php'
	);

	return true;
};
