/// <reference types="mocha" />

import * as assert from "power-assert";
import { both, collection, member, routes } from "../lib/routes-generator";

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

describe("nested collections and members", () => {
    const r = routes({
        c: collection({
            c: collection({
                m: member({
                    m: member({
                        c: collection(),
                    }),
                }),
            }),
        }),
    });

    function testPath(p: string, cb: () => string) {
        it(p, () => assert(cb() === p));
    }

    testPath("/c", () => r.c().toString());
    testPath("/c/c", () => r.c().c().toString());
    testPath("/c/c/m/1", () => r.c().c().m(1).toString());
    testPath("/c/c/m/1/m/0", () => r.c().c().m(1).m(0).toString());
    testPath("/c/c/m/1/m/0/c", () => r.c().c().m(1).m(0).c().toString());
});

describe("nested routes with with both", () => {
    const r = routes({
        c: collection({
            b: both(
                collection({
                    c: collection(),
                }),
                member({
                    c: collection(),
                }),
            ),
        }),
        m: member({
            b: both(
                collection({
                    c: collection(),
                }),
                member({
                    c: collection(),
                }),
            ),
        }),
    });

    function testPath(p: string, cb: () => string) {
        it(p, () => assert(cb() === p));
    }

    testPath("/c", () => r.c().toString());
    testPath("/c/b", () => r.c().b().toString());
    testPath("/c/b/c", () => r.c().b().c().toString());
    testPath("/c/b/1", () => r.c().b(1).toString());
    testPath("/c/b/1/c", () => r.c().b(1).c().toString());
    testPath("/m/1", () => r.m(1).toString());
    testPath("/m/1/b", () => r.m(1).b().toString());
    testPath("/m/1/b/c", () => r.m(1).b().c().toString());
    testPath("/m/1/b/0", () => r.m(1).b(0).toString());
    testPath("/m/1/b/0/c", () => r.m(1).b(0).c().toString());
});

describe("multiple call", () => {
    const r = routes({
        m: member({
            c: collection(),
            c2: collection({
                c: collection(),
            }),
        }),
    });

    it("/m/1 and /m/0", () => {
        assert(r.m(1).toString() === "/m/1");
        assert(r.m(0).toString() === "/m/0");
        assert(r.m(1).c().toString() === "/m/1/c");
        assert(r.m(0).c().toString() === "/m/0/c");
        assert(r.m(1).c().toString() === "/m/1/c");
        assert(r.m(1).c2().toString() === "/m/1/c2");
        assert(r.m(0).c2().toString() === "/m/0/c2");
        assert(r.m(1).c2().toString() === "/m/1/c2");
        assert(r.m(1).c2().c().toString() === "/m/1/c2/c");
        assert(r.m(0).c2().c().toString() === "/m/0/c2/c");
        assert(r.m(1).c2().c().toString() === "/m/1/c2/c");
    });
});
