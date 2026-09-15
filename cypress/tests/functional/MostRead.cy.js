/**
 * @file cypress/tests/functional/MostRead.cy.js
 *
 * Copyright (c) 2026 OJSBR (https://ojsbr.com)
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * Functional tests: the settings and their limits, and the block a reader sees.
 *
 * Parameters (--env): contextPath; adminUser, adminPassword (a journal manager;
 * captcha on login must be off for the run). The block must be enabled and in
 * the sidebar; the reader test needs published articles with usage statistics
 * in the configured window. Settings touched are restored at the end.
 * Selectors use names and ids, so the spec runs in any language.
 */

describe('Most Read block plugin', function() {
	const contextPath = Cypress.env('contextPath') || 'publicknowledge';
	const adminUser = Cypress.env('adminUser') || 'admin';
	const adminPassword = Cypress.env('adminPassword') || 'admin';

	const settingsForm = 'form[id="mostReadSettingsForm"]';
	const field = (name) => settingsForm + ' input[name="' + name + '"]';
	let original = null;

	const login = () => {
		cy.clearCookies();
		cy.visit('/index.php/' + contextPath + '/login');
		cy.get('input[id=username]').clear().type(adminUser, {delay: 0});
		cy.get('input[id=password]').clear().type(adminPassword, {delay: 0, log: false});
		cy.get('form[id=login] button').click();
		cy.get('form[id=login]', {timeout: 30000}).should('not.exist');
	};

	const openSettings = () => {
		cy.visit('/index.php/' + contextPath + '/management/settings/website');
		cy.get('button[id="plugins-button"]', {timeout: 60000}).click();
		cy.waitJQuery();
		cy.get('tr[id*="mostreadblockplugin"] a.show_extras', {timeout: 30000}).click();
		cy.get('a[id*="mostreadblockplugin-settings"]', {timeout: 30000}).click();
		cy.waitJQuery();
		cy.get(settingsForm, {timeout: 30000}).should('exist');
	};

	const fill = (days, count) => {
		cy.get(field('mostReadDays')).invoke('val', '').type(days, {delay: 0});
		cy.get(field('mostReadCount')).invoke('val', '');
		if (count) {
			cy.get(field('mostReadCount')).type(count, {delay: 0});
		}
		cy.get(settingsForm + ' button[id^="submitFormButton-"]').click({force: true});
		cy.waitJQuery();
	};

	it('Refuses days and counts outside their limits and saves valid ones', function() {
		login();
		openSettings();
		cy.get(field('mostReadDays')).invoke('val').then((days) => {
			cy.get(field('mostReadCount')).invoke('val').then((count) => { original = {days, count}; });
		});

		fill('seven', '3');
		cy.get(settingsForm, {timeout: 15000}).should('exist').find('.error, .pkp_form_error').should('exist');

		fill('3650', '51');
		cy.get(settingsForm, {timeout: 15000}).should('exist').find('.error, .pkp_form_error').should('exist');

		fill('3650', '2');
		cy.get(settingsForm).should('not.exist');
		openSettings();
		cy.get(field('mostReadDays')).should('have.value', '3650');
		cy.get(field('mostReadCount')).should('have.value', '2');
	});

	it('Shows the reader at most the configured number of published articles', function() {
		cy.visit('/index.php/' + contextPath, {headers: {Cookie: 'OJSSID=cypress' + Date.now()}});
		cy.get('.block_most_read .most_read_article', {timeout: 30000}).should('have.length.within', 1, 2).each(($item) => {
			cy.wrap($item).find('a').should('have.attr', 'href').and('match', /\/article\/view\//);
			cy.wrap($item).find('.most_read_article_journal').invoke('text').should('match', /\d/);
		});
	});

	after(function() {
		if (original) {
			login();
			openSettings();
			fill(original.days || '7', original.count);
			cy.get(settingsForm, {timeout: 15000}).should('not.exist');
		}
	});
});
