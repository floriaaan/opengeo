/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

// This function gets the stack trace of the current error
function getStackTrace() {
  let stack;

  try {
    throw new Error("");
  } catch (error) {
    stack = (error as Error).stack || "";
  }

  stack = stack.split("\n").map((line) => line.trim());
  return stack.splice(stack[0] === "Error" ? 2 : 1);
}

// This function gets the name of the file that called the current function
const getInitiator = () => {
  // _getInitiatorLine, _ObjectInfoLine, caller
  const [, , caller] = getStackTrace();
  const file = caller.split("/").at(-1) || "";
  return file.replace(")", "");
};

// These functions log messages to the console with a timestamp and the name of the calling file
const warn = (...args: any[]) => {
  console.group(`\x1b[33m${new Date().toISOString()} - WARN - ${getInitiator()}\x1b[0m`);
  console.warn(...args);
  console.groupEnd();
};
const error = (...args: any[]) => {
  console.group(`\x1b[31m${new Date().toISOString()} - ERROR - ${getInitiator()}\x1b[0m`);
  console.error(...args);
  console.groupEnd();
};
const info = (...args: any[]) => {
  console.group(`\x1b[34m${new Date().toISOString()} - INFO - ${getInitiator()}\x1b[0m`);
  console.log(...args);
  console.groupEnd();
};
const debug = (...args: any[]) => {
  console.log(...args);
};

// This object exports the logging functions and can be used to log messages to the console
export const log = {
  warn,
  error,
  info,
  debug,
};

// This object exports utility functions for formatting console output with colors
export const utils = {
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text: string) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  white: (text: string) => `\x1b[37m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
};
