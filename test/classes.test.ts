import { describe, expect, it } from "vitest"
import type { ClassRules } from "../src/schemes/index.js"
import { check as checkRules } from "./helpers.js"

const check = (classes: ClassRules, code: string) => checkRules({ classes }, code)

describe("classes.count", () => {
    it("passes an exact count", () => {
        expect(check({ count: 1 }, "export class A {}")).toEqual([])
    })

    it("reports an exact count mismatch", () => {
        expect(check({ count: 1 }, "class A {} class B {}")).toEqual([
            { rule: "classes.count", message: "Classes in file: expected 1, found 2" },
        ])
    })

    it("supports ranges", () => {
        expect(check({ count: { min: 1, max: 2 } }, "class A {} class B {}")).toEqual([])
        expect(check({ count: { min: 1 } }, "")).toEqual([
            { rule: "classes.count", message: "Classes in file: expected at least 1, found 0" },
        ])
    })
})

describe("classes.name", () => {
    it("passes a matching suffix", () => {
        expect(check({ name: { endsWith: "Controller" } }, "class UserController {}")).toEqual([])
    })

    it("reports a wrong suffix", () => {
        expect(check({ name: { endsWith: "Controller" } }, "class UserService {}")).toEqual([
            {
                rule: "classes.name",
                message: 'Class name "UserService" must end with "Controller"',
            },
        ])
    })

    it("supports matches and oneOf", () => {
        const rules: ClassRules = { name: { matches: "^[A-Z]", oneOf: ["Allowed"] } }
        expect(check(rules, "class lower {}")).toEqual([
            { rule: "classes.name", message: 'Class name "lower" must match /^[A-Z]/' },
            { rule: "classes.name", message: 'Class name "lower" must be one of Allowed' },
        ])
    })

    it("reports an anonymous class", () => {
        expect(check({ name: { endsWith: "Controller" } }, "export default class {}")).toEqual([
            { rule: "classes.name", message: "Anonymous class must be named" },
        ])
    })
})

describe("classes.export", () => {
    const rules: ClassRules = { export: "named" }

    it("passes inline and separate named exports", () => {
        expect(check(rules, "export class A {}")).toEqual([])
        expect(check(rules, "class A {}\nexport { A };")).toEqual([])
    })

    it("reports a default export", () => {
        const expected = [
            { rule: "classes.export", message: '"A" must use a named export, not default' },
        ]
        expect(check(rules, "export default class A {}")).toEqual(expected)
        expect(check(rules, "class A {}\nexport default A;")).toEqual(expected)
    })

    it("reports a class that is not exported", () => {
        expect(check(rules, "class A {}")).toEqual([
            { rule: "classes.export", message: '"A" must be exported by name' },
        ])
    })
})

describe("classes.implements", () => {
    const rules: ClassRules = { implements: ["IUseCase"] }

    it("passes a direct generic implementation", () => {
        const code = `
      import { IUseCase } from "./use-case";
      class A implements IUseCase<string, number> { async execute() { return 1; } }
    `
        expect(check(rules, code)).toEqual([])
    })

    it("resolves aliased imports", () => {
        const code = `
      import { IUseCase as Base } from "./use-case";
      class A implements Base<string, number> { async execute() { return 1; } }
    `
        expect(check(rules, code)).toEqual([])
    })

    it("accepts interfaces extending the required one", () => {
        const code = `
      import { IUseCase } from "./use-case";
      interface ICreateUser extends IUseCase<string, number> {}
      class A implements ICreateUser { async execute() { return 1; } }
    `
        expect(check(rules, code)).toEqual([])
    })

    it("reports a missing interface", () => {
        expect(check(rules, "class A {}")).toEqual([
            { rule: "classes.implements", message: '"A" must implement "IUseCase"' },
        ])
    })
})

describe("classes.decorators", () => {
    const rules: ClassRules = {
        decorators: { allOf: ["Controller"] },
        methods: { public: { decorators: { oneOf: ["Get", "Post"] } } },
    }

    it("passes a decorated controller", () => {
        const code = `
      @Controller("users")
      class UserController {
        @Get() list() {}
        @Post() create() {}
        private helper() {}
      }
    `
        expect(check(rules, code)).toEqual([])
    })

    it("reports missing and ambiguous decorators", () => {
        const code = `
      class UserController {
        list() {}
        @Get() @Post() create() {}
      }
    `
        expect(check(rules, code)).toEqual([
            { rule: "classes.decorators", message: '"UserController" is missing @Controller' },
            {
                rule: "classes.methods.public.decorators",
                message: 'Method "list" must have exactly one of @Get, @Post, found none',
            },
            {
                rule: "classes.methods.public.decorators",
                message: 'Method "create" must have exactly one of @Get, @Post, found @Get, @Post',
            },
        ])
    })

    it("supports allOf on methods", () => {
        const code = "class A { @Get() list() {} }"
        const methodRules: ClassRules = {
            methods: { public: { decorators: { allOf: ["Get", "Auth"] } } },
        }
        expect(check(methodRules, code)).toEqual([
            {
                rule: "classes.methods.public.decorators",
                message: 'Method "list" is missing @Auth',
            },
        ])
    })
})

