#!/bin/bash


if [[ "$TRAVIS_JOB_NUMBER" != *.1 ]]; then
    exit 0; # Nothing to see here folks!
fi

git config user.name "Travis-CI" || exit 1;
git config user.email "Travis-CI@servercooties.com" || exit 2;
git fetch || exit 10;
git checkout "$TRAVIS_BRANCH" || exit 3;
git pull origin "$TRAVIS_BRANCH" || exit 4;
git add "docs/api" || exit 5;
git commit -m 'Automatic Push of Updated Documentation [ci skip]' || exit 6;
git remote add github 'https://github.com/SockDrawer/SockBot.git' || exit 7;
git push github HEAD