import {Database} from "#db";

export default class BaseModel {
    static get db() {
        return Database.client;
    }
}