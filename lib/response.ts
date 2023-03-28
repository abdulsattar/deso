import { extname } from "https://deno.land/std@0.181.0/path/mod.ts";

export class DesoResponse {
  // deno-lint-ignore no-explicit-any
  static json(object: Array<Map<string, any>> | Map<string, any>) {
    return new Response(
      JSON.stringify(
        object,
        (_, value) => {
          if (value instanceof Map) {
            return Object.fromEntries(value);
          }
          return value;
        },
        2
      )
    );
  }
  static async sendFile(filePath: string) {
    const extensionName = extname(filePath);
    const contentType = this.#getContentType(extensionName);
    try {
      const file = await Deno.readFile(filePath);
      return new Response(file, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": file.byteLength.toLocaleString()
        },
      });
    } catch {
      return new Response(`${filePath} - file not found`, {
        status: 404,
      });
    }
  }
  static #getContentType(extensionName: string) {
    switch(extensionName) {
      case ".json":
        return "application/json";
      case ".css":
        return "text/css";
      case ".js":
        return "text/javascript";
      case ".html":
      default:
        return "text/html; charset=utf-8";
    }
  }
}