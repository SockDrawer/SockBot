#!/bin/bash

if [[ "$TRAVIS_PULL_REQUEST" -eq "true" ]]; then
    echo "Not pushing docs for pull request"
    exit 0; # nothing to do here, it's a PR
fi

if [[ "$TRAVIS_JOB_NUMBER" != *.1 ]]; then
    echo "$TRAVIS_JOB_NUMBER: Not Primary Job, Not pushing docs"
    exit 0; # Nothing to see here folks!
fi

git config user.name "Travis-CI" || exit 1;
git config user.email "Travis-CI@servercooties.com" || exit 2;
git remote add github 'https://github.com/SockDrawer/SockBot.git' || exit 7;
git fetch github || exit 10;
git checkout "$TRAVIS_BRANCH" || exit 3;
git pull github "$TRAVIS_BRANCH" || exit 4;
git add -A "docs/api" || exit 5;
git commit -m 'Automatic Push of Updated Documentation [ci skip]' || exit 6;

git push github HEAD