/**
 * @file cypress/tests/functional/MostRead.cy.js
 *
 * Copyright (c) 2026 OJSBR (https://ojsbr.com)
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * Functional tests: the settings and their limits, and the block a reader sees.
 *
 * Parameters (--env): contextPath, adminUser, adminPassword (captcha on login
 * must be off for the run). The defaults match the data set of PKP's
 * continuous integration, and the first test enables the plugin when it is off.
 * Settings touched are put back as they were. The reader test also needs
 * withStatistics=1: the block in the sidebar and published articles with usage
 * statistics in the configured window, which the CI data set does not have.
 * Selectors use names and ids, so the spec runs in any language.
 */

describe('Most Read block plugin', function() {
	const contextPath = Cypress.env('contextPath') || 'publicknowledge';
	const adminUser = Cypress.env('adminUser') || 'admin';
	const adminPassword = Cypress.env('adminPassword') || 'admin';
	const withStatistics = Cypress.env('withStatistics');

	const rowName = 'mostreadblockplugin';
	let originalSidebar = null;
	const settingsForm = 'form[id="mostReadSettingsForm"]';
	const field = (name) => settingsForm + ' input[name="' + name + '"]';

	// ---- OJSBR spec helpers (padrão v2): work on OJS/OMP 3.3, 3.4 and 3.5 and in PKP's CI ----

	const pageUrl = (path) => '/index.php/' + contextPath + (path ? '/' + path : '');

	// Same as PKP's cy.waitJQuery(), which the support files of OJS 3.3 test sites may lack.
	// The Plugins tab can keep requests open for a while (the plugin gallery), hence the timeout.
	// jQuery may not be on the page yet when this runs, so the check retries on the window
	// itself instead of on a property that would resolve as undefined.
	const waitJQuery = () => cy.window({timeout: 60000}).should((win) => {
		expect(win.jQuery && win.jQuery.active, 'pending jQuery requests').to.eq(0);
	});

	// Requests carry the browser's User-Agent: OJS 3.3 drops a session whose agent changes.
	const request = (options) => cy.window({log: false}).then((win) => cy.request(Object.assign(
		typeof options === 'string' ? {url: options} : options,
		{headers: Object.assign({'User-Agent': win.navigator.userAgent}, (typeof options === 'string' ? {} : options.headers) || {})}
	)));

	// Signs in through requests (the login page can re-render while it is typed into), then
	// falls back to the form when the session did not stick (OJS 3.3 cookie handling).
	const login = (username, password) => {
		cy.clearCookies();
		request(pageUrl('login')).then((response) => {
			const token = /name="csrfToken" value="([^"]+)"/.exec(response.body)[1];
			// The form posts to the URL with the language: a redirect would turn the POST into a GET.
			const action = /<form[^>]*id="login"[^>]*action="([^"]+)"/.exec(response.body)[1];
			request({method: 'POST', url: action, form: true, body: {csrfToken: token, username: username, password: password}, log: false});
		});
		cy.visit(pageUrl('submissions') + '?reload=' + Date.now());
		cy.get('body').then(($body) => {
			if ($body.find('form#login').length) {
				cy.get('form#login input[name="username"]').type(username, {delay: 0});
				cy.get('form#login input[name="password"]').type(password, {delay: 0, log: false});
				cy.get('form#login').submit();
				cy.get('form#login', {timeout: 30000}).should('not.exist');
			}
		});
	};

	// REST API calls made from the page itself, so they carry the browser's own session.
	const api = (path, options = {}) => cy.window({log: false}).then((win) => cy.wrap(
		win.fetch(path, Object.assign({credentials: 'same-origin'}, options)).then((response) => {
			if (!response.ok) {
				return response.text().then((text) => {
					throw new Error(path + ' answered ' + response.status + ': ' + text.slice(0, 300));
				});
			}
			return response.json();
		}),
		{log: false, timeout: 30000}
	));

	// The website settings page on its Plugins tab (a new query string forces a load). Load it
	// once per test: loading it again while its plugin gallery request is pending stalls the
	// web server of PKP's CI; API calls and settings modals work on the page already open.
	const openPluginsTab = () => {
		cy.visit(pageUrl('management/settings/website') + '?reload=' + Date.now() + '#plugins');
		cy.get('button[id="plugins-button"]', {timeout: 60000}).click();
		cy.get('button[id="plugins-button"]').should('have.attr', 'aria-selected', 'true');
		waitJQuery();
	};

	// Enables the plugin in the grid when it is off (never turns it off).
	const enablePlugin = (rowName) => {
		cy.get('input[id^="select-cell-' + rowName + '-enabled"]', {timeout: 30000}).then(($checkbox) => {
			if (!$checkbox.is(':checked')) {
				cy.wrap($checkbox).click();
				waitJQuery();
			}
		});
		cy.get('input[id^="select-cell-' + rowName + '-enabled"]').should('be.checked');
	};

	// Opens the settings modal from the grid, without reloading the page: a reload right
	// after saving can stall the web server of PKP's CI. The form is fetched each time.
	const openPluginSettings = (rowName, formSelector) => {
		cy.get('a[id*="-row-' + rowName + '-settings-button-"]', {timeout: 30000}).then(($link) => {
			if (!$link.is(':visible')) {
				cy.get('tr[id$="-row-' + rowName + '"] a.show_extras').first().click();
			}
		});
		// The grid may still be animating the extras row: the link is clicked once it exists.
		cy.get('a[id*="-row-' + rowName + '-settings-button-"]').first().click({force: true});
		waitJQuery();
		cy.window().should((win) => {
			expect(win.jQuery(formSelector).data('pkp.handler')).to.exist;
		});
	};

	// ---- end of helpers ----

	const openSettings = () => openPluginSettings(rowName, settingsForm);

	const fill = (days, count) => {
		cy.get(field('mostReadDays')).invoke('val', days || '');
		cy.get(field('mostReadCount')).invoke('val', count || '');
		cy.get(settingsForm + ' button[id^="submitFormButton-"]').click({force: true});
		waitJQuery();
	};

	// The journal of contextPath with all its settings, and the CSRF token of the page.
	const withJournal = (callback) => {
		cy.window({timeout: 60000}).its('pkp.currentUser.csrfToken').then((token) => {
			api('/index.php/index/api/v1/contexts?count=100').then((list) => {
				const journal = list.items.find((item) => item.urlPath === contextPath);
				api(pageUrl('api/v1/contexts/' + journal.id)).then((details) => callback(details, token));
			});
		});
	};

	const saveSidebar = (journal, token, sidebar) => api(pageUrl('api/v1/contexts/' + journal.id), {
		method: 'PUT',
		headers: {'Content-Type': 'application/json', 'X-Csrf-Token': token},
		body: JSON.stringify({sidebar: sidebar}),
	});

	it('Refuses days and counts outside their limits and saves valid ones', function() {
		login(adminUser, adminPassword);
		openPluginsTab();
		enablePlugin(rowName);
		openSettings();

		cy.get(field('mostReadDays')).invoke('val').then((days) => {
			cy.get(field('mostReadCount')).invoke('val').then((count) => {
				fill('seven', '3');
				cy.get(settingsForm).should('exist').find('.error, .pkp_form_error').should('exist');

				fill('3650', '51');
				cy.get(settingsForm).should('exist').find('.error, .pkp_form_error').should('exist');

				fill('3650', '2');
				cy.get(settingsForm).should('not.exist');
				openSettings();
				cy.get(field('mostReadDays')).should('have.value', '3650');
				cy.get(field('mostReadCount')).should('have.value', '2');

				// Put them back as they were.
				fill(days || '7', count);
				cy.get(settingsForm).should('not.exist');
				openSettings();
				cy.get(field('mostReadDays')).should('have.value', days || '7');
			});
		});
	});

	(withStatistics ? it : it.skip)('Shows the reader published articles with their counts', function() {
		login(adminUser, adminPassword);
		cy.visit(pageUrl('management/settings/website') + '?reload=' + Date.now() + '#plugins');
		withJournal((journal, token) => {
			originalSidebar = journal.sidebar || [];
			if (!originalSidebar.includes(rowName)) {
				saveSidebar(journal, token, originalSidebar.concat([rowName]));
			}
		});

		cy.clearCookies();
		cy.visit(pageUrl('') + '?reload=' + Date.now());
		cy.get('.block_most_read .most_read_article', {timeout: 30000}).should('have.length.at.least', 1).each(($item) => {
			// OJS opens the article; OMP opens the monograph in the catalogue. The link is
			// followed, so a page of the wrong application is caught instead of just matching.
			cy.wrap($item).find('a').should('have.attr', 'href').and('match', /\/(article\/view|catalog\/book)\//).then((href) => {
				request({url: href, failOnStatusCode: false}).its('status').should('eq', 200);
			});
			cy.wrap($item).find('.most_read_article_journal').invoke('text').should('match', /\d/);
			// Only the safe HTML of a title reaches the page.
			cy.wrap($item).find('.most_read_article_title script').should('have.length', 0);
		});
	});

	// Puts the sidebar back as it was, also when a test failed.
	after(function() {
		if (originalSidebar === null || originalSidebar.includes(rowName)) {
			return;
		}
		login(adminUser, adminPassword);
		cy.visit(pageUrl('management/settings/website') + '?reload=' + Date.now() + '#plugins');
		withJournal((journal, token) => saveSidebar(journal, token, originalSidebar));
	});
});
