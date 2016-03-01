#!/bin/bash


if [[ "$TRAVIS_JOB_NUMBER" != *.1 ]]; then
    exit 0; # Nothing to see here folks!
fi

git config user.name "Travis-CI" || exit 1;
git config user.email "Travis-CI@servercooties.com" || exit 1;
git checkout "$TRAVIS_BRANCH" || exit 1;
git pull origin "$TRAVIS_BRANCH" || exit 1;
git add "docs/api" || exit 1;
git commit -m 'Automatic Push of Updated Documentation [ci skip]' || exit 1;
git remote add github 'https://github.com/SockDrawer/SockBot.git' || exit 1;
git push github HEAD