#!/bin/bash


restoreBackup() {
    echo 'RESTORE: Dropping Old `restore` Schema;'
    psql -q -d 'discourse' -c 'DROP SCHEMA backup CASCADE' || return 1;
    echo 'RESTORE: Loading to `restore` Schema'
    tar -xOzf $1 'dump.sql' | psql -q -d 'discourse' || return 1
    echo 'RESTORE: Renaming Old Schema to `backup`';
    psql -d 'discourse' -c 'ALTER SCHEMA public RENAME TO backup' || return 1
    echo 'RESTORE: Finalizing Restore';
    psql -d 'discourse' -c 'ALTER SCHEMA restore RENAME TO public'|| return 1
    echo 'RESTORE: Restore Completed';
    return 0;
}

restoreBackup $1 &> $2