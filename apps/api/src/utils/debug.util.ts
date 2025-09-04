import { SelectQueryBuilder } from 'typeorm';
export class DebugUtil {
  static sqlDebug(query: SelectQueryBuilder<any>): void {
    const [sql, parameters] = query.getQueryAndParameters();

    const formattedSql = this.replacePlaceholdersWithParams(sql, parameters);
    this.consoleLog(formattedSql);
  }

  static replacePlaceholdersWithParams(sql: string, parameters: unknown[] = []): string {
    return sql.replace(/\$(\d+)/g, (_, index) => {
      const paramIndex = parseInt(index, 10) - 1;
      const param = parameters[paramIndex];
      return this.escapeParam(param);
    });
  }

  private static escapeParam(param: unknown): string {
    if (typeof param === 'string') {
      return `'${param.replace(/'/g, "''")}'`;
    }

    if (param === null || param === undefined) {
      return 'NULL';
    }

    if (typeof param === 'number' || typeof param === 'boolean' || typeof param === 'bigint') {
      return param.toString();
    }

    if (param instanceof Date) {
      return `'${param.toISOString()}'`;
    }

    if (Array.isArray(param)) {
      return param.map(p => this.escapeParam(p)).join(', ');
    }

    if (typeof param === 'object') {
      return `'${JSON.stringify(param).replace(/'/g, "''")}'`;
    }

    throw new Error(`Unsupported parameter type for SQL escaping: ${typeof param}`);
  }

  static consoleLog(message: string): void {
    if (!message) {
      console.log('No SQL query to display.');
      return;
    }

    console.log('');
    console.log(
      '------------------------------------------------------------ SQL_DEBUG_START ------------------------------------------------------------',
    );
    console.log('');
    console.log(message);
    console.log('');
    console.log(
      '------------------------------------------------------------ SQL_DEBUG_END ------------------------------------------------------------',
    );
    console.log('');
  }
}
