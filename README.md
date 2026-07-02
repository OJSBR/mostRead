# Most Read — OJS block plugin (OJS 3.4 branch)

[![OJS](https://img.shields.io/badge/OJS-3.4-brightgreen)](https://pkp.sfu.ca/ojs/)
[![Version](https://img.shields.io/badge/version-3.4.0.1-blue)](version.xml)
[![License](https://img.shields.io/badge/license-GPL--3.0-lightgrey)](LICENSE)

> **This is the `stable-3_4_0` branch (OJS 3.4).** For OJS 3.5 use the
> [`stable-3_5_0`](../../tree/stable-3_5_0) branch.

A block plugin for **Open Journal Systems (OJS)** that adds a **"most read articles"**
section to the frontend sidebar. By default it shows the 5 most-viewed articles of the last
7 days, each with its title (linking to the article page) and an eye icon with the full-text
view count.

> **Maintained by [OJSBR](https://ojsbr.com.br).** Adapted for OJS 3.4/3.5 from the original
> community plugin by **Antti-Jussi Nygård (@ajnyga)**, with contributions by **@zielaq**.
> See the full [Credits & authorship](#credits--authorship) section below.

## Compatibility & branches

| OJS version | Branch | Plugin release |
|-------------|--------|----------------|
| OJS 3.5.x   | [`stable-3_5_0`](../../tree/stable-3_5_0) *(default)* | 3.5.0.1 |
| OJS 3.4.x   | [`stable-3_4_0`](../../tree/stable-3_4_0) *(this branch)* | 3.4.0.1 |

## Installation

Install via **Settings → Website → Plugins → Upload A New Plugin**, or extract the folder
into `plugins/blocks/` (giving `plugins/blocks/mostRead/`). Enable the plugin, then activate
the **Most Read Articles** block from the journal sidebar settings.

## Configuration

In the plugin settings the journal manager can set a custom block heading and choose the
number of days used for the "most read" statistics (default: 7).

## Credits & authorship

- **Maintained by** [OJSBR](https://ojsbr.com.br) — adaptation to OJS 3.4/3.5.
- **Original work:** the "Most Read Articles" block plugin by **Antti-Jussi Nygård**
  (**[@ajnyga](https://github.com/ajnyga)**, <https://github.com/ajnyga/mostRead>), with
  contributions by **[@zielaq](https://github.com/zielaq)**.
- Distributed under the **GNU GPL v3**, consistent with the original licensing.

## Contributing

Issues and pull requests are welcome. Please target the branch matching the OJS version you
are working against.

## License

Distributed under the **GNU GPL v3**. See [`LICENSE`](LICENSE) and `docs/COPYING`.

---

## 🇧🇷 Português

> **Esta é a branch `stable-3_4_0` (OJS 3.4).** Para OJS 3.5 use a branch
> [`stable-3_5_0`](../../tree/stable-3_5_0).

Plugin de bloco para o **Open Journal Systems (OJS)** que adiciona uma seção de **"artigos
mais lidos"** à barra lateral. Por padrão mostra os 5 artigos mais acessados nos últimos 7
dias, cada um com título (link para a página do artigo) e ícone de olho com a contagem de
acessos.

> **Mantido pela [OJSBR](https://ojsbr.com.br).** Adaptado para OJS 3.4/3.5 a partir do
> plugin comunitário original de **Antti-Jussi Nygård (@ajnyga)**, com contribuições de
> **@zielaq**. Veja a seção [Créditos e autoria](#créditos-e-autoria) abaixo.

### Instalação

Instale em **Configurações → Website → Plugins → Enviar um novo plugin**, ou extraia a
pasta em `plugins/blocks/` (ficando `plugins/blocks/mostRead/`). Ative o plugin e habilite o
bloco **Artigos mais lidos** nas configurações da barra lateral.

### Créditos e autoria

- **Mantido pela** [OJSBR](https://ojsbr.com.br) — adaptação para OJS 3.4/3.5.
- **Trabalho original:** o bloco "Most Read Articles" de **Antti-Jussi Nygård**
  (**[@ajnyga](https://github.com/ajnyga)**, <https://github.com/ajnyga/mostRead>), com
  contribuições de **[@zielaq](https://github.com/zielaq)**.
- Distribuído sob a **GNU GPL v3**, coerente com o licenciamento original.

### Licença

Distribuído sob a **GNU GPL v3**. Veja [`LICENSE`](LICENSE) e `docs/COPYING`.
