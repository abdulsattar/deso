import type { RouteParams } from "./router.ts";
import { JSONValue, ParamKeys, RouteMatchResult } from "./types.ts";

export class DesoContext<Path = string> {
  #baseRequest: Request;
  // deno-lint-ignore no-explicit-any
  #store: Map<string, any>;
  #responseHeaders?: Headers;
  constructor(request: Request, options?: { routeParams: RouteParams }) {
    this.#baseRequest = request;
    // deno-lint-ignore no-explicit-any
    this.#store = new Map<string, any>();
    if (options?.routeParams) {
      this.loadParams(options.routeParams);
    }
  }
  loadParams = (params: RouteParams) => {
    for (const [key, value] of params) {
      this.#store.set(`params:${key}`, value);
    }
    return this;
  };
  _store = () => this.#store;
  req = (): Request => this.#baseRequest;
  param = <T extends unknown>(key: ParamKeys<Path>): T | undefined => {
    const paramValue = this.#store.get(`params:${key}`);
    return (paramValue as T) ?? undefined;
  };
  async body(type: "json"): Promise<Record<string, unknown>>;
  async body(type: "text"): Promise<string>;
  async body(type: "form"): Promise<FormData>;
  async body(type: "json" | "text" | "form") {
    const incomingRequest = this.#baseRequest;
    if (type === "json") {
      return await incomingRequest.json().catch(() => ({}));
    } else if (type === "text") {
      return await incomingRequest.text();
    }
    return await incomingRequest.formData();
  }
  json = <T = JSONValue>(data: T): Response => {
    return Response.json(data, {
      headers: this.#responseHeaders ?? {},
    });
  };
  text = (value: string): Response =>
    new Response(value, { headers: this.#responseHeaders });
  header(key: string, value: string, options?: { append: boolean }) {
    this.#responseHeaders = new Headers();
    if (options?.append) {
      this.#responseHeaders.append(key, value);
    } else {
      this.#responseHeaders.set(key, value);
    }
    return this.#responseHeaders;
  }

  #loadParamsContext = (routeMatchResult: RouteMatchResult) => {
    const params = routeMatchResult.params ?? {};
    Object.entries(params).forEach(([key, value]) => {
      this.#store.set(`params:${key}`, value);
    });
  };
}
