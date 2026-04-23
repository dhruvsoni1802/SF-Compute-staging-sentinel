#!/usr/bin/env node

import { Command } from "commander";
import { checkCommand } from "./commands/check";

const program = new Command();

program.name("staging-sentinel").version("0.1.0");

program
  .command("check")
  .option("-c, --context <context>", "kubectl context", "current")
  .action((opts) => checkCommand({ context: opts.context }));

program.parse();
