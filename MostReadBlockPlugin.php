<?php

/**
 * @file plugins/blocks/mostRead/MostReadBlockPlugin.php
 *
 * Copyright (c) 2014-2024 Simon Fraser University
 * Copyright (c) 2003-2024 John Willinsky
 * Copyright (c) 2026 OJSBR (https://ojsbr.com)
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class MostReadBlockPlugin
 *
 * @ingroup plugins_blocks_mostRead
 *
 * @brief Class for "Most Read" block plugin
 */

namespace APP\plugins\blocks\mostRead;

use APP\core\Application;
use APP\facades\Repo;
use APP\template\TemplateManager;
use Illuminate\Support\Facades\Cache;
use PKP\core\JSONMessage;
use PKP\facades\Locale;
use PKP\linkAction\LinkAction;
use PKP\linkAction\request\AjaxModal;
use PKP\plugins\BlockPlugin;
use PKP\submission\PKPSubmission;

class MostReadBlockPlugin extends BlockPlugin
{
    /** Cache lifetime in seconds (1 day). */
    public const CACHE_TTL = 60 * 60 * 24;

    /** Defaults and limits of the settings. */
    public const DEFAULT_DAYS = 7;
    public const MAX_DAYS = 3650;
    public const DEFAULT_COUNT = 5;
    public const MAX_COUNT = 50;

    /**
     * Install default settings on journal creation.
     */
    public function getContextSpecificPluginSettingsFile()
    {
        return $this->getPluginPath() . '/settings.xml';
    }

    /**
     * Get the display name of this plugin.
     */
    public function getDisplayName()
    {
        return __('plugins.blocks.mostRead.displayName');
    }

    /**
     * Get a description of the plugin.
     */
    public function getDescription()
    {
        return __('plugins.blocks.mostRead.description');
    }

    /**
     * @copydoc Plugin::getActions()
     */
    public function getActions($request, $actionArgs)
    {
        $router = $request->getRouter();
        return array_merge(
            $this->getEnabled() ? [
                new LinkAction(
                    'settings',
                    new AjaxModal(
                        $router->url($request, null, null, 'manage', null, array_merge($actionArgs, ['verb' => 'settings'])),
                        $this->getDisplayName()
                    ),
                    __('manager.plugins.settings'),
                    null
                ),
            ] : [],
            parent::getActions($request, $actionArgs)
        );
    }

    /**
     * @copydoc Plugin::manage()
     */
    public function manage($args, $request)
    {
        $context = $request->getContext();
        if ($request->getUserVar('verb') !== 'settings' || !$context) {
            return parent::manage($args, $request);
        }

        $form = new MostReadSettingsForm($this, $context->getId());
        if ($request->getUserVar('save')) {
            $form->readInputData();
            if ($form->validate()) {
                $form->execute();
                return new JSONMessage(true);
            }
        } else {
            $form->initData();
        }

        return new JSONMessage(true, $form->fetch($request));
    }

    /**
     * @copydoc BlockPlugin::getContents()
     *
     * The list is cached per journal and language as it is rendered - title,
     * best id and count - so a page view costs one cache read, not one query per
     * article.
     *
     * @param null|mixed $request
     */
    public function getContents($templateMgr, $request = null)
    {
        $request ??= Application::get()->getRequest();
        $context = $request->getContext();
        if (!$context) {
            return '';
        }

        $contextId = (int) $context->getId();
        $locale = Locale::getLocale();

        $items = Cache::remember(
            $this->getCacheKey($contextId, $locale),
            self::CACHE_TTL,
            fn () => $this->loadMostRead($contextId, $locale)
        );

        $mostRead = [];
        foreach ($items as $item) {
            $mostRead[] = [
                'url' => $request->url($context->getPath(), 'article', 'view', [$item['bestId']]),
                'metric' => $item['metric'],
                'title' => $item['title'],
            ];
        }

        $titles = self::decodeTitles($this->getSetting($contextId, 'mostReadBlockTitle'));
        $templateMgr->assign([
            'blockTitle' => $titles[$locale] ?? '',
            'mostRead' => $mostRead,
        ]);

        return parent::getContents($templateMgr, $request);
    }

    /**
     * The block titles per locale, from the stored JSON.
     *
     * @return array<string, string>
     */
    public static function decodeTitles($stored): array
    {
        $titles = json_decode((string) $stored, true);

        return is_array($titles) ? array_filter(array_map(fn ($title) => is_string($title) ? trim($title) : '', $titles), 'strlen') : [];
    }

    /**
     * A setting read as a whole number within its limits, or its default.
     */
    public static function boundedInt($value, int $default, int $max): int
    {
        return ctype_digit(trim((string) $value)) && (int) $value >= 1 ? min((int) $value, $max) : $default;
    }

    /**
     * Build the cache key for a context and a locale.
     */
    public function getCacheKey(int $contextId, string $locale): string
    {
        return "plugins.blocks.mostRead.{$contextId}.{$locale}";
    }

    /**
     * Clear the cached lists of a context, in every language it offers.
     */
    public function clearCache(int $contextId): void
    {
        $context = Application::getContextDAO()->getById($contextId);
        foreach ($context ? (array) $context->getSupportedLocales() : [] as $locale) {
            Cache::forget($this->getCacheKey($contextId, $locale));
        }
    }

    /**
     * Query the most read published articles of a context, ready to display.
     *
     * @return array<int, array{bestId: string|int, metric: int, title: string}>
     */
    public function loadMostRead(int $contextId, string $locale): array
    {
        $days = self::boundedInt($this->getSetting($contextId, 'mostReadDays'), self::DEFAULT_DAYS, self::MAX_DAYS);
        $count = self::boundedInt($this->getSetting($contextId, 'mostReadCount'), self::DEFAULT_COUNT, self::MAX_COUNT);

        $totals = $this->getStatsService()->getTotals([
            'dateStart' => date('Y-m-d', strtotime('-' . $days . ' days')),
            'contextIds' => [$contextId],
            'count' => $count,
            'assocTypes' => [Application::ASSOC_TYPE_SUBMISSION_FILE],
        ]);

        $items = [];
        foreach ($totals as $row) {
            if (!$row->submission_id || !$row->metric) {
                continue;
            }
            $submission = Repo::submission()->get((int) $row->submission_id);
            $publication = $submission?->getCurrentPublication();
            if (!$publication || (int) $publication->getData('status') !== PKPSubmission::STATUS_PUBLISHED) {
                continue;
            }
            $items[] = [
                'bestId' => $submission->getBestId(),
                'metric' => (int) $row->metric,
                'title' => (string) $publication->getLocalizedFullTitle($locale, 'html'),
            ];
        }

        return $items;
    }

    /**
     * The publication statistics service of this OJS version.
     */
    protected function getStatsService()
    {
        return \APP\core\Services::get('publicationStats');
    }
}
