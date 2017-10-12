/// <reference types="mocha" />

import * as assert from "power-assert";
import { both, collection, member, routes } from "../routes-generator";

describe("routes", () => {
    it("/", () => {
        const r = routes({});
        assert(r.toString() === "/");
    });
    it("/ deny parentPath", () => {
        const r = routes(false, {});
        assert.throws(() => r.toString());
    });
});

describe("collection", () => {
    it("/foos", () => {
        const r = routes({
            foos: collection(),
        });
        assert(r.foos() === "/foos");
    });

    it("/foos/bar", () => {
        const r = routes({
            foos: collection({
                bar: collection(),
            }),
        });
        assert(r.foos().bar() === "/foos/bar");
        assert(r.foos().toString() === "/foos");
    });

    it("/foos/bar deny parentPath", () => {
        const r = routes({
            foos: collection(false, {
                bar: collection(),
            }),
        });
        assert(r.foos().bar() === "/foos/bar");
        assert.throws(() => r.foos().toString());
    });
});

describe("member", () => {
    it("/foos/1", () => {
        const r = routes({
            foos: member(),
        });
        assert(r.foos(1) === "/foos/1");
    });

    it("/foos/1/bar", () => {
        const r = routes({
            foos: member({
                bar: collection(),
            }),
        });
        assert(r.foos(1).bar() === "/foos/1/bar");
        assert(r.foos(1).toString() === "/foos/1");
    });

    it("/foos/1/bar deny parentPath", () => {
        const r = routes({
            foos: member(false, {
                bar: collection(),
            }),
        });
        assert(r.foos(1).bar() === "/foos/1/bar");
        assert.throws(() => r.foos(1).toString());
    });
});

describe("both", () => {
    const r = routes({
        foos: both(
            collection(),
            member(),
        ),
    });

    it("/foos", () => {
        assert(r.foos() === "/foos");
    });

    it("/foos/1", () => {
        assert(r.foos(1) === "/foos/1");
    });
});
