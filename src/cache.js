/* @flow */

import { readFile } from 'fs';
import { promisify } from 'util';
import chokidar from 'chokidar';
import EventEmitter from 'events';

type CacheObject = Object | null;
type TransformFunction = CacheObject => CacheObject;
type Cache = Map<string, Object>;
type CacheOpts = {
  transform: TransformFunction,
};

const identity: TransformFunction = i => i;

export default class TrufflePigCache extends EventEmitter {
  _cache: Cache;
  _watcher: any;
  _transform: TransformFunction;
  constructor(paths: Array<string> | string, { transform }: CacheOpts = {}) {
    super();
    this._cache = new Map();
    this._watcher = chokidar.watch(paths, {
      persistent: true,
    });
    this._watcher
      .on('add', async path => this.add(path))
      .on('change', async path => this.change(path))
      .on('error', error => this.emit('error', error))
      .on('unlink', path => this.remove(path));
    this._transform = transform || identity;
  }
  async _readFile(path: string): Promise<CacheObject> {
    let contents: string;
    try {
      contents = await promisify(readFile)(path);
    } catch (e) {
      this.emit('error', `Could not read file: ${path}`);
      return null;
    }
    try {
      return JSON.parse(contents);
    } catch (e) {
      this.emit('error', `Could not parse file: ${path}`);
      return null;
    }
  }
  async add(path: string): Promise<void> {
    if (this._cache.has(path)) return;
    let transformed;
    try {
      const cacheObject = await this._readFile(path);
      transformed = await this._transform(cacheObject);
    } catch (e) {
      this.emit('error', `CacheError: ${e.message}`);
    }
    if (transformed) {
      this._cache.set(path, transformed);
      this.emit('add', path, transformed);
    }
  }
  async change(path: string): Promise<void> {
    if (!this._cache.has(path)) {
      this.emit('error', `Can not change non existing path ${path}`);
      return;
    }
    let transformed;
    try {
      const cacheObject = await this._readFile(path);
      transformed = await this._transform(cacheObject);
    } catch (e) {
      this.emit('error', `CacheError: ${e.message}`);
    }
    if (transformed) {
      this._cache.set(path, transformed);
      this.emit('change', path, transformed);
    }
  }
  get(path: string): CacheObject {
    return this._cache.get(path) || null;
  }
  values(): Array<CacheObject> {
    return Array.from(this._cache.values());
  }
  close(): void {
    this._watcher.close();
  }
  remove(path: string): void {
    this._cache.delete(path);
    this.emit('remove', path);
  }
}