describe("classes.methods.count", () => {
    it("counts methods by scope, including #private and function properties", () => {
        const code = `
      class A {
        constructor() {}
        a() {}
        public b() {}
        protected c() {}
        private d() {}
        #e() {}
        get f() { return 1; }
        g = () => {};
        value = 1;
      }
    `
        const rules: ClassRules = {
            methods: {
                public: { count: 0 },
                protected: { count: 0 },
                private: { count: 0 },
                all: { count: { max: 3 } },
            },
        }
        expect(check(rules, code)).toEqual([
            {
                rule: "classes.methods.public.count",
                message: "Public methods: expected 0, found 3 (a, b, g)",
            },
            {
                rule: "classes.methods.protected.count",
                message: "Protected methods: expected 0, found 1 (c)",
            },
            {
                rule: "classes.methods.private.count",
                message: "Private methods: expected 0, found 2 (d, #e)",
            },
            {
                rule: "classes.methods.all.count",
                message: "Methods: expected at most 3, found 6 (a, b, c, d, #e, g)",
            },
        ])
    })

    it("does not count public methods from the implemented interfaces", () => {
        const code = `
      import { IUseCase } from "./use-case";
      interface ICreateUser extends IUseCase<string, number> {}
      class A implements ICreateUser {
        async execute() { return 1; }
        extra() {}
      }
    `
        const rules: ClassRules = { implements: ["IUseCase"], methods: { public: { count: 0 } } }
        expect(check(rules, code)).toEqual([
            {
                rule: "classes.methods.public.count",
                message: "Public methods: expected 0, found 1 (extra)",
            },
        ])
    })
})

describe("classes.methods constraints", () => {
    it("checks params, async, returnType and static", () => {
        const code = `
      class A {
        async ok(input: string): Promise<void> {}
        sync(a: string, b: string): void {}
        static async helper(input: string) {}
        handle = async (input: string): Promise<void> => {};
      }
    `
        const rules: ClassRules = {
            methods: {
                public: { params: { max: 1 }, async: true, returnType: "explicit", static: false },
            },
        }
        expect(check(rules, code)).toEqual([
            {
                rule: "classes.methods.public.params",
                message: 'Method "sync" parameters: expected at most 1, found 2',
            },
            { rule: "classes.methods.public.async", message: 'Method "sync" must be async' },
            {
                rule: "classes.methods.public.returnType",
                message: 'Method "helper" must declare its return type',
            },
            {
                rule: "classes.methods.public.static",
                message: 'Method "helper" must not be static',
            },
        ])
    })

    it("accepts a return type declared on a function property", () => {
        const code = `
      type Handler = () => void;
      class A {
        handle: Handler = () => {};
      }
    `
        expect(check({ methods: { all: { returnType: "explicit" } } }, code)).toEqual([])
    })

    it("checks method names", () => {
        const code = `
      class A {
        execute() {}
        run() {}
        private loadUser() {}
        private compute() {}
      }
    `
        const rules: ClassRules = {
            methods: {
                public: { name: { oneOf: ["execute"] } },
                private: { name: { matches: "^(load|save)" } },
            },
        }
        expect(check(rules, code)).toEqual([
            {
                rule: "classes.methods.public.name",
                message: 'Method name "run" must be one of execute',
            },
            {
                rule: "classes.methods.private.name",
                message: 'Method name "compute" must match /^(load|save)/',
            },
        ])
    })

    it("counts lines from the method name, ignoring decorators", () => {
        const code = `
      class A {
        @Get()
        short() {
          return 1;
        }
        long() {
          const a = 1;
          const b = 2;
          return a + b;
        }
      }
    `
        expect(check({ methods: { all: { lines: { max: 3 } } } }, code)).toEqual([
            {
                rule: "classes.methods.all.lines",
                message: 'Method "long" lines: expected at most 3, found 5',
            },
        ])
    })
})
