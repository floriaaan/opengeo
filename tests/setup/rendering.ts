/**
 * Rendering tests mocks
 *
 * useSession is mocked to return a session
 * next/router is mocked to return a router
 */

import { vitest } from "vitest";

vitest.mock("next/router", () => require("next-router-mock"));
vitest.mock("next/dist/client/router", () => require("next-router-mock"));
