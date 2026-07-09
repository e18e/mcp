#!/usr/bin/env node

import { StdioTransport } from '@tmcp/transport-stdio';
import { server } from './index.js';

const stdio_transport = new StdioTransport(server);
stdio_transport.listen();
