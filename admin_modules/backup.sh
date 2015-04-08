#!/bin/bash


restoreBackup() {
    test -f "$1" || {
        echo "usage: $0 <backup.sh>"
        return 1
    }
    tar -tzf "$1" | grep 'dump.sql' >/dev/null || {
        echo "archive not a compressed tar or does not contain dump.sql"
        return 1
    }
    echo 'RESTORE: Dropping Old `restore` Schema;'
    psql -q -d 'discourse' -c 'DROP SCHEMA backup CASCADE' || return 1;
    echo 'RESTORE: Loading to `restore` Schema'
    tar -xOzf "$1" 'dump.sql' | psql -q -d 'discourse' || return 1
    echo 'RESTORE: Renaming Old Schema to `backup`';
    psql -d 'discourse' -c 'ALTER SCHEMA public RENAME TO backup' || return 1
    echo 'RESTORE: Finalizing Restore';
    psql -d 'discourse' -c 'ALTER SCHEMA restore RENAME TO public'|| return 1
    echo 'RESTORE: Restore Completed';
    return 0;
}

restoreBackup $1 &> $2
