#!/bin/bash

set -e

npx cypress run  --headless --browser chrome  --config '{"specPattern":["plugins/blocks/mostRead/cypress/tests/functional/*.cy.js"]}'
