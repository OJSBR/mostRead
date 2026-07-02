# Most Read — OJS block plugin

[![OJS](https://img.shields.io/badge/OJS-3.4%20%7C%203.5-brightgreen)](https://pkp.sfu.ca/ojs/)
[![Version](https://img.shields.io/badge/version-3.5.0.1-blue)](version.xml)
[![License](https://img.shields.io/badge/license-GPL--3.0-lightgrey)](LICENSE)

A block plugin for **Open Journal Systems (OJS)** that adds a **"most read articles"**
section to the frontend sidebar.

By default the block shows the 5 most-viewed articles of the last 7 days. Each entry
shows the article title (linking to the article page) and an eye icon with the full-text
view count. In the plugin settings the journal manager can set a custom block heading and
a custom number of days for the statistics window.

> Original plugin by **[@zielaq](https://github.com/zielaq)**. Adapted for OJS 3.4/3.5 and
> maintained by **[OJSBR](https://ojsbr.com.br)**.

## Compatibility / branches

| OJS version | Branch | Plugin release |
|-------------|--------|----------------|
| OJS 3.5.x   | [`stable-3_5_0`](../../tree/stable-3_5_0) *(default)* | 3.5.0.1 |
| OJS 3.4.x   | [`stable-3_4_0`](../../tree/stable-3_4_0) | 3.4.0.1 |

## Installation

1. Download the release for your OJS version (or clone the matching branch).
2. Install via **Settings → Website → Plugins → Upload A New Plugin**, or extract the
   folder into `plugins/blocks/` so you get `plugins/blocks/mostRead/`.
3. Enable the plugin, then activate the **Most Read Articles** block from the journal
   sidebar settings.

## Configuration

In the plugin settings the journal manager can:

- set a custom block heading;
- choose the number of days used for the "most read" statistics (default: 7).

## Contributing

Issues and pull requests are welcome. Please target the branch matching the OJS version
you are working against.

## License

Distributed under the **GNU GPL v3**. See [`LICENSE`](LICENSE).

---

## 🇧🇷 Português

Plugin de bloco para o **Open Journal Systems (OJS)** que adiciona uma seção de
**"artigos mais lidos"** à barra lateral do frontend.

Por padrão, o bloco mostra os 5 artigos mais acessados nos últimos 7 dias. Cada item
exibe o título (com link para a página do artigo) e um ícone de olho com a contagem de
acessos ao texto completo. Nas configurações do plugin, o gestor da revista pode definir
um título personalizado para o bloco e a quantidade de dias considerada nas estatísticas.

> Plugin original de **[@zielaq](https://github.com/zielaq)**. Adaptado para OJS 3.4/3.5 e
> mantido pela **[OJSBR](https://ojsbr.com.br)**.

### Compatibilidade / branches

| Versão do OJS | Branch | Release do plugin |
|---------------|--------|-------------------|
| OJS 3.5.x     | `stable-3_5_0` *(padrão)* | 3.5.0.1 |
| OJS 3.4.x     | `stable-3_4_0` | 3.4.0.1 |

### Instalação

Instale em **Configurações → Website → Plugins → Enviar um novo plugin**, ou extraia a
pasta em `plugins/blocks/` (ficando `plugins/blocks/mostRead/`). Ative o plugin e, em
seguida, habilite o bloco **Artigos mais lidos** nas configurações da barra lateral.

### Licença

Distribuído sob a **GNU GPL v3**. Veja [`LICENSE`](LICENSE).
