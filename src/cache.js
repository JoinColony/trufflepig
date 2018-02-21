/* @flow */

import { readFile } from 'fs';
import { promisify } from 'util';
import chokidar from 'chokidar';
import EventEmitter from 'events';

type CacheObject = Object | null;
type Cache = Map<string, Object>;

export default class TrufflePigCache extends EventEmitter {
  _cache: Cache;
  _watcher: any;
  constructor(paths: Array<string> | string) {
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
    const cacheObject = await this._readFile(path);
    if (cacheObject) {
      this._cache.set(path, cacheObject);
      this.emit('add', path, cacheObject);
    }
  }
  async change(path: string): Promise<void> {
    if (!this._cache.has(path)) {
      this.emit('error', `Can not change non existing path ${path}`);
      return;
    }
    const cacheObject = await this._readFile(path);
    if (cacheObject) {
      this._cache.set(path, cacheObject);
      this.emit('change', path, cacheObject);
    }
  }
  get(path: string): CacheObject {
    return this._cache.get(path) || null;
  }
  close(): void {
    this._watcher.close();
  }
  remove(path: string): void {
    this._cache.delete(path);
    this.emit('remove', path);
  }
}
