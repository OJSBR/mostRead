<?php

/**
 * @file plugins/blocks/mostRead/tests/MostReadTest.php
 *
 * Copyright (c) 2026 OJSBR (https://ojsbr.com)
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class MostReadTest
 *
 * @brief Settings limits, stored titles and the cost of rendering the block.
 */

namespace APP\plugins\blocks\mostRead\tests;

use APP\plugins\blocks\mostRead\MostReadBlockPlugin;
use APP\plugins\blocks\mostRead\MostReadSettingsForm;

class MostReadTest extends TestCase
{
    public function testSettingsFallBackToTheirDefaultsAndLimits(): void
    {
        $this->assertSame(7, MostReadBlockPlugin::boundedInt(null, 7, 3650));
        $this->assertSame(7, MostReadBlockPlugin::boundedInt('abc', 7, 3650), 'A non-number must not become "all time".');
        $this->assertSame(7, MostReadBlockPlugin::boundedInt('-3', 7, 3650));
        $this->assertSame(30, MostReadBlockPlugin::boundedInt(' 30 ', 7, 3650));
        $this->assertSame(50, MostReadBlockPlugin::boundedInt('100000', 5, 50), 'The article count is capped.');
    }

    public function testTheFormAcceptsOnlyWholeNumbersWithinTheLimits(): void
    {
        $this->assertTrue(MostReadSettingsForm::isWholeNumberWithin('7', MostReadBlockPlugin::MAX_DAYS));
        $this->assertTrue(MostReadSettingsForm::isWholeNumberWithin('50', MostReadBlockPlugin::MAX_COUNT));
        $this->assertFalse(MostReadSettingsForm::isWholeNumberWithin('51', MostReadBlockPlugin::MAX_COUNT));
        $this->assertFalse(MostReadSettingsForm::isWholeNumberWithin('0', MostReadBlockPlugin::MAX_COUNT));
        $this->assertFalse(MostReadSettingsForm::isWholeNumberWithin('1.5', MostReadBlockPlugin::MAX_DAYS));
        $this->assertFalse(MostReadSettingsForm::isWholeNumberWithin('seven', MostReadBlockPlugin::MAX_DAYS));
    }

    public function testStoredTitlesAreReadSafely(): void
    {
        $this->assertSame(['en' => 'Most read', 'pt_BR' => 'Mais lidos'], MostReadBlockPlugin::decodeTitles('{"en":" Most read ","pt_BR":"Mais lidos","es":""}'));
        $this->assertSame([], MostReadBlockPlugin::decodeTitles(null));
        $this->assertSame([], MostReadBlockPlugin::decodeTitles('not json'));
    }

    public function testTheListIsCachedPerJournalAndLanguage(): void
    {
        $plugin = new MostReadBlockPlugin();
        $this->assertSame('plugins.blocks.mostRead.1.pt_BR', $plugin->getCacheKey(1, 'pt_BR'));
        $this->assertTrue($plugin->getCacheKey(1, 'en') !== $plugin->getCacheKey(1, 'pt_BR'));
    }

    public function testRenderingTheBlockDoesNotQueryEachArticle(): void
    {
        $source = (string) file_get_contents(dirname(__DIR__) . '/MostReadBlockPlugin.php');
        $start = strpos($source, 'public function getContents(');
        $end = strpos($source, 'public static function decodeTitles(');
        $this->assertStringNotContainsString('Repo::', substr($source, $start, $end - $start));
    }

    public function testTheBlockEscapesWhatTheManagerTypes(): void
    {
        $template = (string) file_get_contents(dirname(__DIR__) . '/templates/block.tpl');
        $this->assertStringContainsString('{$blockTitle|escape}', $template);
        $this->assertStringContainsString('{$submission.url|escape}', $template);
    }
}
