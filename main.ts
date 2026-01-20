const { Pool } = require("pg");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");

interface UField {
    name: string;
    def?: any | null;
    type: "text" | "json";
}
interface UserOptions {
    fields?: Record<string, UField>;
    hash?: Function;
    compare?: Function;
    db: typeof Pool;
}
interface UInfo {
    username: string;
    pass: string;
}

class Users implements UserOptions {
    fields: Record<string, UField>;
    hash?: Function;
    compare?: Function | undefined;
    db: any;
    constructor(opts: UserOptions) {
        this.fields = opts.fields || {};
        this.hash = opts.hash || hash;
        this.compare = opts.compare || compare;
        this.db = opts.db;
    }
    async #query(cmd: string, args: string[]): Promise<any> {
        return this.db.query(cmd, args);
    }
    /**
     * Returns whether the database contains a field-value match or not.
     * @param field - The field to check against.
     * @param val - The value of the field.
     * @returns {Promise<boolean>} The resulting check of whether it contains the field-value match.
     */
    async has(field: string, val: string): Promise<boolean> {
        return (await this.#query("select * from users where $1 = $2", [field, val])).rows > 0;
    }
    /**
     * Adds a new user to the database.
     * @param data - The user's information.
     * @returns {Promise<void>} Does not return anything.
     */
    async add(data: Object): Promise<void> {
        const queryFields: string[] = Object.keys(data);
        const queryArgs: string[] = Object.values(data);
        await this.#query("insert into users ($1) values ($2)", [...queryFields, ...queryArgs]);
    }
}