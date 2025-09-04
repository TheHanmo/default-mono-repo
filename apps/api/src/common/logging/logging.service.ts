import * as fs from 'fs';
import * as path from 'path';

import moment from 'moment-timezone';
import { Logger } from 'typeorm';

import { Injectable, LoggerService } from '@nestjs/common';

import { DebugUtil } from '@utils/debug.util';

@Injectable()
export class FileLoggerService implements Logger, LoggerService {
  private logBaseDirectory = 'logs';

  private getLogFilePath(logType: string): string {
    const now = moment().tz('Asia/Seoul');
    const year = now.format('YYYY');
    const month = now.format('MM');
    const day = now.format('DD');
    const hour = now.format('HH');

    const logDirectory = path.join(this.logBaseDirectory, `${year}${month}${day}`);
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }

    return path.join(logDirectory, `${hour}_app_log_${logType}.log`);
  }

  constructor() {
    // 로그 기본 디렉토리가 존재하지 않으면 생성
    if (!fs.existsSync(this.logBaseDirectory)) {
      fs.mkdirSync(this.logBaseDirectory);
    }
  }

  log(message: string): void {
    this.writeToFile('info', message);
  }

  error(message: string, trace: string): void {
    this.writeToFile('error', `${message}, Trace: ${trace}`);
  }

  warn(message: string): void {
    this.writeToFile('warn', message);
  }

  debug(message: string): void {
    this.writeToFile('debug', message);
  }

  verbose(message: string): void {
    this.writeToFile('verbose', message);
  }

  // TypeORM Logger 인터페이스 메서드 구현
  logQuery(query: string, parameters: unknown[] = []) {
    const newQuery: string = DebugUtil.replacePlaceholdersWithParams(query, parameters);

    this.writeToFile('query', newQuery);
    DebugUtil.consoleLog(newQuery);
  }

  logQueryError(error: string, query: string, parameters?: any[]) {
    const logMessage = `QUERY ERROR: ${error} -- QUERY: ${query} -- PARAMETERS: ${JSON.stringify(parameters)}`;
    this.writeToFile('query_error', logMessage);
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    const logMessage = `SLOW QUERY: ${query} -- TIME: ${time}ms -- PARAMETERS: ${JSON.stringify(parameters)}`;
    this.writeToFile('query_slow', logMessage);
  }

  logSchemaBuild(message: string) {
    this.writeToFile('schema_build', message);
  }

  logMigration(message: string) {
    this.writeToFile('migration', message);
  }

  private writeToFile(logType: string, message: string) {
    const timestamp = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    const logMessage = `[${timestamp}] ${message}\n`;
    const logFilePath = this.getLogFilePath(logType);
    fs.appendFileSync(logFilePath, logMessage);
  }
}
