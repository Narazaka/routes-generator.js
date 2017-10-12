/**
 * routes generator
 */

/** path part */
export type PathPart = number | string;

/** path builder */
export class PathBuilder {
    private parts: PathPart[];
    /**
     * constructor
     * @param parts path parts
     */
    constructor(parts: PathPart[] = []) {
        this.parts = parts;
    }

    /**
     * returns new route generator with added path
     * @param part path part
     */
    addPart(part: PathPart) {
        return new PathBuilder(this.parts.concat(part));
    }

    /**
     * path string
     */
    toString() {
        return this.parts.map((part) => `/${part}`).join("/");
    }
}

/** routes definition */
export interface Routes {
    [key: string]: CollectionReturnType<{}> | MembereturnType<{}>;
}

/** can make path string */
export interface ToStringable {
    toString(): string;
}

/**
 * generate routes
 * @param routes routes definition
 *
 * **example**
 *
 * ```typescript
 * const r = routes({
 *   foos: collection(),
 * });
 *
 * r.foos() // "/foos"
 * r.toString() // "/"
 * ```
 */
export function routes<T extends Routes>(routes: T): T & ToStringable;
/**
 * generate routes
 * @param rootPath if false, deny root path generation
 * @param routes routes definition
 *
 * **example**
 *
 * ```typescript
 * const r = routes(false, {
 *   foos: collection(),
 * });
 *
 * r.foos() // "/foos"
 * r.toString() // Error
 * ```
 */
export function routes<T extends Routes>(rootPath: false, routes: T): T;
// tslint:disable-next-line no-shadowed-variable
export function routes<T extends Routes>(rootPath: T | boolean, routes?: T): T {
    const pathBuilder = new PathBuilder();
    const _routes = routes ? routes : rootPath as T;
    for (const key of Object.keys(_routes)) {
        _routes[key] = _routes[key].bind(pathBuilder.addPart(key));
    }
    _routes.toString =
        !rootPath ?
        () => { throw new Error("toString() not alowed"); } :
        () => "/";

    return _routes;
}

/** collection() return type */
export type CollectionReturnType<T extends Routes> =
    (() => string) | (() => T & ToStringable) | (() => T);

/**
 * collection path
 *
 * **example**
 *
 * ```typescript
 * const r = routes({ foos: collection() });
 *
 * r.foos() // "/foos"
 * ```
 */
export function collection(): () => string;
/**
 * collection path
 * @param children child routes definition
 *
 * **example**
 *
 * ```typescript
 * const r = routes({
 *   foos: collection({
 *     bar: collection(),
 *   }),
 * });
 *
 * r.foos().toString() // "/foos"
 * r.foos().bar() // "/foos/bar"
 * ```
 */
export function collection<T extends Routes>(children: T): () => T & ToStringable;
/**
 * collection path
 * @param parentPath if false, deny parent path generation
 * @param children child routes definition
 *
 * **example**
 *
 * ```typescript
 * const r = routes({
 *   foos: collection(false, {
 *     bar: collection(),
 *   }),
 * });
 *
 * r.foos().toString() // Error
 * r.foos().bar() // "/foos/bar"
 * ```
 */
export function collection<T extends Routes>(parentPath: false, children: T): () => T;
export function collection<T extends Routes>(parentPath?: T | boolean, children?: T) {
    if (typeof parentPath === "boolean") {
        return collectionWithChildren(parentPath, children as T);
    } else if (parentPath) {
        return collectionWithChildren(true, parentPath);
    } else {
        return collectionSimple();
    }
}

function collectionWithChildren<T extends Routes>(parentPath: boolean, children: T) {
    function collectionWithChildrenPathPart(this: PathBuilder) {
        for (const key of Object.keys(children)) {
            children[key] = children[key].bind(this.addPart(key));
        }
        children.toString =
            parentPath ?
            () => this.toString() :
            () => { throw new Error("toString() not alowed"); };

        return children;
    }

    return collectionWithChildrenPathPart;
}

function collectionSimple() {
    function collectionSimplePathPart(this: PathBuilder) {
        return this.toString();
    }

    return collectionSimplePathPart;
}

/** member() return type */
export type MembereturnType<T extends Routes> =
    ((id: PathPart) => string) | ((id: PathPart) => T & ToStringable) | ((id: PathPart) => T);

/**
 * member path
 *
 * **example**
 *
 * ```typescript
 * const r = routes({ foos: member() });
 *
 * r.foos(1) // "/foos/1"
 * ```
 */
export function member(): (id: PathPart) => string;
/**
 * member path
 * @param children child routes definition
 *
 * **example**
 *
 * ```typescript
 * const r = routes({
 *   foos: member({
 *     bar: collection(),
 *   }),
 * });
 *
 * r.foos(1).toString() // "/foos/1"
 * r.foos(1).bar() // "/foos/1/bar"
 * ```
 */
export function member<T extends Routes>(children: T): (id: PathPart) => T & ToStringable;
/**
 * member path
 * @param parentPath if false, deny parent path generation
 * @param children child routes definition
 *
 * **example**
 *
 * ```typescript
 * const r = routes({
 *   foos: member(false, {
 *     bar: collection(),
 *   }),
 * });
 *
 * r.foos(1).toString() // Error
 * r.foos(1).bar() // "/foos/1/bar"
 * ```
 */
export function member<T extends Routes>(children: T, parentPath: true): (id: PathPart) => T;
export function member<T extends Routes>(children?: T, parentPath = false) {
    if (children) {
        return memberWithChildren(children, parentPath);
    } else {
        return memberSimple();
    }
}

function memberWithChildren<T extends Routes>(children: T, parentPath: boolean) {
    function memberWithChildrenPathPart(this: PathBuilder, id: PathPart) {
        const pathBuilder = this.addPart(id);
        for (const key of Object.keys(children)) {
            children[key] = children[key].bind(pathBuilder.addPart(key));
        }
        children.toString =
            parentPath ?
            () => { throw new Error("toString() not alowed"); } :
            () => pathBuilder.toString();

        return children;
    }

    return memberWithChildrenPathPart;
}

function memberSimple() {
    function memberSimplePathPart(this: PathBuilder, id: PathPart) {
        return this.addPart(id).toString();
    }

    return memberSimplePathPart;
}

/**
 * collection and member path
 * @param collection collection path definition
 * @param member member path definition
 *
 * **example**
 *
 * ```typescript
 * const r = routes({
 *   foos: both(
 *     collection(),
 *     member({
 *       bar: collection(),
 *     }),
 *   ),
 * });
 *
 * r.foos().toString() // "/foos"
 * r.foos(1).toString() // "/foos/1"
 * r.foos(1).bar() // "/foos/1/bar"
 * ```
 */
export function both<
    C extends Routes,
    M extends Routes,
    CR extends CollectionReturnType<C>,
    MR extends MembereturnType<M>
    // tslint:disable-next-line no-shadowed-variable
>(collection: CR, member: MR): CR & MR {
    function bothPathPart(id?: PathPart) {
        return id ? member(id) : collection();
    }

    return bothPathPart as CR & MR;
}
