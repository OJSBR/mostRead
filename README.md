# Most Read — OJS block plugin

[![OJS](https://img.shields.io/badge/OJS-3.4%20%7C%203.5-brightgreen)](https://pkp.sfu.ca/ojs/)
[![Version](https://img.shields.io/badge/version-3.5.0.6-blue)](version.xml)
[![License](https://img.shields.io/badge/license-GPL--3.0-lightgrey)](LICENSE)

**⬇️ Install package:** [OJS 3.5](https://github.com/OJSBR/mostRead/releases/download/3.5.0.6/mostRead-3.5.0.6.tar.gz) · [OJS 3.4](https://github.com/OJSBR/mostRead/releases/download/3.4.0.4/mostRead-3.4.0.4.tar.gz) — or browse all [Releases](../../releases).

A block plugin for **Open Journal Systems (OJS)** that adds a **"most read articles"**
section to the frontend sidebar. By default the block shows the 5 most-viewed articles of
the last 7 days, each with its title (linking to the article page) and an eye icon with the
full-text view count. The journal manager can set a custom heading and a custom time window.

> **Maintained by [OJSBR](https://ojsbr.com).** Adapted for OJS 3.4/3.5 from the original
> community plugin by **Antti-Jussi Nygård (@ajnyga)**, with contributions by **@zielaq**.
> See the full [Credits & authorship](#credits--authorship) section below.

## Compatibility & branches

| OJS version | Branch | Plugin release |
|-------------|--------|----------------|
| OJS 3.5.x   | [`stable-3_5_0`](../../tree/stable-3_5_0) *(default)* | 3.5.0.6 |
| OJS 3.4.x   | [`stable-3_4_0`](../../tree/stable-3_4_0) | 3.4.0.4 |

Both branches ship the same code; the locale folders follow each OJS line (38 languages).

## Installation

1. Download the release for your OJS version (or clone the matching branch).
2. Install via **Settings → Website → Plugins → Upload A New Plugin**, or extract the folder
   into `plugins/blocks/` so you get `plugins/blocks/mostRead/`. Do not rename the folder.
3. Enable the plugin, then activate the **Most Read Articles** block from the journal
   sidebar settings.

## Configuration

In the plugin settings the journal manager sets:

- **Days** — the window of the statistics, a whole number from 1 to 3650 (default 7);
- **Number of articles** — from 1 to 50 (default 5);
- **Block title** — per language, as plain text.

## How it works (technical)

- The totals come from the publication statistics service (downloads of submission files in
  the window, ending yesterday, as the core counts them); only published articles are listed.
- The list is cached per journal and language as it is rendered — best id, count and title —
  for one day, so a page view costs one cache read instead of one query per article. Saving
  the settings clears the cache of every language of the journal.
- A non-numeric or out-of-range stored value falls back to the default instead of turning the
  window into "all time" or the list into thousands of rows.

## Tests

- **PHPUnit** (`tests/*Test.php`, on `PKP\tests\PKPTestCase`): the classes against the installed
  PKP, the plugin found by PKP's plugin registry, the limits of the settings, the stored titles,
  the cache key per language, rendering without a query per article, escaping in the block
  (titles keep only safe HTML), the site level without settings, and the 38 translations. From the
  OJS root:

  ```bash
  lib/pkp/lib/vendor/bin/phpunit --configuration lib/pkp/tests/phpunit.xml --no-coverage "$PWD/plugins/blocks/mostRead/tests"
  ```

- **Cypress** (`cypress/tests/functional/MostRead.cy.js`, run by
  [pkp-github-actions](https://github.com/pkp/pkp-github-actions) on every push): enables the
  plugin, refuses days and counts outside the limits, saves valid ones and puts the settings back.
  With `withStatistics=1` (the block in the sidebar and published articles with usage statistics)
  it also checks the block a reader sees.
- Verified on OJS 3.5.0.3 and 3.4.0.10.

Tests are kept in the repository and are not part of the release package.

## Credits & authorship

- **Maintained by** [OJSBR](https://ojsbr.com) — adaptation to OJS 3.4/3.5.
- **Original work:** the "Most Read Articles" block plugin by **Antti-Jussi Nygård**
  (**[@ajnyga](https://github.com/ajnyga)**, <https://github.com/ajnyga/mostRead>), with
  contributions by **[@zielaq](https://github.com/zielaq)**.
- Distributed under the **GNU GPL v3**, consistent with the original licensing.

## AI use

Generative AI (Claude, by Anthropic) was used to write and run tests, improve the code and bring
it in line with PKP standards. Every change is reviewed and tested by OJSBR, which is responsible
for the published releases.

## Contributing

Issues and pull requests are welcome. Please target the branch matching the OJS version you
are working against.

## License

Distributed under the **GNU GPL v3**. See [`LICENSE`](LICENSE) and `docs/COPYING`.

---

## 🇧🇷 Português

Plugin de bloco para o **Open Journal Systems (OJS)** que adiciona uma seção de **"artigos
mais lidos"** à barra lateral. Por padrão mostra os 5 artigos mais acessados nos últimos 7
dias, cada um com título (link para a página do artigo) e ícone de olho com a contagem de
acessos. O gestor pode definir um título personalizado e a janela de dias.

> **Mantido pela [OJSBR](https://ojsbr.com).** Adaptado para OJS 3.4/3.5 a partir do
> plugin comunitário original de **Antti-Jussi Nygård (@ajnyga)**, com contribuições de
> **@zielaq**. Veja a seção [Créditos e autoria](#créditos-e-autoria) abaixo.

### Compatibilidade e branches

| Versão do OJS | Branch | Release do plugin |
|---------------|--------|-------------------|
| OJS 3.5.x     | [`stable-3_5_0`](../../tree/stable-3_5_0) *(padrão)* | 3.5.0.6 |
| OJS 3.4.x     | [`stable-3_4_0`](../../tree/stable-3_4_0) | 3.4.0.4 |

As duas branches têm o mesmo código; as pastas de idioma seguem cada linha do OJS (38 idiomas).

### Instalação

Instale em **Configurações → Website → Plugins → Enviar um novo plugin**, ou extraia a
pasta em `plugins/blocks/` (ficando `plugins/blocks/mostRead/`); não renomeie a pasta. Ative o
plugin e habilite o bloco **Artigos mais lidos** nas configurações da barra lateral.

### Configuração

**Dias** (1 a 3650, padrão 7), **número de artigos** (1 a 50, padrão 5) e **título do bloco**
por idioma, em texto puro. A lista é guardada em cache por revista e idioma já pronta para exibir
(um dia), e salvar as configurações limpa o cache.

### Testes

PHPUnit em `tests/` (sobre `PKP\tests\PKPTestCase`) e Cypress em `cypress/tests/functional/`
(rodado pelo [pkp-github-actions](https://github.com/pkp/pkp-github-actions) a cada push), com os
comandos da seção em inglês. A suíte cobre as classes contra o PKP instalado, o plugin encontrado
pelo registro de plugins, os limites das configurações, os títulos gravados, o cache por idioma, a
renderização sem consulta por artigo, o escape no bloco, o nível do site sem configurações e as 38
traduções; o Cypress confere os limites e, com estatísticas, o bloco que o leitor vê. Verificado no
OJS 3.5.0.3 e 3.4.0.10.

Os testes ficam no repositório e não fazem parte do pacote da release.

### Créditos e autoria

- **Mantido pela** [OJSBR](https://ojsbr.com) — adaptação para OJS 3.4/3.5.
- **Trabalho original:** o bloco "Most Read Articles" de **Antti-Jussi Nygård**
  (**[@ajnyga](https://github.com/ajnyga)**, <https://github.com/ajnyga/mostRead>), com
  contribuições de **[@zielaq](https://github.com/zielaq)**.
- Distribuído sob a **GNU GPL v3**, coerente com o licenciamento original.

### Uso de IA

Foi usada IA generativa (Claude, da Anthropic) para escrever e rodar testes, melhorar o código e
alinhá-lo aos padrões da PKP. Toda mudança é revisada e testada pela OJSBR, que responde pelas
releases publicadas.

### Licença

Distribuído sob a **GNU GPL v3**. Veja [`LICENSE`](LICENSE) e `docs/COPYING`.
