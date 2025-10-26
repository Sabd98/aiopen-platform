// src/types/global.d.ts
declare module 'uuid' {
  export function v1(): string;
  export function v3(name: string, namespace: string): string;
  export function v4(): string;
  export function v5(name: string, namespace: string): string;
  export const NIL: string;
  export const version: string | number;
  export function validate(id: string): boolean;
  export function stringify(buf: Uint8Array): string;
  export function parse(str: string): Uint8Array;
  const _default: any;
  export default _default;
}